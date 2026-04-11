const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getStats, getUsers, banUser, unbanUser, getReports, dismissReport, banItem, broadcastEmail } = require('../controllers/adminController');

// Lightweight admin check middleware
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

router.get('/stats', auth, adminOnly, getStats);
router.get('/users', auth, adminOnly, getUsers);
router.put('/users/:id/ban', auth, adminOnly, banUser);
router.put('/users/:id/unban', auth, adminOnly, unbanUser);
router.get('/reports', auth, adminOnly, getReports);
router.put('/reports/:id/dismiss', auth, adminOnly, dismissReport);
router.put('/items/:id/ban', auth, adminOnly, banItem);
router.post('/broadcast', auth, adminOnly, broadcastEmail);

module.exports = router;
