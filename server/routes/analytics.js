const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMonthlyAnalytics, getCategoryBreakdown, getTopSpending } = require('../controllers/analyticsController');

router.use(protect);

router.get('/monthly', getMonthlyAnalytics);
router.get('/categories', getCategoryBreakdown);
router.get('/top-spending', getTopSpending);

module.exports = router;
