import React, { useState, useEffect } from 'react';
import { itemStore } from '../services/items.store';

const LostItems = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(itemStore.getItemsByType('lost'));
  }, []);

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
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {items.length === 0 ? (
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '250px', justifyContent: 'center', alignItems: 'center' }}>
             <p style={{ color: 'var(--text-muted)' }}>No lost items reported yet. Check back later.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {new Date(item.createdAt).toLocaleDateString()} • {item.category}
              </p>
              <p style={{ flex: 1, marginBottom: '1rem' }}>{item.description}</p>
              {item.location && <p style={{ fontSize: '0.9rem' }}><strong>Location:</strong> {item.location}</p>}
              {item.contact && <p style={{ fontSize: '0.9rem' }}><strong>Contact:</strong> {item.contact}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LostItems;
