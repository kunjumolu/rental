const db = require('../../config/db');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id,
        name,
        email,
        phone,
        address,
        city,
        country,
        id_number,
        notes,
        active_rentals,
        balance,
        status
      FROM customers
      ORDER BY id ASC
    `);

    const customers = result.rows.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      country: customer.country,
      idNumber: customer.id_number,
      notes: customer.notes,
      activeRentals: customer.active_rentals,
      balance: Number(customer.balance),
      status: customer.status
    }));

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    console.error('Get Customers Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomerById = async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT 
        id,
        name,
        email,
        phone,
        address,
        city,
        country,
        id_number,
        notes,
        active_rentals,
        balance,
        status
      FROM customers
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const customer = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        country: customer.country,
        idNumber: customer.id_number,
        notes: customer.notes,
        activeRentals: customer.active_rentals,
        balance: Number(customer.balance),
        status: customer.status
      }
    });
  } catch (error) {
    console.error('Get Customer By Id Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add new customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      country,
      idNumber,
      status,
      notes
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and phone are required'
      });
    }

    const result = await db.query(
      `
      INSERT INTO customers (
        name,
        email,
        phone,
        address,
        city,
        country,
        id_number,
        status,
        notes,
        balance,
        active_rentals
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING 
        id,
        name,
        email,
        phone,
        address,
        city,
        country,
        id_number,
        status,
        notes,
        balance,
        active_rentals
      `,
      [
        name,
        email,
        phone,
        address || '',
        city || '',
        country || '',
        idNumber || '',
        status || 'active',
        notes || '',
        0,
        0
      ]
    );

    const customer = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Customer added successfully',
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        country: customer.country,
        idNumber: customer.id_number,
        status: customer.status,
        notes: customer.notes,
        balance: Number(customer.balance),
        activeRentals: customer.active_rentals
      }
    });
  } catch (error) {
    console.error('Create Customer Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      country,
      idNumber,
      status,
      notes
    } = req.body;

    const result = await db.query(
      `
      UPDATE customers
      SET
        name = $1,
        email = $2,
        phone = $3,
        address = $4,
        city = $5,
        country = $6,
        id_number = $7,
        status = $8,
        notes = $9
      WHERE id = $10
      RETURNING 
        id,
        name,
        email,
        phone,
        address,
        city,
        country,
        id_number,
        notes,
        active_rentals,
        balance,
        status
      `,
      [
        name,
        email,
        phone,
        address,
        city,
        country,
        idNumber,
        status,
        notes,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const customer = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        country: customer.country,
        idNumber: customer.id_number,
        notes: customer.notes,
        activeRentals: customer.active_rentals,
        balance: Number(customer.balance),
        status: customer.status
      }
    });
  } catch (error) {
    console.error('Update Customer Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
exports.deleteCustomer = async (req, res) => {
  try {
    const check = await db.query(
      'SELECT id FROM customers WHERE id = $1',
      [req.params.id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await db.query('DELETE FROM customers WHERE id = $1', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete Customer Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};