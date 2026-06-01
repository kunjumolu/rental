/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('customers', {
    id: 'id',
    name:             { type: 'varchar(255)', notNull: true },
    status:           { type: 'varchar(50)',  default: 'active' },
    phone:            { type: 'varchar(20)' },
    balance:          { type: 'numeric(12,2)', default: 0.00 },
    active_rentals:   { type: 'integer',       default: 0 },
    email:            { type: 'varchar(255)' },
    address:          { type: 'text' },
    city:             { type: 'varchar(100)' },
    state:            { type: 'varchar(255)', default: '' },
    country:          { type: 'varchar(100)' },
    id_number:        { type: 'varchar(100)' },
    customer_id:      { type: 'varchar(20)' },
    notes:            { type: 'text' },
    is_deleted:       { type: 'boolean',   default: false },
    deleted_at:       { type: 'timestamp' },
    created_at:       { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at:       { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('customers', 'email');
  pgm.createIndex('customers', 'status');
  pgm.createIndex('customers', 'is_deleted');
};

exports.down = (pgm) => {
  pgm.dropTable('customers', { ifExists: true, cascade: true });
};
