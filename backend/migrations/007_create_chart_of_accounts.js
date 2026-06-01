/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('chart_of_accounts', {
    id: 'id',
    account_code:      { type: 'varchar(50)', notNull: true, unique: true },
    account_name:      { type: 'varchar(255)', notNull: true },
    account_type:      { type: 'varchar(100)', notNull: true },
    parent_account_id: { type: 'integer', references: '"chart_of_accounts"' },
    is_active:         { type: 'boolean', default: true },
    created_at:        { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Seed standard chart of accounts
  pgm.sql(`
    INSERT INTO chart_of_accounts (account_code, account_name, account_type) VALUES
      ('1000', 'Cash', 'Asset'),
      ('1100', 'Bank Account', 'Asset'),
      ('1200', 'Accounts Receivable', 'Asset'),
      ('1300', 'Inventory', 'Asset'),
      ('2000', 'Accounts Payable', 'Liability'),
      ('3000', 'Owner Equity', 'Equity'),
      ('4000', 'Sales Revenue', 'Income'),
      ('4100', 'Rental Income', 'Income'),
      ('5000', 'Cost of Goods Sold', 'Expense'),
      ('5100', 'Rent Expense', 'Expense'),
      ('5200', 'Salaries Expense', 'Expense'),
      ('5300', 'Utilities Expense', 'Expense'),
      ('5400', 'Travel Expense', 'Expense'),
      ('5500', 'Office Supplies', 'Expense'),
      ('5600', 'Advertising', 'Expense'),
      ('5700', 'Repairs & Maintenance', 'Expense');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('chart_of_accounts', { ifExists: true, cascade: true });
};