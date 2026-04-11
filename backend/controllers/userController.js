const User = require('../models/User');

// GET /api/users/me
const getMe = async (req, res) => {
  res.json(req.user.toJSON());
};

// PUT /api/users/me
const updateMe = async (req, res) => {
  try {
    const { name, phone, course, year, rollNo, bio, profilePic } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (course !== undefined) user.course = course;
    if (year !== undefined) user.year = year;
    if (rollNo !== undefined) user.rollNo = rollNo;
    if (bio !== undefined) user.bio = bio;
    if (profilePic !== undefined) user.profilePic = profilePic;

    await user.save();
    res.json(user.toJSON());
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = { getMe, updateMe };
