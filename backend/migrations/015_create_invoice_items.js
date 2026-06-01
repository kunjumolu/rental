/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('invoice_items', {
    id: 'id',
    invoice_id:  { type: 'integer', notNull: true, references: '"invoices"', onDelete: 'CASCADE' },
    description: { type: 'text', notNull: true },
    quantity:    { type: 'integer', default: 1 },
    unit_price:  { type: 'numeric(12,2)', default: 0.00 },
    amount:      { type: 'numeric(12,2)', default: 0.00 },
    created_at:  { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Seed sample invoice items
  pgm.sql(`
    INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount) VALUES
      (1, 'Camera rental - 3 days',           1, 7500.00,  7500.00),
      (1, 'Lens rental - 3 days',             1, 4500.00,  4500.00),
      (2, 'Camera rental - 5 days',           1, 10000.00, 10000.00),
      (3, 'Lighting kit rental - 2 days',     1, 7200.00,  7200.00),
      (3, 'Tripod rental - 2 days',           1, 800.00,    800.00),
      (3, 'Service fee',                      1, 4000.00,  4000.00),
      (4, 'Gimbal rental - 7 days',           1, 14000.00, 14000.00);
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('invoice_items', { ifExists: true, cascade: true });
};