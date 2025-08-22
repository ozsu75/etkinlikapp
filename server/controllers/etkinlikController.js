const Etkinlik = require('../models/Etkinlik');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// Tüm etkinlikleri listeleme
async function etkinlikListesi(req, res) {
  try {
    const sayfa = parseInt(req.query.sayfa) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (sayfa - 1) * limit;
    
    const filtre = { durum: 'yayinda' };
    
    // Kategori filtreleme
    if (req.query.kategori) {
      filtre.kategoriler = req.query.kategori;
    }
    
    // Tarih filtreleme
    if (req.query.tarih) {
      const tarih = new Date(req.query.tarih);
      const ertesiGun = new Date(tarih);
      ertesiGun.setDate(ertesiGun.getDate() + 1);
      
      filtre.etkinlikTarihi = {
        $gte: tarih,
        $lt: ertesiGun
      };
    }
    
    // Konum filtreleme
    if (req.query.konum) {
      filtre.konum = new RegExp(req.query.konum, 'i');
    }
    
    const etkinlikler = await Etkinlik.find(filtre)
      .populate('olusturan', 'isim soyisim profilResmi')
      .populate('kurum', 'isim logo')
      .sort({ etkinlikTarihi: 1 })
      .skip(skip)
      .limit(limit);
    
    const toplamEtkinlik = await Etkinlik.countDocuments(filtre);
    const toplamSayfa = Math.ceil(toplamEtkinlik / limit);
    
    res.render('etkinlik/list', {
      etkinlikler,
      sayfa,
      toplamSayfa,
      filtreler: req.query
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Etkinlikler yüklenirken bir hata oluştu');
    res.redirect('/');
  }
}

// Etkinlik detayını gösterme
async function etkinlikDetay(req, res) {
  try {
    const etkinlik = await Etkinlik.findById(req.params.id)
      .populate('olusturan', 'isim soyisim profilResmi')
      .populate('kurum', 'isim logo aciklama')
      .populate('katilimcilar.user', 'isim soyisim profilResmi')
      .populate('begenenler', 'isim soyisim')
      .populate('favorileyenler', 'isim soyisim')
      .populate('yorumlar.user', 'isim soyisim profilResmi');
    
    if (!etkinlik) {
      req.flash('error', 'Etkinlik bulunamadı');
      return res.redirect('/etkinlikler');
    }
    
    // Kullanıcının etkinlikle ilişkili durumlarını kontrol etme
    let kullaniciDurum = {
      katiliyor: false,
      begeniyor: false,
      favoriliyor: false
    };
    
    if (req.user) {
      kullaniciDurum.katiliyor = etkinlik.katiliyorMu(req.user._id);
      kullaniciDurum.begeniyor = etkinlik.begeniyorMu(req.user._id);
      kullaniciDurum.favoriliyor = etkinlik.favoriliyorMu(req.user._id);
    }
    
    res.render('etkinlik/detail', {
      etkinlik,
      kullaniciDurum
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Etkinlik yüklenirken bir hata oluştu');
    res.redirect('/etkinlikler');
  }
}

// Yeni etkinlik oluşturma formu
function etkinlikOlusturForm(req, res) {
  // Sadece kurumsal kullanıcılar etkinlik oluşturabilir
  if (req.user.kayitTuru !== 'kurumsal' || !req.user.kurum || !req.user.kurum.onayli) {
    req.flash('error', 'Sadece onaylı kurumsal hesaplar etkinlik oluşturabilir');
    return res.redirect('/etkinlikler');
  }
  
  res.render('etkinlik/create');
}

// Yeni etkinlik oluşturma
async function etkinlikOlustur(req, res) {
  try {
    // Sadece kurumsal kullanıcılar etkinlik oluşturabilir
    if (req.user.kayitTuru !== 'kurumsal' || !req.user.kurum || !req.user.kurum.onayli) {
      req.flash('error', 'Sadece onaylı kurumsal hesaplar etkinlik oluşturabilir');
      return res.redirect('/etkinlikler');
    }
    
    const {
      baslik,
      aciklama,
      kisaAciklama,
      etkinlikTarihi,
      sonBasvuruTarihi,
      konum,
      adres,
      enlem,
      boylam,
      kategoriler,
      ucretli,
      ucret,
      kontenjan,
      etiketler
    } = req.body;
    
    // Kapak resmi yükleme
    let kapakResmi = 'default-event.jpg';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'etkinlikapp/etkinlikler'
      });
      kapakResmi = result.secure_url;
    }
    
    // Kategorileri diziye çevirme
    const kategoriListesi = kategoriler ? kategoriler.split(',').map(k => k.trim()) : [];
    
    // Etiketleri diziye çevirme
    const etiketListesi = etiketler ? etiketler.split(',').map(e => e.trim()) : [];
    
    const yeniEtkinlik = new Etkinlik({
      baslik,
      aciklama,
      kisaAciklama: kisaAciklama || aciklama.substring(0, 150),
      etkinlikTarihi,
      sonBasvuruTarihi: sonBasvuruTarihi || etkinlikTarihi,
      konum,
      adres,
      enlem: enlem || null,
      boylam: boylam || null,
      kapakResmi,
      kategoriler: kategoriListesi,
      ucretli: ucretli === 'true',
      ucret: ucretli === 'true' ? parseFloat(ucret) : 0,
      kontenjan: kontenjan ? parseInt(kontenjan) : null,
      etiketler: etiketListesi,
      olusturan: req.user._id,
      kurum: req.user.kurum._id,
      durum: 'taslak'
    });
    
    await yeniEtkinlik.save();
    
    req.flash('success', 'Etkinlik başarıyla oluşturuldu. Yönetici onayından sonra yayınlanacaktır.');
    res.redirect(`/etkinlik/${yeniEtkinlik._id}`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Etkinlik oluşturulurken bir hata oluştu');
    res.render('etkinlik/create', {
      hatalar: error.errors,
      formData: req.body
    });
  }
}

// Etkinlik düzenleme formu
async function etkinlikDuzenleForm(req, res) {
  try {
    const etkinlik = await Etkinlik.findById(req.params.id);
    
    if (!etkinlik) {
      req.flash('error', 'Etkinlik bulunamadı');
      return res.redirect('/etkinlikler');
    }
    
    // Sadece etkinliği oluşturan kullanıcı veya admin düzenleyebilir
    if (!etkinlik.olusturan.equals(req.user._id) && req.user.rol !== 'admin') {
      req.flash('error', 'Bu etkinliği düzenleme yetkiniz yok');
      return res.redirect(`/etkinlik/${etkinlik._id}`);
    }
    
    res.render('etkinlik/edit', {
      etkinlik,
      kategoriler: etkinlik.kategoriler.join(','),
      etiketler: etkinlik.etiketler.join(',')
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Etkinlik yüklenirken bir hata oluştu');
    res.redirect('/etkinlikler');
  }
}

// Etkinlik düzenleme
async function etkinlikDuzenle(req, res) {
  try {
    const etkinlik = await Etkinlik.findById(req.params.id);
    
    if (!etkinlik) {
      req.flash('error', 'Etkinlik bulunamadı');
      return res.redirect('/etkinlikler');
    }
    
    // Sadece etkinliği oluşturan kullanıcı veya admin düzenleyebilir
    if (!etkinlik.olusturan.equals(req.user._id) && req.user.rol !== 'admin') {
      req.flash('error', 'Bu etkinliği düzenleme yetkiniz yok');
      return res.redirect(`/etkinlik/${etkinlik._id}`);
    }
    
    const {
      baslik,
      aciklama,
      kisaAciklama,
      etkinlikTarihi,
      sonBasvuruTarihi,
      konum,
      adres,
      enlem,
      boylam,
      kategoriler,
      ucretli,
      ucret,
      kontenjan,
      etiketler,
      durum
    } = req.body;
    
    // Kapak resmi güncelleme
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'etkinlikapp/etkinlikler'
      });
      etkinlik.kapakResmi = result.secure_url;
    }
    
    // Kategorileri diziye çevirme
    const kategoriListesi = kategoriler ? kategoriler.split(',').map(k => k.trim()) : [];
    
    // Etiketleri diziye çevirme
    const etiketListesi = etiketler ? etiketler.split(',').map(e => e.trim()) : [];
    
    // Etkinlik bilgilerini güncelleme
    etkinlik.baslik = baslik;
    etkinlik.aciklama = aciklama;
    etkinlik.kisaAciklama = kisaAciklama || aciklama.substring(0, 150);
    etkinlik.etkinlikTarihi = etkinlikTarihi;
    etkinlik.sonBasvuruTarihi = sonBasvuruTarihi || etkinlikTarihi;
    etkinlik.konum = konum;
    etkinlik.adres = adres;
    etkinlik.enlem = enlem || null;
    etkinlik.boylam = boylam || null;
    etkinlik.kategoriler = kategoriListesi;
    etkinlik.ucretli = ucretli === 'true';
    etkinlik.ucret = ucretli === 'true' ? parseFloat(ucret) : 0;
    etkinlik.kontenjan = kontenjan ? parseInt(kontenjan) : null;
    etkinlik.etiketler = etiketListesi;
    
    // Admin durumu değiştirebilir
    if (req.user.rol === 'admin') {
      etkinlik.durum = durum;
      if (durum === 'yayinda' && !etkinlik.yayinlanmaTarihi) {
        etkinlik.yayinlanmaTarihi = new Date();
      }
    }
    
    await etkinlik.save();
    
    req.flash('success', 'Etkinlik başarıyla güncellendi');
    res.redirect(`/etkinlik/${etkinlik._id}`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Etkinlik güncellenirken bir hata oluştu');
    res.redirect(`/etkinlik/${req.params.id}/duzenle`);
  }
}

// Etkinlik silme
async function etkinlikSil(req, res) {
  try {
    const etkinlik = await Etkinlik.findById(req.params.id);
    
    if (!etkinlik) {
      req.flash('error', 'Etkinlik bulunamadı');
      return res.redirect('/etkinlikler');
    }
    
    // Sadece etkinliği oluşturan kullanıcı veya admin silebilir
    if (!etkinlik.olusturan.equals(req.user._id) && req.user.rol !== 'admin') {
      req.flash('error', 'Bu etkinliği silme yetkiniz yok');
      return res.redirect(`/etkinlik/${etkinlik._id}`);
    }
    
    await Etkinlik.findByIdAndDelete(req.params.id);
    
    req.flash('success', 'Etkinlik başarıyla silindi');
    res.redirect('/etkinlikler');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Etkinlik silinirken bir hata oluştu');
    res.redirect(`/etkinlik/${req.params.id}`);
  }
}

// Etkinliğe katılma
async function etkinligeKatil(req, res) {
  try {
    const etkinlik = await Etkinlik.findById(req.params.id);
    
    if (!etkinlik) {
      return res.status(404).json({ success: false, message: 'Etkinlik bulunamadı' });
    }
    
    // Kontenjan kontrolü
    if (etkinlik.kontenjan && etkinlik.katilimciSayisi >= etkinlik.kontenjan) {
      return res.status(400).json({ success: false, message: 'Etkinlik kontenjanı dolmuştur' });
    }
    
    // Son başvuru tarihi kontrolü
    if (etkinlik.sonBasvuruTarihi && new Date() > etkinlik.sonBasvuruTarihi) {
      return res.status(400).json({ success: false, message: 'Son başvuru tarihi geçmiş' });
    }
    
    // Kullanıcı zaten katılıyor mu kontrol et
    if (etkinlik.katiliyorMu(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Zaten bu etkinliğe katılıyorsunuz' });
    }
    
    // Katılımcı ekle
    etkinlik.katilimcilar.push({ user: req.user._id });
    etkinlik.katilimciSayisi += 1;
    
    await etkinlik.save();
    
    res.json({ success: true, message: 'Etkinliğe katılım başarılı', katilimciSayisi: etkinlik.katilimciSayisi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Bir hata oluştu' });
  }
}

// Etkinlikten ayrılma
async function etkinliktenAyril(req, res) {
  try {
    const etkinlik = await Etkinlik.findById(req.params.id);
    
    if (!etkinlik) {
      return res.status(404).json({ success: false, message: 'Etkinlik bulunamadı' });
    }
    
    // Kullanıcı katılıyor mu kontrol et
    if (!etkinlik.katiliyorMu(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Bu etkinliğe katılmıyorsunuz' });
    }
    
    // Katılımcıyı çıkar
    etkinlik.katilimcilar = etkinlik.katilimcilar.filter(
      katilimci => !katilimci.user.equals(req.user._id)
    );
    etkinlik.katilimciSayisi -= 1;
    
    await etkinlik.save();
    
    res.json({ success: true, message: 'Etkinlikten ayrılma başarılı', katilimciSayisi: etkinlik.katilimciSayisi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Bir hata oluştu' });
  }
}

// Etkinliği beğenme
async function etkinlikBegen(req, res) {
  try {
    const etkinlik = await Etkinlik.findById(req.params.id);
    
    if (!etkinlik) {
      return res.status(404).json({ success: false, message: 'Etkinlik bulunamadı' });
    }
    
    // Kullanıcı zaten beğenmiş mi kontrol et
    if (etkinlik.begeniyorMu(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Zaten bu etkinliği beğendiniz' });
    }
    
    // Beğeni ekle
    etkinlik.begenenler.push(req.user._id);
    etkinlik.begeniSayisi += 1;
    
    await etkinlik.save();
    
    res.json({ success: true, message: 'Beğeni başarılı', begeniSayisi: etkinlik.begeniSayisi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Bir hata oluştu' });
  }
}

// Etkinlik beğenisini kaldırma
async function etkinlikBegeniKaldir(req, res) {
  try {
    const etkinlik = await Etkinlik.findById(req.params.id);
    
    if (!etkinlik) {
      return res.status(404).json({ success: false, message: 'Etkinlik bulunamadı' });
    }
    
    // Kullanıcı beğenmiş mi kontrol et
    if (!etkinlik.begeniyorMu(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Bu etkinliği beğenmemişsiniz' });
    }
    
    // Beğeniyi kaldır
    etkinlik.begenenler = etkinlik.begenenler.filter(
      begenen => !begenen.equals(req.user._id)
    );
    etkinlik.begeniSayisi -= 1;
    
    await etkinlik.save();
    
    res.json({ success: true, message: 'Beğeni kaldırma başarılı', begeniSayisi: etkinlik.begeniSayisi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Bir hata oluştu' });
  }
}

// Etkinliği favorilere ekleme
async function etkinlikFavoriEkle(req, res) {
  try {
    const etkinlik = await Etkinlik.findById(req.params.id);
    
    if (!etkinlik) {
      return res.status(404).json({ success: false, message: 'Etkinlik bulunamadı' });
    }
    
    // Kullanıcı zaten favorilemiş mi kontrol et
    if (etkinlik.favoriliyorMu(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Zaten bu etkinliği favorilediniz' });
    }
    
    // Favoriye ekle
    etkinlik.favorileyenler.push(req.user._id);
    
    await etkinlik.save();
    
    // Kullanıcının favoriler listesine de ekle
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { favoriEtkinlikler: etkinlik._id }
    });
    
    res.json({ success: true, message: 'Favorilere ekleme başarılı' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Bir hata oluştu' });
  }
}

// Etkinliği favorilerden çıkarma
async function etkinlikFavoriCikar(req, res) {
  try {
    const etkinlik = await Etkinlik.findById(req.params.id);
    
    if (!etkinlik) {
      return res.status(404).json({ success: false, message: 'Etkinlik bulunamadı' });
    }
    
    // Kullanıcı favorilemiş mi kontrol et
    if (!etkinlik.favoriliyorMu(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Bu etkinliği favorilememişsiniz' });
    }
    
    // Favoriden çıkar
    etkinlik.favorileyenler = etkinlik.favorileyenler.filter(
      favorileyen => !favorileyen.equals(req.user._id)
    );
    
    await etkinlik.save();
    
    // Kullanıcının favoriler listesinden de çıkar
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { favoriEtkinlikler: etkinlik._id }
    });
    
    res.json({ success: true, message: 'Favorilerden çıkarma başarılı' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Bir hata oluştu' });
  }
}

// Yorum ekleme
async function yorumEkle(req, res) {
  try {
    const { yorum, puan } = req.body;
    const etkinlik = await Etkinlik.findById(req.params.id);
    
    if (!etkinlik) {
      req.flash('error', 'Etkinlik bulunamadı');
      return res.redirect('/etkinlikler');
    }
    
    // Yorum ekle
    etkinlik.yorumlar.push({
      user: req.user._id,
      yorum,
      puan: puan ? parseInt(puan) : null
    });
    
    etkinlik.yorumSayisi += 1;
    
    await etkinlik.save();
    
    req.flash('success', 'Yorumunuz başarıyla eklendi');
    res.redirect(`/etkinlik/${etkinlik._id}`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Yorum eklenirken bir hata oluştu');
    res.redirect(`/etkinlik/${req.params.id}`);
  }
}

// Yorum silme
async function yorumSil(req, res) {
  try {
    const { yorumId } = req.params;
    const etkinlik = await Etkinlik.findById(req.params.id);
    
    if (!etkinlik) {
      return res.status(404).json({ success: false, message: 'Etkinlik bulunamadı' });
    }
    
    // Yorumu bul
    const yorum = etkinlik.yorumlar.id(yorumId);
    
    if (!yorum) {
      return res.status(404).json({ success: false, message: 'Yorum bulunamadı' });
    }
    
    // Sadece yorum sahibi veya admin silebilir
    if (!yorum.user.equals(req.user._id) && req.user.rol !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bu yorumu silme yetkiniz yok' });
    }
    
    // Yorumu sil
    yorum.remove();
    etkinlik.yorumSayisi -= 1;
    
    await etkinlik.save();
    
    res.json({ success: true, message: 'Yorum başarıyla silindi', yorumSayisi: etkinlik.yorumSayisi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Bir hata oluştu' });
  }
}

// Kullanıcının etkinliklerini listeleme
async function kullaniciEtkinlikleri(req, res) {
  try {
    const sayfa = parseInt(req.query.sayfa) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (sayfa - 1) * limit;
    const tip = req.query.tip || 'olusturduklarim';
    
    let filtre = {};
    let baslik = '';
    
    if (tip === 'olusturduklarim') {
      filtre = { olusturan: req.user._id };
      baslik = 'Oluşturduğum Etkinlikler';
    } else if (tip === 'katildiklarim') {
      filtre = { 'katilimcilar.user': req.user._id };
      baslik = 'Katıldığım Etkinlikler';
    } else if (tip === 'favorilerim') {
      // Kullanıcının favori etkinliklerini al
      const user = await User.findById(req.user._id).populate('favoriEtkinlikler');
      const etkinlikler = user.favoriEtkinlikler.slice(skip, skip + limit);
      const toplamEtkinlik = user.favoriEtkinlikler.length;
      const toplamSayfa = Math.ceil(toplamEtkinlik / limit);
      
      return res.render('etkinlik/my-events', {
        etkinlikler,
        sayfa,
        toplamSayfa,
        tip,
        baslik: 'Favori Etkinliklerim'
      });
    }
    
    const etkinlikler = await Etkinlik.find(filtre)
      .populate('olusturan', 'isim soyisim profilResmi')
      .populate('kurum', 'isim logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const toplamEtkinlik = await Etkinlik.countDocuments(filtre);
    const toplamSayfa = Math.ceil(toplamEtkinlik / limit);
    
    res.render('etkinlik/my-events', {
      etkinlikler,
      sayfa,
      toplamSayfa,
      tip,
      baslik
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Etkinlikler yüklenirken bir hata oluştu');
    res.redirect('/');
  }
}

// Tüm fonksiyonları export et
module.exports = {
  etkinlikListesi,
  etkinlikDetay,
  etkinlikOlusturForm,
  etkinlikOlustur,
  etkinlikDuzenleForm,
  etkinlikDuzenle,
  etkinlikSil,
  etkinligeKatil,
  etkinliktenAyril,
  etkinlikBegen,
  etkinlikBegeniKaldir,
  etkinlikFavoriEkle,
  etkinlikFavoriCikar,
  yorumEkle,
  yorumSil,
  kullaniciEtkinlikleri
};