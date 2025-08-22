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