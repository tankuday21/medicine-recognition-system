const express = require('express');
const { auth } = require('../middleware/auth');
const symptomCheckerService = require('../services/symptomCheckerService');

const router = express.Router();

// Search symptoms
router.get('/search', async (req, res) => {
  try {
    const { q: query, bodyPart } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid query',
        message: 'Search query must be at least 2 characters long'
      });
    }

    const result = symptomCheckerService.searchSymptoms(query.trim(), bodyPart);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Search failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Symptom search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Internal server error'
    });
  }
});

// Get body parts
router.get('/body-parts', async (req, res) => {
  try {
    const result = symptomCheckerService.getBodyParts();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Failed to get body parts',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Get body parts error:', error);
    res.status(500).json({
      error: 'Failed to get body parts',
      message: 'Internal server error'
    });
  }
});

// Get symptoms by body part
router.get('/body-parts/:bodyPart', async (req, res) => {
  try {
    const { bodyPart } = req.params;
    const result = symptomCheckerService.getSymptomsByBodyPart(bodyPart);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Failed to get symptoms',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Get symptoms by body part error:', error);
    res.status(500).json({
      error: 'Failed to get symptoms',
      message: 'Internal server error'
    });
  }
});

// Analyze symptoms (requires authentication for tracking)
router.post('/analyze', auth, async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        error: 'Invalid symptoms',
        message: 'Please provide at least one symptom'
      });
    }

    // Validate symptom format
    for (const symptom of symptoms) {
      if (!symptom.symptomId || !symptom.severity || !symptom.duration) {
        return res.status(400).json({
          error: 'Invalid symptom format',
          message: 'Each symptom must have symptomId, severity, and duration'
        });
      }
    }

    console.log(`🩺 Analyzing symptoms for user: ${req.user._id}`);
    
    const result = symptomCheckerService.analyzeSymptoms(symptoms);
    
    if (result.success) {
      // Log the analysis for tracking (could be stored in database)
      console.log(`📊 Analysis completed for user ${req.user._id}:`, {
        symptomsCount: symptoms.length,
        conditionsFound: result.data.conditions.length,
        hasEmergency: result.data.hasEmergencySymptoms
      });

      res.json(result);
    } else {
      res.status(400).json({
        error: 'Analysis failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Symptom analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: 'Internal server error'
    });
  }
});

// Get service status
router.get('/status', async (req, res) => {
  try {
    const status = symptomCheckerService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get symptom checker status error:', error);
    res.status(500).json({
      error: 'Failed to get status',
      message: 'Internal server error'
    });
  }
});

module.exports = router;