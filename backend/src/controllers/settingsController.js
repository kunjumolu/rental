const db = require('../../config/db');

// @desc    Get settings by group
// @route   GET /api/settings/:group
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    const { group } = req.params;

    const result = await db.query(
      `SELECT setting_key, setting_value FROM settings WHERE setting_group = $1`,
      [group]
    );

    const settings = {};
    result.rows.forEach((row) => {
      const key = row.setting_key.replace(`${group}_`, '');
      settings[key] = row.setting_value;
    });

    console.log("Fetched settings for group:", group, settings);

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get Settings Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update settings by group
// @route   PUT /api/settings/:group
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const { group } = req.params;
    const updates = req.body;

    console.log("Updating settings group:", group);
    console.log("Updates:", updates);

    for (const [key, value] of Object.entries(updates)) {
      const settingKey = `${group}_${key}`;

      console.log(`Saving: ${settingKey} = ${value}`);

      await db.query(
        `
        INSERT INTO settings (setting_key, setting_value, setting_group, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (setting_key)
        DO UPDATE SET
          setting_value = EXCLUDED.setting_value,
          updated_at = CURRENT_TIMESTAMP
        `,
        [settingKey, String(value), group]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Update Settings Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};