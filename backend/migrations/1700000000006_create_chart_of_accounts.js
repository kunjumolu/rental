/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('chart_of_accounts', {
    id:                'id',
    account_code:      { type: 'varchar(50)',  notNull: true, unique: true },
    account_name:      { type: 'varchar(255)', notNull: true },
    account_type:      { type: 'varchar(100)', notNull: true },
    parent_account_id: { type: 'integer', references: '"chart_of_accounts"', onDelete: 'SET NULL' },
    description:       { type: 'text' },
    is_active:         { type: 'boolean',   default: true },
    created_at:        { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at:        { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('chart_of_accounts', 'account_code');
  pgm.createIndex('chart_of_accounts', 'account_type');
  pgm.createIndex('chart_of_accounts', 'parent_account_id');
};

exports.down = (pgm) => {
  pgm.dropTable('chart_of_accounts', { ifExists: true, cascade: true });
};
