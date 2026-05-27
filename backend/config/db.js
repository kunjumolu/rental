const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// Optional: quick log if DB error happens
pool.on("error", (err) => {
  console.error("Unexpected PG client error:", err);
});

// Export both query and connect + pool (so controllers can use transactions)
module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
};