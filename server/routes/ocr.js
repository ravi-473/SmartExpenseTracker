// ============================================
// routes/ocr.js - OCR Bill Scanner
// ============================================
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const { protect } = require('../middleware/authMiddleware');

// ============================================
// Safe Gemini initialization
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
    console.log('✅ Gemini ready for OCR');
  }
} catch (err) {
  console.warn('⚠️  Gemini init failed in OCR:', err.message);
}

// ============================================
// MULTER: File upload configuration
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG, and WebP images are allowed!'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ============================================
// STRONG Regex-based amount extractor
// Handles: ₹1,600  Rs.500  1600.00  INR 299
// ============================================
const extractAmountFromText = (text) => {
  // Normalise text — remove extra spaces
  const normalized = text.replace(/\s+/g, ' ');

  // Priority 1: Lines that explicitly say "total", "amount", "paid"
  const priorityPatterns = [
    /(?:total|grand total|net total|amount paid|to pay|payable|paid)[^\d₹Rs]*[₹Rs\.]*\s*(\d[\d,]*(?:\.\d{1,2})?)/gi,
    /[₹Rs\.]+\s*(\d[\d,]*(?:\.\d{1,2})?)\s*(?:paid|total|only)/gi,
  ];

  for (const pattern of priorityPatterns) {
    const matches = [...normalized.matchAll(pattern)];
    if (matches.length > 0) {
      // Take the LAST match (usually the grand total at the bottom)
      const lastMatch = matches[matches.length - 1];
      const amount = parseFloat(lastMatch[1].replace(/,/g, ''));
      if (amount > 0) return amount;
    }
  }

  // Priority 2: Any ₹ or Rs. amount — collect all, return the largest (likely the total)
  const currencyPattern = /[₹][\s]*(\d[\d,]*(?:\.\d{1,2})?)|(?:Rs\.?|INR)[\s]*(\d[\d,]*(?:\.\d{1,2})?)/gi;
  const allAmounts = [];
  let match;
  while ((match = currencyPattern.exec(normalized)) !== null) {
    const val = parseFloat((match[1] || match[2]).replace(/,/g, ''));
    if (val > 0) allAmounts.push(val);
  }

  if (allAmounts.length > 0) {
    // Return the largest amount (most likely the total)
    return Math.max(...allAmounts);
  }

  // Priority 3: Plain number that looks like a price (last resort)
  const plainPattern = /(\d{2,6}(?:\.\d{2})?)/g;
  const plainAmounts = [];
  while ((match = plainPattern.exec(normalized)) !== null) {
    const val = parseFloat(match[1]);
    if (val >= 1 && val <= 999999) plainAmounts.push(val);
  }
  return plainAmounts.length > 0 ? Math.max(...plainAmounts) : null;
};

// Extract merchant name from text
const extractMerchant = (text) => {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 2 && l.length < 60);
  // Skip lines that are just numbers or dates
  const merchantLine = lines.find((l) => /[a-zA-Z]{3,}/.test(l) && !/^\d/.test(l));
  return merchantLine ? merchantLine.substring(0, 40) : null;
};

// ============================================
// @route  POST /api/ocr/scan
// ============================================
router.post('/scan', protect, upload.single('bill'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image file.' });
  }

  const imagePath = req.file.path;

  try {
    console.log('🔍 Starting OCR scan on:', req.file.filename);

    // STEP 1: Tesseract OCR
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng+hin', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          process.stdout.write(`\rOCR Progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      },
    });
    console.log('\n✅ OCR complete. Extracted', text.length, 'characters');
    console.log('📄 Raw OCR text:\n', text.substring(0, 300));

    if (!text || text.trim().length < 3) {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      return res.status(400).json({
        success: false,
        message: 'Could not read text from this image. Try a clearer, well-lit photo.',
      });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // STEP 2: Try Gemini for intelligent parsing
    let parsedData = null;

    if (geminiModel) {
      try {
        const prompt = `You are an expert at reading Indian payment receipts, UPI screenshots, and bills.

Here is the OCR text extracted from a receipt/bill image:
"""
${text.substring(0, 2000)}
"""

Extract the following and return as a JSON object:
{
  "amount": <the total amount paid as a NUMBER (e.g. 1600, not "₹1,600"), null if not found>,
  "merchant": <the shop/app/person name as a string, null if not found>,
  "date": <date in YYYY-MM-DD format, null if not found>,
  "category": <one of exactly: "Food & Dining", "Shopping", "Travel & Transport", "Health & Medical", "Utilities & Bills", "Groceries", "Entertainment", "Subscriptions", "Other">,
  "title": <a short 3-6 word description like "Slice UPI payment" or "Zomato food order">
}

IMPORTANT RULES:
- For amount: Look for keywords like "Total", "Amount", "Paid", "₹", "Rs" — return just the NUMBER
- For UPI apps (Slice, PhonePe, GPay, Paytm): the amount is clearly visible as the transfer amount
- Return ONLY the raw JSON. No markdown, no code fences, no explanation whatsoever.`;

        const result = await geminiModel.generateContent(prompt);
        const content = result.response.text().trim()
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        console.log('🤖 Gemini response:', content);
        parsedData = JSON.parse(content);

        // Validate — if Gemini returned 0 or null for amount, try our regex too
        if (!parsedData.amount || parsedData.amount === 0) {
          const regexAmount = extractAmountFromText(text);
          if (regexAmount) {
            console.log('🔧 Gemini missed amount, regex found:', regexAmount);
            parsedData.amount = regexAmount;
          }
        }
      } catch (aiErr) {
        console.error('Gemini OCR parse error:', aiErr.message);
        parsedData = null;
      }
    }

    // STEP 3: Full regex fallback
    if (!parsedData || (!parsedData.amount && !parsedData.merchant)) {
      const amount = extractAmountFromText(text);
      const merchant = extractMerchant(text);
      console.log('📐 Regex extracted — amount:', amount, 'merchant:', merchant);
      parsedData = {
        amount,
        merchant,
        category: 'Other',
        title: merchant ? `${merchant} payment` : 'Scanned Bill',
        date: null,
      };
    }

    console.log('✅ Final parsed data:', parsedData);

    return res.json({
      success: true,
      message: 'Bill scanned successfully!',
      data: {
        ...parsedData,
        rawText: text.substring(0, 800),
        imageUrl,
        filename: req.file.filename,
      },
    });

  } catch (error) {
    console.error('OCR error:', error);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    res.status(500).json({
      success: false,
      message: 'Failed to scan bill. Please try a clearer image.',
    });
  }
});

module.exports = router;
