const Contact = require('../models/Contact');
const User = require('../models/User');

// @desc    Add contact by Hex ID
// @route   POST /api/contacts/add
// @access  Private
const addContact = async (req, res) => {
  try {
    const { hexId } = req.body;

    if (!hexId) {
      return res.status(400).json({ message: 'Hex ID is required' });
    }

    const cleanHex = hexId.replace(/-/g, '').toUpperCase();

    // Check if user is adding themselves
    if (req.user.hexId === cleanHex) {
      return res.status(400).json({ message: 'You cannot add yourself as a contact' });
    }

    // Resolve hexId to user
    const contactUser = await User.findOne({ hexId: cleanHex });
    if (!contactUser) {
      return res.status(404).json({ message: 'User not found with this Hex ID' });
    }

    // Check if already contact
    const existingContact = await Contact.findOne({
      userId: req.user._id,
      contactUserId: contactUser._id,
    });

    if (existingContact) {
      return res.status(400).json({ message: 'This contact has already been added' });
    }

    // Create contact
    const contact = await Contact.create({
      userId: req.user._id,
      contactUserId: contactUser._id,
      contactHexId: contactUser.hexId,
    });

    return res.status(201).json({
      message: 'Contact added successfully',
      contact: {
        _id: contact._id,
        contactUserId: contactUser._id,
        contactHexId: contactUser.hexId,
        username: contactUser.username,
        avatar: contactUser.avatar,
        addedAt: contact.addedAt,
      },
    });
  } catch (error) {
    console.error('Add Contact Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    List all contacts for current user
// @route   GET /api/contacts
// @access  Private
const listContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user._id })
      .populate('contactUserId', 'username email avatar hexId')
      .sort({ addedAt: -1 });

    const formattedContacts = contacts.map((c) => {
      if (!c.contactUserId) return null;
      return {
        _id: c._id,
        contactUserId: c.contactUserId._id,
        username: c.contactUserId.username,
        email: c.contactUserId.email,
        avatar: c.contactUserId.avatar,
        hexId: c.contactUserId.hexId,
        nickname: c.nickname,
        addedAt: c.addedAt,
      };
    }).filter(Boolean);

    return res.json(formattedContacts);
  } catch (error) {
    console.error('List Contacts Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Resolve Hex ID to User Profile
// @route   GET /api/contacts/resolve/:hexId
// @access  Private
const resolveHex = async (req, res) => {
  try {
    const cleanHex = req.params.hexId.replace(/-/g, '').toUpperCase();
    const resolvedUser = await User.findOne({ hexId: cleanHex }).select('username avatar hexId');
    
    if (!resolvedUser) {
      return res.status(404).json({ message: 'Hex ID could not be resolved' });
    }

    return res.json({
      _id: resolvedUser._id,
      username: resolvedUser.username,
      avatar: resolvedUser.avatar,
      hexId: resolvedUser.hexId,
    });
  } catch (error) {
    console.error('Resolve Hex Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addContact,
  listContacts,
  resolveHex,
};
