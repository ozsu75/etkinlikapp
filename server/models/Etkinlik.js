const mongoose = require('mongoose');

const etkinlikSchema = new mongoose.Schema({
  baslik: {
    type: String,
    required: true,
    trim: true
  },
  aciklama: {
    type: String,
    required: true
  },
  kisaAciklama: {
    type: String,
    maxlength: 150
  },
  etkinlikTarihi: {
    type: Date,
    required: true
  },
  sonBasvuruTarihi: {
    type: Date
  },
  konum: {
    type: String,
    required: true
  },
  adres: {
    type: String
  },
  enlem: {
    type: Number
  },
  boylam: {
    type: Number
  },
  kapakResmi: {
    type: String,
    default: 'default-event.jpg'
  },
  resimler: [{
    type: String
  }],
  kategoriler: [{
    type: String
  }],
  ucretli: {
    type: Boolean,
    default: false
  },
  ucret: {
    type: Number,
    default: 0
  },
  kontenjan: {
    type: Number
  },
  katilimciSayisi: {
    type: Number,
    default: 0
  },
  begeniSayisi: {
    type: Number,
    default: 0
  },
  yorumSayisi: {
    type: Number,
    default: 0
  },
  durum: {
    type: String,
    enum: ['taslak', 'yayinda', 'iptal', 'tamamlandi'],
    default: 'taslak'
  },
  yayinlanmaTarihi: {
    type: Date
  },
  olusturan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  kurum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kurum'
  },
  katilimcilar: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    katilimTarihi: {
      type: Date,
      default: Date.now
    }
  }],
  begenenler: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  favorileyenler: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  yorumlar: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    yorum: String,
    puan: {
      type: Number,
      min: 1,
      max: 5
    },
    tarih: {
      type: Date,
      default: Date.now
    }
  }],
  etiketler: [{
    type: String
  }]
}, {
  timestamps: true
});

// Tarih kontrolü için pre-save middleware
etkinlikSchema.pre('save', function(next) {
  if (this.sonBasvuruTarihi && this.sonBasvuruTarihi > this.etkinlikTarihi) {
    return next(new Error('Son başvuru tarihi etkinlik tarihinden sonra olamaz'));
  }
  next();
});

// Etkinlik durumunu güncelleme metodu
etkinlikSchema.methods.durumGuncelle = function() {
  const now = new Date();
  
  if (this.durum === 'yayinda' && now > this.etkinlikTarihi) {
    this.durum = 'tamamlandi';
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Kullanıcının etkinliğe katılıp katılmadığını kontrol etme
etkinlikSchema.methods.katiliyorMu = function(userId) {
  return this.katilimcilar.some(katilimci => 
    katilimci.user.toString() === userId.toString()
  );
};

// Kullanıcının etkinliği beğenip beğenmediğini kontrol etme
etkinlikSchema.methods.begeniyorMu = function(userId) {
  return this.begenenler.some(begenen => 
    begenen.toString() === userId.toString()
  );
};

// Kullanıcının etkinliği favorileyip favorilemediğini kontrol etme
etkinlikSchema.methods.favoriliyorMu = function(userId) {
  return this.favorileyenler.some(favorileyen => 
    favorileyen.toString() === userId.toString()
  );
};

module.exports = mongoose.model('Etkinlik', etkinlikSchema);