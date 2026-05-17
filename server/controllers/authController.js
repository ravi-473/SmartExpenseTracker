// ============================================
// controllers/authController.js - Auth Logic
// ============================================
// Controllers contain the actual business logic.
// Routes just call these controller functions.

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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


// ============================================
// @route   POST /api/auth/forgot-password
// @desc    Generate reset token and (optionally) send reset link
// @access  Public
// ============================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Do not reveal whether email exists; respond with success message
      return res.json({ success: true, message: 'If this email is registered, a reset link has been sent.' });
    }

    // Create reset token (plain) and store a hashed version
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenHashed = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHashed;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Build a reset URL pointing to frontend reset page containing the plain token
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendBase}/reset-password/${resetToken}`;

    // NOTE: In production you should email `resetUrl` to the user. Here we return it for convenience.
    return res.json({ success: true, message: 'Reset link generated', resetUrl });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
// ============================================
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Update password and clear reset token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new JWT token and return user + token (log the user in)
    const newToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successful',
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, login, getMe, updateProfile, forgotPassword, resetPassword };
