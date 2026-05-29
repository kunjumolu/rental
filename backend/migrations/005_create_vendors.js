/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('vendors', {
    id: 'id',
    name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)' },
    phone: { type: 'varchar(50)' },
    address: { type: 'text' },
    contact_person: { type: 'varchar(255)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    company_name: { type: 'varchar(255)' },
    salutation: { type: 'varchar(20)' },
    first_name: { type: 'varchar(100)' },
    last_name: { type: 'varchar(100)' },
    mobile: { type: 'varchar(50)' },
    work_phone: { type: 'varchar(50)' },
    pan: { type: 'varchar(50)' },
    currency: { type: 'varchar(20)', default: 'INR' },
    payment_terms: { type: 'varchar(100)', default: 'Due on Receipt' },
    opening_balance: { type: 'numeric(12,2)', default: 0.00 },
    payables: { type: 'numeric(12,2)', default: 0.00 },
    unused_credits: { type: 'numeric(12,2)', default: 0.00 },
    notes: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('vendors', { ifExists: true, cascade: true });
};
