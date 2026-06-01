/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('bills', {
    id: 'id',
    bill_number:    { type: 'varchar(100)', notNull: true, unique: true },
    vendor_name:    { type: 'varchar(255)', notNull: true },
    vendor_email:   { type: 'varchar(255)' },
    due_date:       { type: 'date', notNull: true },
    amount:         { type: 'numeric(12,2)', default: 0.00 },
    paid_amount:    { type: 'numeric(12,2)', default: 0.00 },
    balance_amount: { type: 'numeric(12,2)', default: 0.00 },
    status:         { type: 'varchar(50)', default: 'pending' },
    notes:          { type: 'text' },
    created_at:     { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at:     { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Seed sample bills
  pgm.sql(`
    INSERT INTO bills (bill_number, vendor_name, vendor_email, due_date, amount, paid_amount, balance_amount, status, notes) VALUES
      ('BILL-2026-001', 'Camera Services Inc',    'accounts@cameraservices.com', CURRENT_DATE - INTERVAL '20 days', 950.00,   950.00,     0.00, 'paid',    'Sensor cleaning'),
      ('BILL-2026-002', 'LightEquip Repairs',     'repairs@lightequip.com',      CURRENT_DATE - INTERVAL '15 days', 37033.00, 37033.00,   0.00, 'paid',    'Equipment repair'),
      ('BILL-2026-003', 'Studio Supplies Co',     'billing@studiosupplies.com',  CURRENT_DATE - INTERVAL '10 days', 1800.00,  1800.00,    0.00, 'paid',    'Monthly consumables'),
      ('BILL-2026-004', 'Camera Services Inc',    'accounts@cameraservices.com', CURRENT_DATE - INTERVAL '7 days',  800.00,   800.00,     0.00, 'paid',    'Equipment service'),
      ('BILL-2026-005', 'AudioGear Wholesale',    'sales@audiogear.com',         CURRENT_DATE + INTERVAL '5 days',  5000.00,  0.00,    5000.00, 'pending', 'Audio equipment'),
      ('BILL-2026-006', 'TechParts Distributors', 'orders@techparts.com',        CURRENT_DATE - INTERVAL '3 days',  80.00,    0.00,      80.00, 'overdue', 'Small parts');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('bills', { ifExists: true, cascade: true });
};