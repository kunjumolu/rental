const db = require('../../config/db');

// @desc    Get financial summary
// @route   GET /api/accounting/summary
// @access  Private
exports.getFinancialSummary = async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    let dateFilter = '';
    let expenseDateFilter = '';

    if (period === 'today') {
      dateFilter = `AND DATE(issue_date) = CURRENT_DATE`;
      expenseDateFilter = `AND DATE(date) = CURRENT_DATE`;
    } else if (period === 'week') {
      dateFilter = `AND issue_date >= DATE_TRUNC('week', CURRENT_DATE)`;
      expenseDateFilter = `AND date >= DATE_TRUNC('week', CURRENT_DATE)`;
    } else if (period === 'month') {
      dateFilter = `AND issue_date >= DATE_TRUNC('month', CURRENT_DATE)`;
      expenseDateFilter = `AND date >= DATE_TRUNC('month', CURRENT_DATE)`;
    } else if (period === 'quarter') {
      dateFilter = `AND issue_date >= DATE_TRUNC('quarter', CURRENT_DATE)`;
      expenseDateFilter = `AND date >= DATE_TRUNC('quarter', CURRENT_DATE)`;
    } else if (period === 'year') {
      dateFilter = `AND issue_date >= DATE_TRUNC('year', CURRENT_DATE)`;
      expenseDateFilter = `AND date >= DATE_TRUNC('year', CURRENT_DATE)`;
    }

    const [revenueRes, expensesRes, receivablesRes, payablesRes, inventoryRes, cashRes] =
      await Promise.all([
        // Revenue = total paid invoices
        db.query(`
          SELECT
            COALESCE(SUM(paid_amount), 0) AS total_revenue
          FROM invoices
          WHERE status = 'paid'
          ${dateFilter}
        `),

        // Expenses = total expenses
        db.query(`
          SELECT
            COALESCE(SUM(amount), 0) AS total_expenses
          FROM expenses
          WHERE 1=1 ${expenseDateFilter}
        `),

        // Receivables = unpaid invoice balances (money customers owe us)
        db.query(`
          SELECT
            COALESCE(SUM(balance_amount), 0) AS outstanding_receivables
          FROM invoices
          WHERE status != 'paid' AND balance_amount > 0
        `),

        // Payables = unpaid bill balances (money we owe vendors)
        db.query(`
          SELECT
            COALESCE(SUM(balance_amount), 0) AS outstanding_payables
          FROM bills
          WHERE status != 'paid' AND balance_amount > 0
        `),

        // Inventory Value = cost_price × total_quantity (NOT daily_rate!)
        // If cost_price is 0 or null, use a reasonable fallback
        db.query(`
          SELECT
            COALESCE(SUM(
              CASE
                WHEN cost_price > 0 THEN cost_price * total_quantity
                ELSE 0
              END
            ), 0) AS inventory_value
          FROM inventory_items
        `),

        // Cash collected = total payments received (paid invoices) minus expenses paid
        // This represents actual cash in hand
        db.query(`
          SELECT
            COALESCE(SUM(paid_amount), 0) AS total_collected
          FROM invoices
          WHERE status = 'paid'
        `)
      ]);

    const revenue = Number(revenueRes.rows[0].total_revenue) || 0;
    const expenses = Number(expensesRes.rows[0].total_expenses) || 0;
    const receivables = Number(receivablesRes.rows[0].outstanding_receivables) || 0;
    const payables = Number(payablesRes.rows[0].outstanding_payables) || 0;
    const inventoryValue = Number(inventoryRes.rows[0].inventory_value) || 0;
    const totalCollected = Number(cashRes.rows[0].total_collected) || 0;

    // CORRECT CALCULATIONS:
    // Cash = Total collected from invoices - Total expenses paid
    const cashBalance = totalCollected - expenses;

    // Total Assets = Cash + Receivables (money owed to us) + Inventory (at cost)
    const totalAssets = Math.max(cashBalance, 0) + receivables + inventoryValue;

    // Liabilities = Payables (money we owe to vendors)
    const liabilities = payables;

    // Equity = Assets - Liabilities (owner's net worth in the business)
    const equity = totalAssets - liabilities;

    // Net Income = Revenue - Expenses (profit/loss for the period)
    const netIncome = revenue - expenses;

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        liabilities,
        equity,
        revenue,
        expenses,
        netIncome
      }
    });
  } catch (error) {
    console.error('Get Financial Summary Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
