/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('settings', {
    id: 'id',
    setting_key:   { type: 'varchar(100)', notNull: true, unique: true },
    setting_value: { type: 'text' },
    setting_group: { type: 'varchar(50)', default: 'general' },
    created_at:    { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at:    { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Seed default settings
  pgm.sql(`
    INSERT INTO settings (setting_key, setting_value, setting_group) VALUES
      ('company_name',           'White Legacy',          'company'),
      ('company_email',          'admin@whitelegacy.com', 'company'),
      ('company_phone',          '+919876543210',         'company'),
      ('company_address',        '1000 Production Blvd',  'company'),
      ('company_city',           'Kochi',                 'company'),
      ('company_country',        'India',                 'company'),
      ('company_currency',       'INR',                   'company'),
      ('system_currency',        'INR',                   'system'),
      ('system_date_format',     'DD/MM/YYYY',            'system'),
      ('system_timezone',        'Asia/Kolkata',          'system'),
      ('system_default_tax_rate','18',                    'system')
    ON CONFLICT (setting_key) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('settings', { ifExists: true, cascade: true });
};