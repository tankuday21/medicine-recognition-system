class NewsService {
  constructor() {
    this.isNewsAPIEnabled = !!process.env.NEWS_API_KEY;
    this.newsCache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    this.categories = this.initializeCategories();
    this.trustedSources = this.initializeTrustedSources();
    console.log('📰 News Service initialized');
    console.log('🔑 NewsAPI:', this.isNewsAPIEnabled ? 'Enabled' : 'Mock Mode');
  }

  // Initialize news categories
  initializeCategories() {
    return {
      general: {
        name: 'General Health',
        keywords: ['health', 'wellness', 'fitness', 'nutrition', 'diet'],
        priority: 1
      },
      medical_research: {
        name: 'Medical Research',
        keywords: ['medical research', 'clinical trial', 'study', 'breakthrough'],
        priority: 2
      },
      diseases: {
        name: 'Diseases & Conditions',
        keywords: ['diabetes', 'heart disease', 'cancer', 'covid', 'flu', 'disease'],
        priority: 3
      },
      medications: {
        name: 'Medications & Drugs',
        keywords: ['medication', 'drug', 'prescription', 'pharmaceutical', 'FDA'],
        priority: 4
      },
      mental_health: {
        name: 'Mental Health',
        keywords: ['mental health', 'depression', 'anxiety', 'therapy', 'psychology'],
        priority: 5
      },
      public_health: {
        name: 'Public Health',
        keywords: ['public health', 'epidemic', 'vaccination', 'healthcare policy'],
        priority: 6
      }
    };
  }

  // Initialize trusted news sources
  initializeTrustedSources() {
    return [
      { id: 'reuters', name: 'Reuters', reliability: 0.95, category: 'news' },
      { id: 'ap-news', name: 'Associated Press', reliability: 0.94, category: 'news' },
      { id: 'bbc-news', name: 'BBC News', reliability: 0.92, category: 'news' },
      { id: 'cnn', name: 'CNN', reliability: 0.85, category: 'news' },
      { id: 'medical-news-today', name: 'Medical News Today', reliability: 0.88, category: 'medical' },
      { id: 'webmd', name: 'WebMD', reliability: 0.82, category: 'medical' },
      { id: 'healthline', name: 'Healthline', reliability: 0.85, category: 'medical' },
      { id: 'mayo-clinic', name: 'Mayo Clinic', reliability: 0.96, category: 'medical' }
    ];
  }

  // Get health news
  async getHealthNews(options = {}) {
    try {
      const {
        category = 'general',
        page = 1,
        pageSize = 20,
        language = 'en',
        sortBy = 'publishedAt'
      } = options;

      console.log(`📰 Fetching health news: category=${category}, page=${page}`);

      // Check cache first
      const cacheKey = `news_${category}_${page}_${pageSize}_${language}`;
      const cachedNews = this.getFromCache(cacheKey);
      
      if (cachedNews) {
        console.log('📦 Returning cached news');
        return {
          success: true,
          data: cachedNews,
          cached: true
        };
      }

      let newsData;
      
      if (this.isNewsAPIEnabled) {
        newsData = await this.fetchFromNewsAPI(category, page, pageSize, language, sortBy);
      } else {
        newsData = await this.generateMockNews(category, page, pageSize);
      }

      // Cache the results
      this.setCache(cacheKey, newsData);

      return {
        success: true,
        data: newsData,
        cached: false
      };

    } catch (error) {
      console.error('Get health news error:', error);
      return {
        success: false,
        message: 'Failed to fetch health news'
      };
    }
  }

  // Fetch from NewsAPI (real implementation)
  async fetchFromNewsAPI(category, page, pageSize, language, sortBy) {
    try {
      const axios = require('axios');
      const categoryConfig = this.categories[category];
      const keywords = categoryConfig ? categoryConfig.keywords.join(' OR ') : 'health';
      
      const params = {
        q: keywords,
        language: language,
        sortBy: sortBy,
        page: page,
        pageSize: pageSize,
        apiKey: process.env.NEWS_API_KEY
      };

      console.log(`🌐 Fetching from NewsAPI: ${keywords}`);
      
      const response = await axios.get('https://newsapi.org/v2/everything', { params });
      const data = response.data;

      if (data.status === 'ok') {
        const processedArticles = data.articles
          .filter(article => article.title && article.description) // Filter out incomplete articles
          .filter(article => this.isHealthRelated(article))
          .map(article => this.processArticle(article, category));

        console.log(`✅ Fetched ${processedArticles.length} health articles from NewsAPI`);

        return {
          articles: processedArticles,
          totalResults: data.totalResults,
          page: page,
          pageSize: pageSize,
          category: category,
          source: 'newsapi'
        };
      } else {
        throw new Error(data.message || 'NewsAPI request failed');
      }

    } catch (error) {
      console.error('NewsAPI fetch error:', error);
      // Fallback to mock data if API fails
      console.log('🎭 Falling back to mock data...');
      return await this.generateMockNews(category, page, pageSize);
    }
  }

  // Generate mock news data for development
  async generateMockNews(category, page, pageSize) {
    try {
      console.log('🎭 Generating mock health news...');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockArticles = this.getMockArticles(category);
      
      // Paginate results
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedArticles = mockArticles.slice(startIndex, endIndex);

      return {
        articles: paginatedArticles,
        totalResults: mockArticles.length,
        page: page,
        pageSize: pageSize,
        category: category,
        source: 'mock'
      };

    } catch (error) {
      console.error('Mock news generation error:', error);
      throw error;
    }
  }

  // Get mock articles based on category
  getMockArticles(category) {
    const baseArticles = [
      {
        id: 'mock_1',
        title: 'New Study Shows Benefits of Regular Exercise for Heart Health',
        description: 'Researchers find that just 30 minutes of daily exercise can significantly reduce cardiovascular disease risk.',
        content: 'A comprehensive study involving 50,000 participants over 10 years has revealed significant cardiovascular benefits...',
        url: 'https://example.com/heart-health-study',
        urlToImage: 'https://via.placeholder.com/400x200/4ade80/ffffff?text=Heart+Health',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        source: { id: 'medical-news-today', name: 'Medical News Today' },
        author: 'Dr. Sarah Johnson',
        category: 'general',
        reliability: 0.88,
        readTime: 4
      },
      {
        id: 'mock_2',
        title: 'FDA Approves New Diabetes Medication with Fewer Side Effects',
        description: 'The new medication shows promise for better glucose control with reduced gastrointestinal side effects.',
        content: 'The Food and Drug Administration has approved a new class of diabetes medication that promises better outcomes...',
        url: 'https://example.com/new-diabetes-drug',
        urlToImage: 'https://via.placeholder.com/400x200/3b82f6/ffffff?text=Diabetes+News',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        source: { id: 'reuters', name: 'Reuters' },
        author: 'Medical Correspondent',
        category: 'medications',
        reliability: 0.95,
        readTime: 3
      },
      {
        id: 'mock_3',
        title: 'Mental Health Awareness: Breaking the Stigma in Healthcare',
        description: 'Healthcare providers are implementing new approaches to address mental health stigma in medical settings.',
        content: 'Mental health professionals and medical doctors are collaborating to create more inclusive healthcare environments...',
        url: 'https://example.com/mental-health-stigma',
        urlToImage: 'https://via.placeholder.com/400x200/8b5cf6/ffffff?text=Mental+Health',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        source: { id: 'healthline', name: 'Healthline' },
        author: 'Dr. Michael Chen',
        category: 'mental_health',
        reliability: 0.85,
        readTime: 5
      },
      {
        id: 'mock_4',
        title: 'Breakthrough in Cancer Treatment: Immunotherapy Shows Promise',
        description: 'New immunotherapy approach demonstrates significant improvement in treatment outcomes for multiple cancer types.',
        content: 'Researchers at leading cancer centers have developed a novel immunotherapy protocol that shows remarkable results...',
        url: 'https://example.com/cancer-immunotherapy',
        urlToImage: 'https://via.placeholder.com/400x200/ef4444/ffffff?text=Cancer+Research',
        publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
        source: { id: 'medical-news-today', name: 'Medical News Today' },
        author: 'Dr. Lisa Rodriguez',
        category: 'medical_research',
        reliability: 0.88,
        readTime: 6
      },
      {
        id: 'mock_5',
        title: 'Seasonal Flu Vaccination: What You Need to Know This Year',
        description: 'Health officials recommend early vaccination as flu season approaches with updated vaccine formulations.',
        content: 'The Centers for Disease Control and Prevention has released updated guidelines for this year\'s flu vaccination...',
        url: 'https://example.com/flu-vaccination-2024',
        urlToImage: 'https://via.placeholder.com/400x200/06b6d4/ffffff?text=Flu+Vaccine',
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        source: { id: 'cdc', name: 'CDC' },
        author: 'Public Health Team',
        category: 'public_health',
        reliability: 0.96,
        readTime: 3
      },
      {
        id: 'mock_6',
        title: 'Nutrition Guidelines Updated: Focus on Plant-Based Proteins',
        description: 'New dietary guidelines emphasize the importance of plant-based proteins for overall health and sustainability.',
        content: 'Nutritionists and health experts have updated dietary recommendations to include more plant-based protein sources...',
        url: 'https://example.com/nutrition-guidelines',
        urlToImage: 'https://via.placeholder.com/400x200/22c55e/ffffff?text=Nutrition',
        publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
        source: { id: 'healthline', name: 'Healthline' },
        author: 'Nutrition Team',
        category: 'general',
        reliability: 0.85,
        readTime: 4
      }
    ];

    // Filter by category if specified
    if (category && category !== 'general') {
      return baseArticles.filter(article => article.category === category);
    }

    return baseArticles;
  }

  // Process article data
  processArticle(article, category) {
    const source = this.trustedSources.find(s => s.id === article.source.id);
    
    return {
      id: article.url ? this.generateArticleId(article.url) : `article_${Date.now()}`,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source,
      author: article.author,
      category: category,
      reliability: source ? source.reliability : 0.7,
      readTime: this.estimateReadTime(article.content || article.description),
      isBookmarked: false,
      tags: this.extractTags(article.title + ' ' + article.description)
    };
  }

  // Check if article is health-related
  isHealthRelated(article) {
    const healthKeywords = [
      'health', 'medical', 'medicine', 'doctor', 'hospital', 'disease', 'treatment',
      'drug', 'medication', 'vaccine', 'therapy', 'diagnosis', 'symptom', 'patient',
      'healthcare', 'wellness', 'fitness', 'nutrition', 'diet', 'mental health'
    ];

    const text = (article.title + ' ' + article.description).toLowerCase();
    return healthKeywords.some(keyword => text.includes(keyword));
  }

  // Estimate reading time
  estimateReadTime(text) {
    if (!text) return 1;
    const wordsPerMinute = 200;
    const wordCount = text.split(' ').length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  // Extract tags from article text
  extractTags(text) {
    const commonTags = [
      'diabetes', 'heart disease', 'cancer', 'covid-19', 'mental health',
      'nutrition', 'exercise', 'medication', 'research', 'prevention',
      'treatment', 'vaccine', 'wellness', 'fitness', 'diet'
    ];

    const lowerText = text.toLowerCase();
    return commonTags.filter(tag => lowerText.includes(tag));
  }

  // Generate article ID from URL
  generateArticleId(url) {
    return 'article_' + Buffer.from(url).toString('base64').slice(0, 16);
  }

  // Search news by query
  async searchNews(query, options = {}) {
    try {
      const {
        page = 1,
        pageSize = 10,
        sortBy = 'relevancy',
        language = 'en'
      } = options;

      console.log(`🔍 Searching news for: ${query}`);

      if (this.isNewsAPIEnabled) {
        return await this.searchNewsAPI(query, page, pageSize, sortBy, language);
      } else {
        return await this.searchMockNews(query, page, pageSize);
      }

    } catch (error) {
      console.error('News search error:', error);
      return {
        success: false,
        message: 'Failed to search news'
      };
    }
  }

  // Search NewsAPI
  async searchNewsAPI(query, page, pageSize, sortBy, language) {
    try {
      const axios = require('axios');
      
      const params = {
        q: `${query} AND (health OR medical OR medicine OR healthcare)`,
        language: language,
        sortBy: sortBy,
        page: page,
        pageSize: pageSize,
        apiKey: process.env.NEWS_API_KEY
      };

      console.log(`🌐 Searching NewsAPI for: ${query}`);
      
      const response = await axios.get('https://newsapi.org/v2/everything', { params });
      const data = response.data;

      if (data.status === 'ok') {
        const processedArticles = data.articles
          .filter(article => article.title && article.description)
          .map(article => this.processArticle(article, 'search'));

        console.log(`✅ Found ${processedArticles.length} articles for: ${query}`);

        return {
          success: true,
          data: {
            articles: processedArticles,
            totalResults: data.totalResults,
            page: page,
            pageSize: pageSize,
            query: query,
            source: 'newsapi'
          }
        };
      } else {
        throw new Error(data.message || 'NewsAPI search failed');
      }

    } catch (error) {
      console.error('NewsAPI search error:', error);
      // Fallback to mock search
      return await this.searchMockNews(query, page, pageSize);
    }
  }

  // Search mock news
  async searchMockNews(query, page, pageSize) {
    const allArticles = this.getMockArticles('general');
    const queryLower = query.toLowerCase();
    
    const filteredArticles = allArticles.filter(article => 
      article.title.toLowerCase().includes(queryLower) ||
      article.description.toLowerCase().includes(queryLower) ||
      article.tags.some(tag => tag.includes(queryLower))
    );

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        articles: paginatedArticles,
        totalResults: filteredArticles.length,
        page: page,
        pageSize: pageSize,
        query: query,
        source: 'mock'
      }
    };
  }

  // Get personalized news based on user profile
  async getPersonalizedNews(userId, userPreferences = {}) {
    try {
      console.log(`👤 Getting personalized news for user: ${userId}`);

      // In a real implementation, this would analyze user's:
      // - Medical conditions from health records
      // - Medications from reminders
      // - Previous news interactions
      // - Demographic information

      const personalizedCategories = this.getPersonalizedCategories(userPreferences);
      const newsPromises = personalizedCategories.map(category => 
        this.getHealthNews({ category: category.id, pageSize: 5 })
      );

      const newsResults = await Promise.all(newsPromises);
      const allArticles = [];

      newsResults.forEach((result, index) => {
        if (result.success) {
          const categoryWeight = personalizedCategories[index].weight;
          result.data.articles.forEach(article => {
            allArticles.push({
              ...article,
              personalizedScore: categoryWeight * article.reliability,
              recommendationReason: personalizedCategories[index].reason
            });
          });
        }
      });

      // Sort by personalized score
      allArticles.sort((a, b) => b.personalizedScore - a.personalizedScore);

      return {
        success: true,
        data: {
          articles: allArticles.slice(0, 20), // Top 20 personalized articles
          totalResults: allArticles.length,
          personalized: true,
          categories: personalizedCategories
        }
      };

    } catch (error) {
      console.error('Personalized news error:', error);
      return {
        success: false,
        message: 'Failed to get personalized news'
      };
    }
  }

  // Get personalized categories based on user preferences
  getPersonalizedCategories(userPreferences) {
    // Default categories with weights
    const categories = [
      { id: 'general', weight: 0.8, reason: 'General health interest' },
      { id: 'medical_research', weight: 0.6, reason: 'Latest medical breakthroughs' }
    ];

    // Adjust based on user conditions/medications
    if (userPreferences.conditions) {
      if (userPreferences.conditions.includes('diabetes')) {
        categories.push({ id: 'diseases', weight: 0.9, reason: 'Diabetes management' });
      }
      if (userPreferences.conditions.includes('heart_disease')) {
        categories.push({ id: 'diseases', weight: 0.9, reason: 'Cardiovascular health' });
      }
    }

    if (userPreferences.medications && userPreferences.medications.length > 0) {
      categories.push({ id: 'medications', weight: 0.7, reason: 'Medication updates' });
    }

    if (userPreferences.mentalHealth) {
      categories.push({ id: 'mental_health', weight: 0.8, reason: 'Mental wellness' });
    }

    return categories;
  }

  // Cache management
  getFromCache(key) {
    const cached = this.newsCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.newsCache.set(key, {
      data: data,
      timestamp: Date.now()
    });

    // Clean up old cache entries
    this.cleanupCache();
  }

  cleanupCache() {
    const now = Date.now();
    for (const [key, cached] of this.newsCache.entries()) {
      if ((now - cached.timestamp) > this.cacheExpiry) {
        this.newsCache.delete(key);
      }
    }
  }

  // Get available categories
  getCategories() {
    return Object.entries(this.categories).map(([id, category]) => ({
      id,
      name: category.name,
      keywords: category.keywords,
      priority: category.priority
    }));
  }

  // Get trusted sources
  getTrustedSources() {
    return this.trustedSources;
  }

  // Get service status
  getStatus() {
    return {
      isEnabled: true,
      provider: this.isNewsAPIEnabled ? 'NewsAPI.org' : 'Mock News',
      cacheSize: this.newsCache.size,
      categories: Object.keys(this.categories).length,
      trustedSources: this.trustedSources.length
    };
  }
}

// Create singleton instance
const newsService = new NewsService();

module.exports = newsService;