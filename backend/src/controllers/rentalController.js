const db = require('../../config/db');

// @desc    Get all rental orders
// @route   GET /api/rentals
// @access  Private
exports.getRentals = async (req, res) => {
  try {
    // Auto update overdue status - SEPARATE query
   // Only mark overdue if balance > 0 (not paid)
await db.query(`
  UPDATE rentals
  SET status = 'overdue'
  WHERE status = 'active'
  AND end_date < CURRENT_DATE
  AND balance_amount > 0
`);

// If paid (balance = 0) and date passed → completed
await db.query(`
  UPDATE rentals
  SET status = 'completed'
  WHERE status IN ('active', 'overdue')
  AND balance_amount <= 0
`);

    // Then fetch - SEPARATE query
    const result = await db.query(`
      SELECT 
        r.id,
        r.order_number,
        r.customer_id,
        c.name AS customer_name,
        c.phone AS customer_phone,
        r.items_count,
        r.start_date,
        r.end_date,
        r.total_amount,
        r.balance_amount,
        r.status,
        r.tax_rate,
        r.deposit_amount,
        r.notes,
        COALESCE(
          (
            SELECT i.balance_amount
            FROM invoices i
            WHERE i.customer_id = r.customer_id
            AND ABS(i.total_amount - r.total_amount) < 1
            AND i.status = 'paid'
            LIMIT 1
          ),
          r.balance_amount
        ) AS effective_balance
      FROM rentals r
      LEFT JOIN customers c ON r.customer_id = c.id
      ORDER BY r.id DESC
    `);

    const rentals = [];

    for (const rental of result.rows) {
      const itemsResult = await db.query(`
        SELECT
          id,
          inventory_item_id,
          item_name,
          quantity,
          days,
          rate,
          subtotal
        FROM rental_items
        WHERE rental_id = $1
        ORDER BY id ASC
      `, [rental.id]);

      const items = itemsResult.rows.map((item) => ({
        id: item.id,
        itemId: item.inventory_item_id,
        itemName: item.item_name || '',
        quantity: Number(item.quantity) || 0,
        days: Number(item.days) || 0,
        rate: Number(item.rate) || 0,
        subtotal: Number(item.subtotal) || 0
      }));

      rentals.push({
        id: rental.id,
        orderNumber: rental.order_number || '',
        customerId: rental.customer_id,
        customerName: rental.customer_name || '',
        customerPhone: rental.customer_phone || '',
        items: items,
        itemsCount: Number(rental.items_count) || 0,
        startDate: rental.start_date,
        endDate: rental.end_date,
        total: Number(rental.total_amount) || 0,
        balance: Number(rental.effective_balance) || 0,
        status: rental.status || '',
        taxRate: Number(rental.tax_rate) || 0,
        depositAmount: Number(rental.deposit_amount) || 0,
        notes: rental.notes || ''
      });
    }

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    console.error('Get Rentals Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get rentals stats
exports.getRentalStats = async (req, res) => {
  try {
    // Auto update overdue before stats
   // Only mark overdue if balance > 0 (not paid)
await db.query(`
  UPDATE rentals
  SET status = 'overdue'
  WHERE status = 'active'
  AND end_date < CURRENT_DATE
  AND balance_amount > 0
`);

// If paid (balance = 0) and date passed → completed
await db.query(`
  UPDATE rentals
  SET status = 'completed'
  WHERE status IN ('active', 'overdue')
  AND balance_amount <= 0
`);
    const result = await db.query(`
      SELECT
        COUNT(*) AS all_count,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'active') AS active_count,
        COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_count,
        COUNT(*) FILTER (WHERE status = 'returned') AS returned_count,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_count
      FROM rentals
    `);

    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        all: Number(stats.all_count) || 0,
        pending: Number(stats.pending_count) || 0,
        active: Number(stats.active_count) || 0,
        overdue: Number(stats.overdue_count) || 0,
        returned: Number(stats.returned_count) || 0,
        completed: Number(stats.completed_count) || 0
      }
    });
  } catch (error) {
    console.error('Get Rental Stats Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single rental
exports.getRentalById = async (req, res) => {
  try {
    const rentalId = parseInt(req.params.id, 10);

    if (isNaN(rentalId) || rentalId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rental ID'
      });
    }

    const result = await db.query(`
      SELECT 
        r.id,
        r.order_number,
        r.customer_id,
        c.name AS customer_name,
        c.phone AS customer_phone,
        r.items_count,
        r.start_date,
        r.end_date,
        r.total_amount,
        r.balance_amount,
        r.status,
        r.tax_rate,
        r.deposit_amount,
        r.notes
      FROM rentals r
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE r.id = $1
    `, [rentalId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rental order not found'
      });
    }

    const rental = result.rows[0];

    const itemsResult = await db.query(`
      SELECT
        ri.id,
        ri.inventory_item_id,
        ri.item_name,
        ri.quantity,
        ri.days,
        ri.rate,
        ri.subtotal
      FROM rental_items ri
      WHERE ri.rental_id = $1
      ORDER BY ri.id ASC
    `, [rentalId]);

    const items = itemsResult.rows.map((item) => ({
      id: item.id,
      itemId: item.inventory_item_id,
      itemName: item.item_name || '',
      quantity: Number(item.quantity) || 0,
      days: Number(item.days) || 0,
      rate: Number(item.rate) || 0,
      subtotal: Number(item.subtotal) || 0
    }));

    res.status(200).json({
      success: true,
      data: {
        id: rental.id,
        orderNumber: rental.order_number || '',
        customerId: rental.customer_id,
        customerName: rental.customer_name || '',
        customerPhone: rental.customer_phone || '',
        items: items,
        itemsCount: Number(rental.items_count) || 0,
        startDate: rental.start_date,
        endDate: rental.end_date,
        total: Number(rental.total_amount) || 0,
        balance: Number(rental.balance_amount) || 0,
        status: rental.status || '',
        taxRate: Number(rental.tax_rate) || 0,
        depositAmount: Number(rental.deposit_amount) || 0,
        notes: rental.notes || ''
      }
    });
  } catch (error) {
    console.error('Get Rental By Id Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create rental order
exports.createRental = async (req, res) => {
  try {
    const {
      customerId,
      startDate,
      endDate,
      items,
      taxRate,
      depositAmount,
      notes
    } = req.body;

    if (!customerId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Customer, start date, and end date are required'
      });
    }

    const rentalItems = Array.isArray(items) ? items : [];

    const orderNumberResult = await db.query(`
      SELECT COALESCE(MAX(id), 0) + 1 AS next_order FROM rentals
    `);

    const nextOrder = orderNumberResult.rows[0].next_order;
    const orderNumber = `ORD-2026-${String(nextOrder).padStart(4, '0')}`;

    const itemCount = rentalItems.length;

    const subtotal = rentalItems.reduce((sum, item) => {
      return (
        sum +
        Number(item.quantity || 0) *
          Number(item.days || 0) *
          Number(item.rate || 0)
      );
    }, 0);

    const tax = subtotal * ((Number(taxRate) || 0) / 100);
    const total = subtotal + tax;
    const balance = total - (Number(depositAmount) || 0);

    const result = await db.query(`
      INSERT INTO rentals (
        order_number,
        customer_id,
        items_count,
        start_date,
        end_date,
        total_amount,
        balance_amount,
        status,
        tax_rate,
        deposit_amount,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `, [
      orderNumber,
      customerId,
      itemCount,
      startDate,
      endDate,
      total,
      balance,
      'active',
      Number(taxRate) || 0,
      Number(depositAmount) || 0,
      notes || ''
    ]);

    const rental = result.rows[0];

    for (const item of rentalItems) {
      const itemId = parseInt(item.itemId, 10);
      const rentQty = Number(item.quantity || 0);
      const days = Number(item.days || 1);
      const rate = Number(item.rate || 0);
      const subtotalRow = rentQty * days * rate;

      if (!itemId || rentQty <= 0) continue;

      const invRes = await db.query(
        `SELECT * FROM inventory_items WHERE id = $1`,
        [itemId]
      );

      if (invRes.rows.length === 0) continue;

      const inventoryItem = invRes.rows[0];
      const currentAvailable = Number(inventoryItem.available_quantity || 0);
      const currentRented = Number(inventoryItem.rented_quantity || 0);
      const currentMaintenance = Number(inventoryItem.maintenance_quantity || 0);

      if (rentQty > currentAvailable) {
        return res.status(400).json({
          success: false,
          message: `${inventoryItem.name} does not have enough available stock`
        });
      }

      await db.query(`
        INSERT INTO rental_items (
          rental_id,
          inventory_item_id,
          item_name,
          quantity,
          days,
          rate,
          subtotal
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
      `, [
        rental.id,
        itemId,
        item.itemName || inventoryItem.name,
        rentQty,
        days,
        rate,
        subtotalRow
      ]);

      const newAvailable = Math.max(currentAvailable - rentQty, 0);
      const newRented = currentRented + rentQty;

      let newStatus = "available";
      if (currentMaintenance > 0) {
        newStatus = "maintenance";
      } else if (newAvailable <= 0) {
        newStatus = "out_of_stock";
      } else if (newAvailable <= 1) {
        newStatus = "low_stock";
      } else {
        newStatus = "available";
      }

      await db.query(`
        UPDATE inventory_items
        SET
          available_quantity = $1,
          rented_quantity = $2,
          status = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `, [newAvailable, newRented, newStatus, itemId]);
    }

    res.status(201).json({
      success: true,
      message: 'Rental order created successfully',
      data: rental
    });
  } catch (error) {
    console.error('Create Rental Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update full rental order
exports.updateRental = async (req, res) => {
  try {
    const rentalId = parseInt(req.params.id, 10);

    if (isNaN(rentalId) || rentalId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rental ID'
      });
    }

    const {
      customerId,
      startDate,
      endDate,
      items,
      taxRate,
      depositAmount,
      notes,
      status
    } = req.body;

    if (!customerId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Customer, start date, and end date are required'
      });
    }

    const rentalItems = Array.isArray(items) ? items : [];
    const itemCount = rentalItems.length;

    const subtotal = rentalItems.reduce((sum, item) => {
      return (
        sum +
        Number(item.quantity || 0) *
          Number(item.days || 0) *
          Number(item.rate || 0)
      );
    }, 0);

    const tax = subtotal * ((Number(taxRate) || 0) / 100);
    const total = subtotal + tax;
    const balance = total - (Number(depositAmount) || 0);

    const result = await db.query(`
      UPDATE rentals
      SET
        customer_id = $1,
        items_count = $2,
        start_date = $3,
        end_date = $4,
        total_amount = $5,
        balance_amount = $6,
        status = $7,
        tax_rate = $8,
        deposit_amount = $9,
        notes = $10
      WHERE id = $11
      RETURNING *
    `, [
      customerId,
      itemCount,
      startDate,
      endDate,
      total,
      balance,
      status || 'active',
      Number(taxRate) || 0,
      Number(depositAmount) || 0,
      notes || '',
      rentalId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rental order not found'
      });
    }

    await db.query(`DELETE FROM rental_items WHERE rental_id = $1`, [rentalId]);

    for (const item of rentalItems) {
      const itemId = parseInt(item.itemId, 10);
      const qty = Number(item.quantity || 0);
      const days = Number(item.days || 1);
      const rate = Number(item.rate || 0);
      const subtotalRow = qty * days * rate;

      if (!itemId || qty <= 0) continue;

      await db.query(`
        INSERT INTO rental_items (
          rental_id,
          inventory_item_id,
          item_name,
          quantity,
          days,
          rate,
          subtotal
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
      `, [
        rentalId,
        itemId,
        item.itemName || '',
        qty,
        days,
        rate,
        subtotalRow
      ]);
    }

    res.status(200).json({
      success: true,
      message: 'Rental order updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update Rental Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update rental status only
exports.updateRentalStatus = async (req, res) => {
  try {
    const rentalId = parseInt(req.params.id, 10);

    if (isNaN(rentalId) || rentalId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rental ID'
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const allowedStatuses = ['pending', 'completed', 'active', 'overdue', 'returned'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const result = await db.query(`
      UPDATE rentals
      SET status = $1
      WHERE id = $2
      RETURNING *
    `, [status, rentalId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rental order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rental status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update Rental Status Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete rental order
exports.deleteRental = async (req, res) => {
  try {
    const rentalId = parseInt(req.params.id, 10);

    if (isNaN(rentalId) || rentalId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rental ID'
      });
    }

    const check = await db.query(
      'SELECT id FROM rentals WHERE id = $1',
      [rentalId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rental order not found'
      });
    }

    await db.query('DELETE FROM rental_items WHERE rental_id = $1', [rentalId]);
    await db.query('UPDATE invoices SET rental_id = NULL WHERE rental_id = $1', [rentalId]);
    await db.query('DELETE FROM rentals WHERE id = $1', [rentalId]);

    res.status(200).json({
      success: true,
      message: 'Rental order deleted successfully'
    });
  } catch (error) {
    console.error('Delete Rental Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting rental order'
    });
  }
};