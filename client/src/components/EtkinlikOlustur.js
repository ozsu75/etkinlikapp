import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EtkinlikOlustur = () => {
  const [formData, setFormData] = useState({
    baslik: '',
    aciklama: '',
    etkinlikTarihi: '',
    konum: '',
    adres: '',
    enlem: '',
    boylam: '',
    kategoriler: '',
    ucretli: false,
    ucret: 0,
    kontenjan: '',
    kapakResmi: null
  });
  
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Google Maps için konum seçme
  const handleMapClick = () => {
    // Bu kısımda Google Maps API entegrasyonu yapılacak
    alert('Google Maps entegrasyonu buraya gelecek. Şimdilik manuel koordinat girin.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // FormData oluştur (dosya yükleme için)
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });
      
      submitData.append('olusturan', user.id);
      submitData.append('kurum', user.userType === 'corporate' ? user.company?.id : '');

      const response = await axios.post('http://localhost:5001/etkinlikler/yeni/olustur', submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert('Etkinlik başarıyla oluşturuldu!');
      navigate('/');
    } catch (error) {
      console.error('Hata:', error);
      setErrors({ submit: 'Etkinlik oluşturulamadı: ' + (error.response?.data?.message || error.message) });
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Yeni Etkinlik Oluştur</h2>
      
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Kapak Resmi */}
        <div style={{ marginBottom: '15px' }}>
          <label>Kapak Resmi</label>
          <input
            type="file"
            name="kapakResmi"
            onChange={handleChange}
            accept="image/*"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Etkinlik Başlığı*</label>
          <input
            type="text"
            name="baslik"
            value={formData.baslik}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Açıklama*</label>
          <textarea
            name="aciklama"
            value={formData.aciklama}
            onChange={handleChange}
            required
            rows="4"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Etkinlik Tarihi ve Saati*</label>
          <input
            type="datetime-local"
            name="etkinlikTarihi"
            value={formData.etkinlikTarihi}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Konum*</label>
          <input
            type="text"
            name="konum"
            value={formData.konum}
            onChange={handleChange}
            required
            placeholder="Örn: İstanbul, Kadıköy"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Adres</label>
          <textarea
            name="adres"
            value={formData.adres}
            onChange={handleChange}
            rows="3"
            placeholder="Detaylı adres bilgisi"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {/* Google Maps için koordinatlar */}
        <div style={{ marginBottom: '15px' }}>
          <label>Koordinatlar (Google Maps)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              name="enlem"
              value={formData.enlem}
              onChange={handleChange}
              placeholder="Enlem"
              style={{ flex: 1, padding: '8px' }}
            />
            <input
              type="text"
              name="boylam"
              value={formData.boylam}
              onChange={handleChange}
              placeholder="Boylam"
              style={{ flex: 1, padding: '8px' }}
            />
            <button 
              type="button" 
              onClick={handleMapClick}
              style={{ padding: '8px 15px', background: '#007bff', color: 'white', border: 'none' }}
            >
              Haritadan Seç
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Kategoriler (virgülle ayırın)</label>
          <input
            type="text"
            name="kategoriler"
            value={formData.kategoriler}
            onChange={handleChange}
            placeholder="Örn: müzik,spor,eğitim"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              name="ucretli"
              checked={formData.ucretli}
              onChange={handleChange}
            />
            Ücretli Etkinlik
          </label>
        </div>

        {formData.ucretli && (
          <div style={{ marginBottom: '15px' }}>
            <label>Ücret (TL)</label>
            <input
              type="number"
              name="ucret"
              value={formData.ucret}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label>Kontenjan</label>
          <input
            type="number"
            name="kontenjan"
            value={formData.kontenjan}
            onChange={handleChange}
            placeholder="Sınırsız için boş bırakın"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {errors.submit && (
          <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#ffe6e6' }}>
            {errors.submit}
          </div>
        )}
        
        <button 
          type="submit" 
          style={{ 
            background: '#28a745', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            cursor: 'pointer',
            fontSize: '16px',
            width: '100%'
          }}
        >
          Etkinlik Oluştur
        </button>
      </form>
    </div>
  );
};

export default EtkinlikOlustur;