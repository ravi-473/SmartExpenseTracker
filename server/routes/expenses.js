// ============================================
// routes/expenses.js - Expense Routes
// ============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getSummary,
} = require('../controllers/expenseController');

// All routes below require authentication (protect middleware)
router.use(protect);

router.get('/summary', getSummary);       // GET /api/expenses/summary
router.get('/', getExpenses);              // GET /api/expenses?page=1&type=expense
router.post('/', addExpense);              // POST /api/expenses
router.put('/:id', updateExpense);         // PUT /api/expenses/:id
router.delete('/:id', deleteExpense);      // DELETE /api/expenses/:id

module.exports = router;
