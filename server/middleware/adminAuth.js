
const adminAuth = (req, res, next) => {
  try {
    // Kullanıcının admin olup olmadığını kontrol et
    if (!req.user) {
      return res.status(401).json({ message: 'Yetkilendirme gerekiyor' });
    }
    
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Admin yetkisi gerekiyor' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

module.exports = adminAuth;