/* eslint-disable no-undef */

// ============================================================
// Initial schema
//
// NOTE: roles and users tables are already created by:
//   - 1700000000017_create_roles.js
//   - 1700000000018_create_users.js
//
// This migration only ensures indexes exist for performance.
// ============================================================

exports.up = (pgm) => {
  // Safe index creation (IF NOT EXISTS equivalent via try/catch handled by pg-migrate)
  pgm.createIndex('users', 'email',   { ifNotExists: true });
  pgm.createIndex('users', 'role_id', { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropIndex('users', 'email',   { ifExists: true });
  pgm.dropIndex('users', 'role_id', { ifExists: true });
};