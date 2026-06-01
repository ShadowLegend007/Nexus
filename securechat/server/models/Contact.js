const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactHexId: {
    type: String,
    required: true,
    uppercase: true,
    minlength: 12,
    maxlength: 12
  },
  nickname: {
    type: String,
    default: null,
    trim: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user cannot add the same contact twice
ContactSchema.index({ userId: 1, contactUserId: 1 }, { unique: true });

module.exports = mongoose.model('Contact', ContactSchema);
