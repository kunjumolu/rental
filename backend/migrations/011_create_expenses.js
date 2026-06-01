/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('expenses', {
    id: 'id',
    date:             { type: 'date', notNull: true },
    expense_account:  { type: 'varchar(255)', notNull: true },
    reference_number: { type: 'varchar(100)' },
    amount:           { type: 'numeric(12,2)', default: 0.00 },
    currency:         { type: 'varchar(20)', default: 'INR' },
    paid_through:     { type: 'varchar(255)' },
    vendor_id:        { type: 'integer', references: '"vendors"' },
    vendor_name:      { type: 'varchar(255)' },
    invoice_number:   { type: 'varchar(100)' },
    customer_id:      { type: 'integer', references: '"customers"' },
    customer_name:    { type: 'varchar(255)' },
    status:           { type: 'varchar(50)', default: 'non-billable' },
    notes:            { type: 'text' },
    created_at:       { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at:       { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Seed sample expenses
  pgm.sql(`
    INSERT INTO expenses (date, expense_account, reference_number, amount, currency, paid_through, vendor_name, status, notes) VALUES
      (CURRENT_DATE - INTERVAL '2 days',  'Travel Expense',        'EXP-001', 1000.00,  'INR', 'Petty Cash',   'Camera Services Inc', 'non-billable', 'Site visit travel'),
      (CURRENT_DATE - INTERVAL '5 days',  'Advertising',           'EXP-002', 1050.00,  'INR', 'Bank Account', '',                    'non-billable', 'Facebook ads'),
      (CURRENT_DATE - INTERVAL '10 days', 'Office Supplies',       'EXP-003', 450.00,   'INR', 'Petty Cash',   'Studio Supplies Co',  'non-billable', 'Printer paper'),
      (CURRENT_DATE - INTERVAL '15 days', 'Utilities',             'EXP-004', 2300.00,  'INR', 'Bank Account', '',                    'non-billable', 'Electricity bill'),
      (CURRENT_DATE - INTERVAL '30 days', 'Rent',                  'EXP-005', 15000.00, 'INR', 'Bank Account', '',                    'non-billable', 'Monthly rent'),
      (CURRENT_DATE - INTERVAL '8 days',  'Repairs & Maintenance', 'EXP-006', 850.00,   'INR', 'Cash',         'LightEquip Repairs',  'non-billable', 'Light stand repair');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('expenses', { ifExists: true, cascade: true });
};