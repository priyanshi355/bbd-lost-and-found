const Item = require('../models/Item');

// Dynamic Read parsing variables automatically against Database Queries
const getItems = async (req, res, next) => {
  try {
    const { type, authorId } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (authorId) filter.authorId = authorId;
    
    // Sort chronologically backwards natively on Mongo limits processing latency for React
    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// Strict Validation POST
const createItem = async (req, res, next) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message, action: "Failed internal schema validations" });
    }
    next(error);
  }
};

// Put targeting specific _ID parameters
const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedItem = await Item.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true } // Return modified version & apply Model rules!
    );
    
    if (!updatedItem) {
      return res.status(404).json({ error: 'Target Item ID bounds failed tracking checks.' });
    }
    res.json(updatedItem);
  } catch (error) {
    next(error);
  }
};

// Raw Object Purging
const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedItem = await Item.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Target Item ID limits missed completely.' });
    }
    res.json({ success: true, message: 'Item cleanly purged from Cloud network.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getItems, createItem, updateItem, deleteItem };
