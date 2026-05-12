require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const db = require('./config/db');
const authRoutes = require('./src/routes/authRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes'); // ✅ IMPORT DASHBOARD ROUTES

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()'); 
    res.status(200).json({ success: true, message: 'Connected', serverTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ success: false, message: 'DB Error', error: err.message });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes); // ✅ MOUNT DASHBOARD ROUTES
app.use('/api/customers', customerRoutes);

// Default & Error Handlers
app.get('/', (req, res) => res.json({ message: 'Welcome to ERMS API' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`\n🚀 ERMS Server running on http://localhost:${PORT}`);
});