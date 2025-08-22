import React, { useState } from 'react';
import axios from 'axios';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'individual',
    phone: '',
    city: '',
    district: '',
    company: {
      name: '',
      shortName: '',
      authorizedPerson: '',
      contactNumber: '',
      address: '',
      taxNumber: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('company.')) {
      const companyField = name.split('.')[1];
      setFormData({
        ...formData,
        company: {
          ...formData.company,
          [companyField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) newErrors.firstName = 'Ad zorunludur';
    if (!formData.lastName) newErrors.lastName = 'Soyad zorunludur';
    if (!formData.email) newErrors.email = 'Email zorunludur';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Geçerli bir email adresi giriniz';
    
    if (!formData.password) newErrors.password = 'Şifre zorunludur';
    else if (formData.password.length < 6) newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    
    if (formData.userType === 'corporate') {
      if (!formData.company.name) newErrors.companyName = 'Kurum adı zorunludur';
      if (!formData.company.authorizedPerson) newErrors.authorizedPerson = 'Yetkili kişi zorunludur';
      if (!formData.company.contactNumber) newErrors.contactNumber = 'İletişim numarası zorunludur';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const res = await axios.post('http://localhost:5001/api/auth/register', formData);
      setSuccess(true);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Kayıt sırasında bir hata oluştu' });
    }
  };

  return (
    <div className="register-form">
      <h2>Üye Ol</h2>
      {success ? (
        <div className="success-message">
          Kayıt işlemi başarılı!{formData.userType === 'corporate' ? 
          ' Kurumsal hesabınız yönetici onayından sonra etkinlik yayınlayabilecektir.' : 
          ' Giriş yapabilirsiniz.'}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ad*</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label>Soyad*</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
          </div>

          <div className="form-group">
            <label>Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Şifre*</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Şifre Tekrar*</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label>Üyelik Türü*</label>
            <select name="userType" value={formData.userType} onChange={handleChange}>
              <option value="individual">Bireysel</option>
              <option value="corporate">Kurumsal</option>
            </select>
          </div>

          <div className="form-group">
            <label>Telefon</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>İl</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>İlçe</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
            />
          </div>

          {formData.userType === 'corporate' && (
            <div className="corporate-fields">
              <h3>Kurumsal Bilgiler</h3>
              
              <div className="form-group">
                <label>Kurum Ünvanı*</label>
                <input
                  type="text"
                  name="company.name"
                  value={formData.company.name}
                  onChange={handleChange}
                  className={errors.companyName ? 'error' : ''}
                />
                {errors.companyName && <span className="error-text">{errors.companyName}</span>}
              </div>

              <div className="form-group">
                <label>Kurum Kısa Adı</label>
                <input
                  type="text"
                  name="company.shortName"
                  value={formData.company.shortName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Yetkili Kişi*</label>
                <input
                  type="text"
                  name="company.authorizedPerson"
                  value={formData.company.authorizedPerson}
                  onChange={handleChange}
                  className={errors.authorizedPerson ? 'error' : ''}
                />
                {errors.authorizedPerson && <span className="error-text">{errors.authorizedPerson}</span>}
              </div>

              <div className="form-group">
                <label>İletişim Numarası*</label>
                <input
                  type="text"
                  name="company.contactNumber"
                  value={formData.company.contactNumber}
                  onChange={handleChange}
                  className={errors.contactNumber ? 'error' : ''}
                />
                {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}
              </div>

              <div className="form-group">
                <label>Kurum Adresi</label>
                <textarea
                  name="company.address"
                  value={formData.company.address}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Vergi Numarası</label>
                <input
                  type="text"
                  name="company.taxNumber"
                  value={formData.company.taxNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {errors.submit && <div className="error-text">{errors.submit}</div>}
          
          <button type="submit" className="submit-btn">Kayıt Ol</button>
        </form>
      )}
    </div>
  );
};

export default RegisterForm;