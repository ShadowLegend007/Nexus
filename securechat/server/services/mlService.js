const MessageStatus = require('../utils/messageStatus');

/**
 * Handle scanning verdicts from either the local stub or real ML webhook.
 * This is the shared single source of truth for message security updates.
 */
async function handleVerdict({ messageId, tier, verdict, confidence, threatType, details }) {
  const Message = require('../models/Message');
  const roomManager = require('../socket/roomManager');
  const socketHandler = require('../socket/socketHandler');

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      console.warn(`[ML Service] Message with ID ${messageId} not found.`);
      return null;
    }

    // Update Message Security Fields
    message.scanStatus = verdict;
    message.scanTier = tier;
    message.threatType = threatType;
    message.threatConfidence = confidence;
    
    if (verdict === 'MALWARE') {
      message.isQuarantined = true;
    }

    await message.save();
    console.log(`[ML Service] Verdict processed for Message ${messageId}: ${verdict}`);

    // Broadcast change via Socket.io
    const io = socketHandler.getIo();
    if (io) {
      const payload = {
        messageId: message._id.toString(),
        scanStatus: message.scanStatus,
        threatType: message.threatType,
        threatConfidence: message.threatConfidence,
        tier: message.scanTier,
      };

      // Emit to sender
      const senderSocketId = roomManager.getSocketId(message.senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit('message:status', payload);
      }

      // Emit to receiver
      const receiverSocketId = roomManager.getSocketId(message.receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message:status', payload);
      }
    }

    return message;
  } catch (error) {
    console.error('[ML Service] Error handling message scan verdict:', error);
    throw error;
  }
}

/**
 * Simulates ML scan with a random delay.
 * Replace this entire function body when ML team is ready.
 *
 * What the real implementation must do:
 *   1. POST to Tier 1 endpoint (your fast local model):
 *      {
 *        messageId: message._id,
 *        contentType: message.contentType,
 *        textContent: message.textContent || null,
 *        fileUrl: message.fileUrl || null,
 *        callbackUrl: process.env.ML_CALLBACK_URL + '/api/ml/verdict'
 *      }
 *   2. If Tier 1 responds with suspiciousScore > 0.4,
 *      forward same payload to Tier 2 (cloud model).
 *   3. Tier 1 and Tier 2 both POST their verdicts to
 *      /api/ml/verdict (the webhook route).
 *   4. Your webhook handler updates message status in DB
 *      and emits 'message:status' via Socket.io.
 */
async function submitForScan(message) {
  const delay = Math.random() * 2000 + 500;
  
  setTimeout(async () => {
    const roll = Math.random();
    let verdict, threatType = null, confidence = null;
    
    if (roll < 0.85) {
      verdict = 'CLEAN';
    } else if (roll < 0.93) {
      verdict = 'SUSPICIOUS';
      threatType = 'UNKNOWN_PATTERN';
      confidence = parseFloat((Math.random() * 0.3 + 0.4).toFixed(2));
    } else {
      verdict = 'MALWARE';
      threatType = ['PDF_EXPLOIT', 'TROJAN', 'PHISHING_LINK', 'STEGANOGRAPHY', 'MACRO_VIRUS'][
        Math.floor(Math.random() * 5)
      ];
      confidence = parseFloat((Math.random() * 0.2 + 0.8).toFixed(2));
    }
    
    await handleVerdict({
      messageId: message._id,
      tier: 1,
      verdict,
      confidence,
      threatType,
      details: verdict === 'CLEAN' ? null : `Detected by stub scanner`
    });
  }, delay);
}

module.exports = {
  submitForScan,
  handleVerdict,
};
