import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

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
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
        <Link to="/post" className={`btn btn-primary`}>Post Item</Link>
        <Link to="/login" className={`nav-link ${isActive('/login')}`}>Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;
