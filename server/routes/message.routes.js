const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  deleteForMe,
  deleteForEveryone,
  starMessage,
  getStarredMessages,
  submitAiReport,
  shareAiReport,
} = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/send', protect, sendMessage);
router.get('/starred', protect, getStarredMessages);
router.get('/:conversationId', protect, getMessages);
router.delete('/:messageId/me', protect, deleteForMe);
router.delete('/:messageId/everyone', protect, deleteForEveryone);
router.put('/:messageId/star', protect, starMessage);
router.post('/:messageId/ai-report', protect, submitAiReport);
router.post('/:messageId/share-ai-report', protect, shareAiReport);

module.exports = router;
