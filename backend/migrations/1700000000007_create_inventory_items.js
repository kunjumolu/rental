/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('inventory_items', {
    id: 'id',
    sku: { type: 'varchar(100)', notNull: true, unique: true },
    name: { type: 'varchar(255)', notNull: true },
    category: { type: 'varchar(100)', notNull: true },
    serial_number: { type: 'varchar(100)' },
    daily_rate: { type: 'numeric(12,2)', default: 0.00 },
    weekly_rate: { type: 'numeric(12,2)', default: 0.00 },
    monthly_rate: { type: 'numeric(12,2)', default: 0.00 },
    total_quantity: { type: 'integer', default: 0 },
    available_quantity: { type: 'integer', default: 0 },
    rented_quantity: { type: 'integer', default: 0 },
    maintenance_quantity: { type: 'integer', default: 0 },
    condition: { type: 'varchar(100)', default: 'New' },
    location: { type: 'varchar(255)' },
    description: { type: 'text' },
    status: { type: 'varchar(50)', default: 'available' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    selling_price: { type: 'numeric(12,2)', default: 0.00 },
    sales_account: { type: 'varchar(100)', default: 'Sales' },
    sales_description: { type: 'text' },
    cost_price: { type: 'numeric(12,2)', default: 0.00 },
    purchase_account: { type: 'varchar(100)', default: 'Cost of Goods Sold' },
    purchase_description: { type: 'text' },
    preferred_vendor_id: { type: 'integer', references: '"vendors"' },
    preferred_vendor_name: { type: 'varchar(255)' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('inventory_items', { ifExists: true, cascade: true });
};
