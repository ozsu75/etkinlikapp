import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Nav,
  Tab
} from 'react-bootstrap';

const AdminDashboard = () => {
  const [istatistikler, setIstatistikler] = useState(null);
  const [kullanicilar, setKullanicilar] = useState([]);
  const [etkinlikler, setEtkinlikler] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchIstatistikler();
  }, []);

  const fetchIstatistikler = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/istatistikler', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIstatistikler(response.data);
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    }
  };

  const fetchKullanicilar = async (tur = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/kullanicilar?tur=${tur}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKullanicilar(response.data.kullanicilar);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
    }
  };

  const fetchEtkinlikler = async (durum = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/etkinlikler?durum=${durum}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEtkinlikler(response.data.etkinlikler);
    } catch (error) {
      console.error('Etkinlikler yüklenemedi:', error);
    }
  };

  const handleKurumsalOnay = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/kurumsal-onay/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchKullanicilar('corporate');
      fetchIstatistikler();
      alert('Kurumsal kullanıcı onaylandı');
    } catch (error) {
      console.error('Onay işlemi başarısız:', error);
    }
  };

  const handleKurumsalRed = async (userId, sebep) => {
    const redSebebi = prompt('Red sebebini girin:');
    if (redSebebi) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`/api/admin/kurumsal-red/${userId}`, {
          redSebebi: redSebebi
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchKullanicilar('corporate');
        fetchIstatistikler();
        alert('Kurumsal kullanıcı reddedildi');
      } catch (error) {
        console.error('Red işlemi başarısız:', error);
      }
    }
  };

  if (!istatistikler) return <div>Yükleniyor...</div>;

  return (
    <Container fluid>
      <Row>
        <Col md={3} lg={2} className="bg-light sidebar">
          <Nav variant="pills" className="flex-column" activeKey={activeTab}>
            <Nav.Item>
              <Nav.Link eventKey="dashboard" onClick={() => setActiveTab('dashboard')}>
                Dashboard
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="users" onClick={() => { setActiveTab('users'); fetchKullanicilar(); }}>
                Kullanıcılar
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="corporate" onClick={() => { setActiveTab('corporate'); fetchKullanicilar('corporate'); }}>
                Kurumsal Başvurular
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="events" onClick={() => { setActiveTab('events'); fetchEtkinlikler(); }}>
                Etkinlikler
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        <Col md={9} lg={10} className="ml-sm-auto px-4">
          {activeTab === 'dashboard' && (
            <div>
              <h2>Yönetici Dashboard</h2>
              <Row>
                <Col md={3}>
                  <Card className="text-center mb-4">
                    <Card.Body>
                      <Card.Title>Toplam Kullanıcı</Card.Title>
                      <h3>{istatistikler.kullanicilar.toplam}</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center mb-4">
                    <Card.Body>
                      <Card.Title>Bireysel</Card.Title>
                      <h3>{istatistikler.kullanicilar.bireysel}</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center mb-4">
                    <Card.Body>
                      <Card.Title>Kurumsal</Card.Title>
                      <h3>{istatistikler.kullanicilar.kurumsal}</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center mb-4">
                    <Card.Body>
                      <Card.Title>Etkinlikler</Card.Title>
                      <h3>{istatistikler.etkinlikler.toplam}</h3>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {activeTab === 'corporate' && (
            <div>
              <h2>Kurumsal Başvurular</h2>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Firma</th>
                    <th>Yetkili</th>
                    <th>Email</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {kullanicilar.map(user => (
                    <tr key={user._id}>
                      <td>{user.company?.name}</td>
                      <td>{user.company?.authorizedPerson}</td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={user.isApproved ? 'success' : 'warning'}>
                          {user.isApproved ? 'Onaylı' : 'Beklemede'}
                        </Badge>
                      </td>
                      <td>
                        {!user.isApproved && (
                          <>
                            <Button 
                              variant="success" 
                              size="sm" 
                              onClick={() => handleKurumsalOnay(user._id)}
                              className="me-2"
                            >
                              Onayla
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleKurumsalRed(user._id)}
                            >
                              Reddet
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <h2>Etkinlik Yönetimi</h2>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Etkinlik</th>
                    <th>Oluşturan</th>
                    <th>Tarih</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {etkinlikler.map(etkinlik => (
                    <tr key={etkinlik._id}>
                      <td>{etkinlik.baslik}</td>
                      <td>{etkinlik.olusturan?.firstName} {etkinlik.olusturan?.lastName}</td>
                      <td>{new Date(etkinlik.etkinlikTarihi).toLocaleDateString()}</td>
                      <td>
                        <Badge bg={
                          etkinlik.durum === 'yayinda' ? 'success' : 
                          etkinlik.durum === 'taslak' ? 'secondary' :
                          etkinlik.durum === 'iptal' ? 'danger' : 'info'
                        }>
                          {etkinlik.durum}
                        </Badge>
                      </td>
                      <td>
                        <Button variant="info" size="sm">Detay</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;  