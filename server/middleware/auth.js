const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Erişim reddedildi. Token gerekli.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token geçersiz.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token geçersiz.' });
  }
};

module.exports = auth;