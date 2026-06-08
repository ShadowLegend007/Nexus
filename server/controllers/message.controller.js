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
      backupFileUrl,
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
      backupFileUrl: backupFileUrl || null,
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

// @desc    Delete message for current user only
// @route   DELETE /api/messages/:messageId/me
// @access  Private
const deleteForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Add user to deletedForUsers if not already there
    if (!message.deletedForUsers.map(id => id.toString()).includes(req.user._id.toString())) {
      message.deletedForUsers.push(req.user._id);
      await message.save();
    }
    return res.json({ message: 'Message deleted for you' });
  } catch (error) {
    console.error('Delete For Me Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete message for everyone
// @route   DELETE /api/messages/:messageId/everyone
// @access  Private
const deleteForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Only sender can delete for everyone
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the sender can delete for everyone' });
    }

    message.isDeletedForEveryone = true;
    message.textContent = null;
    message.fileUrl = null;
    message.fileName = null;
    await message.save();

    // Emit socket event
    const io = req.io;
    const roomManager = require('../socket/roomManager');
    const senderRoom = message.senderId.toString();
    const receiverRoom = message.receiverId.toString();
    if (io) {
      io.to(senderRoom).emit('message:delete', { messageId, isDeletedForEveryone: true });
      io.to(receiverRoom).emit('message:delete', { messageId, isDeletedForEveryone: true });
    }

    return res.json({ message: 'Message deleted for everyone' });
  } catch (error) {
    console.error('Delete For Everyone Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle star on a message
// @route   PUT /api/messages/:messageId/star
// @access  Private
const starMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    const userId = req.user._id.toString();
    const starredIndex = message.starredBy.findIndex(id => id.toString() === userId);
    if (starredIndex === -1) {
      message.starredBy.push(req.user._id);
    } else {
      message.starredBy.splice(starredIndex, 1);
    }
    await message.save();
    return res.json({ starred: starredIndex === -1, message });
  } catch (error) {
    console.error('Star Message Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all starred messages for current user
// @route   GET /api/messages/starred
// @access  Private
const getStarredMessages = async (req, res) => {
  try {
    const messages = await Message.find({ starredBy: req.user._id, isDeletedForEveryone: false })
      .populate('senderId', 'username avatar hexId')
      .populate('receiverId', 'username avatar hexId')
      .populate('conversationId', 'participants')
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json(messages);
  } catch (error) {
    console.error('Get Starred Messages Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Receiver submits AI analysis result for a message
// @route   POST /api/messages/:messageId/ai-report
// @access  Private
const submitAiReport = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { report } = req.body; // { status, details, riskScore }
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    // Only receiver can submit report
    const receiverId = message.receiverId.toString();
    if (receiverId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only receiver can submit AI report' });
    }
    message.aiReport = { ...report, timestamp: new Date() };
    message.aiAnalyzed = true;
    await message.save();
    // Emit to both users so sender can see the pending report
    const io = req.io;
    const roomManager = require('../socket/roomManager');
    const senderSocketId = roomManager.getSocketId(message.senderId.toString());
    if (senderSocketId && io) {
      io.to(senderSocketId).emit('message:aiReport', { messageId: message._id, aiReport: message.aiReport, aiAnalyzed: true });
    }
    return res.json(message);
  } catch (error) {
    console.error('Submit AI Report Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark AI report as shared with sender
// @route   POST /api/messages/:messageId/share-ai-report
// @access  Private
const shareAiReport = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId)
      .populate('senderId', 'username avatar hexId');
    if (!message) return res.status(404).json({ message: 'Message not found' });
    const senderId = message.senderId._id ? message.senderId._id.toString() : message.senderId.toString();
    if (!message.aiReportSharedWith.map(id => id.toString()).includes(senderId)) {
      message.aiReportSharedWith.push(message.senderId._id || message.senderId);
    }
    await message.save();
    // Emit the report to sender
    const io = req.io;
    const roomManager = require('../socket/roomManager');
    const senderSocketId = roomManager.getSocketId(senderId);
    if (senderSocketId && io && message.aiReport) {
      io.to(senderSocketId).emit('message:aiReportShared', {
        messageId: message._id,
        aiReport: message.aiReport,
        aiReportSharedWith: message.aiReportSharedWith
      });
    }
    return res.json({ success: true, message });
  } catch (error) {
    console.error('Share AI Report Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update AI analysis setting for a conversation
// @route   PUT /api/conversations/:conversationId/ai-setting
// @access  Private
const updateConvAiSetting = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { enabled } = req.body;
    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });
    conv.aiAnalysisSettings.set(req.user._id.toString(), enabled);
    await conv.save();
    return res.json({ success: true, aiAnalysisSettings: Object.fromEntries(conv.aiAnalysisSettings) });
  } catch (error) {
    console.error('Update AI Setting Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  deleteForMe,
  deleteForEveryone,
  starMessage,
  getStarredMessages,
  submitAiReport,
  shareAiReport,
  updateConvAiSetting,
};
