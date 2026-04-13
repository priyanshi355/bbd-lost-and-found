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
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pendingImage, setPendingImage] = useState(null); // base64 string
  const fileInputRef = useRef(null);
  const [otherUserProfiles, setOtherUserProfiles] = useState({}); // userId -> profile
  const [showContactSheet, setShowContactSheet] = useState(false);
  const [sheetUserId, setSheetUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

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
      
      const uniqueOtherIds = [...new Set(data.map(c => c.participants.find(p => p !== user.id)).filter(Boolean))];
      uniqueOtherIds.forEach(id => fetchOtherProfile(id));

      if (data.length > 0 && !activeConv && window.innerWidth > 768) {
        openConversation(data[0]);
      }
    } catch (err) {
      toast.error('Failed to load inbox');
    } finally { setLoading(false); }
  };

  const getOtherUserId = (conv) => {
    if (!conv.participants || !user?.id) return null;
    return conv.participants.find(p => p && p.trim() !== user.id.trim());
  };

  const fetchOtherProfile = async (userId) => {
    if (!userId || otherUserProfiles[userId]) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/public`);
      if (res.ok) {
        const data = await res.json();
        setOtherUserProfiles(prev => ({ ...prev, [userId]: data.user }));
      }
    } catch (err) {
      console.warn('Profile load failed');
    }
  };

  const openConversation = async (conv) => {
    setActiveConv(conv);
    setShowContactSheet(false);
    if (window.innerWidth <= 768) {
      setMobileView('chat');
    }
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

  // Real-time message polling
  useEffect(() => {
    if (!activeConv) return;
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const msgs = await messageApi.getMessages(activeConv.id);
        setMessages(prev => {
          if (prev.length !== msgs.length) return msgs;
          // Check if last message ID or content changed to catch edits/updates
          if (prev.length > 0 && msgs.length > 0) {
            if (prev[prev.length - 1].id !== msgs[msgs.length - 1].id) return msgs;
          }
          return prev;
        });
      } catch (err) {
        console.warn('Polling failed');
      }
    }, 1000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeConv]);

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
    <div className="page-container" style={{ padding: 0, height: 'calc(100vh - 70px)', background: 'var(--bg-dark)' }}>
      <div className={`inbox-layout ${mobileView === 'chat' ? 'show-chat' : 'show-list'}`}>
        <div className="inbox-sidebar">
          <div className="inbox-sidebar-header">
            <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: 'var(--primary-color)' }}>💬</span> Inbox
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {conversations.length} conversations
            </div>
          </div>
          <div className="inbox-conv-list" style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No conversations yet.</div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`inbox-conv-item ${activeConv?.id === conv.id ? 'active' : ''}`}
                  onClick={() => openConversation(conv)}
                >
                  {renderAvatar(otherUserProfiles[getOtherUserId(conv)], 48)}
                  <div className="inbox-conv-info">
                    <div className="inbox-conv-top">
                      <span className="inbox-conv-name">
                        {otherUserProfiles[getOtherUserId(conv)]?.name || 'User'}
                      </span>
                      {getUnread(conv) > 0 && <span className="inbox-unread-badge">{getUnread(conv)}</span>}
                    </div>
                    <div className="inbox-conv-preview">
                      re: {conv.itemTitle}
                    </div>
                    <div className="inbox-conv-preview" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      {conv.lastMessage || 'Start writing...'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="inbox-thread">
          {!activeConv ? (
            <div className="inbox-thread-empty">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
              <h3>Select a conversation</h3>
              <p style={{ color: 'var(--text-muted)' }}>Choose a chat to start messaging.</p>
            </div>
          ) : (
            <>
              <div className="inbox-thread-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button className="inbox-back-btn" onClick={(e) => { e.stopPropagation(); setMobileView('list'); }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', display: 'none' }}>←</button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => { if (activeOtherUserId) { setSheetUserId(activeOtherUserId.trim()); setShowContactSheet(true); } }}>
                    {renderAvatar(activeOtherProfile, 42)}
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{activeOtherProfile?.name || 'User'}</h3>
                      <p style={{ color: '#10b981', fontSize: '0.75rem', margin: 0 }}>online</p>
                    </div>
                  </div>
                </div>
                <button
                  style={{ background: 'none', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-muted)', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}
                  onClick={(e) => { e.stopPropagation(); navigate(`/user/${activeOtherUserId}`); }}
                >
                  Profile
                </button>
              </div>
              <div className="inbox-messages">
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '4rem' }}>No messages yet.</div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender === user.id;
                    return (
                      <div key={msg.id} className={`inbox-message-row ${isMe ? 'me' : 'them'}`}>
                        <div className="inbox-bubble-wrap">
                          <div className={`inbox-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                            {msg.imageUrl && <img src={msg.imageUrl} alt="" style={{ maxWidth: '100%', borderRadius: '12px', marginBottom: '0.5rem', display: 'block' }} />}
                            {msg.text}
                          </div>
                          <div className="inbox-msg-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="inbox-reply-box">
                <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImagePick} />
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => fileInputRef.current.click()}>📷</button>
                <form onSubmit={handleSendReply} style={{ flex: 1, display: 'flex', gap: '0.75rem' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    {pendingImage && <div style={{ position: 'absolute', top: '-40px', left: 0, background: 'var(--primary-color)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>Image attached <button onClick={() => setPendingImage(null)} style={{ background: 'none', border: 'none', color: 'white' }}>&times;</button></div>}
                    <input type="text" className="inbox-input" placeholder="Type a message..." value={replyText} onChange={(e) => setReplyText(e.target.value)} disabled={sending} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} />
                  </div>
                  <button type="submit" disabled={sending || (!replyText.trim() && !pendingImage)} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '12px', cursor: 'pointer' }}>{sending ? '...' : '➤'}</button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {showContactSheet && sheetUserId && (
        <div className="modal-overlay" onClick={() => setShowContactSheet(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '360px', textAlign: 'center' }}>
            <button className="modal-close" onClick={() => setShowContactSheet(false)}>&times;</button>
            {(() => {
              const profile = otherUserProfiles[sheetUserId];
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
                    {profile?.profilePic ? (
                      <img src={profile.profilePic} alt="" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)' }} />
                    ) : (
                      <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', color: 'white' }}>
                        {(profile?.name || '?')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.4rem' }}>{profile?.name || 'User'}</h2>
                  {profile?.course && <p style={{ color: 'var(--primary-color)' }}>{profile.course}</p>}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowContactSheet(false)}>Close</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setShowContactSheet(false); navigate(`/user/${sheetUserId}`); }}>Visit</button>
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
