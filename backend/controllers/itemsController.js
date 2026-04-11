const Item = require('../models/Item');
const Report = require('../models/Report');
const User = require('../models/User');
const { sendGenericEmail } = require('../utils/emailService');

// GET / — list items (with optional filters)
const getItems = async (req, res, next) => {
  try {
    const { type, authorId } = req.query;
    const filter = { isBanned: { $ne: true } };
    if (type) filter.type = type;
    if (authorId) filter.authorId = authorId;
    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) { next(error); }
};

// POST / — create item
const createItem = async (req, res, next) => {
  try {
    const newItem = new Item({
      ...req.body,
    });
    const savedItem = await newItem.save();
    
    // Background Smart Match logic for "Found" items
    if (savedItem.type === 'found') {
      const words = savedItem.title.toLowerCase().split(' ').filter(w => w.length > 3);
      if (words.length > 0) {
        const regexStr = words.join('|');
        Item.find({
          type: 'lost',
          category: savedItem.category,
          title: { $regex: regexStr, $options: 'i' },
          resolved: false
        }).limit(5).then(async (matches) => {
          if (matches.length > 0) {
            const authorIds = [...new Set(matches.map(m => m.authorId))];
            const users = await User.find({ _id: { $in: authorIds } });
            users.forEach(user => {
              if (user.email) {
                sendGenericEmail(
                  user.email,
                  '🚨 Potential Match for Your Lost Item!',
                  `<h3 style="margin-bottom: 1rem;">Good news!</h3>
                   <p style="color: #cbd5e1;">Someone just found a <strong>${savedItem.category}</strong> item matching the description: <strong>"${savedItem.title}"</strong>. It could be your lost item!</p>
                   <p style="color: #cbd5e1;"><a href="https://bbd-lost-and-found.vercel.app/found" style="color: #818cf8;">Log in to BBD Lost & Found to check it out.</a></p>`
                ).catch(e => console.error('Smart match email fail:', e));
              }
            });
          }
        }).catch(err => console.error('Smart match DB error:', err));
      }
    }

    res.status(201).json(savedItem);
  } catch (error) {
    if (error.name === 'ValidationError')
      return res.status(400).json({ error: error.message });
    next(error);
  }
};

// GET /my-items
const getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ authorId: req.user._id.toString() }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) { next(error); }
};

// PUT /:id — update item
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.authorId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this item' });
    }
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    res.json(updatedItem);
  } catch (error) { next(error); }
};

// PUT /:id/resolve — mark item as resolved/unresolved
const resolveItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.authorId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    item.resolved = !item.resolved;
    await item.save();
    res.json(item);
  } catch (error) { next(error); }
};

// POST /api/items/:id/verify-claim
const verifyClaim = async (req, res, next) => {
  try {
    const { answer } = req.body;
    if (!answer) return res.status(400).json({ error: 'Answer is required' });

    // Must explicitly select securityAnswer because it has select:false in schema
    const item = await Item.findById(req.params.id).select('+securityAnswer');
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (!item.securityAnswer) return res.status(400).json({ error: 'No security question set for this item' });

    if (item.securityAnswer.toLowerCase().trim() === answer.toLowerCase().trim()) {
      if (!item.unlockedUsers.includes(req.user._id.toString())) {
        item.unlockedUsers.push(req.user._id.toString());
        await item.save();
      }
      return res.json({ success: true, item });
    } else {
      return res.status(400).json({ error: 'Incorrect answer. The poster has locked this item.' });
    }
  } catch(error) { next(error); }
};

// DELETE /:id — delete item
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.authorId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { next(error); }
};

// GET /:id/similar — get similar items by category
const getSimilarItems = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const similar = await Item.find({
      _id: { $ne: item._id },
      category: item.category,
      type: item.type,
      isBanned: { $ne: true },
    }).limit(4).sort({ createdAt: -1 });
    res.json(similar);
  } catch (error) { next(error); }
};

// POST /:id/report — report an item
const reportItem = async (req, res, next) => {
  try {
    const { reason, details, reportedBy, reporterName } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const report = await Report.create({
      item: item._id,
      itemTitle: item.title,
      reportedBy,
      reporterName,
      reason,
      details: details || '',
    });

    // Increment report count on item
    item.reportCount = (item.reportCount || 0) + 1;
    item.isReported = true;
    await item.save();

    res.status(201).json(report.toJSON());
  } catch (error) { next(error); }
};

module.exports = { getItems, createItem, updateItem, deleteItem, getSimilarItems, reportItem, getMyItems, resolveItem, verifyClaim };
