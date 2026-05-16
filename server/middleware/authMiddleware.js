// ============================================
// middleware/authMiddleware.js - JWT Protection
// ============================================
// This "guard" runs BEFORE protected route handlers.
// It checks if the user sent a valid JWT token.
// If not → send 401 Unauthorized. If yes → let them through.

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // JWT tokens are sent in the Authorization header like:
  // "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token (remove "Bearer " prefix)
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      // If tampered with or expired, jwt.verify throws an error
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in DB using the ID stored in the token
      // We use .select('-password') to NOT include the password field
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Please log in again.',
        });
      }

      // Pass control to the next middleware/route handler
      next();
    } catch (error) {
      console.error('JWT Error:', error.message);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Your session has expired. Please log in again.',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please log in.',
    });
  }
};

module.exports = { protect };
