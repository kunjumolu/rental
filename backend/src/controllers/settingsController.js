const db = require('../../config/db');

// ============================================================
// Allowed setting groups (whitelist for safety)
// ============================================================
const VALID_GROUPS = ['company', 'system', 'profile', 'notifications'];

// Keys that are sensitive and should NEVER be returned by GET
// (Should not be stored here either, but this is a safety net.)
const SENSITIVE_KEYS = ['password', 'secret', 'api_key', 'token', 'private_key'];

const isSensitive = (key) =>
  SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s));

// Dev-only logger: silent in production
const devLog = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
};

// ============================================================
// @desc    Get settings by group
// @route   GET /api/settings/:group
// @access  Private
// ============================================================
exports.getSettings = async (req, res) => {
  try {
    const { group } = req.params;

    // Validate group
    if (!VALID_GROUPS.includes(group)) {
      return res.status(400).json({
        success: false,
        message: `Invalid settings group. Allowed: ${VALID_GROUPS.join(', ')}`,
      });
    }

    const result = await db.query(
      `SELECT setting_key, setting_value
         FROM settings
        WHERE setting_group = $1`,
      [group]
    );

    // Build settings object: strip `${group}_` prefix from each key
    const settings = {};
    const prefix = `${group}_`;

    result.rows.forEach((row) => {
      // ✅ FIXED: was using template literal `replace` ` instead of replace(`)
      let key = row.setting_key.startsWith(prefix)
        ? row.setting_key.slice(prefix.length)
        : row.setting_key;

      // 🔒 SECURITY: skip sensitive keys (passwords, secrets, etc.)
      if (isSensitive(key)) return;

      settings[key] = row.setting_value;
    });

    // 🚫 Removed spam logging — was running on every API call.
    //    Uncomment below for debugging if needed:
    // devLog(`[Settings] Fetched group '${group}':`, Object.keys(settings));

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get Settings Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// @desc    Update settings by group
// @route   PUT /api/settings/:group
// @access  Private
// ============================================================
exports.updateSettings = async (req, res) => {
  try {
    const { group } = req.params;
    const updates = req.body;

    // Validate group
    if (!VALID_GROUPS.includes(group)) {
      return res.status(400).json({
        success: false,
        message: `Invalid settings group. Allowed: ${VALID_GROUPS.join(', ')}`,
      });
    }

    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be an object of settings',
      });
    }

    const entries = Object.entries(updates);
    if (entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No settings to update',
      });
    }

    // 🔒 SECURITY: reject sensitive keys
    const sensitiveKeysFound = entries
      .map(([k]) => k)
      .filter((k) => isSensitive(k));
    if (sensitiveKeysFound.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot save sensitive keys via settings API: ${sensitiveKeysFound.join(', ')}`,
      });
    }

    devLog(`[Settings] Updating group '${group}' with`, Object.keys(updates));

    // Use a transaction so partial saves don't happen
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      for (const [key, value] of entries) {
        const settingKey = `${group}_${key}`;

        await client.query(
          `INSERT INTO settings (setting_key, setting_value, setting_group, updated_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT (setting_key)
           DO UPDATE SET
             setting_value = EXCLUDED.setting_value,
             updated_at    = CURRENT_TIMESTAMP`,
          [settingKey, value == null ? '' : String(value), group]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.status(200).json({
      success: true,
      message: 'Settings saved successfully',
    });
  } catch (error) {
    console.error('Update Settings Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
