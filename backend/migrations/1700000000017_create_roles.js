/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('roles', {
    id:          'id',
    name:        { type: 'varchar(50)', notNull: true, unique: true },
    permissions: { type: 'jsonb', default: "'[]'" },
    created_at:  { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at:  { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // Seed default roles — ON CONFLICT prevents duplicate errors on re-run
  pgm.sql(`
    INSERT INTO roles (name, permissions) VALUES
      ('admin',   '["*"]'),
      ('manager', '["read","write","reports"]'),
      ('staff',   '["read","write"]')
    ON CONFLICT (name) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('roles', { ifExists: true, cascade: true });
};
