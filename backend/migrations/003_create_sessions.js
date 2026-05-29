/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('sessions', {
    id: 'id',
    user_id: { type: 'integer', references: '"users"' },
    token_hash: { type: 'varchar(255)' },
    expires_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('sessions', { ifExists: true, cascade: true });
};
