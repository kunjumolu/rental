/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('users', {
    id:            'id',
    email:         { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    full_name:     { type: 'varchar(255)', notNull: true },
    role_id:       { type: 'integer', references: '"roles"', onDelete: 'RESTRICT' },
    is_active:     { type: 'boolean',   default: true },
    last_login_at: { type: 'timestamp' },
    created_at:    { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at:    { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'role_id');
  pgm.createIndex('users', 'is_active');
};

exports.down = (pgm) => {
  pgm.dropTable('users', { ifExists: true, cascade: true });
};
