const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { categorizeExpense, getSavingsInsights, predictExpenses } = require('../controllers/aiController');

router.use(protect);

router.post('/categorize', categorizeExpense);   // POST /api/ai/categorize
router.get('/insights', getSavingsInsights);      // GET /api/ai/insights
router.get('/predict', predictExpenses);          // GET /api/ai/predict

module.exports = router;
