/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('rentals', {
    id:             'id',
    order_number:   { type: 'varchar(50)', unique: true },
    customer_id:    { type: 'integer', references: '"customers"', onDelete: 'SET NULL' },
    status:         { type: 'varchar(50)', default: 'active' },
    start_date:     { type: 'date', default: pgm.func('CURRENT_DATE') },
    end_date:       { type: 'date' },
    items_count:    { type: 'integer',      default: 0 },
    total_amount:   { type: 'numeric(12,2)', default: 0.00 },
    balance_amount: { type: 'numeric(12,2)', default: 0.00 },
    tax_rate:       { type: 'numeric(5,2)', default: 0.00 },
    deposit_amount: { type: 'numeric(12,2)', default: 0.00 },
    notes:          { type: 'text' },
    created_at:     { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at:     { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('rentals', 'customer_id');
  pgm.createIndex('rentals', 'status');
  pgm.createIndex('rentals', 'start_date');
  pgm.createIndex('rentals', 'order_number');
};

exports.down = (pgm) => {
  pgm.dropTable('rentals', { ifExists: true, cascade: true });
};
