const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../utils/blacklist');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (tokenBlacklist.has(token)) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token has been invalidated'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const userRole = (req.user.role || 'staff').toLowerCase();
    const allowed = roles.map((r) => r.toLowerCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required: ${roles.join(' or ')}. Your role: ${userRole}`
      });
    }

    next();
  };
};

module.exports = { protect, requireRole };