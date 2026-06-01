/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('settings', {
    id:            'id',
    setting_key:   { type: 'varchar(100)', notNull: true, unique: true },
    setting_value: { type: 'text' },
    setting_group: { type: 'varchar(50)', default: 'general' },
    created_at:    { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at:    { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('settings', 'setting_key');
  pgm.createIndex('settings', 'setting_group');

  // Seed default application settings
  pgm.sql(`
    INSERT INTO settings (setting_key, setting_value, setting_group) VALUES
      ('company_name',       'My Rental Company',  'company'),
      ('company_email',      '',                   'company'),
      ('company_phone',      '',                   'company'),
      ('company_address',    '',                   'company'),
      ('company_city',       '',                   'company'),
      ('company_country',    'India',              'company'),
      ('currency',           'INR',                'finance'),
      ('currency_symbol',    '₹',                  'finance'),
      ('invoice_prefix',     'INV-',               'finance'),
      ('rental_prefix',      'RNT-',               'finance'),
      ('date_format',        'DD/MM/YYYY',         'general'),
      ('timezone',           'Asia/Kolkata',       'general'),
      ('default_tax_rate',   '18',                 'finance'),
      ('payment_terms',      'Due on Receipt',     'finance')
    ON CONFLICT (setting_key) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('settings', { ifExists: true, cascade: true });
};
