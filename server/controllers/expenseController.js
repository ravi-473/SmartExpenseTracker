// ============================================
// controllers/expenseController.js - Expense Logic
// ============================================

const Expense = require('../models/Expense');

// ============================================
// @route   GET /api/expenses
// @desc    Get all expenses for the logged-in user
// @access  Private
// ============================================
const getExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,           // 'income' or 'expense'
      category,
      startDate,
      endDate,
      search,
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' }; // Case-insensitive search

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Count total documents for pagination
    const total = await Expense.countDocuments(filter);

    // Fetch expenses - sort by date newest first
    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      count: expenses.length,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      data: expenses,
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// @route   POST /api/expenses
// @desc    Add a new expense or income
// @access  Private
// ============================================
const addExpense = async (req, res) => {
  try {
    const { title, amount, type, category, date, notes, merchant } = req.body;

    if (!title || !amount || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, amount, and type are required.',
      });
    }

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount: Number(amount),
      type,
      category: category || 'Other',
      date: date || Date.now(),
      notes,
      merchant,
    });

    res.status(201).json({
      success: true,
      message: `${type === 'income' ? 'Income' : 'Expense'} added successfully!`,
      data: expense,
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// @route   PUT /api/expenses/:id
// @desc    Update an expense
// @access  Private
// ============================================
const updateExpense = async (req, res) => {
  try {
    // Find the expense and make sure it belongs to the current user
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or unauthorized.',
      });
    }

    const { title, amount, type, category, date, notes } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { title, amount: Number(amount), type, category, date, notes },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Expense updated successfully!',
      data: updatedExpense,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private
// ============================================
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or unauthorized.',
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// @route   GET /api/expenses/summary
// @desc    Get this month's totals and balance
// @access  Private
// ============================================
const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Use MongoDB aggregation to sum amounts by type
    const summary = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    summary.forEach((item) => {
      if (item._id === 'income') totalIncome = item.total;
      if (item._id === 'expense') totalExpense = item.total;
    });

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getExpenses, addExpense, updateExpense, deleteExpense, getSummary };
