/* eslint-disable no-undef */

// What happens when we apply the migration (Up)
exports.up = (pgm) => {
  // Create a table named 'users'
  pgm.createTable('users', {
    id: 'id', // Auto-incrementing unique ID number
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    role: { type: 'varchar(50)', notNull: true, default: 'employee' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

// What happens when we revert/undo the migration (Down)
exports.down = (pgm) => {
  pgm.dropTable('users');
};