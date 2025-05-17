import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './Auth.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
    const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Starting login process');
    
    if (!email || !password) {
      console.log('Login validation failed: Missing email or password');
      setError('Email and password are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login for email:', email);
      const result = await login(email, password);
      
      if (result.success) {
        console.log('Login successful, navigating to home');
        navigate('/');
      } else {
        console.error('Login failed:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>
          <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
          <div className="auth-links">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
