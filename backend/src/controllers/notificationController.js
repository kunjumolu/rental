const db = require('../../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = [];

    const [
      overdueRentals,
      lowStockItems,
      overdueInvoices,
      recentPayments,
      recentRentals,
      overdueBills
    ] = await Promise.all([

      db.query(`
        SELECT r.id, r.order_number, c.name AS customer_name, r.end_date
        FROM rentals r
        LEFT JOIN customers c ON c.id = r.customer_id
        WHERE r.status = 'overdue'
        ORDER BY r.end_date ASC
        LIMIT 5
      `),

      db.query(`
        SELECT id, name, sku, available_quantity, status
        FROM inventory_items
        WHERE status = 'low_stock' OR status = 'out_of_stock'
        ORDER BY available_quantity ASC
        LIMIT 5
      `),

      db.query(`
        SELECT i.id, i.invoice_number, c.name AS customer_name, i.due_date, i.balance_amount
        FROM invoices i
        LEFT JOIN customers c ON c.id = i.customer_id
        WHERE i.status = 'overdue'
        ORDER BY i.due_date ASC
        LIMIT 5
      `),

      db.query(`
        SELECT i.id, i.invoice_number, c.name AS customer_name, i.paid_amount, i.updated_at
        FROM invoices i
        LEFT JOIN customers c ON c.id = i.customer_id
        WHERE i.status = 'paid' AND i.updated_at >= NOW() - INTERVAL '7 days'
        ORDER BY i.updated_at DESC
        LIMIT 5
      `),

      db.query(`
        SELECT r.id, r.order_number, c.name AS customer_name, r.created_at
        FROM rentals r
        LEFT JOIN customers c ON c.id = r.customer_id
        WHERE r.created_at >= NOW() - INTERVAL '7 days'
        ORDER BY r.created_at DESC
        LIMIT 5
      `),

      db.query(`
        SELECT id, bill_number, vendor_name, due_date, balance_amount
        FROM bills
        WHERE status = 'overdue'
        ORDER BY due_date ASC
        LIMIT 5
      `)
    ]);

    let idCounter = 1;

    overdueRentals.rows.forEach((r) => {
      notifications.push({
        id: idCounter++,
        type: 'warning',
        title: 'Overdue Rental',
        description: `${r.order_number} from ${r.customer_name || 'Unknown'} is overdue`,
        date: r.end_date ? new Date(r.end_date).toLocaleDateString('en-IN') : '',
        read: false,
        iconType: 'clock',
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-50',
        link: '/rentals'
      });
    });

    lowStockItems.rows.forEach((item) => {
      notifications.push({
        id: idCounter++,
        type: 'alert',
        title: item.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock Alert',
        description: `${item.name} (${item.sku}) — ${item.available_quantity} units available`,
        date: new Date().toLocaleDateString('en-IN'),
        read: false,
        iconType: 'alert',
        iconColor: 'text-red-500',
        iconBg: 'bg-red-50',
        link: '/inventory'
      });
    });

    overdueInvoices.rows.forEach((inv) => {
      notifications.push({
        id: idCounter++,
        type: 'alert',
        title: 'Invoice Overdue',
        description: `${inv.invoice_number} from ${inv.customer_name || 'Unknown'} — ₹${Number(inv.balance_amount).toFixed(2)} pending`,
        date: inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : '',
        read: false,
        iconType: 'file',
        iconColor: 'text-red-500',
        iconBg: 'bg-red-50',
        link: '/invoices'
      });
    });

    recentPayments.rows.forEach((inv) => {
      notifications.push({
        id: idCounter++,
        type: 'success',
        title: 'Payment Received',
        description: `${inv.customer_name || 'Customer'} paid ${inv.invoice_number} — ₹${Number(inv.paid_amount).toFixed(2)}`,
        date: inv.updated_at ? new Date(inv.updated_at).toLocaleDateString('en-IN') : '',
        read: true,
        iconType: 'credit',
        iconColor: 'text-green-500',
        iconBg: 'bg-green-50',
        link: '/invoices'
      });
    });

    recentRentals.rows.forEach((r) => {
      notifications.push({
        id: idCounter++,
        type: 'info',
        title: 'New Rental Order',
        description: `${r.order_number} created for ${r.customer_name || 'Unknown'}`,
        date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '',
        read: true,
        iconType: 'package',
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-50',
        link: '/rentals'
      });
    });

    overdueBills.rows.forEach((bill) => {
      notifications.push({
        id: idCounter++,
        type: 'warning',
        title: 'Bill Overdue',
        description: `${bill.bill_number} from ${bill.vendor_name} — ₹${Number(bill.balance_amount).toFixed(2)} due`,
        date: bill.due_date ? new Date(bill.due_date).toLocaleDateString('en-IN') : '',
        read: false,
        iconType: 'alert',
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-50',
        link: '/bills'
      });
    });

    notifications.sort((a, b) => {
      if (!a.read && b.read) return -1;
      if (a.read && !b.read) return 1;
      return 0;
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter((n) => !n.read).length,
      data: notifications
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllRead = async (req, res) => {
  res.status(200).json({ success: true, message: 'Marked all as read' });
};