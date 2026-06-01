const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { submitForScan } = require('../services/mlService');

// @desc    Send a message
// @route   POST /api/messages/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      receiverHexId,
      contentType,
      textContent,
      fileUrl,
      fileName,
      fileSize
    } = req.body;

    if (!conversationId || !receiverHexId || !contentType) {
      return res.status(400).json({ message: 'Conversation ID, Receiver Hex ID, and Content Type are required' });
    }

    // Resolve receiver
    const cleanHex = receiverHexId.replace(/-/g, '').toUpperCase();
    const receiver = await User.findOne({ hexId: cleanHex });
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver Hex ID cannot be resolved' });
    }

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Create the message with initial 'SCANNING' status
    const message = await Message.create({
      conversationId,
      senderId: req.user._id,
      receiverId: receiver._id,
      contentType,
      textContent: textContent || null,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null,
      scanStatus: 'SCANNING',
      createdAt: new Date(),
    });

    // Update conversation lastMessage and lastActivity
    conversation.lastMessage = message._id;
    conversation.lastActivity = message.createdAt;
    await conversation.save();

    // Emit socket event to receiver (and sender) - "message:new"
    const io = req.io;
    const roomManager = require('../socket/roomManager');
    
    // Format message object for socket output
    const populatedMessage = await message.populate([
      { path: 'senderId', select: 'username avatar hexId' },
      { path: 'receiverId', select: 'username avatar hexId' }
    ]);

    // Emit to sender
    const senderSocketId = roomManager.getSocketId(req.user._id.toString());
    if (senderSocketId && io) {
      io.to(senderSocketId).emit('message:new', populatedMessage);
    }

    // Emit to receiver
    const receiverSocketId = roomManager.getSocketId(receiver._id.toString());
    if (receiverSocketId && io) {
      io.to(receiverSocketId).emit('message:new', populatedMessage);
    }

    // Call ML scan submit AFTER save and emit
    // Note: mlService stub handles updates & notifications automatically!
    submitForScan(message).catch(err => {
      console.error('Failed to initiate ML scan:', err);
    });

    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send Message Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get paginated message history
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    const query = { conversationId };
    if (before) {
      query._id = { $lt: before };
    }

    const messages = await Message.find(query)
      .populate('senderId', 'username avatar hexId')
      .populate('receiverId', 'username avatar hexId')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    // Return chronological order for UI display
    return res.json(messages.reverse());
  } catch (error) {
    console.error('Get Messages Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
