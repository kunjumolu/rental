/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('tax_rates', {
    id:          'id',
    name:        { type: 'varchar(100)', notNull: true },
    rate:        { type: 'numeric(5,2)', default: 0.00 },
    description: { type: 'text' },
    is_default:  { type: 'boolean', default: false },
    is_active:   { type: 'boolean', default: true },
    created_at:  { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at:  { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // Seed common Indian tax rates
  pgm.sql(`
    INSERT INTO tax_rates (name, rate, description, is_default, is_active) VALUES
      ('No Tax',  0.00, 'Tax exempt',  false, true),
      ('GST 5%',  5.00, 'GST at 5%',  false, true),
      ('GST 12%', 12.00,'GST at 12%', false, true),
      ('GST 18%', 18.00,'GST at 18%', true,  true),
      ('GST 28%', 28.00,'GST at 28%', false, true)
    ON CONFLICT DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('tax_rates', { ifExists: true, cascade: true });
};
