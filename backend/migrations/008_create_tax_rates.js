/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('tax_rates', {
    id: 'id',
    name:        { type: 'varchar(100)', notNull: true },
    rate:        { type: 'numeric(5,2)', default: 0.00 },
    description: { type: 'text' },
    is_active:   { type: 'boolean', default: true },
    created_at:  { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Seed Indian GST rates
  pgm.sql(`
    INSERT INTO tax_rates (name, rate, description) VALUES
      ('GST 0%',  0.00,  'No GST'),
      ('GST 5%',  5.00,  'Essential goods'),
      ('GST 12%', 12.00, 'Standard goods'),
      ('GST 18%', 18.00, 'Most goods and services'),
      ('GST 28%', 28.00, 'Luxury and sin goods');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('tax_rates', { ifExists: true, cascade: true });
};