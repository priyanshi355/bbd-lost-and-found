import React, { useState } from 'react';
import { messageApi } from '../services/message.api';
import { toast } from '../services/toast';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

const SendMessageModal = ({ item, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  if (!item) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!user) {
      toast.error('Please login to send a message');
      navigate('/login');
      return;
    }
    setSending(true);
    try {
      await messageApi.startConversation(item.id || item._id, text);
      toast.success('Message sent! View it in your Inbox.');
      onClose();
      navigate('/inbox');
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally { setSending(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h3 style={{ marginBottom: '0.25rem' }}>💬 Send Message</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          About: <strong>{item.title}</strong>
        </p>
        <form onSubmit={handleSend}>
          <div className="form-group">
            <label className="form-label">Your Message</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder={`Hi! I think I found your ${item.title}. Please contact me...`}
              value={text}
              onChange={e => setText(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={sending || !text.trim()}>
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendMessageModal;
