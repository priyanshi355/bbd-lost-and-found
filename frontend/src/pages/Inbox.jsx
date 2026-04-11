import React, { useState, useEffect, useRef } from 'react';
import { messageApi } from '../services/message.api';
import { useAuth } from '../components/AuthContext';
import { toast } from '../services/toast';

const Inbox = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await messageApi.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConv) {
        openConversation(data[0]);
      }
    } catch (err) {
      toast.error('Failed to load inbox');
    } finally { setLoading(false); }
  };

  const openConversation = async (conv) => {
    setActiveConv(conv);
    try {
      const msgs = await messageApi.getMessages(conv.id);
      setMessages(msgs);
      // Reset unread count locally
      setConversations(prev => prev.map(c =>
        c.id === conv.id
          ? { ...c, unreadCount: { ...c.unreadCount, [user.id]: 0 } }
          : c
      ));
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;
    setSending(true);
    try {
      const msg = await messageApi.sendReply(activeConv.id, replyText);
      setMessages(prev => [...prev, msg]);
      setReplyText('');
      // Update conversation preview
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id ? { ...c, lastMessage: replyText } : c
      ));
    } catch (err) {
      toast.error(err.message || 'Failed to send reply');
    } finally { setSending(false); }
  };

  const getOtherParticipant = (conv) => {
    return conv.participants.find(p => p !== user.id) || 'Unknown';
  };

  const getUnread = (conv) => {
    if (!conv.unreadCount) return 0;
    return conv.unreadCount[user.id] || 0;
  };

  return (
    <div className="page-container" style={{ padding: '0' }}>
      <div className="inbox-layout">

        {/* Sidebar — Conversations */}
        <div className="inbox-sidebar">
          <div className="inbox-sidebar-header">
            <h2>💬 Inbox</h2>
            <span className="inbox-count">{conversations.length} conversations</span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="inbox-empty">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p>No messages yet.</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                When someone messages you about your listing, it'll appear here.
              </p>
            </div>
          ) : (
            <div className="inbox-list">
              {conversations.map(conv => {
                const unread = getUnread(conv);
                const isActive = activeConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    className={`inbox-conv-item ${isActive ? 'active' : ''}`}
                    onClick={() => openConversation(conv)}
                  >
                    <div className="inbox-conv-avatar">
                      {conv.itemTitle?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="inbox-conv-info">
                      <div className="inbox-conv-title">{conv.itemTitle || 'Item'}</div>
                      <div className="inbox-conv-preview">{conv.lastMessage}</div>
                    </div>
                    {unread > 0 && (
                      <span className="inbox-unread-badge">{unread}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Main — Message Thread */}
        <div className="inbox-thread">
          {!activeConv ? (
            <div className="inbox-thread-empty">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
              <h3>Select a conversation</h3>
              <p style={{ color: 'var(--text-muted)' }}>Choose a conversation from the left to start chatting.</p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="inbox-thread-header">
                <div>
                  <h3 style={{ margin: 0 }}>{activeConv.itemTitle}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    Conversation about this listing
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="inbox-messages">
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '3rem' }}>
                    No messages yet. Say hello!
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender === user.id;
                    return (
                      <div key={msg.id} className={`inbox-message-row ${isMe ? 'me' : 'them'}`}>
                        {!isMe && (
                          <div className="inbox-msg-avatar">
                            {msg.senderPic
                              ? <img src={msg.senderPic} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                              : msg.senderName?.[0]?.toUpperCase() || '?'
                            }
                          </div>
                        )}
                        <div className="inbox-bubble-wrap">
                          {!isMe && <div className="inbox-msg-name">{msg.senderName}</div>}
                          <div className={`inbox-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                            {msg.text}
                          </div>
                          <div className="inbox-msg-time">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' · '}
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="inbox-reply-box">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a message..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending || !replyText.trim()}
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  {sending ? '...' : 'Send ➤'}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Inbox;
