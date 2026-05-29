/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('expenses', {
    id: 'id',
    date: { type: 'date', notNull: true },
    expense_account: { type: 'varchar(255)', notNull: true },
    reference_number: { type: 'varchar(100)' },
    amount: { type: 'numeric(12,2)', default: 0.00 },
    currency: { type: 'varchar(20)', default: 'INR' },
    paid_through: { type: 'varchar(255)' },
    vendor_id: { type: 'integer', references: '"vendors"' },
    vendor_name: { type: 'varchar(255)' },
    invoice_number: { type: 'varchar(100)' },
    customer_id: { type: 'integer', references: '"customers"' },
    customer_name: { type: 'varchar(255)' },
    status: { type: 'varchar(50)', default: 'non-billable' },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('expenses', { ifExists: true, cascade: true });
};
