const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: String, required: true }, // user ID
  senderName: { type: String },
  senderPic: { type: String },
  text: { type: String, required: true, trim: true },
  readBy: [{ type: String }], // array of user IDs who have read this
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
