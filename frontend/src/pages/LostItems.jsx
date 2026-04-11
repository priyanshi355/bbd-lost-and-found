import React from 'react';

const LostItems = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Lost Items</h1>
        <p>Browse through items reported as lost by students on campus.</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <input type="text" className="form-control" placeholder="Search for items..." />
        <button className="btn btn-primary">Search</button>
      </div>
      
      {/* Items Grid Layout Base */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Placeholder structural item cards without junk data */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '250px', justifyContent: 'center', alignItems: 'center' }}>
           <p style={{ color: 'var(--text-muted)' }}>Item listings will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default LostItems;
