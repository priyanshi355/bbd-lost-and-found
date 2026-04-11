import React from 'react';

const Dashboard = () => {
  return (
    <div className="page-container">
      <div className="page-header" style={{ textAlign: 'left' }}>
        <h1>My Dashboard</h1>
        <p>Manage your reported items and claims.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3>My Listings</h3>
          <p style={{ color: 'var(--text-muted)' }}>You haven't posted any items yet.</p>
        </div>
        
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3>My Claims</h3>
          <p style={{ color: 'var(--text-muted)' }}>You haven't claimed any items yet.</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3>QR Code Verify (Advanced)</h3>
          <p style={{ color: 'var(--text-muted)' }}>Upload or scan a generated QR claim code for secure handover.</p>
          <button className="btn btn-secondary" style={{ marginTop: '1rem' }}>Scan QR</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
