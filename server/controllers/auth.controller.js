const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { generateUniqueHexId } = require('../utils/hexGenerator');
const Otp = require('../models/Otp');
const { sendEmail } = require('../utils/mailer');
// Generate JWT token
const generateToken = (id, userAgent) => {
  const uaHash = crypto.createHash('sha256').update(userAgent || '').digest('hex').substring(0, 16);
  return jwt.sign({ id, uaHash }, process.env.JWT_SECRET || 'nexus_jwt_secret_key_2026_xyz', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email and password' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate unique hexId
    const hexId = await generateUniqueHexId();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      passwordHash,
      hexId,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`, // Default premium avatar
    });

    if (user) {
      const token = generateToken(user._id, req.get('User-Agent') || '');
      return res.status(201).json({
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
        },
        token,
        hexId: user.hexId,
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, req.get('User-Agent') || '');
    return res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      token,
      hexId: user.hexId,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      hexId: updatedUser.hexId
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Store/update public key (and optionally encrypted private key) for E2EE
// @route   POST /api/auth/public-key
// @access  Private
const storePublicKey = async (req, res) => {
  try {
    const { publicKey, encryptedPrivateKey } = req.body;
    if (!publicKey) return res.status(400).json({ message: 'publicKey is required' });
    const user = await User.findById(req.user._id);
    user.publicKey = publicKey;
    if (encryptedPrivateKey) user.encryptedPrivateKey = encryptedPrivateKey;
    await user.save();
    return res.json({ success: true });
  } catch (error) {
    console.error('Store Public Key Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get public key for a user by hexId
// @route   GET /api/auth/public-key/:hexId
// @access  Private
const getPublicKey = async (req, res) => {
  try {
    const { hexId } = req.params;
    const cleanHex = hexId.replace(/-/g, '').toUpperCase();
    const user = await User.findOne({ hexId: cleanHex }).select('publicKey username hexId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ publicKey: user.publicKey, username: user.username, hexId: user.hexId });
  } catch (error) {
    console.error('Get Public Key Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user preferences (UI settings)
// @route   PUT /api/auth/preferences
// @access  Private
const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const user = await User.findById(req.user._id);
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    return res.json({ preferences: user.preferences });
  } catch (error) {
    console.error('Update Preferences Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Delete any existing OTPs for this email
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    await Otp.create({ email: email.toLowerCase(), otp });

    // Send email
    const subject = 'Nexus - Password Reset OTP';
    const text = `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`;
    
    await sendEmail(email.toLowerCase(), subject, text);

    return res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const otpDoc = await Otp.findOne({ email: email.toLowerCase(), otp });
    if (!otpDoc) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    return res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Email, OTP, and new password are required' });

    const otpDoc = await Otp.findOne({ email: email.toLowerCase(), otp });
    if (!otpDoc) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = passwordHash;
    await user.save();

    // Delete used OTP
    await Otp.deleteOne({ _id: otpDoc._id });

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  storePublicKey,
  getPublicKey,
  updatePreferences,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
