/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('invoices', {
    id:               'id',
    invoice_number:   { type: 'varchar(100)', notNull: true, unique: true },
    customer_id:      { type: 'integer', references: '"customers"', onDelete: 'SET NULL' },
    rental_id:        { type: 'integer', references: '"rentals"',   onDelete: 'SET NULL', unique: true },
    issue_date:       { type: 'date', notNull: true },
    due_date:         { type: 'date', notNull: true },
    total_amount:     { type: 'numeric(12,2)', default: 0.00 },
    paid_amount:      { type: 'numeric(12,2)', default: 0.00 },
    balance_amount:   { type: 'numeric(12,2)', default: 0.00 },
    discount_amount:  { type: 'numeric(12,2)', default: 0.00 },
    tax_rate:         { type: 'numeric(5,2)',  default: 0.00 },
    status:           { type: 'varchar(50)', default: 'draft' },
    notes:            { type: 'text' },
    created_at:       { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at:       { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('invoices', 'customer_id');
  pgm.createIndex('invoices', 'rental_id');
  pgm.createIndex('invoices', 'status');
  pgm.createIndex('invoices', 'due_date');
};

exports.down = (pgm) => {
  pgm.dropTable('invoices', { ifExists: true, cascade: true });
};
