

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();


router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Kayıt işlemi
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      userType,
      phone,
      city,
      district,
      company
    } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor' });
    }

    // Yeni kullanıcı oluştur
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      userType,
      phone,
      city,
      district,
      isApproved: userType === 'individual'
    });

    // Kurumsal kullanıcı için ek alanlar
    if (userType === 'corporate') {
      newUser.company = company;
    }

    await newUser.save();

    // JWT token oluştur
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        userType: newUser.userType,
        isApproved: newUser.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
  }
});

// Giriş işlemi
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Geçersiz email veya şifre' });
    }

    // Şifreyi kontrol et
    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz email veya şifre' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
  }
});

module.exports = router;