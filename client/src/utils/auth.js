// auth.js - DÜZELTİLMİŞ HALİ
import jwtDecode from 'jwt-decode';

// Token'ı localStorage'dan al
export const getToken = () => {
  return localStorage.getItem('token');
};

// Kullanıcı bilgilerini al
export const getUser = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

// Kullanıcı giriş yapmış mı?
export const isAuthenticated = () => {
  return !!getToken();
};

// Kullanıcı admin mi? (İsim değiştirdik)
export const isAdminUser = (user = null) => {
  const userData = user || getUser();
  return userData && userData.role === 'admin';
};

// Token'ı kontrol et
export const isTokenValid = () => {
  const user = getUser();
  if (!user) return false;
  
  const currentTime = Date.now() / 1000;
  return user.exp > currentTime;
};