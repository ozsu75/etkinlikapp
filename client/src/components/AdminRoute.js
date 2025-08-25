// AdminRoute.js - DÜZELTİLMİŞ HALİ
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isAdminUser } from '../utils/auth'; // İsim değiştirdik

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/giris" replace />;
  }
  
  if (!isAdminUser(user)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AdminRoute;