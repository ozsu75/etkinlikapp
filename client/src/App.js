import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import './App.css';
import EtkinlikOlustur from './components/EtkinlikOlustur';







function App() {
  const [user, setUser] = useState(null);

  // Sayfa yüklendiğinde localStorage'dan kullanıcıyı al
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Etkinlik Platformu</h1>
          <nav>
            <a href="/" className="nav-link">Ana Sayfa</a>
            {user && user.userType === 'corporate' && (
              <a href="/etkinlik-olustur" className="nav-link">Etkinlik Oluştur</a>
            )}
            <a href="/register" className="nav-link">Üye Ol</a>
            {user ? (
              <>
                <span style={{ color: 'white', margin: '0 15px' }}>
                  Hoş geldiniz, {user.firstName}!
                </span>
                <button onClick={() => {
                  localStorage.removeItem('user');
                  localStorage.removeItem('token');
                  setUser(null);
                  window.location.href = '/';
                }} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                  Çıkış Yap
                </button>
              </>
            ) : (
              <a href="/login" className="nav-link">Giriş Yap</a>
            )}
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={
              <div>
                <h2>Hoş Geldiniz</h2>
                {user ? (
                  <p>Hoş geldiniz {user.firstName} {user.lastName}! Etkinlikleri keşfedebilirsiniz.</p>
                ) : (
                  <p>Etkinlikleri keşfetmek için lütfen giriş yapın veya üye olun.</p>
                )}
              </div>
            } />
            
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm setUser={setUser} />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/etkinlik-olustur" element={<EtkinlikOlustur />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;