import { itemStore } from '../services/items.store';
import { toast } from '../services/toast';
import { useNavigate } from 'react-router-dom';

const PostItem = () => {
  const navigate = useNavigate();
  const [type, setType] = useState('lost');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    contact: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.description) {
      toast.error("Please fill in the required fields (Title, Category, Description).");
      return;
    }

    setIsSubmitting(true);

    // Call Vanilla JS store implementation for CRUD Create
    itemStore.addItem({
      type,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      location: formData.location,
      contact: formData.contact,
    });

    toast.success(`Successfully reported ${type} item!`);
    
    // Reset form state properly
    setFormData({ title: '', category: '', description: '', location: '', contact: '' });
    setIsSubmitting(false);
    
    // Auto redirect to updated list to fulfill render requirement
    if (type === 'lost') {
      navigate('/lost');
    } else {
      navigate('/found');
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
