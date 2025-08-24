
const adminAuth = (req, res, next) => {
  try {
    // Basit admin kontrolü - gerçek uygulamada daha güvenli bir yöntem kullanın
    if (req.user && req.user.email === process.env.ADMIN_EMAIL) {
      next();
    } else {
      return res.status(403).json({ message: 'Admin erişimi reddedildi' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

module.exports = adminAuth;