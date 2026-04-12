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
  const [pendingImage, setPendingImage] = useState(null); // base64 string
  const fileInputRef = useRef(null);
  const [otherUserProfiles, setOtherUserProfiles] = useState({}); // userId -> profile
  const [showContactSheet, setShowContactSheet] = useState(false);
  const [sheetUserId, setSheetUserId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Lock background scroll when contact sheet is open
  useEffect(() => {
    if (showContactSheet) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [showContactSheet]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await messageApi.getConversations();
      setConversations(data);
      
      // Fetch all missing profiles for the sidebar
      const uniqueOtherIds = [...new Set(data.map(c => c.participants.find(p => p !== user.id)).filter(Boolean))];
      uniqueOtherIds.forEach(id => fetchOtherProfile(id));

      if (data.length > 0 && !activeConv) {
        openConversation(data[0]);
      }
    } catch (err) {
      toast.error('Failed to load inbox');
    } finally { setLoading(false); }
  };

  const getOtherUserId = (conv) => {
    if (!conv.participants || !user?.id) return null;
    return conv.participants.find(p => p.trim() !== user.id.trim());
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
    } catch (err) {
      console.warn('Profile load failed for', userId);
    }
  };

  const openConversation = async (conv) => {
    setActiveConv(conv);
    setShowContactSheet(false);
    const otherId = getOtherUserId(conv);
    if (otherId) fetchOtherProfile(otherId.trim());
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
    if (!replyText.trim() && !pendingImage) return;
    if (!activeConv) return;
    setSending(true);
    try {
      const msg = await messageApi.sendReply(activeConv.id, replyText, pendingImage || null);
      setMessages(prev => [...prev, msg]);
      setReplyText('');
      setPendingImage(null);
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id ? { ...c, lastMessage: pendingImage ? '📷 Photo' : replyText } : c
      ));
    } catch (err) {
      toast.error(err.message || 'Failed to send reply');
    } finally { setSending(false); }
  };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error('Image must be under 3MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPendingImage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
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
                    <div 
                      className="inbox-conv-avatar" 
                      style={{ overflow: 'hidden', padding: 0, cursor: 'pointer' }}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (otherId) {
                          setSheetUserId(otherId.trim());
                          setShowContactSheet(true);
                        }
                      }}
                    >
                      {otherProfile?.profilePic
                        ? <img src={otherProfile.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        : <span>{conv.itemTitle?.[0]?.toUpperCase() || '?'}</span>
                      }
                    </div>
                    <div className="inbox-conv-info" onClick={() => openConversation(conv)}>
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
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                  onClick={() => {
                    if (activeOtherUserId) {
                      setSheetUserId(activeOtherUserId.trim());
                      setShowContactSheet(true);
                    }
                  }}
                >
                  {renderAvatar(activeOtherProfile, 40)}
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>
                      {activeOtherProfile?.name || 'Loading...'}
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
                            onClick={() => {
                              if (activeOtherUserId) {
                                setSheetUserId(activeOtherUserId.trim());
                                setShowContactSheet(true);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                            title="See DP info"
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
                            {msg.imageUrl && (
                              <img
                                src={msg.imageUrl}
                                alt="Sent image"
                                style={{ maxWidth: '220px', maxHeight: '220px', borderRadius: '8px', display: 'block', marginBottom: msg.text ? '0.4rem' : 0, cursor: 'pointer' }}
                                onClick={() => window.open(msg.imageUrl, '_blank')}
                              />
                            )}
                            {msg.text && <span>{msg.text}</span>}
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
              <form onSubmit={handleSendReply} className="inbox-reply-box" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                {/* Image Preview */}
                {pendingImage && (
                  <div style={{ position: 'relative', alignSelf: 'flex-start' }}>
                    <img src={pendingImage} alt="preview" style={{ maxHeight: '80px', maxWidth: '120px', borderRadius: '8px', border: '2px solid var(--primary-color)' }} />
                    <button
                      type="button"
                      onClick={() => setPendingImage(null)}
                      style={{ position: 'absolute', top: -6, right: -6, background: 'var(--accent-color)', border: 'none', color: 'white', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >×</button>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  {/* Image picker button */}
                  <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleImagePick} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary"
                    style={{ padding: '0.75rem', fontSize: '1.2rem', flexShrink: 0 }}
                    title="Send image"
                  >📷</button>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={pendingImage ? 'Add a caption... (optional)' : 'Type a message...'}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending || (!replyText.trim() && !pendingImage)}
                    style={{ padding: '0.75rem 1rem', flexShrink: 0 }}
                  >
                    {sending ? '...' : '➤'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* WhatsApp-style Contact Info Bottom Sheet */}
      {showContactSheet && sheetUserId && (
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
            {(() => {
              const profile = otherUserProfiles[sheetUserId];
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
                    {profile?.profilePic ? (
                      <img
                        src={profile.profilePic}
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
                        {(profile?.name || '?')[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{profile?.name || 'Loading Name...'}</h2>

                  {profile ? (
                    <>
                      {profile.course && (
                        <p style={{ color: 'var(--primary-color)', fontWeight: 500, marginBottom: '0.5rem' }}>
                          {profile.course}{profile.year ? ` · ${profile.year} Year` : ''}
                        </p>
                      )}
                      {profile.rollNo && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                          🎓 {profile.rollNo}
                        </p>
                      )}
                      {profile.bio && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                          "{profile.bio}"
                        </p>
                      )}
                    </>
                  ) : (
                     <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                       Loading contact information...
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
                      onClick={() => { setShowContactSheet(false); navigate(`/user/${sheetUserId}`); }}
                    >
                      Full Profile
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
