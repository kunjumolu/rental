const db = require('../../config/db');

// Helper: Generate next customer_id like WL001, WL002, etc.
const generateCustomerId = async () => {
  try {
    const result = await db.query(`
      SELECT customer_id FROM customers 
      WHERE customer_id IS NOT NULL AND customer_id != '' 
      ORDER BY customer_id DESC 
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return 'WL001';
    }

    const lastId = result.rows[0].customer_id; // e.g., "WL025"
    const numPart = parseInt(lastId.replace('WL', ''), 10);
    const nextNum = numPart + 1;
    return `WL${String(nextNum).padStart(3, '0')}`;
  } catch (err) {
    console.error('Generate Customer ID Error:', err);
    return `WL${Date.now().toString().slice(-3)}`;
  }
};

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id,
        customer_id,
        name,
        email,
        phone,
        address,
        city,
        state,
        country,
        id_number,
        notes,
        active_rentals,
        balance,
        status
      FROM customers
      WHERE is_deleted IS NOT TRUE
      ORDER BY id ASC
    `);

    const customers = result.rows.map((customer) => ({
      id: customer.id,
      customerId: customer.customer_id || '',
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state || '',
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
        customer_id,
        name,
        email,
        phone,
        address,
        city,
        state,
        country,
        id_number,
        notes,
        active_rentals,
        balance,
        status
      FROM customers
      WHERE id = $1
      AND is_deleted IS NOT TRUE
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
        customerId: customer.customer_id || '',
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state || '',
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
      state,
      country,
      idNumber,
      customerId,
      status,
      notes
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and phone are required'
      });
    }

    // Auto-generate customer_id if not provided
    const finalCustomerId = customerId || await generateCustomerId();

    const result = await db.query(
      `
      INSERT INTO customers (
        customer_id,
        name,
        email,
        phone,
        address,
        city,
        state,
        country,
        id_number,
        status,
        notes,
        balance,
        active_rentals
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING 
        id,
        customer_id,
        name,
        email,
        phone,
        address,
        city,
        state,
        country,
        id_number,
        status,
        notes,
        balance,
        active_rentals
      `,
      [
        finalCustomerId,
        name,
        email,
        phone,
        address || '',
        city || '',
        state || '',
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
        customerId: customer.customer_id || '',
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state || '',
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
      state,
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
        state = $6,
        country = $7,
        id_number = $8,
        status = $9,
        notes = $10
      WHERE id = $11
      AND is_deleted IS NOT TRUE
      RETURNING 
        id,
        customer_id,
        name,
        email,
        phone,
        address,
        city,
        state,
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
        address || '',
        city || '',
        state || '',
        country || '',
        idNumber || '',
        status,
        notes || '',
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
        customerId: customer.customer_id || '',
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state || '',
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

// @desc    Soft delete customer
// @route   DELETE /api/customers/:id
// @access  Private
exports.deleteCustomer = async (req, res) => {
  try {
    const customerId = parseInt(req.params.id, 10);

    if (isNaN(customerId) || customerId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customerCheck = await db.query(
      'SELECT id, name, is_deleted FROM customers WHERE id = $1',
      [customerId]
    );

    if (customerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (customerCheck.rows[0].is_deleted) {
      return res.status(400).json({
        success: false,
        message: 'Customer already deleted'
      });
    }

    await db.query(
      `UPDATE customers SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [customerId]
    );

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Soft Delete Customer Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
