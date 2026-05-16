// ============================================
// models/Expense.js - Expense Database Schema
// ============================================
// This defines what an "Expense" (or income) looks like in MongoDB.

const mongoose = require('mongoose');

// List of all valid categories
const CATEGORIES = [
  'Food & Dining',
  'Travel & Transport',
  'Shopping',
  'Entertainment',
  'Health & Medical',
  'Utilities & Bills',
  'Education',
  'Salary & Income',
  'Freelance Income',
  'Investment',
  'Rent & Housing',
  'Groceries',
  'Fuel',
  'Subscriptions',
  'Personal Care',
  'Gifts & Donations',
  'Other',
];

const expenseSchema = new mongoose.Schema(
  {
    // Which user this expense belongs to
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },

    // 'expense' = money going out, 'income' = money coming in
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: [true, 'Type is required'],
    },

    category: {
      type: String,
      enum: CATEGORIES,
      default: 'Other',
    },

    date: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },

    // For OCR-scanned bills
    billImage: {
      type: String, // URL to the uploaded image
      default: null,
    },

    // Was this auto-categorized by AI?
    aiCategorized: {
      type: Boolean,
      default: false,
    },

    // Was this extracted from an OCR scan?
    fromOCR: {
      type: Boolean,
      default: false,
    },

    // Was this extracted from a bank SMS?
    fromSMS: {
      type: Boolean,
      default: false,
    },

    // Merchant name (for bank SMS parsing)
    merchant: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// INDEX: Speed up common queries
// ============================================
// This makes searching by user + date much faster
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
