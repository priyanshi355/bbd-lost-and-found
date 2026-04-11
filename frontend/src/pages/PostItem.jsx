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
    description: '',
    category: '',
    type: 'lost',
    location: '',
    contact: '',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [images, setImages] = useState([]); // array of base64 strings (up to 5)
  const [mapCoords, setMapCoords] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    if (!files.length) return;
    const readers = files.map(file => new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) return reject(new Error('Not an image'));
      if (file.size > 3 * 1024 * 1024) return reject(new Error(`${file.name} is too large (max 3MB)`));
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }));
    Promise.all(readers)
      .then(results => setImages(prev => [...prev, ...results].slice(0, 5)))
      .catch(err => toast.error(err.message));
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

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
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer,
        imageUrl: images[0] || null,
        images: images,
        lat: mapCoords?.lat || null,
        lng: mapCoords?.lng || null,
      });

      toast.success(`Successfully reported ${type} item!`);
      setFormData({ title: '', category: '', description: '', location: '', contact: '', securityQuestion: '', securityAnswer: '' });
      setImages([]);
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
            onClick={() => { setType('lost'); setFormData(prev => ({...prev, type: 'lost'})) }}
          >
            I Lost Something
          </button>
          <button 
            type="button"
            className={`btn ${type === 'found' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1 }}
            onClick={() => { setType('found'); setFormData(prev => ({...prev, type: 'found'})) }}
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
            <label className="form-label">Images (Optional — up to 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="form-control"
              ref={fileInputRef}
              style={{ display: 'block', padding: '0.6rem' }}
            />
            {images.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={img} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                    <button type="button" onClick={() => removeImage(i)}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--accent-color)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', color: 'white', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✕
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <div style={{ width: '80px', height: '80px', border: '2px dashed var(--glass-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                    onClick={() => fileInputRef.current?.click()}>
                    +
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Contact Details (Optional)</label>
            <input type="text" name="contact" value={formData.contact} onChange={handleChange} className="form-control" placeholder="Phone number or generic info..." />
          </div>

          {formData.type === 'found' && (
            <div className="form-group" style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '1rem', borderLeft: '3px solid var(--accent-color)', borderRadius: '4px' }}>
              <label className="form-label" style={{ color: 'var(--accent-color)' }}>🔒 Anti-Scam Claim Protection (Optional)</label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Require claimants to correctly answer a secret question about the item (e.g. "What is the lock screen wallpaper?") before they can see your contact info.
              </p>
              <input type="text" name="securityQuestion" value={formData.securityQuestion} onChange={handleChange} className="form-control" placeholder="Security Question..." style={{ marginBottom: '0.5rem' }} />
              <input type="text" name="securityAnswer" value={formData.securityAnswer} onChange={handleChange} className="form-control" placeholder="Exact Answer (Case-insensitive)" />
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostItem;
