import React from 'react';

const AdminPanel = () => {
  return (
    <div className="page-container">
      <div className="page-header" style={{ textAlign: 'left' }}>
        <h1 style={{ color: 'var(--accent-color)' }}>Admin Panel</h1>
        <p>System moderation and oversight dashboard.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
          <h3>Pending Claims</h3>
          <h2 style={{ margin: 0 }}>0</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--secondary-color)' }}>
          <h3>Unverified ID Cards</h3>
          <h2 style={{ margin: 0 }}>0</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-color)' }}>
          <h3>Flagged Duplicates</h3>
          <h2 style={{ margin: 0 }}>0</h2>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', minHeight: '300px' }}>
        <h3>Recent Activity</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '2rem', textAlign: 'center' }}>No activities logged yet.</p>
      </div>
    </div>
  );
};

export default AdminPanel;
