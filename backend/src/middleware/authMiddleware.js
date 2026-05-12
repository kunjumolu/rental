const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../utils/blacklist');

const protect = (req, res, next) => {
  let token;

  // 1. Check if Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Get token from header
      token = req.headers.authorization.split(' ')[1];

      // 3. Check if token is blacklisted (logged out)
      if (tokenBlacklist.has(token)) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token has been invalidated (logged out)'
        });
      }

      // 4. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 5. Attach user payload to request object
      req.user = decoded; 
      
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired'
      });
    }
  }

  // 6. If no token is found
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

module.exports = { protect };