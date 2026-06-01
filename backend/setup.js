// ============================================================
// 🚀 ERMS Backend - ONE-COMMAND SETUP
// Handles fresh installs AND existing databases (data-safe)
// ============================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const c = {
  bold:  (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red:   (s) => `\x1b[31m${s}\x1b[0m`,
  yellow:(s) => `\x1b[33m${s}\x1b[0m`,
  cyan:  (s) => `\x1b[36m${s}\x1b[0m`,
  dim:   (s) => `\x1b[2m${s}\x1b[0m`,
};

const log = {
  step: (n, m) => console.log(`\n${c.bold(c.cyan(`▶ STEP ${n}:`))} ${m}`),
  ok:   (m) => console.log(`  ${c.green('✓')} ${m}`),
  err:  (m) => console.log(`  ${c.red('✗')} ${m}`),
  info: (m) => console.log(`  ${c.dim('•')} ${c.dim(m)}`),
  warn: (m) => console.log(`  ${c.yellow('!')} ${m}`),
  br:   ()  => console.log(),
};

function box(title, lines) {
  const w = 60;
  console.log('\n' + c.cyan('┌' + '─'.repeat(w - 2) + '┐'));
  console.log(c.cyan('│') + ' ' + c.bold(title.padEnd(w - 4)) + ' ' + c.cyan('│'));
  console.log(c.cyan('├' + '─'.repeat(w - 2) + '┤'));
  lines.forEach((line) => console.log(c.cyan('│') + ' ' + line.padEnd(w - 4) + ' ' + c.cyan('│')));
  console.log(c.cyan('└' + '─'.repeat(w - 2) + '┘'));
}

async function main() {
  console.log('\n' + c.bold(c.cyan('═'.repeat(60))));
  console.log(c.bold('🚀  ERMS BACKEND - AUTOMATED SETUP'));
  console.log(c.bold(c.cyan('═'.repeat(60))));

  // STEP 1: node_modules
  log.step(1, 'Checking dependencies...');
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log.err('node_modules not found!');
    console.log(`\n    ${c.bold(c.green('npm install'))}\n`);
    process.exit(1);
  }
  for (const pkg of ['pg', 'dotenv', 'bcryptjs', 'node-pg-migrate']) {
    if (!fs.existsSync(path.join(nodeModulesPath, pkg))) {
      log.err(`Missing package: ${pkg}`);
      log.info(`Run: ${c.green('npm install')}`);
      process.exit(1);
    }
  }
  log.ok('All packages installed');

  // STEP 2: .env
  log.step(2, 'Checking environment variables...');
  const envPath = path.join(__dirname, '.env');
  const examplePath = path.join(__dirname, '.env.example');

  if (!fs.existsSync(envPath)) {
    if (!fs.existsSync(examplePath)) {
      log.err('Both .env and .env.example are missing!');
      process.exit(1);
    }
    fs.copyFileSync(examplePath, envPath);
    log.warn(`Created ${c.bold('.env')} file from .env.example`);
    box('⚠️  ACTION REQUIRED', [
      '',
      '  1. Open .env file in your editor',
      '  2. Update DB_PASSWORD to YOUR PostgreSQL password',
      '  3. Save the file',
      '  4. Run this script again:',
      '',
      `       ${c.green('npm run setup')}`,
      '',
    ]);
    process.exit(0);
  }
  log.ok('.env file exists');

  require('dotenv').config({ path: envPath });

  const required = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'JWT_SECRET'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    log.err(`Missing env vars: ${missing.join(', ')}`);
    process.exit(1);
  }
  log.ok('All required env vars set');

  // STEP 3: DB connection
  log.step(3, 'Testing database connection...');
  const { Pool } = require('pg');
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
  });

  try {
    const res = await pool.query('SELECT current_database() AS db, current_user AS usr');
    log.ok(`Connected to '${res.rows[0].db}' as '${res.rows[0].usr}'`);
  } catch (err) {
    log.err(`Database connection failed: ${err.message}`);
    process.exit(1);
  }

  // STEP 4: Analyze DB state (KEY FIX!)
  log.step(4, 'Analyzing database state...');

  const tablesRes = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  const existingTables = tablesRes.rows.map((r) => r.table_name);
  const hasPgMigrations = existingTables.includes('pgmigrations');
  const hasAppTables = existingTables.some((t) => t !== 'pgmigrations');

  log.info(`Found ${existingTables.length} tables in database`);

  if (hasAppTables && !hasPgMigrations) {
    log.warn('Tables exist but no migration tracking found');
    log.info('Creating pgmigrations table and marking existing migrations...');
    await ensurePgMigrationsExists(pool);
    await markMigrationsAsRun(pool);
    log.ok('Migration tracking initialized');
    log.info('Skipping migrate:up — all tables already exist');
  } else if (hasAppTables && hasPgMigrations) {
    log.info('Database has tables + migration tracking');
    log.info('Migrations already applied — skipping migrate:up');
    // Verify pgmigrations has records
    const trackingCount = await pool.query('SELECT COUNT(*)::int AS n FROM pgmigrations');
    if (trackingCount.rows[0].n === 0) {
      log.warn('pgmigrations table is empty — marking existing migrations');
      await markMigrationsAsRun(pool);
    }
  } else {
    log.info('Fresh database — running migrations from scratch');
    await runMigrations();
  }

  // Verify final tables
  const finalCount = await pool.query(`
    SELECT COUNT(*)::int AS n FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      AND table_name != 'pgmigrations'
  `);
  log.ok(`${finalCount.rows[0].n} tables ready in database`);

  // STEP 5: Admin user
  log.step(5, 'Setting up default admin user...');

  const ADMIN_EMAIL = 'admin@erms.com';
  const ADMIN_PASSWORD = 'admin123';

  try {
    const userTableCheck = await pool.query(`
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='users') AS exists
    `);

    if (!userTableCheck.rows[0].exists) {
      log.err('users table not found!');
      process.exit(1);
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);

    if (existing.rows.length > 0) {
      log.info(`Admin user '${ADMIN_EMAIL}' already exists. Skipping.`);
    } else {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

      await pool.query(
        `INSERT INTO users (email, password_hash, full_name, role_id, is_active)
         VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name='admin'), true)`,
        [ADMIN_EMAIL, hash, 'Administrator']
      );

      log.ok(`Created admin user: ${ADMIN_EMAIL}`);
    }
  } catch (err) {
    log.err(`Failed to create admin user: ${err.message}`);
  }

  await pool.end();

  console.log('\n' + c.bold(c.green('═'.repeat(60))));
  console.log(c.bold(c.green('🎉  SETUP COMPLETE!')));
  console.log(c.bold(c.green('═'.repeat(60))));

  box('📋 LOGIN CREDENTIALS', [
    '',
    `  Email:    ${c.bold(c.green(ADMIN_EMAIL))}`,
    `  Password: ${c.bold(c.green(ADMIN_PASSWORD))}`,
    '',
  ]);

  box('🚀 START THE SERVER', [
    '',
    `  ${c.green('npm run dev')}`,
    '',
    `  Then open: ${c.cyan('http://localhost:5000/api/health')}`,
    '',
  ]);

  console.log();
  process.exit(0);
}

// Helper: Create pgmigrations table if missing
async function ensurePgMigrationsExists(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pgmigrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      run_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Helper: Run migrations
async function runMigrations() {
  try {
    log.br();
    execSync('npm run migrate:up', {
      stdio: 'inherit',
      cwd: __dirname,
      env: { ...process.env },
    });
    log.br();
    log.ok('Migrations completed');
  } catch (err) {
    log.err('Migration command failed');
    throw err;
  }
}

// Helper: Mark migration files as already run
async function markMigrationsAsRun(pool) {
  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    log.warn('migrations/ folder not found');
    return;
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.js'))
    .sort();

  for (const file of migrationFiles) {
    const name = file.replace(/\.js$/, '');

    const exists = await pool.query('SELECT id FROM pgmigrations WHERE name = $1', [name]);

    if (exists.rows.length === 0) {
      await pool.query(
        'INSERT INTO pgmigrations (name, run_on) VALUES ($1, CURRENT_TIMESTAMP)',
        [name]
      );
      log.info(`Marked as done: ${name}`);
    }
  }
}

main().catch((err) => {
  log.err(`Setup failed: ${err.message}`);
  console.error(c.dim(err.stack));
  process.exit(1);
});