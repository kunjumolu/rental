const db = require('../../config/db');

// Helper
const mapInvoice = (invoice, items = []) => ({
  id: invoice.id,
  invoiceNumber: invoice.invoice_number,
  rentalId: invoice.rental_id || null,
  customerId: invoice.customer_id,
  customerName: invoice.customer_name || '',
  customerEmail: invoice.customer_email || '',
  customerAddress: invoice.customer_address || '',
  issueDate: invoice.issue_date,
  dueDate: invoice.due_date,
  total: Number(invoice.total_amount) || 0,
  balance: Number(invoice.balance_amount) || 0,
  status: invoice.status || '',
  notes: invoice.notes || '',
  taxRate: Number(invoice.tax_rate || 0),
  discount: Number(invoice.discount_amount || 0),
  paidAmount: Number(invoice.paid_amount || 0),
  items
});

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    // Auto update overdue status
    await db.query(`
      UPDATE invoices
      SET status = 'overdue'
      WHERE status NOT IN ('paid', 'overdue')
      AND due_date < CURRENT_DATE
      AND due_date IS NOT NULL
    `);

    const result = await db.query(`
      SELECT
        i.id,
        i.invoice_number,
        i.rental_id,
        i.customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        c.address AS customer_address,
        i.issue_date,
        i.due_date,
        i.total_amount,
        i.balance_amount,
        i.paid_amount,
        i.tax_rate,
        i.discount_amount,
        i.status,
        i.notes,
        i.created_at
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY i.id ASC
    `);

    const invoices = result.rows.map((invoice) => mapInvoice(invoice));

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error('Get Invoices Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Get invoice stats
// @route   GET /api/invoices/stats
// @access  Private
exports.getInvoiceStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*) AS all_count,
        COUNT(*) FILTER (WHERE status = 'draft') AS draft_count,
        COUNT(*) FILTER (WHERE status = 'sent') AS sent_count,
        COUNT(*) FILTER (WHERE status = 'paid') AS paid_count,
        COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_count
      FROM invoices
    `);

    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        all: Number(stats.all_count) || 0,
        draft: Number(stats.draft_count) || 0,
        sent: Number(stats.sent_count) || 0,
        paid: Number(stats.paid_count) || 0,
        overdue: Number(stats.overdue_count) || 0
      }
    });
  } catch (error) {
    console.error('Get Invoice Stats Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single invoice with items
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id, 10);

    if (isNaN(invoiceId) || invoiceId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice ID'
      });
    }

    // Auto update overdue if due date passed
    await db.query(`
      UPDATE invoices
      SET status = 'overdue'
      WHERE id = $1
      AND status NOT IN ('paid', 'overdue')
      AND due_date < CURRENT_DATE
      AND due_date IS NOT NULL
    `, [invoiceId]);

    const invoiceRes = await db.query(`
      SELECT
        i.id,
        i.invoice_number,
        i.rental_id,
        i.customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        c.address AS customer_address,
        i.issue_date,
        i.due_date,
        i.total_amount,
        i.balance_amount,
        i.paid_amount,
        i.tax_rate,
        i.discount_amount,
        i.status,
        i.notes
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = $1
    `, [invoiceId]);

    if (invoiceRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const itemsRes = await db.query(`
      SELECT id, description, quantity, unit_price, amount
      FROM invoice_items
      WHERE invoice_id = $1
      ORDER BY id ASC
    `, [invoiceId]);

    const items = itemsRes.rows.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unit_price) || 0,
      amount: Number(item.amount) || 0
    }));

    res.status(200).json({
      success: true,
      data: mapInvoice(invoiceRes.rows[0], items)
    });
  } catch (error) {
    console.error('Get Invoice By Id Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  try {
    const {
      customerId,
      issueDate,
      dueDate,
      customerAddress,
      status,
      items,
      taxRate,
      discount,
      notes,
      paidAmount
    } = req.body;

    if (!customerId || !issueDate || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Customer, issue date and due date are required'
      });
    }

    const lineItems = Array.isArray(items) ? items : [];

    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0));
    }, 0);

    const taxAmount = subtotal * (Number(taxRate || 0) / 100);
    const discountAmount = Number(discount || 0);
    const total = subtotal + taxAmount - discountAmount;

    const paid = Number(paidAmount || 0);
    const balance = Math.max(total - paid, 0);

  // Use MAX(id) to avoid duplicate invoice numbers
const nextRes = await db.query(`
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-2026-([0-9]+)') AS INTEGER)
  ), 0) + 1 AS next_invoice
  FROM invoices
  WHERE invoice_number LIKE 'INV-2026-%'
`);

const nextInvoice = nextRes.rows[0].next_invoice;
const invoiceNumber = `INV-2026-${String(nextInvoice).padStart(3, '0')}`;
    const invoiceRes = await db.query(`
      INSERT INTO invoices (
        invoice_number,
        customer_id,
        issue_date,
        due_date,
        total_amount,
        balance_amount,
        paid_amount,
        tax_rate,
        discount_amount,
        status,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `, [
      invoiceNumber,
      customerId,
      issueDate,
      dueDate,
      total,
      balance,
      paid,
      Number(taxRate || 0),
      discountAmount,
      status || 'draft',
      notes || ''
    ]);

    const invoice = invoiceRes.rows[0];

    for (const item of lineItems) {
      const amount = Number(item.quantity || 0) * Number(item.unitPrice || 0);

      await db.query(`
        INSERT INTO invoice_items (
          invoice_id,
          description,
          quantity,
          unit_price,
          amount
        )
        VALUES ($1,$2,$3,$4,$5)
      `, [
        invoice.id,
        item.description,
        Number(item.quantity || 0),
        Number(item.unitPrice || 0),
        amount
      ]);
    }

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Create Invoice Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id, 10);

    if (isNaN(invoiceId) || invoiceId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice ID'
      });
    }

    const {
      customerId,
      issueDate,
      dueDate,
      status,
      items,
      taxRate,
      discount,
      notes,
      paidAmount
    } = req.body;

    const lineItems = Array.isArray(items) ? items : [];

    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0));
    }, 0);

    const taxAmount = subtotal * (Number(taxRate || 0) / 100);
    const discountAmount = Number(discount || 0);
    const total = subtotal + taxAmount - discountAmount;
    const paid = Number(paidAmount || 0);
    const balance = total - paid;

    const invoiceRes = await db.query(`
      UPDATE invoices
      SET
        customer_id = $1,
        issue_date = $2,
        due_date = $3,
        total_amount = $4,
        balance_amount = $5,
        paid_amount = $6,
        tax_rate = $7,
        discount_amount = $8,
        status = $9,
        notes = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `, [
      customerId,
      issueDate,
      dueDate,
      total,
      balance,
      paid,
      Number(taxRate || 0),
      discountAmount,
      status,
      notes || '',
      invoiceId
    ]);

    if (invoiceRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    await db.query(`DELETE FROM invoice_items WHERE invoice_id = $1`, [invoiceId]);

    for (const item of lineItems) {
      const amount = Number(item.quantity || 0) * Number(item.unitPrice || 0);

      await db.query(`
        INSERT INTO invoice_items (
          invoice_id,
          description,
          quantity,
          unit_price,
          amount
        )
        VALUES ($1,$2,$3,$4,$5)
      `, [
        invoiceId,
        item.description,
        Number(item.quantity || 0),
        Number(item.unitPrice || 0),
        amount
      ]);
    }

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoiceRes.rows[0]
    });
  } catch (error) {
    console.error('Update Invoice Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark invoice as paid
// @route   PATCH /api/invoices/:id/pay
// @access  Private
exports.markInvoicePaid = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id, 10);

    if (isNaN(invoiceId) || invoiceId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice ID'
      });
    }

    const result = await db.query(`
      UPDATE invoices
      SET
        status = 'paid',
        paid_amount = total_amount,
        balance_amount = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [invoiceId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const invoice = result.rows[0];

    // Update linked rental balance to 0
    if (invoice.rental_id) {
      await db.query(`
        UPDATE rentals
        SET balance_amount = 0
        WHERE id = $1
      `, [invoice.rental_id]);
    }

    // Also try to find rental by customer and total amount if rental_id is null
    if (!invoice.rental_id && invoice.customer_id) {
      await db.query(`
        UPDATE rentals
        SET balance_amount = 0
        WHERE customer_id = $1
        AND total_amount = $2
        AND balance_amount > 0
      `, [invoice.customer_id, invoice.total_amount]);
    }

    res.status(200).json({
      success: true,
      message: 'Invoice marked as paid',
      data: invoice
    });
  } catch (error) {
    console.error('Mark Invoice Paid Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id, 10);

    if (isNaN(invoiceId) || invoiceId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice ID'
      });
    }

    const result = await db.query(`
      DELETE FROM invoices
      WHERE id = $1
      RETURNING id
    `, [invoiceId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Delete Invoice Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate invoice from rental
// @route   POST /api/invoices/generate-from-rental/:rentalId
// @access  Private
exports.generateInvoiceFromRental = async (req, res) => {
  try {
    const rentalId = parseInt(req.params.rentalId, 10);

    if (isNaN(rentalId) || rentalId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rental ID'
      });
    }

    // Prevent duplicate invoice generation
    const existingInvoiceRes = await db.query(
      `SELECT id, invoice_number FROM invoices WHERE rental_id = $1`,
      [rentalId]
    );

    if (existingInvoiceRes.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invoice already exists for this rental (${existingInvoiceRes.rows[0].invoice_number})`
      });
    }

    // Fetch rental
    const rentalRes = await db.query(`
      SELECT
        r.*,
        c.name AS customer_name,
        c.email AS customer_email,
        c.address AS customer_address
      FROM rentals r
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE r.id = $1
    `, [rentalId]);

    if (rentalRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    const rental = rentalRes.rows[0];

    // Fetch rental items from rental_items table
    const rentalItemsRes = await db.query(`
      SELECT
        item_name,
        quantity,
        days,
        rate,
        subtotal
      FROM rental_items
      WHERE rental_id = $1
      ORDER BY id ASC
    `, [rentalId]);

    const rentalItems = rentalItemsRes.rows;

    // Generate invoice number
   const nextRes = await db.query(`
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-2026-([0-9]+)') AS INTEGER)
  ), 0) + 1 AS next_invoice
  FROM invoices
  WHERE invoice_number LIKE 'INV-2026-%'
`);

const nextInvoice = nextRes.rows[0].next_invoice;
const invoiceNumber = `INV-2026-${String(nextInvoice).padStart(3, '0')}`;
    // Calculate totals from rental items
    let subtotal = 0;
    if (rentalItems.length > 0) {
      subtotal = rentalItems.reduce((sum, item) => {
        return sum + Number(item.subtotal || 0);
      }, 0);
    } else {
      subtotal = Number(rental.total_amount) || 0;
    }

    const taxRate = Number(rental.tax_rate || 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    const depositPaid = Number(rental.deposit_amount || 0);
    const balance = Math.max(total - depositPaid, 0);

    // Create invoice
    const invoiceRes = await db.query(`
      INSERT INTO invoices (
        invoice_number,
        rental_id,
        customer_id,
        issue_date,
        due_date,
        total_amount,
        balance_amount,
        paid_amount,
        tax_rate,
        discount_amount,
        status,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `, [
      invoiceNumber,
      rentalId,
      rental.customer_id,
      new Date(),
      rental.end_date,
      total,
      balance,
      depositPaid,
      taxRate,
      0,
      'draft',
      `Generated from rental ${rental.order_number}`
    ]);

    const invoice = invoiceRes.rows[0];

    // Save individual rental items as invoice items
    if (rentalItems.length > 0) {
      for (const item of rentalItems) {
        const itemSubtotal = Number(item.subtotal || 0);
        const unitPrice =
          item.quantity > 0 ? itemSubtotal / Number(item.quantity) : 0;

        await db.query(`
          INSERT INTO invoice_items (
            invoice_id,
            description,
            quantity,
            unit_price,
            amount
          )
          VALUES ($1,$2,$3,$4,$5)
        `, [
          invoice.id,
          `${item.item_name} (${item.days || 1} day${Number(item.days) > 1 ? 's' : ''})`,
          Number(item.quantity || 1),
          Number(unitPrice.toFixed(2)),
          itemSubtotal
        ]);
      }
    } else {
      // Fallback: save as single item if no rental items found
      await db.query(`
        INSERT INTO invoice_items (
          invoice_id,
          description,
          quantity,
          unit_price,
          amount
        )
        VALUES ($1,$2,$3,$4,$5)
      `, [
        invoice.id,
        `Rental Order ${rental.order_number}`,
        1,
        Number(rental.total_amount || 0),
        Number(rental.total_amount || 0)
      ]);
    }

    res.status(201).json({
      success: true,
      message: 'Invoice generated from rental successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Generate Invoice From Rental Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};