/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('settings', {
    id: 'id',
    setting_key: { type: 'varchar(100)', notNull: true, unique: true },
    setting_value: { type: 'text' },
    setting_group: { type: 'varchar(50)', default: 'general' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('settings', { ifExists: true, cascade: true });
};
