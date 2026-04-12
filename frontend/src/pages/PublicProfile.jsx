import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ItemModal from '../components/ItemModal';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/users/${userId}/public`);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        setProfile(data.user);
        setItems(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) load();
  }, [userId]);

  const filteredItems = activeTab === 'all'
    ? items
    : items.filter(i => i.type === activeTab);

  const lostCount = items.filter(i => i.type === 'lost').length;
  const foundCount = items.filter(i => i.type === 'found').length;
  const resolvedCount = items.filter(i => i.resolved).length;

  if (isLoading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid var(--glass-border)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
        <h3 style={{ marginBottom: '0.5rem' }}>Profile Not Found</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>This user profile doesn't exist or was removed.</p>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', marginBottom: '1.5rem', wordBreak: 'break-all' }}>
          Requested ID: {userId}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate(-1)}>← Back</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => window.location.reload()}>🔄 Retry</button>
        </div>
      </div>
    </div>
  );

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const joinDate = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '';

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0 }}
      >
        ← Back
      </button>

      {/* Profile Card */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
            {profile?.profilePic ? (
              <img
                src={profile.profilePic}
                alt={profile.name}
                style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)' }}
              />
            ) : (
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-color), #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: 700, color: 'white',
                border: '3px solid rgba(167,139,250,0.4)'
              }}>
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <h1 style={{ fontSize: '1.6rem', margin: 0 }}>{profile?.name}</h1>
              {profile?.role === 'admin' && (
                <span style={{ background: 'var(--accent-color)', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                  ADMIN
                </span>
              )}
            </div>
            {(profile?.course || profile?.year) && (
              <p style={{ color: 'var(--primary-color)', fontSize: '0.95rem', marginBottom: '0.4rem', fontWeight: 500 }}>
                {[profile.course, profile.year && `${profile.year} Year`].filter(Boolean).join(' • ')}
              </p>
            )}
            {profile?.rollNo && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                🎓 Roll No: {profile.rollNo}
              </p>
            )}
            {profile?.bio && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{profile.bio}</p>
            )}
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              📅 Member since {joinDate}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Posts', value: items.length, color: 'var(--text-light)' },
            { label: 'Lost Reports', value: lostCount, color: 'var(--accent-color)' },
            { label: 'Found Reports', value: foundCount, color: 'var(--secondary-color)' },
            { label: 'Resolved', value: resolvedCount, color: '#a78bfa' },
          ].map(stat => (
            <div key={stat.label} className="glass-panel" style={{ flex: '1 1 80px', padding: '0.85rem', textAlign: 'center', borderRadius: '10px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['all', 'lost', 'found'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', textTransform: 'capitalize' }}
            >
              {tab === 'all' ? `All (${items.length})` : tab === 'lost' ? `Lost (${lostCount})` : `Found (${foundCount})`}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📭</div>
            <p style={{ color: 'var(--text-muted)' }}>No {activeTab === 'all' ? '' : activeTab} listings yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="glass-panel item-card"
                onClick={() => setSelectedItem(item)}
                style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', opacity: item.resolved ? 0.6 : 1 }}
              >
                {item.resolved && (
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--secondary-color)', display: 'inline-block', alignSelf: 'flex-start', marginBottom: '0.5rem', fontWeight: 700 }}>
                    RESOLVED
                  </span>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: item.type === 'lost' ? 'var(--accent-color)' : 'var(--secondary-color)', flex: 1 }}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: item.type === 'lost' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)', color: item.type === 'lost' ? 'var(--accent-color)' : 'var(--secondary-color)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
                  </span>
                </div>
                {item.imageUrl && (
                  <div style={{ height: '100px', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.75rem' }}>
                    <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                  {item.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>📍 {item.location || 'Campus'}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default PublicProfile;
