/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('sessions', {
    id:         'id',
    user_id:    { type: 'integer', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    token_hash: { type: 'varchar(255)', notNull: true, unique: true },
    ip_address: { type: 'varchar(45)' },
    user_agent: { type: 'text' },
    expires_at: { type: 'timestamp', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('sessions', 'user_id');
  pgm.createIndex('sessions', 'token_hash');
  pgm.createIndex('sessions', 'expires_at');
};

exports.down = (pgm) => {
  pgm.dropTable('sessions', { ifExists: true, cascade: true });
};
