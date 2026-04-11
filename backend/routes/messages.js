const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { startConversation, getConversations, getUnreadCount, getMessages, sendReply } = require('../controllers/messageController');

router.post('/start', auth, startConversation);
router.get('/conversations', auth, getConversations);
router.get('/unread-count', auth, getUnreadCount);
router.get('/:conversationId', auth, getMessages);
router.post('/:conversationId/reply', auth, sendReply);

module.exports = router;
