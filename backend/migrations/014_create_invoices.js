/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('invoices', {
    id: 'id',
    invoice_number:   { type: 'varchar(100)', notNull: true, unique: true },
    customer_id:      { type: 'integer', references: '"customers"' },
    rental_id:        { type: 'integer', unique: true, references: '"rentals"' },
    issue_date:       { type: 'date', notNull: true },
    due_date:         { type: 'date', notNull: true },
    total_amount:     { type: 'numeric(12,2)', default: 0.00 },
    paid_amount:      { type: 'numeric(12,2)', default: 0.00 },
    balance_amount:   { type: 'numeric(12,2)', default: 0.00 },
    tax_rate:         { type: 'numeric(5,2)', default: 0.00 },
    discount_amount:  { type: 'numeric(12,2)', default: 0.00 },
    status:           { type: 'varchar(50)', default: 'draft' },
    notes:            { type: 'text' },
    created_at:       { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at:       { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Seed sample invoices
  pgm.sql(`
    INSERT INTO invoices (invoice_number, customer_id, issue_date, due_date, total_amount, paid_amount, balance_amount, status) VALUES
      ('INV-2026-0001', 1, CURRENT_DATE - INTERVAL '5 days',  CURRENT_DATE + INTERVAL '10 days', 12000.00, 12000.00,    0.00, 'paid'),
      ('INV-2026-0002', 2, CURRENT_DATE - INTERVAL '2 days',  CURRENT_DATE + INTERVAL '13 days', 10000.00,  5000.00, 5000.00, 'pending'),
      ('INV-2026-0003', 3, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '5 days',  12000.00, 12000.00,    0.00, 'paid'),
      ('INV-2026-0004', 4, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '5 days',  14000.00,  7000.00, 7000.00, 'overdue');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('invoices', { ifExists: true, cascade: true });
};