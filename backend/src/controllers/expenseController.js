const db = require('../../config/db');

exports.getExpenses = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM expenses
      ORDER BY date DESC, id DESC
    `);
    res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Get Expenses Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid expense ID' });
    }
    const result = await db.query(`SELECT * FROM expenses WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get Expense By Id Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const {
      date, expenseAccount, referenceNumber, amount, currency,
      paidThrough, vendorId, vendorName, invoiceNumber,
      customerId, customerName, status, notes
    } = req.body;

    if (!date || !expenseAccount || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Date, expense account, and amount are required'
      });
    }

    const result = await db.query(`
      INSERT INTO expenses (
        date, expense_account, reference_number, amount, currency,
        paid_through, vendor_id, vendor_name, invoice_number,
        customer_id, customer_name, status, notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
    `, [
      date, expenseAccount, referenceNumber || '',
      Number(amount) || 0, currency || 'INR',
      paidThrough || '', vendorId || null, vendorName || '',
      invoiceNumber || '', customerId || null, customerName || '',
      status || 'non-billable', notes || ''
    ]);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create Expense Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid expense ID' });
    }

    const {
      date, expenseAccount, referenceNumber, amount, currency,
      paidThrough, vendorId, vendorName, invoiceNumber,
      customerId, customerName, status, notes
    } = req.body;

    const result = await db.query(`
      UPDATE expenses
      SET date=$1, expense_account=$2, reference_number=$3,
          amount=$4, currency=$5, paid_through=$6,
          vendor_id=$7, vendor_name=$8, invoice_number=$9,
          customer_id=$10, customer_name=$11, status=$12,
          notes=$13, updated_at=CURRENT_TIMESTAMP
      WHERE id=$14
      RETURNING *
    `, [
      date, expenseAccount, referenceNumber || '',
      Number(amount) || 0, currency || 'INR',
      paidThrough || '', vendorId || null, vendorName || '',
      invoiceNumber || '', customerId || null, customerName || '',
      status || 'non-billable', notes || '', id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update Expense Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid expense ID' });
    }

    const result = await db.query(
      `DELETE FROM expenses WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete Expense Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};