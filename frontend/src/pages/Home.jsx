import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Welcome to BBD Lost & Found</h1>
        <p>A secure platform for BBD College students to report lost belongings or help return found items.</p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/lost" className="btn btn-primary">Find a Lost Item</Link>
          <Link to="/post" className="btn btn-secondary">Report Found Item</Link>
        </div>
      </div>
      
      {/* Additional landing page sections can go here */}
    </div>
  );
};

export default Home;
