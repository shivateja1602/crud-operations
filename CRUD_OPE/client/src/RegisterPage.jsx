import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './Auth.css';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState('user');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Starting registration process');
    
    // Validation
    if (!name || !email || !password || !age) {
      console.log('Validation failed: Missing required fields');
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Preparing user data for registration');
      const userData = { name, email, password, age, role };
      console.log('Calling register function with image:', image ? 'Image selected' : 'No image');
      
      const result = await register(userData, image);
      console.log('Registration result:', { success: result.success });
      
      if (result.success) {
        console.log('Registration successful, navigating to home');
        navigate('/');
      } else {
        console.error('Registration failed:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Register</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input 
            type="text" 
            id="name" 
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            disabled={loading}
          />
        </div>
        
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
            placeholder="Create a password"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input 
            type="number" 
            id="age" 
            className="form-control"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Profile Image</label>
          <input 
            type="file" 
            id="image"
            className="form-control"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
          />
          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        
        <div className="auth-links">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
