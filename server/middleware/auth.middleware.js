const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nexus_jwt_secret_key_2026_xyz');

      // Get user from the token, exclude password hash
      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Fingerprint check — validate User-Agent hash embedded in JWT
      if (decoded.uaHash) {
        const currentUaHash = crypto.createHash('sha256').update(req.get('User-Agent') || '').digest('hex').substring(0, 16);
        if (currentUaHash !== decoded.uaHash) {
          return res.status(401).json({ message: 'Session invalid. Please log in again.' });
        }
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
