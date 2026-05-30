const db = require('../../config/db');

const getDateFilter = (period) => {
  switch (period) {
    case 'today':
      return {
        invoiceFilter: `AND DATE(issue_date) = CURRENT_DATE`,
        rentalFilter: `AND DATE(created_at) = CURRENT_DATE`,
        expenseFilter: `AND DATE(date) = CURRENT_DATE`,
        billFilter: `AND DATE(created_at) = CURRENT_DATE`,
      };
    case 'week':
      return {
        invoiceFilter: `AND issue_date >= DATE_TRUNC('week', CURRENT_DATE)`,
        rentalFilter: `AND created_at >= DATE_TRUNC('week', CURRENT_DATE)`,
        expenseFilter: `AND date >= DATE_TRUNC('week', CURRENT_DATE)`,
        billFilter: `AND created_at >= DATE_TRUNC('week', CURRENT_DATE)`,
      };
    case 'month':
      return {
        invoiceFilter: `AND issue_date >= DATE_TRUNC('month', CURRENT_DATE)`,
        rentalFilter: `AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
        expenseFilter: `AND date >= DATE_TRUNC('month', CURRENT_DATE)`,
        billFilter: `AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      };
    case 'quarter':
      return {
        invoiceFilter: `AND issue_date >= DATE_TRUNC('quarter', CURRENT_DATE)`,
        rentalFilter: `AND created_at >= DATE_TRUNC('quarter', CURRENT_DATE)`,
        expenseFilter: `AND date >= DATE_TRUNC('quarter', CURRENT_DATE)`,
        billFilter: `AND created_at >= DATE_TRUNC('quarter', CURRENT_DATE)`,
      };
    case 'year':
      return {
        invoiceFilter: `AND issue_date >= DATE_TRUNC('year', CURRENT_DATE)`,
        rentalFilter: `AND created_at >= DATE_TRUNC('year', CURRENT_DATE)`,
        expenseFilter: `AND date >= DATE_TRUNC('year', CURRENT_DATE)`,
        billFilter: `AND created_at >= DATE_TRUNC('year', CURRENT_DATE)`,
      };
    default:
      return {
        invoiceFilter: '',
        rentalFilter: '',
        expenseFilter: '',
        billFilter: '',
      };
  }
};

// Business Overview — P&L
exports.getBusinessOverview = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const { invoiceFilter, expenseFilter } = getDateFilter(period);

    const [revenueRes, expenseRes, rentalRes] = await Promise.all([
      db.query(`
        SELECT
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'paid'), 0) AS total_revenue,
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'paid'), 0) AS paid_revenue,
          COUNT(*) FILTER (WHERE status = 'paid') AS paid_count,
          COUNT(*) FILTER (WHERE status != 'paid') AS unpaid_count,
          COALESCE(SUM(balance_amount) FILTER (WHERE status != 'paid'), 0) AS outstanding
        FROM invoices
        WHERE 1=1 ${invoiceFilter}
      `),
      db.query(`
        SELECT
          COALESCE(SUM(amount), 0) AS total_expenses,
          COUNT(*) AS expense_count
        FROM expenses
        WHERE 1=1 ${expenseFilter}
      `),
      db.query(`
        SELECT
          COUNT(*) AS total_rentals,
          COUNT(*) FILTER (WHERE status = 'active') AS active_rentals,
          COUNT(*) FILTER (WHERE status = 'completed') AS completed_rentals,
          COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_rentals,
          COALESCE(SUM(total_amount), 0) AS total_rental_value
        FROM rentals
        WHERE 1=1 ${expenseFilter.replace('date', 'created_at')}
      `)
    ]);

    const revenue = Number(revenueRes.rows[0].total_revenue) || 0;
    const expenses = Number(expenseRes.rows[0].total_expenses) || 0;
    const netIncome = revenue - expenses;

    res.status(200).json({
      success: true,
      data: {
        revenue,
        expenses,
        netIncome,
        grossProfit: revenue,
        outstanding: Number(revenueRes.rows[0].outstanding) || 0,
        paidCount: Number(revenueRes.rows[0].paid_count) || 0,
        unpaidCount: Number(revenueRes.rows[0].unpaid_count) || 0,
        expenseCount: Number(expenseRes.rows[0].expense_count) || 0,
        totalRentals: Number(rentalRes.rows[0].total_rentals) || 0,
        activeRentals: Number(rentalRes.rows[0].active_rentals) || 0,
        completedRentals: Number(rentalRes.rows[0].completed_rentals) || 0,
        overdueRentals: Number(rentalRes.rows[0].overdue_rentals) || 0,
        totalRentalValue: Number(rentalRes.rows[0].total_rental_value) || 0,
      }
    });
  } catch (error) {
    console.error('Business Overview Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sales Report
exports.getSalesReport = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const { invoiceFilter } = getDateFilter(period);

    const result = await db.query(`
      SELECT
        i.invoice_number,
        c.name AS customer_name,
        c.email AS customer_email,
        i.issue_date,
        i.due_date,
        i.total_amount,
        i.paid_amount,
        i.balance_amount,
        i.status
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE 1=1 ${invoiceFilter}
      ORDER BY i.issue_date DESC
    `);

    const total = result.rows.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);
    const totalPaid = result.rows.reduce((sum, r) => sum + Number(r.paid_amount || 0), 0);
    const totalOutstanding = result.rows.reduce((sum, r) => sum + Number(r.balance_amount || 0), 0);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      summary: { total, totalPaid, totalOutstanding },
      data: result.rows
    });
  } catch (error) {
    console.error('Sales Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Receivables Report
exports.getReceivablesReport = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        COUNT(i.id) AS invoice_count,
        COALESCE(SUM(i.total_amount), 0) AS total_invoiced,
        COALESCE(SUM(i.paid_amount), 0) AS total_paid,
        COALESCE(SUM(i.balance_amount), 0) AS outstanding_balance,
        MAX(i.due_date) AS latest_due_date
      FROM customers c
      LEFT JOIN invoices i ON i.customer_id = c.id AND i.status != 'paid'
      WHERE c.is_deleted IS NOT TRUE
      GROUP BY c.id, c.name, c.email, c.phone
      HAVING COALESCE(SUM(i.balance_amount), 0) > 0
      ORDER BY outstanding_balance DESC
    `);

    const totalOutstanding = result.rows.reduce(
      (sum, r) => sum + Number(r.outstanding_balance || 0), 0
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      summary: { totalOutstanding },
      data: result.rows
    });
  } catch (error) {
    console.error('Receivables Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Payments Received
exports.getPaymentsReport = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const { invoiceFilter } = getDateFilter(period);

    const result = await db.query(`
      SELECT
        i.invoice_number,
        c.name AS customer_name,
        i.paid_amount,
        i.total_amount,
        i.status,
        i.issue_date,
        i.updated_at AS payment_date
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.status = 'paid' AND i.paid_amount > 0
      ${invoiceFilter}
      ORDER BY i.updated_at DESC
    `);

    const totalReceived = result.rows.reduce(
      (sum, r) => sum + Number(r.paid_amount || 0), 0
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      summary: { totalReceived },
      data: result.rows
    });
  } catch (error) {
    console.error('Payments Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Payables Report
exports.getPayablesReport = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        b.bill_number,
        b.vendor_name,
        b.vendor_email,
        b.amount,
        b.paid_amount,
        b.balance_amount,
        b.status,
        b.due_date,
        b.created_at
      FROM bills b
      WHERE b.status != 'paid'
      ORDER BY b.due_date ASC
    `);

    const totalPayable = result.rows.reduce(
      (sum, r) => sum + Number(r.balance_amount || 0), 0
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      summary: { totalPayable },
      data: result.rows
    });
  } catch (error) {
    console.error('Payables Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Expenses Report
exports.getExpensesReport = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const { expenseFilter } = getDateFilter(period);

    const result = await db.query(`
      SELECT
        e.id,
        e.date,
        e.expense_account,
        e.reference_number,
        e.amount,
        e.currency,
        e.paid_through,
        e.vendor_name,
        e.customer_name,
        e.status,
        e.notes
      FROM expenses e
      WHERE 1=1 ${expenseFilter}
      ORDER BY e.date DESC
    `);

    const total = result.rows.reduce(
      (sum, r) => sum + Number(r.amount || 0), 0
    );

    const byCategory = {};
    result.rows.forEach((r) => {
      const cat = r.expense_account || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + Number(r.amount || 0);
    });

    res.status(200).json({
      success: true,
      count: result.rows.length,
      summary: { total, byCategory },
      data: result.rows
    });
  } catch (error) {
    console.error('Expenses Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Inventory Report
exports.getInventoryReport = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        ii.name,
        ii.sku,
        ii.category,
        ii.total_quantity,
        ii.available_quantity,
        ii.rented_quantity,
        ii.maintenance_quantity,
        ii.status,
        ii.daily_rate,
        ii.cost_price,
        COALESCE(SUM(ri.subtotal), 0) AS total_revenue,
        COUNT(DISTINCT ri.rental_id) AS rental_count
      FROM inventory_items ii
      LEFT JOIN rental_items ri ON ri.inventory_item_id = ii.id
      GROUP BY ii.id, ii.name, ii.sku, ii.category,
               ii.total_quantity, ii.available_quantity,
               ii.rented_quantity, ii.maintenance_quantity,
               ii.status, ii.daily_rate, ii.cost_price
      ORDER BY total_revenue DESC
    `);

    const totalItems = result.rows.length;
    const totalRevenue = result.rows.reduce(
      (sum, r) => sum + Number(r.total_revenue || 0), 0
    );
    const lowStock = result.rows.filter(
      (r) => r.status === 'low_stock' || r.status === 'out_of_stock'
    ).length;

    res.status(200).json({
      success: true,
      count: result.rows.length,
      summary: { totalItems, totalRevenue, lowStock },
      data: result.rows
    });
  } catch (error) {
    console.error('Inventory Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Customers Report
exports.getCustomersReport = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const { invoiceFilter, rentalFilter } = getDateFilter(period);

    const result = await db.query(`
      SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        c.status,
        COUNT(DISTINCT r.id) AS total_rentals,
        COUNT(DISTINCT i.id) AS total_invoices,
        COALESCE(SUM(i.total_amount) FILTER (WHERE i.status = 'paid'), 0) AS total_paid,
        COALESCE(SUM(i.balance_amount) FILTER (WHERE i.status != 'paid'), 0) AS outstanding
      FROM customers c
      LEFT JOIN rentals r ON r.customer_id = c.id
      LEFT JOIN invoices i ON i.customer_id = c.id
      WHERE c.is_deleted IS NOT TRUE
      GROUP BY c.id, c.name, c.email, c.phone, c.status
      ORDER BY total_paid DESC
    `);

    const totalCustomers = result.rows.length;
    const totalRevenue = result.rows.reduce(
      (sum, r) => sum + Number(r.total_paid || 0), 0
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      summary: { totalCustomers, totalRevenue },
      data: result.rows
    });
  } catch (error) {
    console.error('Customers Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Rentals Report
exports.getRentalsReport = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const { rentalFilter } = getDateFilter(period);

    const result = await db.query(`
      SELECT
        r.order_number,
        c.name AS customer_name,
        c.phone AS customer_phone,
        r.start_date,
        r.end_date,
        r.items_count,
        r.total_amount,
        r.balance_amount,
        r.deposit_amount,
        r.status,
        r.created_at
      FROM rentals r
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE 1=1 ${rentalFilter}
      ORDER BY r.created_at DESC
    `);

    const total = result.rows.reduce(
      (sum, r) => sum + Number(r.total_amount || 0), 0
    );
    const collected = result.rows.reduce(
      (sum, r) => sum + (Number(r.total_amount || 0) - Number(r.balance_amount || 0)), 0
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      summary: { total, collected, outstanding: total - collected },
      data: result.rows
    });
  } catch (error) {
    console.error('Rentals Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};