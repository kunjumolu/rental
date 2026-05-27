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

    const [revenueRes, expensesRes, receivablesRes, payablesRes, inventoryRes] =
      await Promise.all([
        db.query(`
          SELECT
            COALESCE(SUM(total_amount) FILTER (WHERE status = 'paid'), 0) AS total_revenue,
            COALESCE(SUM(tax_rate / 100 * total_amount) FILTER (WHERE status = 'paid'), 0) AS tax_collected
          FROM invoices
          WHERE 1=1 ${dateFilter}
        `),

        db.query(`
          SELECT
            COALESCE(SUM(amount), 0) AS total_expenses
          FROM expenses
          WHERE 1=1 ${expenseDateFilter}
        `),

        db.query(`
          SELECT
            COALESCE(SUM(balance_amount), 0) AS outstanding_receivables
          FROM invoices
          WHERE status != 'paid'
          ${dateFilter}
        `),

        db.query(`
          SELECT
            COALESCE(SUM(balance_amount), 0) AS outstanding_payables
          FROM bills
          WHERE status != 'paid'
        `),

        db.query(`
          SELECT
            COALESCE(SUM(daily_rate * total_quantity), 0) AS inventory_value
          FROM inventory_items
        `)
      ]);

    const revenue = Number(revenueRes.rows[0].total_revenue) || 0;
    const taxCollected = Number(revenueRes.rows[0].tax_collected) || 0;
    const expenses = Number(expensesRes.rows[0].total_expenses) || 0;
    const receivables = Number(receivablesRes.rows[0].outstanding_receivables) || 0;
    const payables = Number(payablesRes.rows[0].outstanding_payables) || 0;
    const inventoryValue = Number(inventoryRes.rows[0].inventory_value) || 0;

    const totalAssets = revenue + receivables + inventoryValue;
    const liabilities = payables + taxCollected;
    const equity = totalAssets - liabilities;
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