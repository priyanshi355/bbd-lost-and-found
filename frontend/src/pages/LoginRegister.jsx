import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from '../services/toast';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      if (login(formData.email, formData.password)) {
        navigate('/dashboard');
      }
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        toast.error("Please fill in all required fields!");
        return;
      }
      if (register(formData.name, formData.email, formData.password)) {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="John Doe" />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">College Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" placeholder="student@bbd.ac.in" required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? 'Login to Account' : 'Register Now'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '500' }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Register here' : 'Login here'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
