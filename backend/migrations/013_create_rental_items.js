/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('rental_items', {
    id: 'id',
    rental_id:         { type: 'integer', notNull: true, references: '"rentals"', onDelete: 'CASCADE' },
    inventory_item_id: { type: 'integer', references: '"inventory_items"' },
    item_name:         { type: 'varchar(255)' },
    quantity:          { type: 'integer', default: 1 },
    days:              { type: 'integer', default: 1 },
    rate:              { type: 'numeric(12,2)', default: 0.00 },
    subtotal:          { type: 'numeric(12,2)', default: 0.00 },
    created_at:        { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Seed sample rental items
  pgm.sql(`
    INSERT INTO rental_items (rental_id, inventory_item_id, item_name, quantity, days, rate, subtotal) VALUES
      (1, 1, 'Canon 5D Mark IV',     1, 3, 2500.00, 7500.00),
      (1, 3, 'Canon 70-200mm f/2.8', 1, 3, 1500.00, 4500.00),
      (2, 2, 'Sony A7 III',          1, 5, 2000.00, 10000.00),
      (3, 5, 'Godox AD600',          2, 2, 1200.00, 4800.00),
      (3, 6, 'LED Panel 600W',       1, 2, 800.00,  1600.00),
      (3, 7, 'Manfrotto Tripod',     1, 2, 400.00,   800.00),
      (4, 10,'DJI Ronin S',          1, 7, 1500.00, 10500.00);
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('rental_items', { ifExists: true, cascade: true });
};