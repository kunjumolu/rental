const db = require('../../config/db');

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private
exports.getDashboardOverview = async (req, res) => {
  try {
    const [
      statsRes,
      financialRes,
      alertsRes,
      recentActivityRes,
      topCustomersRes,
      topItemsRes,
      revenueChartRes
    ] = await Promise.all([
      // Top stats
      db.query(`
        SELECT
          COALESCE((SELECT SUM(total_amount) FROM invoices WHERE status = 'paid'), 0) AS total_revenue,
          COALESCE((SELECT COUNT(*) FROM rentals WHERE status = 'active'), 0) AS active_rentals,
          COALESCE((SELECT COUNT(*) FROM rentals WHERE status = 'overdue'), 0) AS overdue_rentals,
          COALESCE((SELECT SUM(available_quantity) FROM inventory_items), 0) AS available_inventory
      `),

      // Financial position
      db.query(`
        SELECT
          COALESCE((SELECT SUM(balance_amount) FROM invoices WHERE status != 'paid'), 0) AS outstanding_receivables,
          COALESCE((SELECT COUNT(*) FROM invoices WHERE status = 'overdue'), 0) AS overdue_invoices,
          COALESCE((SELECT SUM(balance_amount) FROM bills WHERE status != 'paid'), 0) AS outstanding_payables,
          COALESCE((SELECT COUNT(*) FROM bills WHERE status = 'overdue'), 0) AS overdue_bills
      `),

      // Alerts
      db.query(`
        SELECT
          COALESCE((SELECT COUNT(*) FROM rentals WHERE status = 'overdue'), 0) AS overdue_rentals,
          COALESCE((SELECT COUNT(*) FROM invoices WHERE status != 'paid' AND balance_amount > 0), 0) AS unpaid_invoices,
          COALESCE((SELECT COUNT(*) FROM inventory_items WHERE status = 'low_stock' OR status = 'out_of_stock'), 0) AS low_stock_items,
          COALESCE((SELECT COUNT(*) FROM bills WHERE status != 'paid'), 0) AS bills_to_pay
      `),

      // Recent activity
      db.query(`
        SELECT * FROM (
          SELECT
            'rental' AS type,
            created_at AS activity_date,
            'Rental order ' || order_number || ' created' AS title,
            total_amount AS amount
          FROM rentals

          UNION ALL

          SELECT
            'invoice' AS type,
            created_at AS activity_date,
            'Invoice ' || invoice_number || ' created' AS title,
            total_amount AS amount
          FROM invoices

          UNION ALL

          SELECT
            'payment' AS type,
            updated_at AS activity_date,
            'Payment received for invoice ' || invoice_number AS title,
            paid_amount AS amount
          FROM invoices
          WHERE status = 'paid' AND paid_amount > 0

          UNION ALL

          SELECT
            'bill' AS type,
            created_at AS activity_date,
            'Bill ' || bill_number || ' created for ' || vendor_name AS title,
            amount AS amount
          FROM bills
        ) x
        ORDER BY activity_date DESC
        LIMIT 8
      `),

      // Top customers
    db.query(`
  SELECT
    c.id,
    c.name,
    COALESCE(SUM(i.total_amount) FILTER (WHERE i.status = 'paid'), 0) AS revenue
  FROM customers c
  LEFT JOIN invoices i ON i.customer_id = c.id
  WHERE c.is_deleted IS NOT TRUE
  GROUP BY c.id, c.name
  ORDER BY revenue DESC
  LIMIT 5
`),

      // Top rental items
  db.query(`
  SELECT
    ii.name,
    COALESCE(SUM(ri.quantity), 0) AS rented_quantity
  FROM inventory_items ii
  LEFT JOIN rental_items ri ON ri.inventory_item_id = ii.id
  GROUP BY ii.id, ii.name
  ORDER BY rented_quantity DESC
  LIMIT 5
`),
      // Revenue vs expenses chart
      db.query(`
        WITH revenue_data AS (
          SELECT
            TO_CHAR(issue_date, 'Mon') AS month,
            DATE_TRUNC('month', issue_date) AS month_order,
            COALESCE(SUM(total_amount) FILTER (WHERE status = 'paid'), 0) AS revenue
          FROM invoices
          GROUP BY TO_CHAR(issue_date, 'Mon'), DATE_TRUNC('month', issue_date)
        ),
        expense_data AS (
          SELECT
            TO_CHAR(due_date, 'Mon') AS month,
            DATE_TRUNC('month', due_date) AS month_order,
            COALESCE(SUM(amount), 0) AS expenses
          FROM bills
          GROUP BY TO_CHAR(due_date, 'Mon'), DATE_TRUNC('month', due_date)
        )
        SELECT
          COALESCE(r.month, e.month) AS month,
          COALESCE(r.month_order, e.month_order) AS month_order,
          COALESCE(r.revenue, 0) AS revenue,
          COALESCE(e.expenses, 0) AS expenses
        FROM revenue_data r
        FULL OUTER JOIN expense_data e
          ON r.month_order = e.month_order
        ORDER BY month_order
      `)
    ]);

    const stats = {
      totalRevenue: Number(statsRes.rows[0].total_revenue) || 0,
      activeRentals: Number(statsRes.rows[0].active_rentals) || 0,
      overdueRentals: Number(statsRes.rows[0].overdue_rentals) || 0,
      availableInventory: Number(statsRes.rows[0].available_inventory) || 0
    };

    const outstandingReceivables = Number(financialRes.rows[0].outstanding_receivables) || 0;
    const outstandingPayables = Number(financialRes.rows[0].outstanding_payables) || 0;

    const financial = {
      outstandingReceivables,
      overdueInvoices: Number(financialRes.rows[0].overdue_invoices) || 0,
      outstandingPayables,
      overdueBills: Number(financialRes.rows[0].overdue_bills) || 0,
      netPosition: outstandingReceivables - outstandingPayables
    };

    const alerts = [
      {
        type: "overdue_rentals",
        text: `${Number(alertsRes.rows[0].overdue_rentals) || 0} overdue rentals`
      },
      {
        type: "unpaid_invoices",
        text: `${Number(alertsRes.rows[0].unpaid_invoices) || 0} unpaid invoices`
      },
      {
        type: "low_stock",
        text: `${Number(alertsRes.rows[0].low_stock_items) || 0} items low/out of stock`
      },
      {
        type: "bills_to_pay",
        text: `${Number(alertsRes.rows[0].bills_to_pay) || 0} bills to pay`
      }
    ];

    const recentActivity = recentActivityRes.rows.map((row) => ({
      type: row.type,
      title: row.title,
      date: row.activity_date,
      amount: row.amount ? Number(row.amount) : null
    }));

    const topCustomers = topCustomersRes.rows.map((row) => ({
      id: row.id,
      name: row.name,
      revenue: Number(row.revenue) || 0
    }));

    const topRentalItems = topItemsRes.rows.map((row) => ({
      name: row.name,
      value: Number(row.rented_quantity) || 0
    }));

    const revenueChart = revenueChartRes.rows.map((row) => ({
      month: row.month,
      revenue: Number(row.revenue) || 0,
      expenses: Number(row.expenses) || 0
    }));

    res.status(200).json({
      success: true,
      data: {
        stats,
        financial,
        alerts,
        recentActivity,
        topCustomers,
        topRentalItems,
        revenueChart
      }
    });
  } catch (error) {
    console.error('Get Dashboard Overview Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};