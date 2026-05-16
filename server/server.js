// ============================================
// server.js - Main Entry Point for Backend
// ============================================
// This is the first file that runs when you start the server.
// It sets up Express, connects to MongoDB, and registers all routes.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config(); // Load .env variables

// Import all route files
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const ocrRoutes = require('./routes/ocr');
const smsRoutes = require('./routes/sms');

// Create Express app
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================
// helmet() adds security headers to all responses
app.use(helmet());

// cors() allows your React frontend to talk to this backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// morgan() logs all incoming requests (useful for debugging)
app.use(morgan('dev'));

// express.json() lets us read JSON data from request body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files (bill images) as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// ROUTES
// ============================================
// Each route handles a specific part of the app
app.use('/api/auth', authRoutes);           // Login, Register
app.use('/api/expenses', expenseRoutes);    // Add, Edit, Delete expenses
app.use('/api/analytics', analyticsRoutes); // Charts and summaries
app.use('/api/ai', aiRoutes);               // AI categorization & insights
app.use('/api/ocr', ocrRoutes);             // Bill scanning
app.use('/api/sms', smsRoutes);             // Bank SMS parsing

// Health check route - visit http://localhost:5000/api/health to test
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Expense Tracker API is running!',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
// This catches any errors thrown in route handlers
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler - when no route matches
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============================================
// DATABASE CONNECTION & SERVER START
// ============================================
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // Stop the server if DB connection fails
  });
