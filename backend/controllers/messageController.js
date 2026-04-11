const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Item = require('../models/Item');
const User = require('../models/User');
const { sendGenericEmail } = require('../utils/emailService');

// POST /api/messages/start — start a conversation (or get existing) and send first message
const startConversation = async (req, res) => {
  try {
    const { itemId, text } = req.body;
    const senderId = req.user._id.toString();

    if (!text || !text.trim()) return res.status(400).json({ error: 'Message text is required' });

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const receiverId = item.authorId;
    if (receiverId === senderId) return res.status(400).json({ error: 'You cannot message yourself' });

    const participants = [senderId, receiverId].sort();

    // Find existing conversation for this item between these two users
    let conversation = await Conversation.findOne({
      item: itemId,
      participants: { $all: participants }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        item: itemId,
        itemTitle: item.title,
        participants,
        lastMessage: text.trim(),
        lastMessageAt: new Date(),
        unreadCount: { [receiverId]: 1, [senderId]: 0 },
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      senderName: req.user.name,
      senderPic: req.user.profilePic || null,
      text: text.trim(),
      readBy: [senderId],
    });

    // Update conversation last message + increment receiver unread
    const currentUnread = conversation.unreadCount.get(receiverId) || 0;
    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    conversation.unreadCount.set(receiverId, currentUnread + 1);
    await conversation.save();

    // Async email notification
    User.findById(receiverId).then(receiver => {
      if (receiver && receiver.email) {
        sendGenericEmail(
          receiver.email,
          `New Message about "${item.title}"`,
          `<h3 style="margin-bottom: 1rem;">You received a new message!</h3>
           <p style="color: #cbd5e1;"><strong>${req.user.name}</strong> sent you a message regarding your item <strong>${item.title}</strong>.</p>
           <div style="background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0;">
             <p style="color: #f8fafc; margin: 0; font-style: italic;">"${text.trim()}"</p>
           </div>
           <p style="color: #cbd5e1;"><a href="https://bbd-lost-and-found.vercel.app/inbox" style="color: #818cf8;">Click here to reply</a></p>`
        ).catch(err => console.error('Failed to send message email:', err));
      }
    });

    res.status(201).json({ conversation: conversation.toJSON(), message: message.toJSON() });
  } catch (err) {
    console.error('Start conversation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/messages/conversations — list all conversations for the logged-in user
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const conversations = await Conversation.find({ participants: userId })
      .sort({ lastMessageAt: -1 });
    res.json(conversations.map(c => c.toJSON()));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/messages/unread-count — total unread message count for the logged-in user
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const conversations = await Conversation.find({ participants: userId });
    const total = conversations.reduce((sum, c) => sum + (c.unreadCount.get(userId) || 0), 0);
    res.json({ count: total });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/messages/:conversationId — get all messages in a conversation
const getMessages = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (!conversation.participants.includes(userId))
      return res.status(403).json({ error: 'Access denied' });

    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort({ createdAt: 1 });

    // Mark all as read for this user
    await Message.updateMany(
      { conversationId: req.params.conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    // Reset unread count for this user
    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    res.json(messages.map(m => m.toJSON()));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/messages/:conversationId/reply — send a reply
const sendReply = async (req, res) => {
  try {
    const { text } = req.body;
    const senderId = req.user._id.toString();
    if (!text || !text.trim()) return res.status(400).json({ error: 'Message text is required' });

    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (!conversation.participants.includes(senderId))
      return res.status(403).json({ error: 'Access denied' });

    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      senderName: req.user.name,
      senderPic: req.user.profilePic || null,
      text: text.trim(),
      readBy: [senderId],
    });

    // Update conversation, increment unread for the OTHER participant
    const receiverId = conversation.participants.find(p => p !== senderId);
    const currentUnread = conversation.unreadCount.get(receiverId) || 0;
    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    conversation.unreadCount.set(receiverId, currentUnread + 1);
    conversation.unreadCount.set(senderId, 0);
    await conversation.save();

    // Async email notification
    User.findById(receiverId).then(receiver => {
      if (receiver && receiver.email) {
        sendGenericEmail(
          receiver.email,
          `New Reply about "${conversation.itemTitle}"`,
          `<h3 style="margin-bottom: 1rem;">You received a new reply!</h3>
           <p style="color: #cbd5e1;"><strong>${req.user.name}</strong> replied to the conversation regarding <strong>${conversation.itemTitle}</strong>.</p>
           <div style="background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0;">
             <p style="color: #f8fafc; margin: 0; font-style: italic;">"${text.trim()}"</p>
           </div>
           <p style="color: #cbd5e1;"><a href="https://bbd-lost-and-found.vercel.app/inbox" style="color: #818cf8;">Click here to reply</a></p>`
        ).catch(err => console.error('Failed to send reply email:', err));
      }
    });

    res.status(201).json(message.toJSON());
  } catch (err) {
    console.error('Reply error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { startConversation, getConversations, getUnreadCount, getMessages, sendReply };
