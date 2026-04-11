import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">BBD Lost & Found</Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
        <Link to="/lost" className={`nav-link ${isActive('/lost')}`}>Lost Items</Link>
        <Link to="/found" className={`nav-link ${isActive('/found')}`}>Found Items</Link>
        
        {user && <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>}
        {user?.role === 'admin' && <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>Admin Panel</Link>}
        
        <Link to="/post" className={`btn btn-primary`}>Post Item</Link>
        
        {user ? (
          <button 
            onClick={logout} 
            className="nav-link" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}
          >
            Logout ({user.name.split(' ')[0]})
          </button>
        ) : (
          <Link to="/login" className={`nav-link ${isActive('/login')}`}>Login / Register</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
