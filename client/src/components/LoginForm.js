import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setErrors({});
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Giriş sırasında bir hata oluştu' });
    }
  };

  return (
    <div className="login-form">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Şifre</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {errors.submit && <div className="error-text">{errors.submit}</div>}
        
        <button type="submit" className="submit-btn">Giriş Yap</button>
      </form>
    </div>
  );
};

export default LoginForm;