const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const geminiService = require('../services/geminiService');

// Function to get the appropriate AI service
const getAIService = () => {
  try {
    // Check if Gemini AI is enabled and configured
    if (process.env.ENABLE_AI_CHAT === 'true' && process.env.GEMINI_API_KEY) {
      console.log('✅ Using Gemini AI service for chat');
      return geminiService;
    } else {
      console.log('⚠️ Gemini AI not configured, using mock service');
      return require('../services/mockAIService');
    }
  } catch (error) {
    console.error('❌ Error loading AI service:', error);
    return require('../services/mockAIService');
  }
};

const router = express.Router();

// Send message to AI assistant
router.post('/message', optionalAuth, async (req, res) => {
  try {
    const { message, conversationHistory, userContext } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message is required'
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message is too long (max 2000 characters)'
      });
    }

    console.log(`💬 Processing chat message from ${req.user ? 'authenticated' : 'anonymous'} user`);

    // Build user context from profile if authenticated
    let enhancedUserContext = userContext || {};
    if (req.user) {
      enhancedUserContext = {
        ...enhancedUserContext,
        userId: req.user._id,
        age: req.user.age,
        medicalConditions: req.user.medicalConditions || [],
        currentMedications: req.user.currentMedications || [],
        allergies: req.user.allergies || []
      };
    }

    // Use Gemini service for real AI chat
    if (process.env.ENABLE_AI_CHAT === 'true' && process.env.GEMINI_API_KEY) {
      const result = await geminiService.generateChatResponse(
        message.trim(),
        conversationHistory || [],
        enhancedUserContext
      );

      if (result.success) {
        res.json({
          success: true,
          data: {
            message: result.data.message,
            followUpSuggestions: result.data.followUpSuggestions,
            timestamp: result.data.timestamp,
            context: result.data.context,
            aiProvider: 'gemini'
          }
        });
      } else {
        res.status(400).json({
          error: 'AI processing failed',
          message: result.error || 'Failed to generate response'
        });
      }
    } else {
      // Fallback to mock response
      res.json({
        success: true,
        data: {
          message: "I'm currently in demo mode. To enable real AI conversations, please configure your Gemini API key in the environment settings.",
          followUpSuggestions: [
            "Tell me about your medications",
            "Help me understand my symptoms",
            "What should I ask my doctor?"
          ],
          timestamp: new Date().toISOString(),
          context: { responseType: 'demo_mode' },
          aiProvider: 'demo'
        }
      });
    }

  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      error: 'Chat failed',
      message: 'Internal server error'
    });
  }
});

// Analyze medicine interactions
router.post('/analyze-interactions', optionalAuth, async (req, res) => {
  try {
    const { medicines, userContext } = req.body;

    if (!medicines || !Array.isArray(medicines) || medicines.length < 1) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'At least 1 medicine is required for analysis'
      });
    }

    console.log(`🔬 Analyzing interactions for ${medicines.length} medicines`);

    // Build user context from profile if authenticated
    let enhancedUserContext = userContext || {};
    if (req.user) {
      enhancedUserContext = {
        ...enhancedUserContext,
        userId: req.user._id,
        age: req.user.age,
        medicalConditions: req.user.medicalConditions || [],
        currentMedications: req.user.currentMedications || [],
        allergies: req.user.allergies || []
      };
    }

    // Use Gemini service for real interaction analysis
    if (process.env.ENABLE_AI_CHAT === 'true' && process.env.GEMINI_API_KEY) {
      const result = await geminiService.analyzeMedicineInteractions(
        medicines,
        enhancedUserContext
      );

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          aiProvider: 'gemini'
        });
      } else {
        res.status(400).json({
          error: 'Analysis failed',
          message: result.error || 'Failed to analyze interactions'
        });
      }
    } else {
      // Fallback response
      res.json({
        success: true,
        data: {
          overallRisk: "unknown",
          interactions: [],
          contraindications: [],
          generalRecommendations: [
            "Please consult your healthcare provider about these medications",
            "Enable AI features for detailed interaction analysis"
          ],
          warningFlags: ["AI analysis not available in demo mode"],
          consultationRecommended: true,
          reasoning: "AI interaction analysis requires Gemini API configuration"
        },
        aiProvider: 'demo'
      });
    }
  } catch (error) {
    console.error('Medicine interaction analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: 'Internal server error'
    });
  }
});

// Get dosage guidance
router.post('/dosage-guidance', auth, async (req, res) => {
  try {
    const { medicine } = req.body;

    if (!medicine || !medicine.name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Medicine information is required'
      });
    }

    const aiService = getAIService();
    const result = await aiService.provideDosageGuidance(
      medicine,
      req.user,
      req.user._id
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Guidance failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Dosage guidance error:', error);
    res.status(500).json({
      error: 'Guidance failed',
      message: 'Internal server error'
    });
  }
});

// Get conversation history
router.get('/history', auth, async (req, res) => {
  try {
    const { conversationId, limit = 20 } = req.query;

    const aiService = getAIService();
    const result = await aiService.getConversationHistory(
      req.user._id,
      conversationId,
      parseInt(limit)
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'History fetch failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Conversation history error:', error);
    res.status(500).json({
      error: 'History fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get conversation summaries
router.get('/conversations', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const aiService = getAIService();
    const result = await aiService.getConversationSummaries(
      req.user._id,
      parseInt(limit)
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Conversations fetch failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Conversations fetch error:', error);
    res.status(500).json({
      error: 'Conversations fetch failed',
      message: 'Internal server error'
    });
  }
});

// Health check for AI service
router.get('/health', async (req, res) => {
  try {
    const aiService = getAIService();
    const isAvailable = aiService.isInitialized;
    
    res.json({
      success: true,
      data: {
        aiServiceAvailable: isAvailable,
        status: isAvailable ? 'operational' : 'unavailable',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({
      error: 'Health check failed',
      message: 'Internal server error'
    });
  }
});

module.exports = router;