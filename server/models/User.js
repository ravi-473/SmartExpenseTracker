// ============================================
// models/User.js - User Database Schema
// ============================================
// This defines what a "User" looks like in MongoDB.
// Think of this as a blueprint for every user account.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,           // Removes extra spaces
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,         // No two users can have the same email
      lowercase: true,      // Always store email in lowercase
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // IMPORTANT: Don't return password in queries by default
    },
    currency: {
      type: String,
      default: 'INR', // Default to Indian Rupee (change to USD if needed)
    },
    monthlyBudget: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: '', // URL to profile picture
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// ============================================
// MIDDLEWARE: Hash password before saving
// ============================================
// This runs automatically before every .save() call.
// It converts the plain password to a hashed version.
// Example: "mypassword123" → "$2a$10$xJ8K..."
userSchema.pre('save', async function (next) {
  // Only hash if password was actually changed
  if (!this.isModified('password')) return next();

  // 10 = salt rounds (higher = more secure but slower)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============================================
// METHOD: Check if entered password is correct
// ============================================
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
