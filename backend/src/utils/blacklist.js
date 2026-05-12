// In-memory store for invalidated tokens
// Note: This resets when the server restarts. 
// For production, use Redis or a database table.
const tokenBlacklist = new Set();

module.exports = tokenBlacklist;