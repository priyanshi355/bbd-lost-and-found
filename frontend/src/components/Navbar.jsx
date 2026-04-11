import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { messageApi } from '../services/message.api';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll unread count every 30 seconds when user is logged in
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const fetchUnread = async () => {
      try {
        const data = await messageApi.getUnreadCount();
        setUnreadCount(data.count || 0);
      } catch { /* silent fail */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">BBD Lost & Found</Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
        <Link to="/lost" className={`nav-link ${isActive('/lost')}`}>Lost Items</Link>
        <Link to="/found" className={`nav-link ${isActive('/found')}`}>Found Items</Link>

        {user?.role === 'admin' && (
          <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>Admin Panel</Link>
        )}

        <Link to="/post" className="btn btn-primary">Post Item</Link>

        {user ? (
          <>
            {/* Inbox bell with unread badge */}
            <Link to="/inbox" className="nav-inbox-btn" title="Inbox">
              💬
              {unreadCount > 0 && (
                <span className="nav-unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </Link>

            <div className="nav-avatar-wrapper" ref={dropdownRef}>
              <button className="nav-avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {user.profilePic ? (
                  <img src={user.profilePic} alt="avatar" className="nav-avatar-img" />
                ) : (
                  <div className="nav-avatar-initials">{initials}</div>
                )}
                <span className="nav-avatar-name">{user.name.split(' ')[0]}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>▾</span>
              </button>
              {dropdownOpen && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-header">
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                  <Link to="/profile" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    👤 My Profile
                  </Link>
                  <Link to="/dashboard" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    📋 Dashboard
                  </Link>
                  <Link to="/inbox" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    💬 Inbox {unreadCount > 0 && <span className="nav-unread-badge" style={{ position: 'static', marginLeft: 'auto' }}>{unreadCount}</span>}
                  </Link>
                  <div className="nav-dropdown-divider"></div>
                  <button className="nav-dropdown-item nav-dropdown-logout" onClick={() => { logout(); setDropdownOpen(false); }}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className={`nav-link ${isActive('/login')}`}>Login / Register</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
