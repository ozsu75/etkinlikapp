const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Temel bilgiler
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  // Etkinlik ilişkileri
  katildigiEtkinlikler: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etkinlik'
  }],
  favoriEtkinlikler: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etkinlik'
  }],
  takipEttigiKullanicilar: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  takipEttigiKurumlar: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kurum'
  }],
  takipciSayisi: {
    type: Number,
    default: 0
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    enum: ['individual', 'corporate'],
    required: true
  },
  
  // Kurumsal kullanıcı için ek alanlar
  company: {
    name: {
      type: String,
      trim: true
    },
    shortName: {
      type: String,
      trim: true
    },
    authorizedPerson: {
      type: String,
      trim: true
    },
    contactNumber: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    taxNumber: {
      type: String,
      trim: true
    }
  },
  
  // İsteğe bağlı bilgiler
  phone: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  
  // Sistem alanları
  isApproved: {
    type: Boolean,
    default: false
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },

  isActive: {
    type: Boolean,
    default: true
  },
  onayTarihi: {
    type: Date
  },
  onaylayanAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  redSebebi: {
    type: String,
    trim: true
  },


  
  // Takip sistemi
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  favoriteEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  participatingEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }]
});

// Şifre hash'leme
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Şifre karşılaştırma
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Admin kontrol metodu - DOĞRU YERDE (schema tanımından SONRA)
userSchema.methods.isAdmin = function() {
  return this.email === process.env.ADMIN_EMAIL;
};

module.exports = mongoose.model('User', userSchema);