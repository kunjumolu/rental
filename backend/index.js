require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const db = require('./config/db');
const authRoutes = require('./src/routes/authRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes'); // ✅ IMPORT DASHBOARD ROUTES
const rentalRoutes = require('./src/routes/rentalRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes');
const billRoutes = require('./src/routes/billRoutes');
const vendorRoutes = require('./src/routes/vendorRoutes');
const taxRateRoutes = require('./src/routes/taxRateRoutes');
const chartOfAccountsRoutes = require('./src/routes/chartOfAccountsRoutes');
const ledgerRoutes = require('./src/routes/ledgerRoutes');
const accountingRoutes = require('./src/routes/accountingRoutes');
const reportsRoutes = require('./src/routes/reportsRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const userRoutes = require('./src/routes/userRoutes');

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
app.use('/api/rentals', rentalRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/tax-rates', taxRateRoutes);
app.use('/api/chart-of-accounts', chartOfAccountsRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings',settingsRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Default & Error Handlers
app.get('/', (req, res) => res.json({ message: 'Welcome to ERMS API' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`\nERMS Server running on http://localhost:${PORT}`);
});