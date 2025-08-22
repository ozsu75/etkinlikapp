exports.mustBeAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Bu sayfayı görüntülemek için giriş yapmalısınız');
  res.redirect('/giris');
};

exports.mustBeAuthorized = (roles) => {
  return (req, res, next) => {
    if (req.isAuthenticated() && roles.includes(req.user.rol)) {
      return next();
    }
    req.flash('error', 'Bu işlem için yetkiniz yok');
    res.redirect('/');
  };
};