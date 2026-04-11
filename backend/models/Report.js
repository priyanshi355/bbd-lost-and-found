const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemTitle: { type: String },
  reportedBy: { type: String, required: true }, // userId
  reporterName: { type: String },
  reason: { type: String, required: true },
  details: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' },
}, { timestamps: true });

reportSchema.set('toJSON', {
  transform: (doc, obj) => {
    obj.id = obj._id.toString();
    delete obj._id; delete obj.__v;
    return obj;
  }
});

module.exports = mongoose.model('Report', reportSchema);
