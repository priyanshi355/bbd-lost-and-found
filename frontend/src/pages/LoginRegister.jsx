import React, { useState } from 'react';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 2rem 0' }}>
          {isLogin ? 'Login to Account' : 'Create Account'}
        </h2>
        
        <form>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" placeholder="John Doe" />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">College Email (@bbd.ac.in)</label>
            <input type="email" className="form-control" placeholder="student@bbd.ac.in" />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="••••••••" />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Upload College ID (Advanced Feature)</label>
              <input type="file" className="form-control" />
            </div>
          )}

          <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600' }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Register' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
