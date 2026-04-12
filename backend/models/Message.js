const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: String, required: true },
  senderName: { type: String },
  senderPic: { type: String },
  text: { type: String, trim: true, default: '' },
  imageUrl: { type: String, default: null }, // base64 image in message
  readBy: [{ type: String }],
}, { timestamps: true });

messageSchema.set('toJSON', {
  transform: (doc, obj) => {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj;
  }
});

module.exports = mongoose.model('Message', messageSchema);
