import React, { useState, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import { toast } from '../services/toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    course: user?.course || '',
    year: user?.year || '',
    rollNo: user?.rollNo || '',
    bio: user?.bio || '',
    profilePic: user?.profilePic || null,
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target.result.length > 3 * 1024 * 1024) {
        toast.error('Image too large. Use a smaller photo.');
        return;
      }
      setForm({ ...form, profilePic: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(form);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="page-container">
      <div className="page-header" style={{ textAlign: 'left' }}>
        <h1>My Profile</h1>
        <p>Manage your account information and preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>

        {/* Profile Picture Card */}
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="profile-avatar-container" onClick={() => fileInputRef.current?.click()}>
            {form.profilePic ? (
              <img src={form.profilePic} alt="Profile" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">{initials}</div>
            )}
            <div className="profile-avatar-overlay">📷<br/><span>Change Photo</span></div>
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
          <h3 style={{ marginTop: '1rem', marginBottom: '0.25rem' }}>{user?.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</p>

          <div style={{ marginTop: '1rem' }}>
            {user?.isEmailVerified ? (
              <span className="verified-badge">✅ Email Verified</span>
            ) : (
              <span className="unverified-badge">⚠️ Email Not Verified</span>
            )}
          </div>

          {user?.role === 'admin' && (
            <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '20px', background: 'rgba(244,63,94,0.15)', color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 700 }}>
              🔐 Admin
            </span>
          )}

          {user?.course && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div>{user.course} {user.year ? `· Year ${user.year}` : ''}</div>
              {user.rollNo && <div style={{ marginTop: '0.25rem' }}>Roll: {user.rollNo}</div>}
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Edit Profile</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="form-control" placeholder="+91 9876543210" />
              </div>
              <div className="form-group">
                <label className="form-label">Course / Branch</label>
                <input type="text" name="course" value={form.course} onChange={handleChange} className="form-control" placeholder="B.Tech CSE" />
              </div>
              <div className="form-group">
                <label className="form-label">Year</label>
                <select name="year" value={form.year} onChange={handleChange} className="form-control" style={{ appearance: 'none' }}>
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="PG">PG</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input type="text" name="rollNo" value={form.rollNo} onChange={handleChange} className="form-control" placeholder="220100100001" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} className="form-control" rows="3" placeholder="Tell the community a bit about yourself..." />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
