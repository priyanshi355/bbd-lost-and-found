import React, { useState, useEffect } from 'react';
import { itemStore } from '../services/items.store';
import { toast } from '../services/toast';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    // Artificial load to demonstrate skeleton
    setTimeout(() => {
      loadItems();
    }, 600);
  }, []);

  const loadItems = () => {
    setItems(itemStore.getAllItems());
    setIsLoading(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      itemStore.deleteItem(id);
      toast.success('Item deleted successfully!');
      loadItems();
    }
  };

  const handleResolve = (id) => {
    itemStore.updateItem(id, { resolved: true });
    toast.success('Item marked as resolved!');
    loadItems();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = () => {
    if (!editForm.title || !editForm.description) {
      toast.error("Title and description are required");
      return;
    }
    itemStore.updateItem(editingId, editForm);
    toast.success('Item updated successfully!');
    setEditingId(null);
    loadItems();
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ textAlign: 'left' }}>
        <h1>My Dashboard</h1>
        <p>Manage your reported items and claims.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3>My Listings</h3>
          {isLoading ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
               <div className="skeleton" style={{ height: '80px', borderRadius: '8px' }}></div>
               <div className="skeleton" style={{ height: '80px', borderRadius: '8px' }}></div>
             </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>📋</h2>
              <p style={{ color: 'var(--text-muted)' }}>You haven't posted any items yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {items.map(item => (
                <div key={item.id} className={item.resolved ? 'resolved-item' : ''} style={{ 
                  padding: '1rem', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.2)',
                  transition: 'opacity 0.3s ease'
                }}>
                  {editingId === item.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0' }}>Title</label>
                      <input type="text" name="title" value={editForm.title} onChange={handleEditChange} className="form-control" />
                      
                      <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0' }}>Description</label>
                      <textarea name="description" value={editForm.description} onChange={handleEditChange} className="form-control" rows="2"></textarea>
                      
                      <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0' }}>Contact Info</label>
                      <input type="text" name="contact" value={editForm.contact || ''} onChange={handleEditChange} className="form-control" />
                      
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button className="btn btn-primary" onClick={saveEdit} style={{ padding: '0.5rem 1rem' }}>Save</button>
                        <button className="btn btn-secondary" onClick={cancelEdit} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '4px', 
                            background: item.type === 'lost' ? 'var(--primary-color)' : 'var(--secondary-color)' 
                          }}>
                            {item.type ? item.type.toUpperCase() : 'UNKNOWN'}
                          </span>
                          {item.resolved && (
                             <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--secondary-color)' }}>
                               RESOLVED
                             </span>
                          )}
                          <span style={{ textDecoration: item.resolved ? 'line-through' : 'none' }}>
                             {item.title}
                          </span>
                        </h4>
                        <p style={{ fontSize: '0.9rem', margin: '0', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!item.resolved && (
                          <button className="btn btn-secondary" onClick={() => handleResolve(item.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)' }}>Resolve</button>
                        )}
                        <button className="btn btn-secondary" onClick={() => startEdit(item)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Edit</button>
                        <button className="btn btn-primary" onClick={() => handleDelete(item.id)} style={{ background: 'var(--accent-color)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
