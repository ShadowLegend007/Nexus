const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc    List all conversations for current user
// @route   GET /api/conversations
// @access  Private
const listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'username email avatar hexId')
      .populate('lastMessage')
      .sort({ lastActivity: -1 });

    return res.json(conversations);
  } catch (error) {
    console.error('List Conversations Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Start or retrieve a 1-on-1 conversation by Hex ID
// @route   POST /api/conversations/start
// @access  Private
const startConversation = async (req, res) => {
  try {
    const { hexId } = req.body;

    if (!hexId) {
      return res.status(400).json({ message: 'Hex ID is required' });
    }

    const cleanHex = hexId.replace(/-/g, '').toUpperCase();

    // Resolve hexId to user
    const otherUser = await User.findOne({ hexId: cleanHex });
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found with this Hex ID' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, otherUser._id] },
    });

    if (conversation) {
      conversation = await conversation.populate('participants', 'username email avatar hexId');
      return res.json(conversation);
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants: [req.user._id, otherUser._id],
    });

    conversation = await conversation.populate('participants', 'username email avatar hexId');

    return res.status(201).json(conversation);
  } catch (error) {
    console.error('Start Conversation Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  listConversations,
  startConversation,
};
