/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('rental_items', {
    id: 'id',
    rental_id: { type: 'integer', references: '"rentals"', onDelete: 'CASCADE' },
    inventory_item_id: { type: 'integer', references: '"inventory_items"' },
    item_name: { type: 'varchar(255)' },
    quantity: { type: 'integer', default: 1 },
    days: { type: 'integer', default: 1 },
    rate: { type: 'numeric(12,2)', default: 0.00 },
    subtotal: { type: 'numeric(12,2)', default: 0.00 },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('rental_items', { ifExists: true, cascade: true });
};
