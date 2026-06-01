/* eslint-disable no-undef */

// ============================================================
// Migration Test
// Verifies all tables and columns exist correctly after
// running all prior migrations. Safe to run multiple times.
// ============================================================

exports.up = async (pgm) => {
  const client = pgm.db;

  // Helper: get all table names
  const { rows: tableRows } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  `);
  const existingTables = tableRows.map((r) => r.table_name);

  console.log('\n========== MIGRATION TEST ==========');
  console.log('Tables found:', existingTables);

  // ── 1. Required tables ────────────────────────────────────────────────────
  const requiredTables = [
    'customers',
    'vendors',
    'chart_of_accounts',
    'inventory_items',
    'bills',
    'expenses',
    'rentals',
    'rental_items',
    'invoices',
    'invoice_items',
    'ledger_entries',
    'tax_rates',
    'settings',
    'roles',
    'users',
    'sessions',
    'password_reset_tokens',
  ];

  const missing = requiredTables.filter((t) => !existingTables.includes(t));

  if (missing.length > 0) {
    throw new Error(`❌ Missing tables: ${missing.join(', ')}`);
  }
  console.log('✅ All required tables exist.\n');

  // ── 2. Column checks ──────────────────────────────────────────────────────
  const columnChecks = {
    customers: ['id', 'name', 'status', 'phone', 'email', 'balance', 'active_rentals', 'is_deleted', 'created_at'],
    vendors:   ['id', 'name', 'email', 'phone', 'currency', 'opening_balance', 'created_at'],
    inventory_items: ['id', 'sku', 'name', 'category', 'daily_rate', 'weekly_rate', 'monthly_rate', 'total_quantity', 'available_quantity', 'status', 'created_at'],
    rentals:   ['id', 'customer_id', 'status', 'start_date', 'end_date', 'order_number', 'total_amount', 'balance_amount', 'deposit_amount', 'created_at'],
    rental_items: ['id', 'rental_id', 'inventory_item_id', 'item_name', 'quantity', 'days', 'rate', 'subtotal', 'created_at'],
    invoices:  ['id', 'invoice_number', 'customer_id', 'rental_id', 'issue_date', 'due_date', 'total_amount', 'balance_amount', 'paid_amount', 'status', 'created_at'],
    invoice_items: ['id', 'invoice_id', 'description', 'quantity', 'unit_price', 'amount', 'created_at'],
    ledger_entries: ['id', 'entry_date', 'account_code', 'account_name', 'debit', 'credit', 'balance', 'created_at'],
    roles:     ['id', 'name', 'permissions', 'created_at'],
    users:     ['id', 'email', 'password_hash', 'full_name', 'role_id', 'is_active', 'created_at'],
    sessions:  ['id', 'user_id', 'token_hash', 'expires_at', 'created_at'],
    password_reset_tokens: ['id', 'user_id', 'token', 'expires_at', 'used', 'created_at'],
    tax_rates: ['id', 'name', 'rate', 'is_active', 'created_at'],
    settings:  ['id', 'setting_key', 'setting_value', 'setting_group', 'created_at'],
    bills:     ['id', 'bill_number', 'vendor_name', 'due_date', 'amount', 'paid_amount', 'balance_amount', 'status', 'created_at'],
    expenses:  ['id', 'date', 'expense_account', 'amount', 'vendor_id', 'customer_id', 'status', 'created_at'],
  };

  const missingCols = [];

  for (const [table, cols] of Object.entries(columnChecks)) {
    const { rows } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1;
    `, [table]);
    const actual = rows.map((r) => r.column_name);

    for (const col of cols) {
      if (!actual.includes(col)) {
        missingCols.push(`${table}.${col}`);
        console.warn(`  ❌ Missing column: ${table}.${col}`);
      }
    }
    console.log(`  ✅ ${table}: OK`);
  }

  if (missingCols.length > 0) {
    throw new Error(`❌ Missing columns:\n  ${missingCols.join('\n  ')}`);
  }

  // ── 3. Roles seed check ───────────────────────────────────────────────────
  const { rows: roleRows } = await client.query(`SELECT name FROM roles ORDER BY name;`);
  const roleNames = roleRows.map((r) => r.name);
  console.log('\n  Roles in DB:', roleNames);

  const requiredRoles = ['admin', 'manager', 'staff'];
  const missingRoles = requiredRoles.filter((r) => !roleNames.includes(r));

  if (missingRoles.length > 0) {
    // Auto-fix: insert missing roles
    for (const role of missingRoles) {
      await client.query(
        `INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;`,
        [role]
      );
      console.log(`  🌱 Inserted missing role: ${role}`);
    }
  } else {
    console.log('  ✅ All default roles present.');
  }

  console.log('\n✅ All migration tests passed!');
  console.log('====================================\n');
};

exports.down = async () => {
  // This migration is read-only (assertions + safe seed fix).
  // Nothing to roll back.
  console.log('Migration test: nothing to roll back.');
};