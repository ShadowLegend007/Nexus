const express = require('express');
const router = express.Router();
const { listConversations, startConversation } = require('../controllers/conversation.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, listConversations);
router.post('/start', protect, startConversation);

module.exports = router;
