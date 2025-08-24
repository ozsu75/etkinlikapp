const express = require('express');
const router = express.Router();
const etkinlikController = require('../controllers/etkinlikController');
const { mustBeAuthenticated } = require('../middleware/auth');
const { catchErrors } = require('../handlers/errorHandlers');
const { upload } = require('../config/cloudinary');

// 1. Önce sabit route'ları tanımlayın
// Tüm etkinlikleri listeleme (GET /etkinlikler)
router.get('/', catchErrors(etkinlikController.etkinlikListesi));

// Yeni etkinlik oluşturma formu (GET /etkinlikler/yeni)
router.get('/yeni', mustBeAuthenticated, catchErrors(etkinlikController.etkinlikOlusturForm));

// Kullanıcının etkinliklerini listeleme (GET /etkinlikler/profil/etkinliklerim)
router.get('/profil/etkinliklerim', mustBeAuthenticated, catchErrors(etkinlikController.kullaniciEtkinlikleri));

// 2. En son dinamik route'ları tanımlayın
// Etkinlik detayı (GET /etkinlikler/:id)
router.get('/:id', catchErrors(etkinlikController.etkinlikDetay));

// Etkinlik düzenleme formu (GET /etkinlikler/:id/duzenle)
router.get('/:id/duzenle', mustBeAuthenticated, catchErrors(etkinlikController.etkinlikDuzenleForm));

// Yeni etkinlik oluşturma (POST /etkinlikler/yeni/olustur)
router.post('/yeni/olustur', mustBeAuthenticated, upload.single('kapakResmi'), catchErrors(etkinlikController.etkinlikOlustur));

// Etkinlik düzenleme (POST /etkinlikler/:id/duzenle)
router.post('/:id/duzenle', mustBeAuthenticated, upload.single('kapakResmi'), catchErrors(etkinlikController.etkinlikDuzenle));

// Etkinlik silme (POST /etkinlikler/:id/sil)
router.post('/:id/sil', mustBeAuthenticated, catchErrors(etkinlikController.etkinlikSil));

// Etkinliğe katılma (AJAX) (POST /etkinlikler/:id/katil)
router.post('/:id/katil', mustBeAuthenticated, catchErrors(etkinlikController.etkinligeKatil));

// Etkinlikten ayrılma (AJAX) (POST /etkinlikler/:id/ayril)
router.post('/:id/ayril', mustBeAuthenticated, catchErrors(etkinlikController.etkinliktenAyril));

// Etkinliği beğenme (AJAX) (POST /etkinlikler/:id/begen)
router.post('/:id/begen', mustBeAuthenticated, catchErrors(etkinlikController.etkinlikBegen));

// Etkinlik beğenisini kaldırma (AJAX) (POST /etkinlikler/:id/begeni-kaldir)
router.post('/:id/begeni-kaldir', mustBeAuthenticated, catchErrors(etkinlikController.etkinlikBegeniKaldir));

// Etkinliği favorilere ekleme (AJAX) (POST /etkinlikler/:id/favori-ekle)
router.post('/:id/favori-ekle', mustBeAuthenticated, catchErrors(etkinlikController.etkinlikFavoriEkle));

// Etkinliği favorilerden çıkarma (AJAX) (POST /etkinlikler/:id/favori-cikar)
router.post('/:id/favori-cikar', mustBeAuthenticated, catchErrors(etkinlikController.etkinlikFavoriCikar));

// Yorum ekleme (POST /etkinlikler/:id/yorum)
router.post('/:id/yorum', mustBeAuthenticated, catchErrors(etkinlikController.yorumEkle));

// Yorum silme (AJAX) (DELETE /etkinlikler/:id/yorum/:yorumId)
router.delete('/:id/yorum/:yorumId', mustBeAuthenticated, catchErrors(etkinlikController.yorumSil));

module.exports = router;