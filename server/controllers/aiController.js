// ============================================
// controllers/aiController.js - All AI Features
// ============================================
// Uses Google Gemini API (FREE) for:
//   1. Auto-categorize expenses
//   2. Generate savings suggestions
//   3. Predict next month's expenses
//   4. Detect unusual spending

const Expense = require('../models/Expense');

// ============================================
// Safe Gemini initialization
// App won't crash if key is missing
// ============================================
let geminiModel = null;
try {
  if (
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'AIzaSy-your-gemini-key-here'
  ) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Google Gemini AI initialized');
  } else {
    console.warn('⚠️  GEMINI_API_KEY not set — using smart rule-based fallback');
  }
} catch (err) {
  console.warn('⚠️  Gemini init failed:', err.message);
}

// Helper: send prompt to Gemini, return text
const callGemini = async (prompt) => {
  if (!geminiModel) return null;
  try {
    const result = await geminiModel.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return null;
  }
};

// ============================================
// Rule-based fallback categorizer
// Works perfectly without any API key
// ============================================
const ruleBasedCategorize = (title) => {
  const t = (title || '').toLowerCase();
  if (/swiggy|zomato|mcdonald|domino|pizza|burger|restaurant|cafe|food|lunch|dinner|breakfast|biryani|kfc|subway/.test(t)) return 'Food & Dining';
  if (/uber|ola|rapido|irctc|flight|train|bus|metro|cab|taxi|travel|airport/.test(t)) return 'Travel & Transport';
  if (/amazon|flipkart|myntra|meesho|ajio|nykaa|shopping|purchase|order/.test(t)) return 'Shopping';
  if (/netflix|spotify|hotstar|prime|youtube|zee5|subscription|membership/.test(t)) return 'Subscriptions';
  if (/hospital|doctor|pharmacy|medicine|medical|clinic|health|apollo/.test(t)) return 'Health & Medical';
  if (/school|college|course|udemy|book|education|tuition|exam|fee/.test(t)) return 'Education';
  if (/electricity|water|internet|wifi|airtel|jio|bsnl|vi|bill|recharge/.test(t)) return 'Utilities & Bills';
  if (/grocery|vegetable|fruit|supermarket|dmart|bigbasket|blinkit|zepto/.test(t)) return 'Groceries';
  if (/petrol|diesel|fuel|hp|shell|iocl/.test(t)) return 'Fuel';
  if (/salon|spa|haircut|beauty|parlour|personal care/.test(t)) return 'Personal Care';
  if (/rent|house|flat|apartment|pg|hostel/.test(t)) return 'Rent & Housing';
  if (/salary|income|freelance|received|credited|bonus/.test(t)) return 'Salary & Income';
  if (/movie|cinema|pvr|inox|game|concert|entertainment/.test(t)) return 'Entertainment';
  if (/gift|donation|charity/.test(t)) return 'Gifts & Donations';
  return 'Other';
};

// ============================================
// FEATURE 1: AI Expense Categorization
// @route  POST /api/ai/categorize
// ============================================
const categorizeExpense = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const categories = [
      'Food & Dining', 'Travel & Transport', 'Shopping', 'Entertainment',
      'Health & Medical', 'Utilities & Bills', 'Education', 'Groceries',
      'Fuel', 'Subscriptions', 'Personal Care', 'Gifts & Donations',
      'Rent & Housing', 'Salary & Income', 'Other',
    ];

    const geminiResponse = await callGemini(
      `You are an expense categorizer for an Indian user.
Given this expense title: "${title}"

Choose EXACTLY ONE category from this list:
${categories.join(', ')}

Examples:
- "Swiggy order" → Food & Dining
- "Uber to airport" → Travel & Transport
- "Amazon purchase" → Shopping
- "Netflix subscription" → Subscriptions
- "Apollo pharmacy" → Health & Medical
- "Electricity bill" → Utilities & Bills
- "Jio recharge" → Utilities & Bills
- "BigBasket order" → Groceries
- "HP petrol" → Fuel

Return ONLY the category name. Nothing else.`
    );

    if (geminiResponse) {
      const matched = categories.find(
        (c) => c.toLowerCase() === geminiResponse.toLowerCase().trim()
      );
      return res.json({ success: true, category: matched || ruleBasedCategorize(title), source: 'gemini' });
    }

    return res.json({ success: true, category: ruleBasedCategorize(title), source: 'rules' });

  } catch (error) {
    console.error('Categorize error:', error);
    res.json({ success: true, category: ruleBasedCategorize(req.body?.title || ''), source: 'fallback' });
  }
};

// ============================================
// FEATURE 2: AI Savings Suggestions
// @route  GET /api/ai/insights
// ============================================
const getSavingsInsights = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenses = await Expense.find({
      user: req.user._id,
      type: 'expense',
      date: { $gte: thirtyDaysAgo },
    }).sort({ amount: -1 });

    if (expenses.length === 0) {
      return res.json({
        success: true,
        insights: [
          '👋 Welcome! Start adding your daily expenses to unlock personalized AI insights.',
          '💡 Track both income and expenses for a full financial picture.',
          '🎯 Set a monthly budget in your Profile page to get budget alerts on the dashboard.',
          '📸 Use the Bill Scanner to automatically add expenses by photographing receipts!',
        ],
        unusualSpending: [],
        summary: { totalSpent: 0, totalExpenses: 0, topCategory: 'N/A' },
      });
    }

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
    const topCategory = sortedCategories[0]?.[0] || 'N/A';
    const avgExpense = totalSpent / expenses.length;

    const unusualExpenses = expenses
      .filter((e) => e.amount > avgExpense * 3)
      .slice(0, 3)
      .map((e) => ({ title: e.title, amount: e.amount, category: e.category, date: e.date }));

    const categoryString = sortedCategories
      .slice(0, 6)
      .map(([cat, total]) => `${cat}: ₹${total.toFixed(0)}`)
      .join(', ');

    const geminiResponse = await callGemini(
      `You are a friendly personal finance advisor for an Indian user.

Their last 30 days of spending:
- Total spent: ₹${totalSpent.toFixed(0)}
- Transactions: ${expenses.length}
- Categories: ${categoryString}
- Daily average: ₹${(totalSpent / 30).toFixed(0)}

Give exactly 4 specific, actionable, friendly savings tips based on their actual spending.
Be culturally relevant for India. Mention specific rupee amounts. Start each with an emoji.

IMPORTANT: Return ONLY a valid JSON array. No markdown, no code blocks, no extra text.
Format: ["tip1", "tip2", "tip3", "tip4"]`
    );

    let insights = null;
    if (geminiResponse) {
      try {
        const cleaned = geminiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) insights = parsed;
      } catch {
        insights = [geminiResponse];
      }
    }

    if (!insights) {
      insights = generateRuleBasedInsights(categoryTotals, totalSpent, expenses.length, topCategory);
    }

    return res.json({
      success: true,
      insights,
      unusualSpending: unusualExpenses,
      summary: { totalSpent, totalExpenses: expenses.length, topCategory },
    });

  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate insights.' });
  }
};

// Rule-based insights (works without any API key)
const generateRuleBasedInsights = (categoryTotals, totalSpent, txCount, topCategory) => {
  const insights = [];
  const dailyAvg = totalSpent / 30;
  const topAmount = categoryTotals[topCategory] || 0;

  const categoryTips = {
    'Food & Dining': `🍽️ Food is your biggest spend at ₹${topAmount.toFixed(0)}. Cooking at home 3x/week can save ~₹${Math.round(topAmount * 0.25)} monthly!`,
    'Shopping': `🛍️ You spent ₹${topAmount.toFixed(0)} on shopping. Try the 24-hour rule before any non-essential purchase to cut impulse buying by ~30%.`,
    'Travel & Transport': `🚗 Transport costs ₹${topAmount.toFixed(0)}. Try carpooling or the metro — even 2 fewer cab rides a week saves ₹${Math.round(topAmount * 0.2)}/month.`,
    'Subscriptions': `📱 ₹${topAmount.toFixed(0)} in subscriptions! List them all and cancel any unused ones — this is the easiest money you can save right now.`,
    'Groceries': `🛒 Spent ₹${topAmount.toFixed(0)} on groceries. Meal planning and buying in bulk from D-Mart or BigBasket can save 15-20% easily.`,
    'Utilities & Bills': `💡 Bills at ₹${topAmount.toFixed(0)}. Switch to LED lights, unplug standby devices, and compare mobile plans to reduce this number.`,
  };

  insights.push(categoryTips[topCategory] || `📊 Top spend is ${topCategory} at ₹${topAmount.toFixed(0)}. Review whether all these expenses are truly necessary.`);
  insights.push(`💰 You spend ₹${dailyAvg.toFixed(0)}/day on average. Set a daily cap of ₹${Math.round(dailyAvg * 0.85)} to save ₹${Math.round(dailyAvg * 0.15 * 30)} per month.`);
  insights.push(txCount > 15
    ? `📈 ${txCount} transactions this month — many small purchases add up. Try the "₹500 rule": pause before any purchase under ₹500 and ask if you truly need it.`
    : '🏦 Auto-transfer 20% of your income to savings on payday. Saving first before spending is the most powerful financial habit you can build.'
  );
  insights.push('📊 Try the 50-30-20 rule: 50% for needs (rent, bills, food), 30% for wants (eating out, shopping), 20% for savings and SIP investments.');

  return insights;
};

// ============================================
// FEATURE 3: Predict Next Month's Expenses
// @route  GET /api/ai/predict
// ============================================
const predictExpenses = async (req, res) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const data = await Expense.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: threeMonthsAgo } } },
      {
        $group: {
          _id: { category: '$category', month: { $month: '$date' }, year: { $year: '$date' } },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toLocaleString('default', { month: 'long', year: 'numeric' });

    if (data.length === 0) {
      return res.json({ success: true, predictions: [], totalPredicted: 0, month: nextMonth,
        message: 'Add expenses for at least 1 month to see predictions.' });
    }

    const categoryMap = {};
    data.forEach((item) => {
      const cat = item._id.category;
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(item.total);
    });

    const predictions = Object.entries(categoryMap).map(([category, amounts]) => {
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const trend = amounts.length > 1 ? (amounts[amounts.length - 1] - amounts[0]) / amounts.length : 0;
      const predicted = Math.max(0, avg + trend * 0.5);
      return {
        category,
        predictedAmount: Math.round(predicted),
        basedOnMonths: amounts.length,
        confidence: amounts.length >= 3 ? 'High' : amounts.length === 2 ? 'Medium' : 'Low',
      };
    });

    predictions.sort((a, b) => b.predictedAmount - a.predictedAmount);
    const totalPredicted = predictions.reduce((sum, p) => sum + p.predictedAmount, 0);

    res.json({ success: true, predictions, totalPredicted, month: nextMonth });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate predictions.' });
  }
};

module.exports = { categorizeExpense, getSavingsInsights, predictExpenses };
