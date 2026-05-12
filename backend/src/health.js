const db = require('./config/db');

app.get('/api/health', async (req, res) => {
  try {
    // This query asks the DB for the current time
    const result = await db.query('SELECT NOW()');
    res.json({
      status: 'OK',
      database: 'Connected',
      serverTime: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({
      status: 'Error',
      database: 'Disconnected',
      message: err.message
    });
  }
});