const db = require('../../config/db');

exports.getVendors = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT *
      FROM vendors
      ORDER BY id ASC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get Vendors Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendorId = parseInt(req.params.id, 10);

    if (isNaN(vendorId) || vendorId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor ID'
      });
    }

    const result = await db.query(`
      SELECT *
      FROM vendors
      WHERE id = $1
    `, [vendorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get Vendor By Id Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const {
      salutation,
      firstName,
      lastName,
      companyName,
      displayName,
      email,
      workPhone,
      mobile,
      pan,
      currency,
      paymentTerms,
      openingBalance,
      address,
      contact_person,
      notes
    } = req.body;

    const name = displayName || `${firstName || ''} ${lastName || ''}`.trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Vendor name is required'
      });
    }

    const result = await db.query(`
      INSERT INTO vendors (
        name,
        salutation,
        first_name,
        last_name,
        company_name,
        email,
        phone,
        work_phone,
        mobile,
        address,
        contact_person,
        pan,
        currency,
        payment_terms,
        opening_balance,
        payables,
        unused_credits,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *
    `, [
      name,
      salutation || 'Mr.',
      firstName || '',
      lastName || '',
      companyName || '',
      email || '',
      workPhone || mobile || '',
      workPhone || '',
      mobile || '',
      address || '',
      contact_person || `${salutation || ''} ${firstName || ''} ${lastName || ''}`.trim(),
      pan || '',
      currency || 'INR',
      paymentTerms || 'Due on Receipt',
      Number(openingBalance || 0),
      0,
      0,
      notes || ''
    ]);

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create Vendor Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const vendorId = parseInt(req.params.id, 10);

    if (isNaN(vendorId) || vendorId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor ID'
      });
    }

    const {
      name,
      salutation,
      first_name,
      last_name,
      company_name,
      email,
      phone,
      work_phone,
      mobile,
      address,
      contact_person,
      pan,
      currency,
      payment_terms,
      opening_balance,
      notes
    } = req.body;

    const result = await db.query(`
      UPDATE vendors
      SET
        name = $1,
        salutation = $2,
        first_name = $3,
        last_name = $4,
        company_name = $5,
        email = $6,
        phone = $7,
        work_phone = $8,
        mobile = $9,
        address = $10,
        contact_person = $11,
        pan = $12,
        currency = $13,
        payment_terms = $14,
        opening_balance = $15,
        notes = $16
      WHERE id = $17
      RETURNING *
    `, [
      name,
      salutation || '',
      first_name || '',
      last_name || '',
      company_name || '',
      email || '',
      phone || '',
      work_phone || '',
      mobile || '',
      address || '',
      contact_person || '',
      pan || '',
      currency || 'INR',
      payment_terms || 'Due on Receipt',
      Number(opening_balance || 0),
      notes || '',
      vendorId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update Vendor Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const vendorId = parseInt(req.params.id, 10);

    if (isNaN(vendorId) || vendorId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor ID'
      });
    }

    const result = await db.query(`
      DELETE FROM vendors
      WHERE id = $1
      RETURNING id
    `, [vendorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('Delete Vendor Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};