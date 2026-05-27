const db = require('../../config/db');

exports.getLedgerEntries = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT *
      FROM ledger_entries
      ORDER BY entry_date DESC, id DESC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get Ledger Entries Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};