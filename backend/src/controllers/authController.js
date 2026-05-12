const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const tokenBlacklist = require('../utils/blacklist');

// @desc    Login user / Get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Fetch user and role from DB
    const result = await db.query(
      'SELECT u.id, u.email, u.full_name, u.password_hash, u.is_active, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1',
      [email]
    );

    const user = result.rows[0];

    // 2. Check if user exists and PLAIN TEXT password matches
    if (!user || user.password_hash !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    // 4. Generate JWT (Expires in 24 hours)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 5. Send Response (Matching your exact required format)
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role_name
        },
        token
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server Error during login' });
  }
};

// @desc    Logout user / Invalidate token
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.split(' ')[1];
      
      // Add to blacklist to invalidate it
      tokenBlacklist.add(token);
    }

    res.status(200).json({ 
      success: true, 
      message: 'User logged out successfully, token invalidated' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error during logout' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    // req.user.id comes from the protect middleware
    const result = await db.query(
      'SELECT u.id, u.email, u.full_name, u.created_at, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1',
      [req.user.id]
    );
    
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};