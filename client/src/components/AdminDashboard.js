import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [data, setData] = useState({ kullanicilar: [], etkinlikler: [] });

  useEffect(() => {
    // Basit veri yükleme
    setData({
      kullanicilar: [
        { _id: 1, firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@mail.com', userType: 'individual' },
        { _id: 2, firstName: 'Mehmet', lastName: 'Kaya', email: 'mehmet@mail.com', userType: 'corporate' }
      ],
      etkinlikler: [
        { _id: 1, baslik: 'Konser', durum: 'yayinda' },
        { _id: 2, baslik: 'Seminer', durum: 'taslak' }
      ]
    });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Paneli</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>Kullanıcılar</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Ad</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tip</th>
            </tr>
          </thead>
          <tbody>
            {data.kullanicilar.map(user => (
              <tr key={user._id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {user.firstName} {user.lastName}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.userType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3>Etkinlikler</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Başlık</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Durum</th>
            </tr>
          </thead>
          <tbody>
            {data.etkinlikler.map(etkinlik => (
              <tr key={etkinlik._id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{etkinlik.baslik}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{etkinlik.durum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;