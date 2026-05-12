const db = require('../../config/db');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    // Run all queries in parallel for maximum performance
    const [
      customersResult,
      inventoryResult,
      rentalsResult,
      revenueResult,
      pendingResult
    ] = await Promise.all([
      getCustomerStats(),
      getInventoryStats(),
      getRentalStats(),
      getRevenueStats(),
      getPendingActionsStats()
    ]);

    // Calculate Revenue Growth Percentage safely
    const thisMonth = parseFloat(revenueResult.this_month) || 0;
    const lastMonth = parseFloat(revenueResult.last_month) || 0;
    let growthPercentage = 0;
    
    if (lastMonth > 0) {
      growthPercentage = parseFloat((((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1));
    } else if (thisMonth > 0) {
      growthPercentage = 100; // 100% growth if last month was 0
    }

    // Format final response
    res.status(200).json({
      success: true,
      data: {
        customers: customersResult,
        inventory: inventoryResult,
        rentals: rentalsResult,
        revenue: {
          today: parseFloat(revenueResult.today) || 0,
          this_month: thisMonth,
          last_month: lastMonth,
          growth_percentage: growthPercentage
        },
        pending_actions: pendingResult
      }
    });

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error fetching dashboard stats' 
    });
  }
};

// ==========================================
// HELPER FUNCTIONS (Optimized SQL Queries)
// ==========================================

async function getCustomerStats() {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM customers) as total,
      (SELECT COUNT(DISTINCT customer_id) FROM rentals WHERE created_at >= NOW() - INTERVAL '30 days') as active,
      (SELECT COUNT(*) FROM customers WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as new_this_month;
  `;
  const result = await db.query(query);
  return {
    total: parseInt(result.rows[0].total),
    active: parseInt(result.rows[0].active),
    new_this_month: parseInt(result.rows[0].new_this_month)
  };
}

async function getInventoryStats() {
  // Uses PostgreSQL FILTER clause for a single, highly optimized query
  const query = `
    SELECT 
      COUNT(*) as total_items,
      COUNT(*) FILTER (WHERE status = 'available') as available,
      COUNT(*) FILTER (WHERE status = 'in_use') as in_use,
      COUNT(*) FILTER (WHERE status = 'maintenance') as in_maintenance
    FROM inventory_items;
  `;
  const result = await db.query(query);
  return {
    total_items: parseInt(result.rows[0].total_items),
    available: parseInt(result.rows[0].available),
    in_use: parseInt(result.rows[0].in_use),
    in_maintenance: parseInt(result.rows[0].in_maintenance)
  };
}

async function getRentalStats() {
  const query = `
    SELECT 
      COUNT(*) FILTER (WHERE status = 'active') as active,
      COUNT(*) FILTER (WHERE status = 'active' AND end_date < CURRENT_DATE) as overdue,
      COUNT(*) FILTER (WHERE end_date = CURRENT_DATE AND status = 'active') as returning_today,
      COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as total_this_month
    FROM rentals;
  `;
  const result = await db.query(query);
  return {
    active: parseInt(result.rows[0].active),
    overdue: parseInt(result.rows[0].overdue),
    returning_today: parseInt(result.rows[0].returning_today),
    total_this_month: parseInt(result.rows[0].total_this_month)
  };
}

async function getRevenueStats() {
  const query = `
    SELECT 
      COALESCE(SUM(total_amount) FILTER (WHERE issue_date = CURRENT_DATE), 0) as today,
      COALESCE(SUM(total_amount) FILTER (WHERE issue_date >= DATE_TRUNC('month', CURRENT_DATE)), 0) as this_month,
      COALESCE(SUM(total_amount) FILTER (WHERE issue_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') 
                                      AND issue_date < DATE_TRUNC('month', CURRENT_DATE)), 0) as last_month
    FROM invoices
    WHERE status = 'paid';
  `;
  const result = await db.query(query);
  return result.rows[0]; // Returns raw strings/numbers, parsed in main function
}

async function getPendingActionsStats() {
  // Mocking pending approvals/maintenance based on existing data
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM invoices WHERE status = 'pending') as pending_approvals,
      (SELECT COUNT(*) FROM invoices WHERE status = 'overdue' OR (status = 'pending' AND issue_date < CURRENT_DATE - INTERVAL '30 days')) as overdue_payments,
      (SELECT COUNT(*) FROM inventory_items WHERE status = 'maintenance') as maintenance_required;
  `;
  const result = await db.query(query);
  return {
    pending_approvals: parseInt(result.rows[0].pending_approvals),
    overdue_payments: parseInt(result.rows[0].overdue_payments),
    maintenance_required: parseInt(result.rows[0].maintenance_required)
  };
}