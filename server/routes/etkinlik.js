const express = require('express');
const router = express.Router();
const etkinlikController = require('../controllers/etkinlikController');
const { auth } = require('../middleware/auth');

// Tüm etkinlikleri listeleme (Herkes erişebilir)
router.get('/', etkinlikController.etkinlikListesi);

// Etkinlik detayı (Herkes erişebilir)
router.get('/:id', etkinlikController.etkinlikDetay);

// Diğer tüm route'ları GEÇİCİ OLARAK YORUM SATIRI YAPALIM
/*
router.post('/yeni/olustur', auth, upload.single('kapakResmi'), etkinlikController.etkinlikOlustur);
router.post('/:id/duzenle', auth, upload.single('kapakResmi'), etkinlikController.etkinlikDuzenle);
router.post('/:id/sil', auth, etkinlikController.etkinlikSil);
router.post('/:id/katil', auth, etkinlikController.etkinligeKatil);
router.post('/:id/ayril', auth, etkinlikController.etkinliktenAyril);
router.post('/:id/begen', auth, etkinlikController.etkinlikBegen);
router.post('/:id/begeni-kaldir', auth, etkinlikController.etkinlikBegeniKaldir);
router.post('/:id/favori-ekle', auth, etkinlikController.etkinlikFavoriEkle);
router.post('/:id/favori-cikar', auth, etkinlikController.etkinlikFavoriCikar);
router.post('/:id/yorum', auth, etkinlikController.yorumEkle);
router.delete('/:id/yorum/:yorumId', auth, etkinlikController.yorumSil);
*/

module.exports = router;