import React, { useState } from 'react';

const PostItem = () => {
  const [type, setType] = useState('lost');

  return (
    <div className="page-container" style={{ alignItems: 'center' }}>
      <div className="page-header">
        <h1>Post an Item</h1>
        <p>Report an item you have lost or found on the BBD campus.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '600px' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            className={`btn ${type === 'lost' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1 }}
            onClick={() => setType('lost')}
          >
            I Lost Something
          </button>
          <button 
            className={`btn ${type === 'found' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1 }}
            onClick={() => setType('found')}
          >
            I Found Something
          </button>
        </div>

        <form>
          <div className="form-group">
            <label className="form-label">Item Title</label>
            <input type="text" className="form-control" placeholder="E.g., Black Dell Laptop Charger" />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" style={{ WebkitAppearance: 'none', appearance: 'none' }}>
              <option value="">Select a category</option>
              <option value="electronics">Electronics</option>
              <option value="documents">Documents / ID</option>
              <option value="accessories">Accessories</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="4" placeholder="Provide detailed description..."></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Location (Last seen / Found at)</label>
            <input type="text" className="form-control" placeholder="E.g., Library 2nd Floor" />
          </div>

          <div className="form-group">
            <label className="form-label">Upload Images</label>
            <input type="file" className="form-control" multiple />
          </div>

          <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostItem;
