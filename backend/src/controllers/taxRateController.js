const db = require('../../config/db');

// @desc    Get all tax rates
// @route   GET /api/tax-rates
exports.getTaxRates = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT *
      FROM tax_rates
      ORDER BY id ASC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get Tax Rates Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single tax rate
// @route   GET /api/tax-rates/:id
exports.getTaxRateById = async (req, res) => {
  try {
    const taxId = parseInt(req.params.id, 10);

    if (isNaN(taxId) || taxId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tax rate ID'
      });
    }

    const result = await db.query(`
      SELECT *
      FROM tax_rates
      WHERE id = $1
    `, [taxId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tax rate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get Tax Rate By Id Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create tax rate
// @route   POST /api/tax-rates
exports.createTaxRate = async (req, res) => {
  try {
    const { name, rate, description, is_active } = req.body;

    if (!name || rate === undefined || rate === null) {
      return res.status(400).json({
        success: false,
        message: 'Tax name and rate are required'
      });
    }

    const result = await db.query(`
      INSERT INTO tax_rates (name, rate, description, is_active)
      VALUES ($1,$2,$3,$4)
      RETURNING *
    `, [
      name,
      Number(rate) || 0,
      description || '',
      is_active !== undefined ? is_active : true
    ]);

    res.status(201).json({
      success: true,
      message: 'Tax rate created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create Tax Rate Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update tax rate
// @route   PUT /api/tax-rates/:id
exports.updateTaxRate = async (req, res) => {
  try {
    const taxId = parseInt(req.params.id, 10);

    if (isNaN(taxId) || taxId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tax rate ID'
      });
    }

    const { name, rate, description, is_active } = req.body;

    const result = await db.query(`
      UPDATE tax_rates
      SET
        name = $1,
        rate = $2,
        description = $3,
        is_active = $4
      WHERE id = $5
      RETURNING *
    `, [
      name,
      Number(rate) || 0,
      description || '',
      is_active,
      taxId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tax rate not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tax rate updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update Tax Rate Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete tax rate
// @route   DELETE /api/tax-rates/:id
exports.deleteTaxRate = async (req, res) => {
  try {
    const taxId = parseInt(req.params.id, 10);

    if (isNaN(taxId) || taxId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tax rate ID'
      });
    }

    const result = await db.query(`
      DELETE FROM tax_rates
      WHERE id = $1
      RETURNING id
    `, [taxId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tax rate not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tax rate deleted successfully'
    });
  } catch (error) {
    console.error('Delete Tax Rate Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};