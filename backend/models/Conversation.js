const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemTitle: { type: String }, // denormalized for quick display
  participants: [{ type: String }], // array of user IDs (strings)
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  // Track unread per participant: { userId: count }
  unreadCount: { type: Map, of: Number, default: {} },
}, { timestamps: true });

conversationSchema.set('toJSON', {
  transform: (doc, obj) => {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj;
  }
});

module.exports = mongoose.model('Conversation', conversationSchema);
