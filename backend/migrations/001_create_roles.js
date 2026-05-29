/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('roles', {
    id: 'id',
    name: { type: 'varchar(50)', notNull: true, unique: true },
    permissions: { type: 'jsonb' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // Seed default roles
  pgm.sql(`
    INSERT INTO roles (name) VALUES ('admin'), ('manager'), ('staff')
    ON CONFLICT (name) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('roles', { ifExists: true, cascade: true });
};
