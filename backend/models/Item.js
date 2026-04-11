const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// MongoDB rigid architecture definition reflecting mock payload
const itemSchema = new Schema({
  title: { type: String, required: [true, 'Title property missing'], trim: true },
  description: { type: String, required: [true, 'Description property missing'] },
  category: { type: String, required: [true, 'Categorical structure missing'] },
  type: { type: String, enum: ['lost', 'found'], required: true },
  location: { type: String },
  contact: { type: String },
  authorId: { type: String, required: true }, // Ties inherently mapped relationships efficiently
  resolved: { type: Boolean, default: false },
  imageUrl: { type: String, default: null },
  images: { type: [String], default: [] }, // multiple images gallery
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  reportCount: { type: Number, default: 0 },
  isReported: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
}, {
  timestamps: true // Creates 'createdAt', 'updatedAt' passively
});

// Re-map internal NoSQL format structurally to adhere safely to Frontend parsing bounds
itemSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Item', itemSchema);
