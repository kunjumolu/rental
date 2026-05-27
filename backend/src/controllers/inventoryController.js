const db = require('../../config/db');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
exports.getInventoryItems = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT *
      FROM inventory_items
      ORDER BY id DESC
    `);

   const items = result.rows.map((item) => ({
  id: item.id,
  sku: item.sku,
  name: item.name,
  category: item.category,
  serialNumber: item.serial_number,
  dailyRate: Number(item.daily_rate) || 0,
  weeklyRate: Number(item.weekly_rate) || 0,
  monthlyRate: Number(item.monthly_rate) || 0,
  costPrice: Number(item.cost_price) || 0,
  totalQuantity: Number(item.total_quantity) || 0,
  availableQuantity: Number(item.available_quantity) || 0,
  rentedQuantity: Number(item.rented_quantity) || 0,
  maintenanceQuantity: Number(item.maintenance_quantity) || 0,
  condition: item.condition || '',
  location: item.location || '',
  description: item.description || '',
  status: item.status || '',
  createdAt: item.created_at
}));

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Get Inventory Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get inventory stats
// @route   GET /api/inventory/stats
// @access  Private
exports.getInventoryStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*) AS total_items,
        COALESCE(SUM(available_quantity), 0) AS available,
        COUNT(*) FILTER (WHERE status = 'low_stock' OR status = 'out_of_stock') AS low_out_stock,
        COUNT(*) FILTER (WHERE status = 'maintenance') AS maintenance
      FROM inventory_items
    `);

    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        totalItems: Number(stats.total_items) || 0,
        available: Number(stats.available) || 0,
        lowOutStock: Number(stats.low_out_stock) || 0,
        maintenance: Number(stats.maintenance) || 0
      }
    });
  } catch (error) {
    console.error('Get Inventory Stats Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
exports.getInventoryItemById = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);

    if (isNaN(itemId) || itemId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory item ID'
      });
    }

    const result = await db.query(`
      SELECT *
      FROM inventory_items
      WHERE id = $1
    `, [itemId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    const item = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        serialNumber: item.serial_number,
        dailyRate: Number(item.daily_rate) || 0,
        weeklyRate: Number(item.weekly_rate) || 0,
        monthlyRate: Number(item.monthly_rate) || 0,
        totalQuantity: Number(item.total_quantity) || 0,
        availableQuantity: Number(item.available_quantity) || 0,
        rentedQuantity: Number(item.rented_quantity) || 0,
        maintenanceQuantity: Number(item.maintenance_quantity) || 0,
        condition: item.condition || '',
        location: item.location || '',
        description: item.description || '',
        status: item.status || ''
      }
    });
  } catch (error) {
    console.error('Get Inventory Item By Id Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private
exports.createInventoryItem = async (req, res) => {
  try {
    const {
      sku,
      name,
      category,
      serialNumber,
      dailyRate,
      weeklyRate,
      monthlyRate,
      totalQuantity,
      condition,
      location,
      description,
      sellingPrice,
      salesAccount,
      salesDescription,
      costPrice,
      purchaseAccount,
      purchaseDescription,
      preferredVendorId,
      preferredVendorName
    } = req.body;

    if (!sku || !name || !category || !dailyRate || totalQuantity === undefined || totalQuantity === null) {
      return res.status(400).json({
        success: false,
        message: 'SKU, name, category, daily rate and total quantity are required'
      });
    }

    const totalQty = Number(totalQuantity);
    const daily = Number(dailyRate) || 0;
    const weekly = Number(weeklyRate) || 0;
    const monthly = Number(monthlyRate) || 0;

    let status = 'available';
    if (totalQty <= 0) status = 'out_of_stock';
    else if (totalQty <= 1) status = 'low_stock';

    const result = await db.query(`
      INSERT INTO inventory_items (
        sku, name, category, serial_number,
        daily_rate, weekly_rate, monthly_rate,
        total_quantity, available_quantity,
        rented_quantity, maintenance_quantity,
        condition, location, description, status,
        selling_price, sales_account, sales_description,
        cost_price, purchase_account, purchase_description,
        preferred_vendor_id, preferred_vendor_name
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      RETURNING *
    `, [
      sku, name, category,
      serialNumber || '',
      daily, weekly, monthly,
      totalQty, totalQty,
      0, 0,
      condition || 'New',
      location || '',
      description || '',
      status,
      Number(sellingPrice || 0),
      salesAccount || 'Sales',
      salesDescription || '',
      Number(costPrice || 0),
      purchaseAccount || 'Cost of Goods Sold',
      purchaseDescription || '',
      preferredVendorId || null,
      preferredVendorName || ''
    ]);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create Inventory Item Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update inventory item fully
// @route   PUT /api/inventory/:id
// @access  Private
// @desc    Update inventory item fully
// @route   PUT /api/inventory/:id
// @access  Private
exports.updateInventoryItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);

    if (isNaN(itemId) || itemId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory item ID'
      });
    }

    const {
      sku,
      name,
      category,
      serialNumber,
      dailyRate,
      weeklyRate,
      monthlyRate,
      totalQuantity,
      rentedQuantity,
      maintenanceQuantity,
      condition,
      location,
      description
    } = req.body;

    const totalQty = Number(totalQuantity) || 0;
    const rentedQty = Number(rentedQuantity) || 0;
    const maintenanceQty = Number(maintenanceQuantity) || 0;

    const availableQty = Math.max(totalQty - rentedQty - maintenanceQty, 0);

    let autoStatus = "available";

    if (maintenanceQty > 0) {
      autoStatus = "maintenance";
    } else if (availableQty <= 0) {
      autoStatus = "out_of_stock";
    } else if (availableQty <= 1) {
      autoStatus = "low_stock";
    } else {
      autoStatus = "available";
    }

    const result = await db.query(`
      UPDATE inventory_items
      SET
        sku = $1,
        name = $2,
        category = $3,
        serial_number = $4,
        daily_rate = $5,
        weekly_rate = $6,
        monthly_rate = $7,
        total_quantity = $8,
        available_quantity = $9,
        rented_quantity = $10,
        maintenance_quantity = $11,
        condition = $12,
        location = $13,
        description = $14,
        status = $15,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *
    `, [
      sku,
      name,
      category,
      serialNumber || '',
      Number(dailyRate) || 0,
      Number(weeklyRate) || 0,
      Number(monthlyRate) || 0,
      totalQty,
      availableQty,
      rentedQty,
      maintenanceQty,
      condition || 'New',
      location || '',
      description || '',
      autoStatus,
      itemId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update Inventory Item Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update inventory item status only
// @route   PATCH /api/inventory/:id/status
// @access  Private
exports.updateInventoryStatus = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);

    if (isNaN(itemId) || itemId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory item ID'
      });
    }

    let { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    status = String(status).toLowerCase().trim().replace(/\s+/g, "_");

    const allowedStatuses = ['available', 'low_stock', 'out_of_stock', 'maintenance'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const result = await db.query(`
      UPDATE inventory_items
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, itemId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inventory status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update Inventory Status Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
exports.deleteInventoryItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);

    if (isNaN(itemId) || itemId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory item ID'
      });
    }

    const check = await db.query(
      'SELECT id FROM inventory_items WHERE id = $1',
      [itemId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Delete related rental_items first
    await db.query(
      'DELETE FROM rental_items WHERE inventory_item_id = $1',
      [itemId]
    );

    // Then delete inventory item
    await db.query(
      'DELETE FROM inventory_items WHERE id = $1',
      [itemId]
    );

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Delete Inventory Item Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};