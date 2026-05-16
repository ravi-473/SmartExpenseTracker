// ============================================
// controllers/authController.js - Auth Logic
// ============================================
// Controllers contain the actual business logic.
// Routes just call these controller functions.

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// ============================================
// Helper: Generate a JWT token
// ============================================
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },           // Payload stored inside token
    process.env.JWT_SECRET,   // Secret key to sign with
    { expiresIn: '30d' }      // Token expires in 30 days
  );
};

// ============================================
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (no token needed)
// ============================================
const register = async (req, res) => {
  try {
    // Check for validation errors (from express-validator)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg, // Return first error
      });
    }

    const { name, email, password } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create the user (password gets hashed automatically via the model's pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

// ============================================
// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
// ============================================
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { email, password } = req.body;

    // Find user by email (we need the password field for comparison, so use .select('+password'))
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare entered password with hashed password in DB
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

// ============================================
// @route   GET /api/auth/me
// @desc    Get currently logged-in user profile
// @access  Private (requires token)
// ============================================
const getMe = async (req, res) => {
  try {
    // req.user is set by the authMiddleware
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyBudget: user.monthlyBudget,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// @route   PUT /api/auth/profile
// @desc    Update user profile (name, budget, currency)
// @access  Private
// ============================================
const updateProfile = async (req, res) => {
  try {
    const { name, currency, monthlyBudget } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, currency, monthlyBudget },
      { new: true, runValidators: true } // Return updated doc
    );

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, login, getMe, updateProfile };
