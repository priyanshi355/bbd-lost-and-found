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

// GET /api/users/:id/public
const getPublicProfile = async (req, res) => {
  try {
    const id = req.params.id ? req.params.id.trim() : null;
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Try finding by ID directly, Mongoose handles string casting
    let user = null;
    try {
      user = await User.findById(id).select('name course year bio profilePic role createdAt');
    } catch (err) {
      // If casting failed, user stays null
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    const Item = require('../models/Item');
    const items = await Item.find({ authorId: id, isBanned: { $ne: true } })
      .sort({ createdAt: -1 });

    res.json({
      user: user.toJSON(),
      items
    });
  } catch (err) {
    console.error('Public profile error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

module.exports = { getMe, updateMe, getPublicProfile };
