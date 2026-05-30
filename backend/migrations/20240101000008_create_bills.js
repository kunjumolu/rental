/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('bills', {
    id: 'id',
    bill_number: { type: 'varchar(100)', notNull: true, unique: true },
    vendor_name: { type: 'varchar(255)', notNull: true },
    vendor_email: { type: 'varchar(255)' },
    due_date: { type: 'date', notNull: true },
    amount: { type: 'numeric(12,2)', default: 0.00 },
    paid_amount: { type: 'numeric(12,2)', default: 0.00 },
    balance_amount: { type: 'numeric(12,2)', default: 0.00 },
    status: { type: 'varchar(50)', default: 'pending' },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('bills', { ifExists: true, cascade: true });
};
