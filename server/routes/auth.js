// ============================================
// routes/auth.js - Authentication Routes
// ============================================
// Routes define the URL endpoints.
// They call the appropriate controller functions.

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { register, login, getMe, updateProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ============================================
// Validation Rules
// ============================================
// These rules run BEFORE the controller function.
// If validation fails, the controller checks errors and returns an error response.

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ============================================
// Route Definitions
// ============================================

// POST /api/auth/register - Create new account
router.post('/register', registerValidation, register);

// POST /api/auth/login - Login
router.post('/login', loginValidation, login);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
], forgotPassword);

// POST /api/auth/reset-password - Reset using token
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], resetPassword);

// GET /api/auth/me - Get current user (protected)
router.get('/me', protect, getMe);

// PUT /api/auth/profile - Update profile (protected)
router.put('/profile', protect, updateProfile);

module.exports = router;
