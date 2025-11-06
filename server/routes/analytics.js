const express = require('express');
const { auth } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');

const router = express.Router();

// Get comprehensive health dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;

    // Validate timeframe
    const validTimeframes = ['7d', '30d', '90d', '1y'];
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        error: 'Invalid timeframe',
        message: 'Timeframe must be one of: 7d, 30d, 90d, 1y'
      });
    }

    console.log(`📊 Dashboard request for user: ${req.user._id}, timeframe: ${timeframe}`);

    const result = await analyticsService.getHealthDashboard(req.user._id, timeframe);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Dashboard generation failed',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: 'Dashboard generation failed',
      message: 'Internal server error'
    });
  }
});

// Get adherence analytics
router.get('/adherence', auth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;

    const result = await analyticsService.getAdherenceAnalytics(req.user._id, timeframe);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Adherence analytics failed',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Adherence analytics error:', error);
    res.status(500).json({
      error: 'Adherence analytics failed',
      message: 'Internal server error'
    });
  }
});

// Get health trends
router.get('/trends', auth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;

    const result = await analyticsService.getHealthTrends(req.user._id, timeframe);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Health trends failed',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Health trends error:', error);
    res.status(500).json({
      error: 'Health trends failed',
      message: 'Internal server error'
    });
  }
});

// Get report summary
router.get('/reports', auth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;

    const result = await analyticsService.getReportSummary(req.user._id, timeframe);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Report summary failed',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Report summary error:', error);
    res.status(500).json({
      error: 'Report summary failed',
      message: 'Internal server error'
    });
  }
});

// Get medication insights
router.get('/medications', auth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;

    const result = await analyticsService.getMedicationInsights(req.user._id, timeframe);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Medication insights failed',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Medication insights error:', error);
    res.status(500).json({
      error: 'Medication insights failed',
      message: 'Internal server error'
    });
  }
});

// Get service status
router.get('/status', async (req, res) => {
  try {
    const status = analyticsService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get analytics service status error:', error);
    res.status(500).json({
      error: 'Failed to get service status',
      message: 'Internal server error'
    });
  }
});

module.exports = router;