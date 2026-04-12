import React, { useState, useEffect, useMemo } from 'react';
import { itemStore } from '../services/items.store';
import ItemModal from '../components/ItemModal';

const FoundItems = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortDate, setSortDate] = useState('newest');

  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      const data = await itemStore.getItemsByType('found');
      setItems(data);
      setIsLoading(false);
    };
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = item.title.toLowerCase().includes(q) || 
                            item.description.toLowerCase().includes(q) || 
                            (item.location && item.location.toLowerCase().includes(q));
      
      const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortDate === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [items, searchQuery, categoryFilter, sortDate]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Found Items</h1>
        <p>Browse through items found around the BBD campus to claim your lost property.</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="search-bar-row">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by title, description or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 2 }}
          />
          <select 
            className="filter-select" 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ flex: 1, minWidth: '150px' }}
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="documents">Documents / ID</option>
            <option value="accessories">Accessories</option>
            <option value="other">Other</option>
          </select>
          <select 
            className="filter-select" 
            value={sortDate} 
            onChange={(e) => setSortDate(e.target.value)}
            style={{ flex: 1, minWidth: '150px' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {isLoading ? (
          /* Skeletons */
          Array(4).fill(0).map((_, i) => (
            <div key={`sk-${i}`} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
            </div>
          ))
        ) : filteredItems.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', gridColumn: '1 / -1', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>✨</h2>
             <h3 style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>No found items reported</h3>
             <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search filters. Be the first to report something you've found!</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div 
              key={item.id} 
              className={`glass-panel item-card ${item.resolved ? 'resolved-item' : ''}`} 
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
              onClick={() => setSelectedItem(item)}
            >
              {item.resolved && (
                 <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--secondary-color)', display: 'inline-block', alignSelf: 'flex-start', marginBottom: '0.5rem' }}>
                   RESOLVED
                 </span>
              )}
              <h3 style={{ margin: '0 0 0.5rem 0', color: item.resolved ? 'var(--text-muted)' : 'var(--secondary-color)' }}>
                 {item.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {new Date(item.createdAt).toLocaleDateString()} • {item.category}
              </p>
              {item.imageUrl && (
                <div style={{ marginBottom: '1rem', height: '120px', overflow: 'hidden', borderRadius: '6px' }}>
                  <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <p style={{ flex: 1, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.description}
              </p>
              {item.location && <p style={{ fontSize: '0.9rem' }}><strong>Found at:</strong> {item.location}</p>}
            </div>
          ))
        )}
      </div>

      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
};

export default FoundItems;
