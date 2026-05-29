/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('tax_rates', {
    id: 'id',
    name: { type: 'varchar(100)', notNull: true },
    rate: { type: 'numeric(5,2)', default: 0.00 },
    description: { type: 'text' },
    is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('tax_rates', { ifExists: true, cascade: true });
};
