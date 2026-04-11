import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import LostItems from './pages/LostItems';
import FoundItems from './pages/FoundItems';
import PostItem from './pages/PostItem';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/lost" element={<LostItems />} />
          <Route path="/found" element={<FoundItems />} />
          <Route path="/post" element={<PostItem />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
