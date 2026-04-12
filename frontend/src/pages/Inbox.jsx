import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageApi } from '../services/message.api';
import { useAuth } from '../components/AuthContext';
import { toast } from '../services/toast';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

const Inbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserProfiles, setOtherUserProfiles] = useState({}); // userId -> profile
  const [showContactSheet, setShowContactSheet] = useState(false);
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

  const getOtherUserId = (conv) => {
    return conv.participants.find(p => p !== user.id);
  };

  // Fetch profile of other user in a conversation
  const fetchOtherProfile = async (userId) => {
    if (!userId || otherUserProfiles[userId]) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/public`);
      if (res.ok) {
        const data = await res.json();
        setOtherUserProfiles(prev => ({ ...prev, [userId]: data.user }));
      }
    } catch {}
  };

  const openConversation = async (conv) => {
    setActiveConv(conv);
    setShowContactSheet(false);
    const otherId = conv.participants?.find(p => p !== user.id);
    if (otherId) fetchOtherProfile(otherId);
    try {
      const msgs = await messageApi.getMessages(conv.id);
      setMessages(msgs);
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
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id ? { ...c, lastMessage: replyText } : c
      ));
    } catch (err) {
      toast.error(err.message || 'Failed to send reply');
    } finally { setSending(false); }
  };

  const getUnread = (conv) => {
    if (!conv.unreadCount) return 0;
    return conv.unreadCount[user.id] || 0;
  };

  const activeOtherUserId = activeConv ? getOtherUserId(activeConv) : null;
  const activeOtherProfile = activeOtherUserId ? otherUserProfiles[activeOtherUserId] : null;

  const renderAvatar = (profile, size = 40) => {
    if (profile?.profilePic) {
      return <img src={profile.profilePic} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />;
    }
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary-color), #a78bfa)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.38, fontWeight: 700, color: 'white', flexShrink: 0
      }}>
        {(profile?.name || '?')[0].toUpperCase()}
      </div>
    );
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
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
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
                const otherId = conv.participants?.find(p => p !== user.id);
                const otherProfile = otherId ? otherUserProfiles[otherId] : null;
                return (
                  <div
                    key={conv.id}
                    className={`inbox-conv-item ${isActive ? 'active' : ''}`}
                    onClick={() => openConversation(conv)}
                  >
                    {/* Avatar with real pic if available */}
                    <div className="inbox-conv-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                      {otherProfile?.profilePic
                        ? <img src={otherProfile.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        : <span>{conv.itemTitle?.[0]?.toUpperCase() || '?'}</span>
                      }
                    </div>
                    <div className="inbox-conv-info">
                      <div className="inbox-conv-title">{otherProfile?.name || conv.itemTitle || 'Item'}</div>
                      <div className="inbox-conv-preview" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        re: {conv.itemTitle}
                      </div>
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
              {/* WhatsApp-style Thread Header — clickable */}
              <div
                className="inbox-thread-header"
                onClick={() => setShowContactSheet(true)}
                style={{ cursor: 'pointer' }}
                title="View contact info"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {renderAvatar(activeOtherProfile, 40)}
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>
                      {activeOtherProfile?.name || 'Unknown User'}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
                      {activeOtherProfile?.course ? `${activeOtherProfile.course}${activeOtherProfile.year ? ' · ' + activeOtherProfile.year + ' Year' : ''}` : `re: ${activeConv.itemTitle}`}
                    </p>
                  </div>
                </div>
                <button
                  style={{ background: 'none', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-muted)', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}
                  onClick={(e) => { e.stopPropagation(); navigate(`/user/${activeOtherUserId}`); }}
                >
                  View Profile
                </button>
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
                          <div
                            className="inbox-msg-avatar"
                            onClick={() => activeOtherUserId && navigate(`/user/${activeOtherUserId}`)}
                            style={{ cursor: 'pointer' }}
                            title="View profile"
                          >
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

      {/* WhatsApp-style Contact Info Bottom Sheet */}
      {showContactSheet && activeOtherProfile && (
        <div
          className="modal-overlay"
          onClick={() => setShowContactSheet(false)}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '360px', textAlign: 'center' }}
          >
            <button className="modal-close" onClick={() => setShowContactSheet(false)}>&times;</button>

            {/* Large Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
              {activeOtherProfile.profilePic ? (
                <img
                  src={activeOtherProfile.profilePic}
                  alt=""
                  style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)' }}
                />
              ) : (
                <div style={{
                  width: '90px', height: '90px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-color), #a78bfa)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.4rem', fontWeight: 700, color: 'white',
                  border: '3px solid rgba(167,139,250,0.4)'
                }}>
                  {activeOtherProfile.name?.[0].toUpperCase()}
                </div>
              )}
            </div>

            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{activeOtherProfile.name}</h2>

            {activeOtherProfile.course && (
              <p style={{ color: 'var(--primary-color)', fontWeight: 500, marginBottom: '0.5rem' }}>
                {activeOtherProfile.course}{activeOtherProfile.year ? ` · ${activeOtherProfile.year} Year` : ''}
              </p>
            )}
            {activeOtherProfile.rollNo && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                🎓 {activeOtherProfile.rollNo}
              </p>
            )}
            {activeOtherProfile.bio && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                "{activeOtherProfile.bio}"
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowContactSheet(false)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => { setShowContactSheet(false); navigate(`/user/${activeOtherUserId}`); }}
              >
                Full Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
