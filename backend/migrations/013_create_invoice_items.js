/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('invoice_items', {
    id: 'id',
    invoice_id: { type: 'integer', references: '"invoices"', onDelete: 'CASCADE' },
    description: { type: 'text', notNull: true },
    quantity: { type: 'integer', default: 1 },
    unit_price: { type: 'numeric(12,2)', default: 0.00 },
    amount: { type: 'numeric(12,2)', default: 0.00 },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('invoice_items', { ifExists: true, cascade: true });
};
