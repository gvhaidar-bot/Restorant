export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(401).json({
        success: false,
        message: "anda gak punya akses halaman ini",
      });
    }

    next();
  };
};
