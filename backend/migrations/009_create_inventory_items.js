/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('inventory_items', {
    id: 'id',
    sku:                    { type: 'varchar(100)', notNull: true, unique: true },
    name:                   { type: 'varchar(255)', notNull: true },
    category:               { type: 'varchar(100)', notNull: true },
    serial_number:          { type: 'varchar(100)' },
    description:            { type: 'text' },
    daily_rate:             { type: 'numeric(12,2)', default: 0.00 },
    weekly_rate:            { type: 'numeric(12,2)', default: 0.00 },
    monthly_rate:           { type: 'numeric(12,2)', default: 0.00 },
    total_quantity:         { type: 'integer', default: 0 },
    available_quantity:     { type: 'integer', default: 0 },
    rented_quantity:        { type: 'integer', default: 0 },
    maintenance_quantity:   { type: 'integer', default: 0 },
    condition:              { type: 'varchar(100)', default: 'New' },
    location:               { type: 'varchar(255)' },
    status:                 { type: 'varchar(50)', default: 'available' },
    selling_price:          { type: 'numeric(12,2)', default: 0.00 },
    sales_account:          { type: 'varchar(100)', default: 'Sales' },
    sales_description:      { type: 'text' },
    cost_price:             { type: 'numeric(12,2)', default: 0.00 },
    purchase_account:       { type: 'varchar(100)', default: 'Cost of Goods Sold' },
    purchase_description:   { type: 'text' },
    preferred_vendor_id:    { type: 'integer', references: '"vendors"' },
    preferred_vendor_name:  { type: 'varchar(255)' },
    created_at:             { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at:             { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Seed sample inventory items
  pgm.sql(`
    INSERT INTO inventory_items (sku, name, category, daily_rate, weekly_rate, monthly_rate,
      total_quantity, available_quantity, cost_price, selling_price, condition, status) VALUES
      ('CAM-001', 'Canon 5D Mark IV',     'Camera',     2500, 15000, 60000, 5,  5,  180000, 216000, 'Good', 'available'),
      ('CAM-002', 'Sony A7 III',          'Camera',     2000, 12000, 50000, 3,  3,  150000, 180000, 'Good', 'available'),
      ('LEN-001', 'Canon 70-200mm f/2.8', 'Lens',       1500,  9000, 37500, 4,  4,  120000, 144000, 'Good', 'available'),
      ('LEN-002', 'Sigma 35mm f/1.4',     'Lens',       1000,  6000, 25000, 6,  6,   80000,  96000, 'Good', 'available'),
      ('LIT-001', 'Godox AD600',          'Lighting',   1200,  7200, 30000, 8,  8,   50000,  60000, 'Good', 'available'),
      ('LIT-002', 'LED Panel 600W',       'Lighting',    800,  4800, 20000, 10, 10,  25000,  30000, 'Good', 'available'),
      ('TRP-001', 'Manfrotto Tripod',     'Support',     400,  2400, 10000, 12, 12,  15000,  18000, 'Good', 'available'),
      ('AUD-001', 'Sennheiser MKE 600',   'Audio',       600,  3600, 15000, 6,  6,   35000,  42000, 'Good', 'available'),
      ('AUD-002', 'Zoom H6 Recorder',     'Audio',       500,  3000, 12500, 4,  4,   30000,  36000, 'Good', 'available'),
      ('GMB-001', 'DJI Ronin S',          'Stabilizer', 1500,  9000, 37500, 3,  3,   65000,  78000, 'Good', 'available');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('inventory_items', { ifExists: true, cascade: true });
};