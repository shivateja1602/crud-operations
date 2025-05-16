import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import CreateUser from './CreateUser';
import UpdateUser from './UpdateUser';
import Users from './Users';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route path='/' element={
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      } />
      
      <Route path='/create' element={
        <ProtectedRoute>
          <CreateUser />
        </ProtectedRoute>
      } />
      
      <Route path='/update/:id' element={
        <ProtectedRoute>
          <UpdateUser />
        </ProtectedRoute>
      } />
      
      <Route path='*' element={<div>Page not found</div>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;