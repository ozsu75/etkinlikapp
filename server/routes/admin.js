const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Kurum = require('../models/Kurum');
const Etkinlik = require('../models/Etkinlik');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Tüm kullanıcıları listele
router.get('/kullanicilar', auth, adminAuth, async (req, res) => {
  try {
    const { sayfa = 1, limit = 10, tur, onayDurumu } = req.query;
    
    const filter = {};
    if (tur) filter.userType = tur;
    if (onayDurumu !== undefined) {
      if (tur === 'corporate') {
        filter.isApproved = onayDurumu === 'true';
      }
    }
    
    const kullanicilar = await User.find(filter)
      .select('-password')
      .limit(limit * 1)
      .skip((sayfa - 1) * limit)
      .sort({ createdAt: -1 });
    
    const toplam = await User.countDocuments(filter);
    
    res.json({
      kullanicilar,
      toplamSayfa: Math.ceil(toplam / limit),
      mevcutSayfa: parseInt(sayfa),
      toplam
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kurumsal başvuruları listele
router.get('/kurumsal-basvurular', auth, adminAuth, async (req, res) => {
  try {
    const { sayfa = 1, limit = 10, durum } = req.query;
    
    const filter = { userType: 'corporate' };
    if (durum) {
      if (durum === 'onayli') filter.isApproved = true;
      else if (durum === 'bekleyen') filter.isApproved = false;
    }
    
    const kullanicilar = await User.find(filter)
      .select('-password')
      .populate('company')
      .limit(limit * 1)
      .skip((sayfa - 1) * limit)
      .sort({ createdAt: -1 });
    
    const toplam = await User.countDocuments(filter);
    
    res.json({
      kullanicilar,
      toplamSayfa: Math.ceil(toplam / limit),
      mevcutSayfa: parseInt(sayfa),
      toplam
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kurumsal başvuruyu onayla
router.put('/kurumsal-onay/:id', auth, adminAuth, async (req, res) => {
  try {
    const kullanici = await User.findById(req.params.id);
    
    if (!kullanici || kullanici.userType !== 'corporate') {
      return res.status(404).json({ message: 'Kurumsal kullanıcı bulunamadı' });
    }
    
    kullanici.isApproved = true;
    kullanici.onayTarihi = new Date();
    kullanici.onaylayanAdmin = req.user.id;
    
    await kullanici.save();
    
    res.json({ 
      message: 'Kurumsal kullanıcı başarıyla onaylandı',
      kullanici: {
        id: kullanici._id,
        email: kullanici.email,
        company: kullanici.company,
        isApproved: kullanici.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kurumsal başvuruyu reddet
router.put('/kurumsal-red/:id', auth, adminAuth, async (req, res) => {
  try {
    const { redSebebi } = req.body;
    const kullanici = await User.findById(req.params.id);
    
    if (!kullanici || kullanici.userType !== 'corporate') {
      return res.status(404).json({ message: 'Kurumsal kullanıcı bulunamadı' });
    }
    
    kullanici.isApproved = false;
    kullanici.redSebebi = redSebebi;
    
    await kullanici.save();
    
    res.json({ 
      message: 'Kurumsal kullanıcı başarıyla reddedildi',
      kullanici: {
        id: kullanici._id,
        email: kullanici.email,
        company: kullanici.company,
        isApproved: kullanici.isApproved,
        redSebebi: kullanici.redSebebi
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kullanıcı engelle/aktif et
router.put('/kullanici-durum/:id', auth, adminAuth, async (req, res) => {
  try {
    const { durum } = req.body;
    const kullanici = await User.findById(req.params.id);
    
    if (!kullanici) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    kullanici.isActive = durum;
    await kullanici.save();
    
    res.json({ 
      message: `Kullanıcı ${durum ? 'aktif' : 'engelli'} duruma getirildi`,
      kullanici: {
        id: kullanici._id,
        email: kullanici.email,
        isActive: kullanici.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Tüm etkinlikleri listele
router.get('/etkinlikler', auth, adminAuth, async (req, res) => {
  try {
    const { sayfa = 1, limit = 10, durum } = req.query;
    
    const filter = {};
    if (durum) filter.durum = durum;
    
    const etkinlikler = await Etkinlik.find(filter)
      .populate('olusturan', 'firstName lastName email')
      .populate('kurum', 'unvan kisaAd')
      .limit(limit * 1)
      .skip((sayfa - 1) * limit)
      .sort({ createdAt: -1 });
    
    const toplam = await Etkinlik.countDocuments(filter);
    
    res.json({
      etkinlikler,
      toplamSayfa: Math.ceil(toplam / limit),
      mevcutSayfa: parseInt(sayfa),
      toplam
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Etkinlik durumunu güncelle
router.put('/etkinlik-durum/:id', auth, adminAuth, async (req, res) => {
  try {
    const { durum } = req.body;
    const etkinlik = await Etkinlik.findById(req.params.id);
    
    if (!etkinlik) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }
    
    etkinlik.durum = durum;
    await etkinlik.save();
    
    res.json({ 
      message: 'Etkinlik durumu güncellendi',
      etkinlik: {
        id: etkinlik._id,
        baslik: etkinlik.baslik,
        durum: etkinlik.durum
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// İstatistikler
router.get('/istatistikler', auth, adminAuth, async (req, res) => {
  try {
    const toplamKullanici = await User.countDocuments();
    const toplamBireysel = await User.countDocuments({ userType: 'individual' });
    const toplamKurumsal = await User.countDocuments({ userType: 'corporate' });
    const onayliKurumsal = await User.countDocuments({ 
      userType: 'corporate', 
      isApproved: true 
    });
    const bekleyenKurumsal = await User.countDocuments({ 
      userType: 'corporate', 
      isApproved: false 
    });
    const toplamEtkinlik = await Etkinlik.countDocuments();
    const aktifEtkinlik = await Etkinlik.countDocuments({ durum: 'yayinda' });
    const tamamlananEtkinlik = await Etkinlik.countDocuments({ durum: 'tamamlandi' });
    
    res.json({
      kullanicilar: {
        toplam: toplamKullanici,
        bireysel: toplamBireysel,
        kurumsal: toplamKurumsal,
        onayliKurumsal,
        bekleyenKurumsal
      },
      etkinlikler: {
        toplam: toplamEtkinlik,
        aktif: aktifEtkinlik,
        tamamlanan: tamamlananEtkinlik
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router;