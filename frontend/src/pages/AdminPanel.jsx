import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { itemStore } from '../services/items.store';
import { authStore } from '../services/auth.store';
import { toast } from '../services/toast';

const AdminPanel = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, totalItems: 0, activeItems: 0, resolvedItems: 0 });
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allUsers = authStore.getAllUsers();
    const allItems = itemStore.getAllItems();
    
    setStats({
      users: allUsers.length,
      totalItems: allItems.length,
      activeItems: allItems.filter(i => !i.resolved).length,
      resolvedItems: allItems.filter(i => i.resolved).length,
    });
    setItems(allItems);
  };

  const handleDeleteItem = (id) => {
     if(window.confirm('Admin Override: Are you sure you wish to permanently delete this item?')) {
        itemStore.deleteItem(id);
        toast.success("Item manually purged.");
        loadData();
     }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ textAlign: 'left' }}>
        <h1 style={{ color: 'var(--accent-color)' }}>Admin Control Panel</h1>
        <p>System Overview and Master Governance</p>
      </div>

      {/* Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
         <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', margin: '0' }}>{stats.users}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Registered Users</p>
         </div>
         <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', margin: '0', color: 'var(--primary-color)' }}>{stats.totalItems}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Total Listings</p>
         </div>
         <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', margin: '0', color: 'var(--accent-color)' }}>{stats.activeItems}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Active Flagged</p>
         </div>
         <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', margin: '0', color: 'var(--secondary-color)' }}>{stats.resolvedItems}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Resolved Cases</p>
         </div>
      </div>

      {/* Global Table */}
      <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Global Item Registry</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Type</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Title</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Author ID</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                 <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: item.type === 'lost' ? 'var(--primary-color)' : 'var(--secondary-color)' }}>
                      {item.type ? item.type.toUpperCase() : 'UNKNOWN'}
                    </span>
                 </td>
                 <td style={{ padding: '1rem' }}>{item.title}</td>
                 <td style={{ padding: '1rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.authorId || 'Anonymous'}</span>
                 </td>
                 <td style={{ padding: '1rem' }}>
                    {item.resolved ? <span style={{ color: 'var(--secondary-color)' }}>Resolved</span> : <span style={{ color: 'var(--accent-color)' }}>Active</span>}
                 </td>
                 <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: 'var(--accent-color)', borderColor: 'var(--accent-color)' }} onClick={() => handleDeleteItem(item.id)}>Purge</button>
                 </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Registry empty.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
