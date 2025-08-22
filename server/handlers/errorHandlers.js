// server/handlers/errorHandlers.js

// Hata yakalayıcı middleware'ler

// Async fonksiyonlar için hata yakalayıcı
exports.catchErrors = (fn) => {
  return function(req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

// 404 hatası - Sayfa bulunamadı
exports.notFound = (req, res, next) => {
  const err = new Error('Sayfa bulunamadı');
  err.status = 404;
  next(err);
};

// Geliştirme ortamı için hata gösterici
exports.developmentErrors = (err, req, res, next) => {
  err.stack = err.stack || '';
  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>')
  };
  res.status(err.status || 500);
  
  if (req.xhr) {
    res.json(errorDetails);
  } else {
    res.render('error', {
      title: 'Hata',
      error: errorDetails
    });
  }
};

// Production ortamı için hata gösterici
exports.productionErrors = (err, req, res, next) => {
  res.status(err.status || 500);
  
  if (req.xhr) {
    res.json({
      message: err.message,
      error: {}
    });
  } else {
    res.render('error', {
      title: 'Hata',
      message: err.message,
      error: {}
    });
  }
};

// MongoDB duplicate key hatası
exports.mongoErrorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    req.flash('error', `${field} zaten kullanımda. Lütfen farklı bir ${field} seçin.`);
    return res.redirect('back');
  }
  next(err);
};

// CastError (Geçersiz ObjectId)
exports.castErrorHandler = (err, req, res, next) => {
  if (err.name === 'CastError') {
    req.flash('error', 'Geçersiz ID formatı');
    return res.redirect('back');
  }
  next(err);
};

// JWT hatalarını işleme
exports.jwtErrorHandler = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Geçersiz token' });
  }
  next(err);
};

// Validation hata yakalayıcı
exports.flashValidationErrors = (err, req, res, next) => {
  if (!err.errors) return next(err);
  
  // validation errors look like
  const errorKeys = Object.keys(err.errors);
  errorKeys.forEach(key => req.flash('error', err.errors[key].message));
  res.redirect('back');
};