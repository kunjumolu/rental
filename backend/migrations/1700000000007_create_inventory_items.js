/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('inventory_items', {
    id:                    'id',
    sku:                   { type: 'varchar(100)', notNull: true, unique: true },
    name:                  { type: 'varchar(255)', notNull: true },
    category:              { type: 'varchar(100)', notNull: true },
    serial_number:         { type: 'varchar(100)' },
    description:           { type: 'text' },
    condition:             { type: 'varchar(100)', default: 'New' },
    location:              { type: 'varchar(255)' },
    status:                { type: 'varchar(50)',  default: 'available' },

    // Pricing
    daily_rate:            { type: 'numeric(12,2)', default: 0.00 },
    weekly_rate:           { type: 'numeric(12,2)', default: 0.00 },
    monthly_rate:          { type: 'numeric(12,2)', default: 0.00 },
    selling_price:         { type: 'numeric(12,2)', default: 0.00 },
    cost_price:            { type: 'numeric(12,2)', default: 0.00 },

    // Quantities
    total_quantity:        { type: 'integer', default: 0 },
    available_quantity:    { type: 'integer', default: 0 },
    rented_quantity:       { type: 'integer', default: 0 },
    maintenance_quantity:  { type: 'integer', default: 0 },

    // Sales info
    sales_account:         { type: 'varchar(100)', default: 'Sales' },
    sales_description:     { type: 'text' },

    // Purchase info
    purchase_account:      { type: 'varchar(100)', default: 'Cost of Goods Sold' },
    purchase_description:  { type: 'text' },
    preferred_vendor_id:   { type: 'integer', references: '"vendors"', onDelete: 'SET NULL' },
    preferred_vendor_name: { type: 'varchar(255)' },

    created_at:            { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at:            { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('inventory_items', 'sku');
  pgm.createIndex('inventory_items', 'category');
  pgm.createIndex('inventory_items', 'status');
  pgm.createIndex('inventory_items', 'preferred_vendor_id');
};

exports.down = (pgm) => {
  pgm.dropTable('inventory_items', { ifExists: true, cascade: true });
};
