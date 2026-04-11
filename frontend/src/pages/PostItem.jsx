import React, { useState, useRef } from 'react';
import { itemStore } from '../services/items.store';
import { toast } from '../services/toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import CampusMap from '../components/CampusMap';

const PostItem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [type, setType] = useState('lost');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    contact: ''
  });
  const [imageBase64, setImageBase64] = useState('');
  const [mapCoords, setMapCoords] = useState(null); // { lat, lng }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageBase64('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      // Basic image size validation (optional)
      if (event.target.result.length > 5 * 1024 * 1024) { // over ~3.5MB base64
        toast.error('Image is too large. Please select a smaller file (under 3MB).');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setImageBase64('');
        return;
      }
      setImageBase64(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.description) {
      toast.error("Please fill in the required fields (Title, Category, Description).");
      return;
    }

    setIsSubmitting(true);

    try {
      await itemStore.addItem({
        authorId: user?.id,
        type,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        contact: formData.contact,
        imageUrl: imageBase64 || null,
        lat: mapCoords?.lat || null,
        lng: mapCoords?.lng || null,
      });

      toast.success(`Successfully reported ${type} item!`);
      
      setFormData({ title: '', category: '', description: '', location: '', contact: '' });
      setImageBase64('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsSubmitting(false);
      
      if (type === 'lost') {
        navigate('/lost');
      } else {
        navigate('/found');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to successfully post database records.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ alignItems: 'center' }}>
      <div className="page-header">
        <h1>Post an Item</h1>
        <p>Report an item you have lost or found on the BBD campus.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '600px' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            type="button"
            className={`btn ${type === 'lost' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1 }}
            onClick={() => setType('lost')}
          >
            I Lost Something
          </button>
          <button 
            type="button"
            className={`btn ${type === 'found' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1 }}
            onClick={() => setType('found')}
          >
            I Found Something
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" placeholder="E.g., Black Dell Laptop Charger" required />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} className="form-control" style={{ WebkitAppearance: 'none', appearance: 'none' }} required>
              <option value="">Select a category</option>
              <option value="electronics">Electronics</option>
              <option value="documents">Documents / ID</option>
              <option value="accessories">Accessories</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows="4" placeholder="Provide detailed description..." required></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Location (Last seen / Found at)</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="form-control" placeholder="E.g., Library 2nd Floor" />
          </div>

          <div className="form-group">
            <label className="form-label">Pin on BBD Campus Map (Optional)</label>
            {mapCoords && (
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
                📍 Pin placed at ({mapCoords.lat.toFixed(5)}, {mapCoords.lng.toFixed(5)})
                <button type="button" onClick={() => setMapCoords(null)} style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.8rem' }}>Remove pin</button>
              </p>
            )}
            <CampusMap
              lat={mapCoords?.lat}
              lng={mapCoords?.lng}
              onChange={(lat, lng) => setMapCoords({ lat, lng })}
              height="280px"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image (Optional)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="form-control" 
              ref={fileInputRef}
              style={{ display: 'block', padding: '0.6rem' }}
            />
            {imageBase64 && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <img 
                  src={imageBase64} 
                  alt="Preview" 
                  style={{ maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--glass-border)' }} 
                />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Contact Information (Optional)</label>
            <input type="text" name="contact" value={formData.contact} onChange={handleChange} className="form-control" placeholder="E.g., +91 9876543210 or email" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostItem;
