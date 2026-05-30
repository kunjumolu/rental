const bcrypt = require('bcryptjs');
const db = require('../../config/db');

// ============================================================
// User Management Controller
//
// All routes except getMyProfile / updateMyProfile / changeMyPassword
// require admin role (enforced at route level).
// ============================================================

// Helper: shape user object for response (never send password_hash)
const mapUser = (u) => ({
  id: u.id,
  email: u.email,
  full_name: u.full_name,
  role: u.role_name || u.role,
  role_id: u.role_id,
  is_active: u.is_active,
  created_at: u.created_at,
});

// ============================================================
// ADMIN-ONLY ROUTES
// ============================================================

// @desc    Get all users (admin only)
// @route   GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;

    const where = [];
    const params = [];

    if (role) {
      params.push(role);
      where.push(`r.name = $${params.length}`);
    }
    if (status === 'active') where.push(`u.is_active = true`);
    if (status === 'inactive') where.push(`u.is_active = false`);
    if (search) {
      params.push(`%${search}%`);
      where.push(`(u.email ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const result = await db.query(
      `SELECT u.id, u.email, u.full_name, u.is_active, u.created_at,
              u.role_id, r.name AS role_name
         FROM users u
         JOIN roles r ON u.role_id = r.id
         ${whereClause}
         ORDER BY u.id DESC`,
      params
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(mapUser),
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all roles (for dropdown)
// @route   GET /api/users/roles
exports.getRoles = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM roles ORDER BY id');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get Roles Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const result = await db.query(
      `SELECT u.id, u.email, u.full_name, u.is_active, u.created_at,
              u.role_id, r.name AS role_name
         FROM users u
         JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: mapUser(result.rows[0]) });
  } catch (error) {
    console.error('Get User By Id Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new user (admin only)
// @route   POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { email, full_name, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password and role are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check email uniqueness
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Find role_id
    const roleRes = await db.query('SELECT id FROM roles WHERE name = $1', [role]);
    if (roleRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid role: ${role}. Must be admin, manager, or staff.`,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (email, password_hash, full_name, role_id, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, email, full_name, is_active, created_at, role_id`,
      [email, passwordHash, full_name || '', roleRes.rows[0].id]
    );

    const created = result.rows[0];
    created.role_name = role;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: mapUser(created),
    });
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user (admin only) — email/name/role
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const { email, full_name, role } = req.body;

    const existing = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const current = existing.rows[0];

    // Email uniqueness check (if email being changed)
    if (email && email !== current.email) {
      const dup = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [
        email,
        id,
      ]);
      if (dup.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    let roleId = current.role_id;
    if (role) {
      const r = await db.query('SELECT id FROM roles WHERE name = $1', [role]);
      if (r.rows.length === 0) {
        return res.status(400).json({ success: false, message: `Invalid role: ${role}` });
      }
      roleId = r.rows[0].id;

      // 🛡️ Safety: if demoting an admin, ensure at least one admin remains
      if (current.role_id !== roleId) {
        const wasAdmin = await db.query(
          `SELECT r.name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1`,
          [id]
        );
        if (wasAdmin.rows[0].name === 'admin' && role !== 'admin') {
          const adminCount = await db.query(
            `SELECT COUNT(*)::int AS n
               FROM users u JOIN roles r ON u.role_id = r.id
              WHERE r.name = 'admin' AND u.is_active = true`
          );
          if (adminCount.rows[0].n <= 1) {
            return res.status(400).json({
              success: false,
              message: 'Cannot demote the last active admin',
            });
          }
        }
      }
    }

    const result = await db.query(
      `UPDATE users
          SET email     = $1,
              full_name = $2,
              role_id   = $3,
              updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id, email, full_name, is_active, created_at, role_id`,
      [email || current.email, full_name ?? current.full_name, roleId, id]
    );

    const updated = result.rows[0];
    const r = await db.query('SELECT name FROM roles WHERE id = $1', [updated.role_id]);
    updated.role_name = r.rows[0]?.name;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: mapUser(updated),
    });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle is_active (soft delete / reactivate)
// @route   PATCH /api/users/:id/status
exports.toggleUserStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // 🛡️ Don't let admin deactivate themselves
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    const existing = await db.query(
      `SELECT u.id, u.is_active, r.name AS role
         FROM users u JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1`,
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = existing.rows[0];
    const newStatus = !user.is_active;

    // 🛡️ Don't allow deactivating the last active admin
    if (user.role === 'admin' && newStatus === false) {
      const adminCount = await db.query(
        `SELECT COUNT(*)::int AS n
           FROM users u JOIN roles r ON u.role_id = r.id
          WHERE r.name = 'admin' AND u.is_active = true`
      );
      if (adminCount.rows[0].n <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate the last active admin',
        });
      }
    }

    await db.query(
      `UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [newStatus, id]
    );

    res.json({
      success: true,
      message: newStatus ? 'User reactivated' : 'User deactivated',
      data: { id, is_active: newStatus },
    });
  } catch (error) {
    console.error('Toggle User Status Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset a user's password (admin only) — sets a new password directly
// @route   POST /api/users/:id/reset-password
exports.resetUserPassword = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { newPassword } = req.body;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const exists = await db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query(
      `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [newHash, id]
    );

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset User Password Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// SELF-SERVICE ROUTES (any logged-in user)
// ============================================================

// @desc    Get my profile
// @route   GET /api/users/me/profile
exports.getMyProfile = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.email, u.full_name, u.is_active, u.created_at, r.name AS role_name
         FROM users u JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: mapUser(result.rows[0]) });
  } catch (error) {
    console.error('Get My Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update my own profile (only full_name allowed; not role/email/active)
// @route   PUT /api/users/me/profile
exports.updateMyProfile = async (req, res) => {
  try {
    const { full_name } = req.body;

    await db.query(
      `UPDATE users SET full_name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [full_name || '', req.user.id]
    );

    const result = await db.query(
      `SELECT u.id, u.email, u.full_name, u.is_active, u.created_at, r.name AS role_name
         FROM users u JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated',
      data: mapUser(result.rows[0]),
    });
  } catch (error) {
    console.error('Update My Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change my own password (requires current password)
// @route   POST /api/users/me/change-password
exports.changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const result = await db.query(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    // Verify current password (support both bcrypt + legacy plain)
    let isMatch = false;
    if (user.password_hash && user.password_hash.startsWith('$2')) {
      isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    } else {
      isMatch = user.password_hash === currentPassword;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query(
      `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [newHash, req.user.id]
    );

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change My Password Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
