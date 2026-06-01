/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('rentals', {
    id: 'id',
    order_number:    { type: 'varchar(50)', unique: true },
    customer_id:     { type: 'integer', references: '"customers"' },
    start_date:      { type: 'date', default: pgm.func('CURRENT_DATE') },
    end_date:        { type: 'date' },
    items_count:     { type: 'integer', default: 0 },
    total_amount:    { type: 'numeric(12,2)', default: 0.00 },
    balance_amount:  { type: 'numeric(12,2)', default: 0.00 },
    tax_rate:        { type: 'numeric(5,2)', default: 0.00 },
    deposit_amount:  { type: 'numeric(12,2)', default: 0.00 },
    status:          { type: 'varchar(50)', default: 'active' },
    notes:           { type: 'text' },
    created_at:      { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Seed sample rentals
  pgm.sql(`
    INSERT INTO rentals (order_number, customer_id, start_date, end_date, items_count, total_amount, balance_amount, deposit_amount, status) VALUES
      ('RENT-2026-0001', 1, CURRENT_DATE - INTERVAL '5 days',  CURRENT_DATE - INTERVAL '2 days', 2, 12000.00,    0.00, 2400.00, 'completed'),
      ('RENT-2026-0002', 2, CURRENT_DATE - INTERVAL '2 days',  CURRENT_DATE + INTERVAL '3 days', 1, 10000.00, 5000.00, 2000.00, 'active'),
      ('RENT-2026-0003', 3, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '8 days', 3, 12000.00,    0.00, 2400.00, 'completed'),
      ('RENT-2026-0004', 4, CURRENT_DATE + INTERVAL '1 day',   CURRENT_DATE + INTERVAL '8 days', 1, 14000.00, 7000.00, 2800.00, 'active');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('rentals', { ifExists: true, cascade: true });
};