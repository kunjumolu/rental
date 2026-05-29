/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('ledger_entries', {
    id: 'id',
    entry_date: { type: 'date', notNull: true },
    account_code: { type: 'varchar(50)', notNull: true },
    account_name: { type: 'varchar(255)', notNull: true },
    reference_type: { type: 'varchar(50)' },
    reference_id: { type: 'varchar(100)' },
    description: { type: 'text' },
    debit: { type: 'numeric(12,2)', default: 0.00 },
    credit: { type: 'numeric(12,2)', default: 0.00 },
    balance: { type: 'numeric(12,2)', default: 0.00 },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('ledger_entries', { ifExists: true, cascade: true });
};
