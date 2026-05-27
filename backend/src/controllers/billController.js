const db = require('../../config/db');

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private
exports.getBills = async (req, res) => {
  try {
    // Auto update overdue bills
    await db.query(`
      UPDATE bills
      SET status = 'overdue'
      WHERE status NOT IN ('paid', 'overdue')
      AND due_date < CURRENT_DATE
      AND due_date IS NOT NULL
    `);

    const result = await db.query(`
      SELECT *
      FROM bills
      ORDER BY id ASC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get Bills Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get bill stats
// @route   GET /api/bills/stats
// @access  Private
exports.getBillStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*) AS all_count,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'paid') AS paid_count,
        COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_count,
        COUNT(*) FILTER (WHERE status = 'draft') AS draft_count,
        COALESCE(SUM(balance_amount) FILTER (WHERE status = 'pending' OR status = 'overdue'), 0) AS outstanding_payables
      FROM bills
    `);

    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        all: Number(stats.all_count) || 0,
        pending: Number(stats.pending_count) || 0,
        paid: Number(stats.paid_count) || 0,
        overdue: Number(stats.overdue_count) || 0,
        draft: Number(stats.draft_count) || 0,
        outstandingPayables: Number(stats.outstanding_payables) || 0
      }
    });
  } catch (error) {
    console.error('Get Bill Stats Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single bill
// @route   GET /api/bills/:id
// @access  Private
exports.getBillById = async (req, res) => {
  try {
    const billId = parseInt(req.params.id, 10);

    if (isNaN(billId) || billId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bill ID'
      });
    }

    const result = await db.query(`
      SELECT *
      FROM bills
      WHERE id = $1
    `, [billId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get Bill By Id Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new bill
// @route   POST /api/bills
// @access  Private
exports.createBill = async (req, res) => {
  try {
    console.log('Create Bill - Incoming body:', req.body);

    const {
      vendorName,
      vendorEmail,
      dueDate,
      amount,
      status,
      notes
    } = req.body;

    if (!vendorName) {
      return res.status(400).json({
        success: false,
        message: 'Vendor name is required'
      });
    }

    const nextRes = await db.query(`
      SELECT COALESCE(MAX(id), 0) + 1 AS next_bill FROM bills
    `);

    const nextBill = nextRes.rows[0].next_bill;
    const billNumber = `BILL-2026-${String(nextBill).padStart(3, '0')}`;

    const amountNum = Number(amount) || 0;
    const finalStatus = status || 'draft';
    const balance = finalStatus === 'paid' ? 0 : amountNum;
    const paid = finalStatus === 'paid' ? amountNum : 0;

    const result = await db.query(`
      INSERT INTO bills (
        bill_number,
        vendor_name,
        vendor_email,
        due_date,
        amount,
        paid_amount,
        balance_amount,
        status,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [
      billNumber,
      vendorName,
      vendorEmail || '',
      dueDate || null,
      amountNum,
      paid,
      balance,
      finalStatus,
      notes || ''
    ]);

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create Bill Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update bill
// @route   PUT /api/bills/:id
// @access  Private
exports.updateBill = async (req, res) => {
  try {
    const billId = parseInt(req.params.id, 10);

    if (isNaN(billId) || billId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bill ID'
      });
    }

    const {
      vendorName,
      vendorEmail,
      dueDate,
      amount,
      paidAmount,
      status,
      notes
    } = req.body;

    const existing = await db.query(
      'SELECT * FROM bills WHERE id = $1',
      [billId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    const current = existing.rows[0];

    const finalStatus = status || current.status;
    const finalAmount = Number(amount || current.amount) || 0;
    const finalPaid = finalStatus === 'paid'
      ? finalAmount
      : Number(paidAmount || current.paid_amount) || 0;
    const finalBalance = finalStatus === 'paid' ? 0 : finalAmount - finalPaid;

    const result = await db.query(`
      UPDATE bills
      SET
        vendor_name = $1,
        vendor_email = $2,
        due_date = $3,
        amount = $4,
        paid_amount = $5,
        balance_amount = $6,
        status = $7,
        notes = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [
      vendorName || current.vendor_name,
      vendorEmail || current.vendor_email,
      dueDate || current.due_date,
      finalAmount,
      finalPaid,
      finalBalance,
      finalStatus,
      notes || current.notes,
      billId
    ]);

    res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update Bill Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark bill as paid
// @route   PATCH /api/bills/:id/pay
// @access  Private
exports.markBillPaid = async (req, res) => {
  try {
    const billId = parseInt(req.params.id, 10);

    if (isNaN(billId) || billId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bill ID'
      });
    }

    const result = await db.query(`
      UPDATE bills
      SET
        status = 'paid',
        paid_amount = amount,
        balance_amount = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [billId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bill marked as paid',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Mark Bill Paid Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete bill
// @route   DELETE /api/bills/:id
// @access  Private
exports.deleteBill = async (req, res) => {
  try {
    const billId = parseInt(req.params.id, 10);

    if (isNaN(billId) || billId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bill ID'
      });
    }

    const result = await db.query(`
      DELETE FROM bills
      WHERE id = $1
      RETURNING id
    `, [billId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    console.error('Delete Bill Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};