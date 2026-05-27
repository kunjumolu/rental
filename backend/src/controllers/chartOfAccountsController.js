const db = require('../../config/db');

exports.getChartOfAccounts = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT *
      FROM chart_of_accounts
      ORDER BY account_code ASC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get Chart Of Accounts Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};