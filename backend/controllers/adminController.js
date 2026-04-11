const Item = require('../models/Item');
const User = require('../models/User');
const Report = require('../models/Report');
const { sendOtpEmail } = require('../utils/emailService');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalItems, lostItems, foundItems, resolvedItems, reportedItems, totalUsers, pendingReports] = await Promise.all([
      Item.countDocuments({ isBanned: { $ne: true } }),
      Item.countDocuments({ type: 'lost', isBanned: { $ne: true } }),
      Item.countDocuments({ type: 'found', isBanned: { $ne: true } }),
      Item.countDocuments({ resolved: true }),
      Item.countDocuments({ isReported: true }),
      User.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ]);

    // Category breakdown
    const categoryData = await Item.aggregate([
      { $match: { isBanned: { $ne: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ totalItems, lostItems, foundItems, resolvedItems, reportedItems, totalUsers, pendingReports, categoryData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-passwordHash -emailOtp -resetPasswordOtp');
    res.json(users.map(u => u.toJSON()));
  } catch (err) { res.status(500).json({ error: 'Failed to load users' }); }
};

// PUT /api/admin/users/:id/ban
const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.role = 'banned';
    await user.save();
    res.json({ message: `User ${user.name} has been banned.` });
  } catch (err) { res.status(500).json({ error: 'Failed to ban user' }); }
};

// PUT /api/admin/users/:id/unban
const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.role = 'student';
    await user.save();
    res.json({ message: `User ${user.name} has been reinstated.` });
  } catch (err) { res.status(500).json({ error: 'Failed to unban user' }); }
};

// GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(reports.map(r => r.toJSON()));
  } catch (err) { res.status(500).json({ error: 'Failed to load reports' }); }
};

// PUT /api/admin/reports/:id/dismiss
const dismissReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, { status: 'dismissed' }, { new: true });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report.toJSON());
  } catch (err) { res.status(500).json({ error: 'Failed to dismiss report' }); }
};

// PUT /api/admin/items/:id/ban
const banItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    // Mark related reports as reviewed
    await Report.updateMany({ item: item._id }, { status: 'reviewed' });
    res.json({ message: `Item "${item.title}" has been removed.` });
  } catch (err) { res.status(500).json({ error: 'Failed to ban item' }); }
};

// POST /api/admin/broadcast
const broadcastEmail = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ error: 'Subject and message are required' });

    const users = await User.find({ isEmailVerified: true }).select('email name');
    let sent = 0;

    // Send in batches to avoid overwhelming the SMTP server
    for (const user of users) {
      try {
        await sendOtpEmail(user.email, '', subject,
          `<p>Dear ${user.name},</p><p>${message.replace(/\n/g, '<br/>')}</p>`
            .replace('Use the OTP below', '').replace(/<div.*?<\/div>/s, `<div style="background:#1e293b;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:1.5rem;margin:2rem 0;">${message.replace(/\n/g, '<br/>')}</div>`)
        );
        sent++;
      } catch { /* skip failed emails */ }
    }

    res.json({ message: `Broadcast sent to ${sent} users.` });
  } catch (err) { res.status(500).json({ error: 'Broadcast failed' }); }
};

module.exports = { getStats, getUsers, banUser, unbanUser, getReports, dismissReport, banItem, broadcastEmail };
