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
    const rawId = req.params.id;
    const id = rawId ? rawId.trim() : null;

    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    let user = null;
    try {
      // First attempt with findById
      user = await User.findById(id).select('name course year bio profilePic role createdAt');
    } catch (err) {
      // If findById fails (e.g. cast error), try finding by _id string directly
      user = await User.findOne({ _id: id }).select('name course year bio profilePic role createdAt');
    }

    if (!user) {
      console.warn(`Public profile 404 for ID: ${id}`);
      return res.status(404).json({ error: 'User not found' });
    }

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
