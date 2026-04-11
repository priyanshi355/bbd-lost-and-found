const Item = require('../models/Item');
const Report = require('../models/Report');

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
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    if (error.name === 'ValidationError')
      return res.status(400).json({ error: error.message });
    next(error);
  }
};

// PUT /:id — update item
const updateItem = async (req, res, next) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!updatedItem) return res.status(404).json({ error: 'Item not found' });
    res.json(updatedItem);
  } catch (error) { next(error); }
};

// DELETE /:id — delete item
const deleteItem = async (req, res, next) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: 'Item not found' });
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

module.exports = { getItems, createItem, updateItem, deleteItem, getSimilarItems, reportItem };
