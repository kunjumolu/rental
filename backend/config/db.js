const { Pool } = require("pg");
require("dotenv").config();

// ============================================================
// PostgreSQL connection pool configuration
// ============================================================

// Validate required env vars early — fail loud, not silently
const required = ["DB_USER", "DB_HOST", "DB_NAME", "DB_PASSWORD"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(
    `❌ Missing required environment variables in .env: ${missing.join(", ")}`
  );
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432, // fallback to default PG port

  // ----- Pool tuning (production-friendly defaults) -----
  max: Number(process.env.DB_POOL_MAX) || 20,        // max simultaneous connections
  idleTimeoutMillis: 30000,                           // close idle clients after 30s
  connectionTimeoutMillis: 5000,                      // fail fast if can't connect in 5s

  // ----- SSL (auto-enabled in production, e.g. Heroku/Render/AWS) -----
  ssl:
    process.env.DB_SSL === "true" || process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// ============================================================
// Event listeners
// ============================================================

// Catch errors from idle clients (network drops, DB restarts, etc.)
pool.on("error", (err) => {
  console.error("❌ Unexpected PG client error:", err.message);
});

// Optional: log new client connections (helpful in dev)
pool.on("connect", () => {
  if (process.env.NODE_ENV !== "production") {
    // console.log("🔌 New PG client connected");
  }
});

// ============================================================
// Startup connection test
// Try once on boot so config errors show immediately.
// ============================================================
(async () => {
  try {
    const res = await pool.query("SELECT NOW() AS now, current_database() AS db");
    console.log(
      `✅ Database connected: ${res.rows[0].db} @ ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}`
    );
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("   Check your .env file and make sure PostgreSQL is running.");
    // Don't process.exit(1) here — let nodemon retry on next save
  }
})();

// ============================================================
// Graceful shutdown — close pool when app is stopped
// ============================================================
const shutdown = async (signal) => {
  console.log(`\n${signal} received — closing DB pool...`);
  try {
    await pool.end();
    console.log("✅ DB pool closed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error closing pool:", err.message);
    process.exit(1);
  }
};
process.on("SIGINT", () => shutdown("SIGINT"));   // Ctrl+C
process.on("SIGTERM", () => shutdown("SIGTERM")); // kill / docker stop

// ============================================================
// Public API
// ============================================================
module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
};
