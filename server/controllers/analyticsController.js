// ============================================
// controllers/analyticsController.js
// ============================================
// Provides data for charts: monthly bar chart, category pie chart, etc.

const Expense = require('../models/Expense');

// ============================================
// @route   GET /api/analytics/monthly
// @desc    Get last 6 months income vs expense (for bar chart)
// @access  Private
// ============================================
const getMonthlyAnalytics = async (req, res) => {
  try {
    // Go back 6 months from today
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const data = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Format the data for Chart.js
    const months = [];
    const incomeData = [];
    const expenseData = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      months.push(label);

      const incomeEntry = data.find((e) => e._id.year === year && e._id.month === month && e._id.type === 'income');
      const expenseEntry = data.find((e) => e._id.year === year && e._id.month === month && e._id.type === 'expense');

      incomeData.push(incomeEntry ? incomeEntry.total : 0);
      expenseData.push(expenseEntry ? expenseEntry.total : 0);
    }

    res.json({
      success: true,
      data: { months, income: incomeData, expenses: expenseData },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// @route   GET /api/analytics/categories
// @desc    Get expense breakdown by category (for pie chart)
// @access  Private
// ============================================
const getCategoryBreakdown = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? Number(month) - 1 : now.getMonth();
    const targetYear = year ? Number(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const data = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    res.json({
      success: true,
      data: data.map((item) => ({
        category: item._id,
        total: item.total,
        count: item.count,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// @route   GET /api/analytics/top-spending
// @desc    Top 5 most expensive transactions this month
// @access  Private
// ============================================
const getTopSpending = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const data = await Expense.find({
      user: req.user._id,
      type: 'expense',
      date: { $gte: startOfMonth },
    })
      .sort({ amount: -1 })
      .limit(5);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getMonthlyAnalytics, getCategoryBreakdown, getTopSpending };
