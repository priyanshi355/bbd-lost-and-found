import React from 'react';

const FoundItems = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Found Items</h1>
        <p>Browse through items found around the BBD campus to claim your lost property.</p>
      </div>
      
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <input type="text" className="form-control" placeholder="Search for found items..." />
        <button className="btn btn-primary">Search</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '250px', justifyContent: 'center', alignItems: 'center' }}>
           <p style={{ color: 'var(--text-muted)' }}>Found item listings will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default FoundItems;
