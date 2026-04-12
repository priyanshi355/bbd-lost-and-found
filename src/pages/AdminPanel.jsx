import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/admin.api';
import { toast } from '../services/toast';
import { useAuth } from '../components/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [broadcast, setBroadcast] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => { loadTab(tab); }, [tab]);

  const loadTab = async (t) => {
    setLoading(true);
    try {
      if (t === 'stats') setStats(await adminApi.getStats());
      if (t === 'users') setUsers(await adminApi.getUsers());
      if (t === 'reports') setReports(await adminApi.getReports());
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleBanUser = async (id, banned) => {
    try {
      const res = banned ? await adminApi.unbanUser(id) : await adminApi.banUser(id);
      toast.success(res.message);
      loadTab('users');
    } catch (err) { toast.error(err.message); }
  };

  const handleDismissReport = async (id) => {
    try { await adminApi.dismissReport(id); toast.success('Report dismissed.'); loadTab('reports'); }
    catch (err) { toast.error(err.message); }
  };

  const handleBanItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    try { const r = await adminApi.banItem(itemId); toast.success(r.message); loadTab('reports'); }
    catch (err) { toast.error(err.message); }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Send this to ALL verified users?`)) return;
    setSending(true);
    try {
      const r = await adminApi.broadcast(broadcast.subject, broadcast.message);
      toast.success(r.message);
      setBroadcast({ subject: '', message: '' });
    } catch (err) { toast.error(err.message); }
    finally { setSending(false); }
  };

  const tabs = [
    { id: 'stats', label: '📊 Analytics' },
    { id: 'users', label: '👥 Users' },
    { id: 'reports', label: `🚩 Reports${stats?.pendingReports > 0 ? ` (${stats.pendingReports})` : ''}` },
    { id: 'broadcast', label: '📢 Broadcast' },
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ textAlign: 'left' }}>
        <h1 style={{ color: 'var(--accent-color)' }}>🔐 Admin Control Panel</h1>
        <p>Full platform management and oversight</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`btn ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1.25rem' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>}

      {/* ===== STATS ===== */}
      {!loading && tab === 'stats' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'var(--primary-color)' },
              { label: 'Total Listings', value: stats.totalItems, color: 'var(--secondary-color)' },
              { label: 'Lost Items', value: stats.lostItems, color: '#f59e0b' },
              { label: 'Found Items', value: stats.foundItems, color: 'var(--secondary-color)' },
              { label: 'Resolved', value: stats.resolvedItems, color: '#10b981' },
              { label: 'Pending Reports', value: stats.pendingReports, color: 'var(--accent-color)' },
            ].map(s => (
              <div key={s.label} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.25rem 0', color: s.color }}>{s.value}</h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Category Breakdown</h3>
            {stats.categoryData.map(c => (
              <div key={c._id} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ textTransform: 'capitalize' }}>{c._id || 'Other'}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{c.count} items</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '8px' }}>
                  <div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, var(--primary-color), #a78bfa)', width: `${Math.min(100, (c.count / stats.totalItems) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== USERS ===== */}
      {!loading && tab === 'users' && (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Registered Users ({users.length})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                {['Name', 'Email', 'Course', 'Verified', 'Role', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem', color: 'var(--text-muted)', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {u.profilePic
                        ? <img src={u.profilePic} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{u.name?.[0]}</div>
                      }
                      {u.name}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{u.course || '—'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {u.isEmailVerified ? <span style={{ color: '#10b981' }}>✅</span> : <span style={{ color: '#ef4444' }}>❌</span>}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: u.role === 'admin' ? 'rgba(244,63,94,0.2)' : u.role === 'banned' ? 'rgba(239,68,68,0.2)' : 'rgba(79,70,229,0.2)', color: u.role === 'banned' ? '#ef4444' : 'inherit' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {u.id !== user.id && u.role !== 'admin' && (
                      <button onClick={() => handleBanUser(u.id, u.role === 'banned')}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: u.role === 'banned' ? 'var(--secondary-color)' : 'var(--accent-color)', borderColor: u.role === 'banned' ? 'var(--secondary-color)' : 'var(--accent-color)' }}>
                        {u.role === 'banned' ? 'Unban' : 'Ban'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== REPORTS ===== */}
      {!loading && tab === 'reports' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>🚩 Pending Reports ({reports.length})</h3>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              No pending reports — all clear!
            </div>
          ) : reports.map(r => (
            <div key={r.id} style={{ padding: '1.25rem', borderRadius: '8px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0' }}>Item: {r.itemTitle}</h4>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Reported by: {r.reporterName} · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                  <p style={{ margin: 0 }}><strong>Reason:</strong> {r.reason}</p>
                  {r.details && <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{r.details}</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleDismissReport(r.id)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Dismiss</button>
                  <button onClick={() => handleBanItem(r.item)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'var(--accent-color)' }}>Remove Item</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== BROADCAST ===== */}
      {tab === 'broadcast' && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>📢 Send Announcement</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Send an email to all verified users on the platform.</p>
          <form onSubmit={handleBroadcast}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input type="text" className="form-control" placeholder="Important Update from BBD Lost & Found"
                value={broadcast.subject} onChange={e => setBroadcast({ ...broadcast, subject: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-control" rows={6} placeholder="Write your announcement here..."
                value={broadcast.message} onChange={e => setBroadcast({ ...broadcast, message: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={sending}>
              {sending ? 'Sending...' : '📢 Send to All Users'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
