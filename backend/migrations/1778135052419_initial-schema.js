/* eslint-disable no-undef */

// ============================================================
// Initial schema
//
// Creates:
//   1. roles table (admin, manager, staff)
//   2. users table with:
//      - email, password_hash, full_name, is_active
//      - role_id (FK → roles)
//      - created_at
//
// Roles are seeded automatically: admin, manager, staff
// ============================================================

exports.up = (pgm) => {
  // -------- 1. Roles table --------
  pgm.createTable('roles', {
    id:   'id',
    name: { type: 'varchar(50)', notNull: true, unique: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Seed the 3 standard roles
  pgm.sql(`
    INSERT INTO roles (name) VALUES
      ('admin'),
      ('manager'),
      ('staff');
  `);

  // -------- 2. Users table --------
  pgm.createTable('users', {
    id: 'id',
    email:         { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    full_name:     { type: 'varchar(255)' },
    is_active:     { type: 'boolean', notNull: true, default: true },
    role_id: {
      type: 'integer',
      notNull: true,
      references: '"roles"',
      onDelete: 'RESTRICT',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Index for fast email lookups during login
  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'role_id');
};

exports.down = (pgm) => {
  pgm.dropTable('users');
  pgm.dropTable('roles');
};
