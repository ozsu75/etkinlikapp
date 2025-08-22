const mongoose = require('mongoose');

const kurumSchema = new mongoose.Schema({
  unvan: {
    type: String,
    required: true,
    trim: true
  },
  kisaAd: {
    type: String,
    required: true,
    trim: true
  },
  yetkiliKisi: {
    type: String,
    required: true,
    trim: true
  },
  iletisimNo: {
    type: String,
    required: true,
    trim: true
  },
  adres: {
    type: String,
    required: true,
    trim: true
  },
  vergiNo: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  durum: {
    type: String,
    enum: ['beklemede', 'onaylandi', 'reddedildi'],
    default: 'beklemede'
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
  olusturan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  takipciler: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  takipciSayisi: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Kurum', kurumSchema);