const express = require('express');
const router = express.Router();
const { getMe, updateMe, getPublicProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, getMe);
router.get('/:id/public', getPublicProfile);
router.put('/me', authMiddleware, updateMe);

module.exports = router;
