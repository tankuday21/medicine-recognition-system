const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Fixed demo user ObjectId (valid 24-character hex string)
const DEMO_USER_ID = new mongoose.Types.ObjectId('000000000000000000000001');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Handle demo user
    if (decoded.isDemo) {
      req.user = {
        _id: DEMO_USER_ID,
        email: 'test@mediot.com',
        name: 'Test User',
        isDemo: true,
        isActive: true
      };
      return next();
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token or user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      error: 'Access denied',
      message: 'Invalid token'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      
      // Handle demo user
      if (decoded.isDemo) {
        req.user = {
          _id: DEMO_USER_ID,
          email: 'test@mediot.com',
          name: 'Test User',
          isDemo: true,
          isActive: true
        };
        return next();
      }

      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = { auth, optionalAuth };