import React, { useState, useEffect } from 'react';
import { itemStore } from '../services/items.store';
import { useAuth } from '../components/AuthContext';
import { toast } from '../services/toast';
import { useNavigate } from 'react-router-dom';

const MyItems = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editModal, setEditModal] = useState({ open: false, item: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMyItems = async () => {
    setIsLoading(true);
    try {
      const data = await itemStore.getMyItems();
      setItems(data);
    } catch (err) {
      toast.error('Failed to load your postings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyItems();
  }, [user, navigate]);

  const handleResolveToggle = async (id) => {
    try {
      await itemStore.resolveItem(id);
      toast.success('Item status updated!');
      setItems(prev => prev.map(i => i._id === id ? { ...i, resolved: !i.resolved } : i));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await itemStore.deleteItem(id);
      toast.success('Listing deleted securely');
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { title, description, location, contact } = editModal.item;
      const updated = await itemStore.updateItem(editModal.item._id, { title, description, location, contact });
      setItems(prev => prev.map(i => i._id === updated._id ? updated : i));
      toast.success('Listing updated successfully!');
      setEditModal({ open: false, item: null });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Profile & Postings</h1>
          <p>Manage the items you've reported as lost or found.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/post')}>+ New Listing</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {isLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
        ) : items.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', margin: '0 0 1rem' }}>📋</h2>
            <h3>No Postings Yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>You haven't posted any items yet.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item._id} className={`glass-panel item-card ${item.resolved ? 'resolved-item' : ''}`} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: item.type === 'lost' ? 'var(--primary-color)' : 'var(--secondary-color)', display: 'inline-block' }}>
                  {item.type.toUpperCase()}
                </span>
                {item.resolved && <span style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>✅ Resolved</span>}
              </div>

              {((item.images && item.images[0]) || item.imageUrl) && (
                <div style={{ marginBottom: '1rem', height: '140px', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={(item.images && item.images[0]) || item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </div>
              )}

              <h3 style={{ margin: '0 0 0.5rem 0', color: item.resolved ? 'var(--text-muted)' : 'var(--text-light)' }}>{item.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>{item.description}</p>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', borderColor: item.resolved ? '#64748b' : '#3b82f6', color: item.resolved ? '#94a3b8' : '#60a5fa' }} 
                  onClick={() => handleResolveToggle(item._id)}
                >
                  {item.resolved ? 'Mark Unresolved' : 'Mark Resolved'}
                </button>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => setEditModal({ open: true, item: { ...item } })}>
                  Edit
                </button>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => handleDelete(item._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editModal.open && (
        <div className="modal-overlay" onClick={() => setEditModal({ open: false, item: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditModal({ open: false, item: null })}>&times;</button>
            <h3>Edit Listing</h3>
            <form onSubmit={submitEdit} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-control" value={editModal.item.title} onChange={e => setEditModal({ ...editModal, item: { ...editModal.item, title: e.target.value }})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={4} value={editModal.item.description} onChange={e => setEditModal({ ...editModal, item: { ...editModal.item, description: e.target.value }})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-control" value={editModal.item.location || ''} onChange={e => setEditModal({ ...editModal, item: { ...editModal.item, location: e.target.value }})} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact</label>
                <input className="form-control" value={editModal.item.contact || ''} onChange={e => setEditModal({ ...editModal, item: { ...editModal.item, contact: e.target.value }})} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditModal({ open: false, item: null })}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyItems;
