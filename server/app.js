const express = require('express');
const mongoose = require('mongoose');
const adminRoutes = require('./routes/admin');
const cors = require('cors');
require('dotenv').config();



// Hata yakalayıcıları import et
const {
  notFound,
  developmentErrors,
  productionErrors,
  flashValidationErrors,
  jwtErrorHandler,
  mongoErrorHandler,
  castErrorHandler
} = require('./handlers/errorHandlers');

// Route importları
const authRoutes = require('./routes/auth');
const etkinlikRoutes = require('./routes/etkinlik');

const app = express();

// ✅ CORS AYARLARI
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// ✅ OPTIONS istekleri için özel handling
app.options('*', cors());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB bağlantısı - YENİ AYARLAR
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 saniye timeout
  socketTimeoutMS: 45000, // 45 saniye socket timeout
})
.then(() => console.log('✅ MongoDB bağlantısı başarılı'))
.catch(err => console.log('❌ MongoDB bağlantı hatası:', err));

// Bağlantı eventlerini dinle
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB bağlantısı başarılı');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB bağlantı hatası:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB bağlantısı kesildi');
});

// Route'lar
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Etkinlik route'larını ekle - SADECE BİR TANE KULLAN
app.use('/etkinlikler', etkinlikRoutes);

// Kök route - TEST için
app.get('/', (req, res) => {
  res.json({ message: 'Etkinlik Platformu API - ÇALIŞIYOR!' });
});

// MongoDB hata yakalayıcıları
app.use(mongoErrorHandler);
app.use(castErrorHandler);

// JWT hata yakalayıcı
app.use(jwtErrorHandler);

// Validation hata yakalayıcı
app.use(flashValidationErrors);

// 404 hatası
app.use(notFound);

// Geliştirme/production hata yakalayıcıları
if (app.get('env') === 'development') {
  app.use(developmentErrors);
} else {
  app.use(productionErrors);
}

// Sunucuyu başlat
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Sunucu ${PORT} portunda çalışıyor`);
});