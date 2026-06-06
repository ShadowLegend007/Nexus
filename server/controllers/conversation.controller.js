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

    const isSelf = otherUser._id.toString() === req.user._id.toString();

    let conversation;

    if (isSelf) {
      // Self-conversation: find one where the only participant is the user themselves
      // We store [userId, userId] for self-chats
      conversation = await Conversation.findOne({
        participants: { $size: 2, $all: [req.user._id] },
        $where: 'this.participants[0].toString() === this.participants[1].toString()'
      });

      // Fallback: use a simpler approach - find convs where user is participant and both participants are same
      if (!conversation) {
        const selfConvs = await Conversation.find({ participants: req.user._id });
        conversation = selfConvs.find(c =>
          c.participants.length === 2 &&
          c.participants.every(p => p.toString() === req.user._id.toString())
        ) || null;
      }
    } else {
      // Normal conversation between two different users
      conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, otherUser._id], $size: 2 },
      });
    }

    if (conversation) {
      conversation = await conversation.populate('participants', 'username email avatar hexId');
      return res.json(conversation);
    }

    // Create new conversation
    const participantIds = isSelf
      ? [req.user._id, req.user._id]
      : [req.user._id, otherUser._id];

    conversation = await Conversation.create({
      participants: participantIds,
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
