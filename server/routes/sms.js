// ============================================
// routes/sms.js - Bank SMS Parser (Demo Feature)
// ============================================
// Simulates parsing bank SMS messages like:
// "Your account XX1234 debited Rs.500.00 at SWIGGY on 14-01-2024"

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// ============================================
// @route   POST /api/sms/parse
// @desc    Parse a bank SMS and extract transaction info
// @access  Private
// ============================================
router.post('/parse', protect, async (req, res) => {
  try {
    const { smsText } = req.body;

    if (!smsText) {
      return res.status(400).json({ success: false, message: 'SMS text is required' });
    }

    const text = smsText.toLowerCase();
    let result = {
      type: 'expense',
      amount: null,
      merchant: null,
      title: null,
      category: 'Other',
      date: new Date(),
    };

    // ----------------------------------------
    // Extract Amount using various patterns
    // ----------------------------------------
    // Patterns like: "Rs.500", "INR 1,234.56", "₹299", "debited for 150"
    const amountPatterns = [
      /(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.\d{2})?)/i,
      /(?:debited|credited|paid|spent)\s+(?:with\s+)?(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.\d{2})?)/i,
      /(?:for|of)\s+(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.\d{2})?)/i,
    ];

    for (const pattern of amountPatterns) {
      const match = smsText.match(pattern);
      if (match) {
        result.amount = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }

    // ----------------------------------------
    // Detect if DEBIT or CREDIT
    // ----------------------------------------
    if (text.includes('credited') || text.includes('received') || text.includes('deposited')) {
      result.type = 'income';
    }

    // ----------------------------------------
    // Extract Merchant Name
    // ----------------------------------------
    // Patterns: "at SWIGGY", "to AMAZON", "for NETFLIX"
    const merchantPatterns = [
      /(?:at|to|from|via|for|with)\s+([A-Z][A-Z0-9\s&]{2,25}?)(?:\s+on|\s+ref|\.|$)/,
      /merchant\s*:?\s*([A-Z][A-Z0-9\s]{2,20})/i,
    ];

    for (const pattern of merchantPatterns) {
      const match = smsText.match(pattern);
      if (match) {
        result.merchant = match[1].trim();
        result.title = match[1].trim();
        break;
      }
    }

    // ----------------------------------------
    // Extract Date
    // ----------------------------------------
    const datePattern = /(\d{2}[-/]\d{2}[-/]\d{2,4})|(\d{2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4})/i;
    const dateMatch = smsText.match(datePattern);
    if (dateMatch) {
      const parsedDate = new Date(dateMatch[0]);
      if (!isNaN(parsedDate.getTime())) {
        result.date = parsedDate;
      }
    }

    // ----------------------------------------
    // Auto-categorize based on known merchants
    // ----------------------------------------
    const merchantCategories = {
      'swiggy': 'Food & Dining',
      'zomato': 'Food & Dining',
      'mcdonald': 'Food & Dining',
      'domino': 'Food & Dining',
      'uber': 'Travel & Transport',
      'ola': 'Travel & Transport',
      'rapido': 'Travel & Transport',
      'irctc': 'Travel & Transport',
      'amazon': 'Shopping',
      'flipkart': 'Shopping',
      'myntra': 'Shopping',
      'netflix': 'Subscriptions',
      'spotify': 'Subscriptions',
      'hotstar': 'Subscriptions',
      'electricity': 'Utilities & Bills',
      'airtel': 'Utilities & Bills',
      'jio': 'Utilities & Bills',
      'bsnl': 'Utilities & Bills',
      'petrol': 'Fuel',
      'diesel': 'Fuel',
      'hospital': 'Health & Medical',
      'pharmacy': 'Health & Medical',
    };

    const merchantLower = (result.merchant || '').toLowerCase();
    const smtLower = text;

    for (const [keyword, category] of Object.entries(merchantCategories)) {
      if (merchantLower.includes(keyword) || smtLower.includes(keyword)) {
        result.category = category;
        break;
      }
    }

    // If no merchant found, create a default title
    if (!result.title) {
      result.title = result.type === 'income' ? 'Bank Transfer Received' : 'Bank Transaction';
    }

    res.json({
      success: true,
      data: result,
      message: result.amount
        ? `Parsed: ${result.type === 'income' ? '+' : '-'}₹${result.amount} at ${result.merchant || 'Unknown'}`
        : 'Could not extract all details from SMS',
    });
  } catch (error) {
    console.error('SMS parse error:', error);
    res.status(500).json({ success: false, message: 'Failed to parse SMS' });
  }
});

// ============================================
// @route   GET /api/sms/samples
// @desc    Get sample SMS messages for demo
// ============================================
router.get('/samples', protect, (req, res) => {
  const samples = [
    'Your SBI account XX4521 has been debited Rs.450.00 for SWIGGY on 14-01-2024. Avl Bal: Rs.12,450.00',
    'Dear Customer, Rs.1299.00 debited from your HDFC account to AMAZON on 15-01-2024. UPI Ref: 123456789',
    'INR 2,500.00 credited to your account from SALARY TRANSFER on 01-01-2024. Balance: Rs.45,000.00',
    'Your account has been debited with Rs.599.00 for NETFLIX subscription. Ref No: 987654321',
    'Rs.350.00 paid to OLA CABS via UPI on 14-01-2024 12:30:00. UPI ID: ola@upi',
  ];

  res.json({ success: true, samples });
});

module.exports = router;
