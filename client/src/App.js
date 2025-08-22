import React, { useState } from 'react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Etkinlik Platformu</h1>
        <nav>
          <button onClick={() => setCurrentView('home')}>Ana Sayfa</button>
          <button onClick={() => setCurrentView('register')}>Üye Ol</button>
          <button onClick={() => setCurrentView('login')}>Giriş Yap</button>
        </nav>
      </header>

      <main>
        {currentView === 'home' && (
          <div>
            <h2>Hoş Geldiniz</h2>
            <p>Etkinlikleri keşfetmek için lütfen giriş yapın veya üye olun.</p>
          </div>
        )}

        {currentView === 'register' && <RegisterForm />}
        
        {currentView === 'login' && <LoginForm setUser={setUser} />}
      </main>
    </div>
  );
}

export default App;