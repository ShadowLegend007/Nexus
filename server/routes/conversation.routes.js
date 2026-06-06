const express = require('express');
const router = express.Router();
const { listConversations, startConversation } = require('../controllers/conversation.controller');
const { updateConvAiSetting } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, listConversations);
router.post('/start', protect, startConversation);
router.put('/:conversationId/ai-setting', protect, updateConvAiSetting);

module.exports = router;
