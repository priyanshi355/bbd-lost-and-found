import React from 'react';
import CampusMap from './CampusMap';

const ItemModal = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <span style={{ 
          fontSize: '0.8rem', 
          padding: '0.3rem 0.6rem', 
          borderRadius: '4px', 
          background: item.type === 'lost' ? 'var(--primary-color)' : 'var(--secondary-color)',
          display: 'inline-block',
          marginBottom: '1rem'
        }}>
          {item.type ? item.type.toUpperCase() : 'ITEM'}
        </span>
        
        {item.resolved && (
          <span style={{ 
            fontSize: '0.8rem', 
            padding: '0.3rem 0.6rem', 
            borderRadius: '4px', 
            background: 'var(--secondary-color)',
            display: 'inline-block',
            marginBottom: '1rem',
            marginLeft: '0.5rem'
          }}>
            RESOLVED
          </span>
        )}

        <h2 style={{ marginBottom: '0.5rem', color: item.resolved ? 'var(--text-muted)' : 'inherit' }}>
          {item.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {new Date(item.createdAt).toLocaleDateString()} • {item.category}
        </p>

        {item.imageUrl && (
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid var(--glass-border)' }} 
            />
          </div>
        )}
        
        <div style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Description</h4>
          <p>{item.description}</p>
        </div>

        {item.location && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Last Seen / Found At</h4>
            <p>{item.location}</p>
          </div>
        )}
        
        {item.contact && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Contact Info</h4>
            <p>{item.contact}</p>
          </div>
        )}

        {item.lat && item.lng && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>📍 Location on Campus Map</h4>
            <CampusMap lat={item.lat} lng={item.lng} readOnly={true} height="220px" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemModal;
