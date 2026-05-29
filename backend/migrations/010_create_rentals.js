/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('rentals', {
    id: 'id',
    customer_id: { type: 'integer', references: '"customers"' },
    status: { type: 'varchar(50)', default: 'active' },
    start_date: { type: 'date', default: pgm.func('CURRENT_DATE') },
    end_date: { type: 'date' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    order_number: { type: 'varchar(50)', unique: true },
    items_count: { type: 'integer', default: 0 },
    total_amount: { type: 'numeric(12,2)', default: 0.00 },
    balance_amount: { type: 'numeric(12,2)', default: 0.00 },
    tax_rate: { type: 'numeric(5,2)', default: 0.00 },
    deposit_amount: { type: 'numeric(12,2)', default: 0.00 },
    notes: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('rentals', { ifExists: true, cascade: true });
};
