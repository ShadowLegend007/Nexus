const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'pdf', 'word', 'ppt', 'excel', 'link', 'other'],
    required: true
  },
  textContent: {
    type: String,
    default: null
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  scanStatus: {
    type: String,
    enum: ['SENDING', 'SCANNING', 'TIER2_SCANNING', 'CLEAN', 'SUSPICIOUS', 'MALWARE', 'QUARANTINED'],
    default: 'SCANNING'
  },
  scanTier: {
    type: Number,
    default: null
  },
  threatType: {
    type: String,
    default: null
  },
  threatConfidence: {
    type: Number,
    default: null
  },
  isQuarantined: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  readAt: {
    type: Date,
    default: null
  },
  deletedForUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  isDeletedForEveryone: {
    type: Boolean,
    default: false
  },
  starredBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  encryptedContent: {
    type: String,
    default: null
  },
  aiReportSharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  aiReport: {
    type: Object,
    default: null
  },
  aiAnalyzed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexing for faster paginated lookup
MessageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
