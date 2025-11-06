const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const newsService = require('../services/newsService');

const router = express.Router();

// Get latest news (default endpoint)
router.get('/', async (req, res) => {
  try {
    const {
      limit = 20,
      page = 1,
      category = 'general',
      language = 'en',
      sortBy = 'publishedAt'
    } = req.query;

    console.log(`📰 Latest news request: limit=${limit}, page=${page}`);

    const result = await newsService.getHealthNews({
      category,
      page: parseInt(page),
      pageSize: parseInt(limit),
      language,
      sortBy
    });

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        cached: result.cached || false
      });
    } else {
      res.status(400).json({
        error: 'News fetch failed',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Latest news error:', error);
    res.status(500).json({
      error: 'News fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get general health news
router.get('/health', async (req, res) => {
  try {
    const {
      category = 'general',
      page = 1,
      pageSize = 20,
      language = 'en',
      sortBy = 'publishedAt'
    } = req.query;

    console.log(`📰 Health news request: category=${category}, page=${page}`);

    const result = await newsService.getHealthNews({
      category,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      language,
      sortBy
    });

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        cached: result.cached || false
      });
    } else {
      res.status(400).json({
        error: 'News fetch failed',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Health news error:', error);
    res.status(500).json({
      error: 'News fetch failed',
      message: 'Internal server error'
    });
  }
});

// Search news by query
router.get('/search', async (req, res) => {
  try {
    const { q: query, page = 1, pageSize = 10, sortBy = 'relevancy', language = 'en' } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid query',
        message: 'Search query must be at least 2 characters long'
      });
    }

    console.log(`🔍 News search request: query="${query}"`);

    const result = await newsService.searchNews(query.trim(), {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      sortBy,
      language
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'News search failed',
        message: result.message
      });
    }

  } catch (error) {
    console.error('News search error:', error);
    res.status(500).json({
      error: 'News search failed',
      message: 'Internal server error'
    });
  }
});

// Get personalized news (requires authentication)
router.get('/personalized', auth, async (req, res) => {
  try {
    console.log(`👤 Personalized news request for user: ${req.user._id}`);

    // Get user preferences from profile or use defaults
    const userPreferences = {
      conditions: req.user.medicalConditions || [],
      medications: req.user.currentMedications || [],
      mentalHealth: req.user.mentalHealthInterest || false,
      ...req.query // Allow query params to override
    };

    const result = await newsService.getPersonalizedNews(req.user._id, userPreferences);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Personalized news failed',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Personalized news error:', error);
    res.status(500).json({
      error: 'Personalized news failed',
      message: 'Internal server error'
    });
  }
});

// Get available news categories
router.get('/categories', async (req, res) => {
  try {
    const categories = newsService.getCategories();
    
    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to get categories',
      message: 'Internal server error'
    });
  }
});

// Get trusted news sources
router.get('/sources', async (req, res) => {
  try {
    const sources = newsService.getTrustedSources();
    
    res.json({
      success: true,
      data: sources
    });

  } catch (error) {
    console.error('Get sources error:', error);
    res.status(500).json({
      error: 'Failed to get sources',
      message: 'Internal server error'
    });
  }
});

// Get news service status
router.get('/status', async (req, res) => {
  try {
    const status = newsService.getStatus();
    
    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Get news service status error:', error);
    res.status(500).json({
      error: 'Failed to get service status',
      message: 'Internal server error'
    });
  }
});

module.exports = router;