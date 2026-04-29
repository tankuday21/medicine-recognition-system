class NewsService {
  constructor() {
    this.isNewsAPIEnabled = !!process.env.NEWS_API_KEY;
    this.isNewsDataEnabled = !!process.env.NEWSDATA_API_KEY;
    this.isCurrentsEnabled = !!process.env.CURRENTS_API_KEY;
    this.isGNewsEnabled = !!process.env.GNEWS_API_KEY;
    
    this.newsCache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    this.categories = this.initializeCategories();
    this.trustedSources = this.initializeTrustedSources();
    
    console.log('📰 News Service initialized');
    console.log('🔑 Providers:', {
      NewsAPI: this.isNewsAPIEnabled,
      NewsData: this.isNewsDataEnabled,
      Currents: this.isCurrentsEnabled,
      GNews: this.isGNewsEnabled
    });
  }

  // Initialize news categories
  initializeCategories() {
    return {
      health: {
        name: 'Health',
        keywords: ['health', 'medicine', 'healthcare', 'wellness', 'medical'],
        priority: 0
      },
      science: {
        name: 'Science',
        keywords: ['science', 'scientific research', 'astronomy', 'biology', 'physics', 'space'],
        priority: 1
      },
      technology: {
        name: 'Technology',
        keywords: ['technology', 'tech news', 'software', 'artificial intelligence', 'gadgets', 'innovation'],
        priority: 2
      },
      business: {
        name: 'Business',
        keywords: ['business', 'finance', 'economy', 'stock market', 'startup', 'investing'],
        priority: 3
      },
      entertainment: {
        name: 'Entertainment',
        keywords: ['entertainment', 'movies', 'music', 'hollywood', 'celebrity', 'arts'],
        priority: 4
      },
      sports: {
        name: 'Sports',
        keywords: ['sports', 'football', 'basketball', 'soccer', 'olympics', 'athletes'],
        priority: 5
      },
      general: {
        name: 'General News',
        keywords: ['news', 'world events', 'politics', 'current events', 'breaking news'],
        priority: 6
      },
      medical_research: {
        name: 'Medical Research',
        keywords: ['medical research', 'clinical trial', 'study', 'breakthrough'],
        priority: 7
      },
      diseases: {
        name: 'Diseases & Conditions',
        keywords: ['diabetes', 'heart disease', 'cancer', 'covid', 'flu', 'disease'],
        priority: 8
      },
      medications: {
        name: 'Medications & Drugs',
        keywords: ['medication', 'drug', 'prescription', 'pharmaceutical', 'FDA'],
        priority: 9
      },
      mental_health: {
        name: 'Mental Health',
        keywords: ['mental health', 'depression', 'anxiety', 'therapy', 'psychology'],
        priority: 10
      },
      public_health: {
        name: 'Public Health',
        keywords: ['public health', 'epidemic', 'vaccination', 'healthcare policy'],
        priority: 11
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
        category = 'health',
        page = 1,
        pageSize = 20,
        language = 'en',
        country = 'us',
        sortBy = 'publishedAt'
      } = options;

      console.log(`📰 Aggregating health news: category=${category}, country=${country}, page=${page}`);

      // Check cache first
      const cacheKey = `news_${category}_${country}_${page}_${pageSize}_${language}`;
      const cachedNews = this.getFromCache(cacheKey);

      if (cachedNews) {
        console.log('📦 Returning cached news');
        return {
          success: true,
          data: cachedNews,
          cached: true
        };
      }

      let allArticles = [];
      const fetchPromises = [];

      // Fetch from all enabled APIs in parallel
      if (this.isNewsAPIEnabled) fetchPromises.push(this.fetchFromNewsAPI(category, page, pageSize, language, sortBy, country));
      if (this.isNewsDataEnabled) fetchPromises.push(this.fetchFromNewsData(category, country, page));
      if (this.isCurrentsEnabled) fetchPromises.push(this.fetchFromCurrents(category, country, page));
      if (this.isGNewsEnabled) fetchPromises.push(this.fetchFromGNews(category, country, page));

      const results = await Promise.allSettled(fetchPromises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value && result.value.articles) {
          allArticles = [...allArticles, ...result.value.articles];
        }
      });

      // If no real APIs are enabled or all failed, use mock data
      if (allArticles.length === 0) {
        console.log('🎭 No articles found or all APIs disabled. Using mock data...');
        const mockData = await this.generateMockNews(category, page, pageSize);
        allArticles = mockData.articles;
      }

      // Deduplicate articles by URL or Title
      const uniqueArticles = this.deduplicateArticles(allArticles);
      
      // Sort by publication date (newest first)
      uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      const newsData = {
        articles: uniqueArticles,
        totalResults: uniqueArticles.length,
        page: page,
        pageSize: pageSize,
        category: category,
        country: country
      };

      console.log(`📰 News aggregation complete. Unique articles: ${uniqueArticles.length}`);

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

  // Fetch from NewsData.io
  async fetchFromNewsData(category, country, page) {
    try {
      const axios = require('axios');
      const categoryConfig = this.categories[category];
      const keywords = categoryConfig ? categoryConfig.keywords.join(' OR ') : 'health';
      const url = `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=${encodeURIComponent(keywords)}&category=health&country=${country}&language=en`;
      
      console.log(`🌐 Fetching from NewsData.io: category=${category}`);
      const res = await axios.get(url);
      const data = res.data;

      if (data.status === 'success' && data.results) {
        return {
          articles: data.results.map(art => ({
            id: art.article_id || this.generateArticleId(art.link),
            title: art.title,
            description: art.description,
            content: art.content,
            url: art.link,
            urlToImage: (art.image_url && art.image_url !== 'None' && art.image_url !== 'null') ? art.image_url : this.getFallbackImage(category),
            publishedAt: art.pubDate,
            source: { name: art.source_id, id: art.source_id },
            category: category,
            provider: 'newsdata',
            country: country
          }))
        };
      }
      return { articles: [] };
    } catch (error) {
      console.error('NewsData fetch error:', error.message);
      return { articles: [] };
    }
  }

  // Fetch from Currents API
  async fetchFromCurrents(category, country, page) {
    try {
      const axios = require('axios');
      const categoryConfig = this.categories[category];
      const keywords = categoryConfig ? categoryConfig.keywords.join(' OR ') : 'health';
      const url = `https://api.currentsapi.services/v1/search?apiKey=${process.env.CURRENTS_API_KEY}&keywords=${encodeURIComponent(keywords)}&country=${country}&language=en`;
      
      console.log(`🌐 Fetching from Currents API: country=${country}`);
      const res = await axios.get(url);
      const data = res.data;

      if (data.status === 'ok' && data.news) {
        return {
          articles: data.news.map(art => ({
            id: art.id || this.generateArticleId(art.url),
            title: art.title,
            description: art.description,
            content: art.description, // Currents often has less content
            url: art.url,
            urlToImage: (art.image && art.image !== 'None' && art.image !== 'null') ? art.image : this.getFallbackImage(category),
            publishedAt: art.published,
            source: { name: art.author, id: 'currents' },
            category: category,
            provider: 'currents',
            country: country
          }))
        };
      }
      return { articles: [] };
    } catch (error) {
      console.error('Currents API fetch error:', error.message);
      return { articles: [] };
    }
  }

  // Fetch from GNews
  async fetchFromGNews(category, country, page) {
    try {
      const axios = require('axios');
      const url = `https://gnews.io/api/v4/top-headlines?category=${category === 'health' ? 'health' : 'general'}&country=${country}&lang=en&apikey=${process.env.GNEWS_API_KEY}`;
      
      console.log(`🌐 Fetching from GNews: country=${country}`);
      const res = await axios.get(url);
      const data = res.data;

      if (data.articles) {
        return {
          articles: data.articles.map(art => ({
            id: this.generateArticleId(art.url),
            title: art.title,
            description: art.description,
            content: art.content,
            url: art.url,
            urlToImage: (art.image && art.image !== 'None' && art.image !== 'null') ? art.image : this.getFallbackImage(category),
            publishedAt: art.publishedAt,
            source: art.source,
            category: category,
            provider: 'gnews',
            country: country
          }))
        };
      }
      return { articles: [] };
    } catch (error) {
      console.error('GNews fetch error:', error.message);
      return { articles: [] };
    }
  }

  // Deduplicate articles
  deduplicateArticles(articles) {
    const seenUrls = new Set();
    const seenTitles = new Set();
    return articles.filter(article => {
      const url = article.url?.toLowerCase().trim();
      const title = article.title?.toLowerCase().trim();
      if (!url || seenUrls.has(url)) return false;
      if (!title || seenTitles.has(title)) return false;
      seenUrls.add(url);
      seenTitles.add(title);
      return true;
    });
  }

  // Fetch from NewsAPI (real implementation)
  async fetchFromNewsAPI(category, page, pageSize, language, sortBy, country) {
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
          .map(article => this.processArticle(article, category, country));

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
        urlToImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
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
        urlToImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
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
        urlToImage: 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=800&q=80',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
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
        urlToImage: 'https://images.unsplash.com/photo-1579684385136-137af75461bb?w=800&q=80',
        publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
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
        urlToImage: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80',
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
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
        urlToImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
        publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        source: { id: 'healthline', name: 'Healthline' },
        author: 'Nutrition Team',
        category: 'general',
        reliability: 0.85,
        readTime: 4
      }
    ];

    // Generate expanded mock data (multiply base articles to enable scrolling)
    // Create ~60 articles by cycling through base templates
    let expandedArticles = [];
    const totalNeeded = 60;

    for (let i = 0; i < totalNeeded; i++) {
      const template = baseArticles[i % baseArticles.length];
      const timeOffset = i * 2 * 60 * 60 * 1000; // Decrement time for each older article

      expandedArticles.push({
        ...template,
        id: `mock_${i}_${Date.now()}`,
        title: `${template.title} ${i > 5 ? `(Archive ${Math.floor(i / 5)})` : ''}`, // Add variation to title
        publishedAt: new Date(Date.now() - timeOffset).toISOString(),
        country: category === 'health' || !category ? 'us' : 'in', // Just for mock variety
        // Randomize reliability slightly
        reliability: Math.min(0.98, Math.max(0.7, template.reliability + (Math.random() * 0.1 - 0.05)))
      });
    }

    // Filter by category if specified
    if (category && category !== 'general' && category !== 'health') {
      return expandedArticles.filter(article => article.category === category);
    }

    return expandedArticles;
  }

  // Get high-quality fallback image based on category
  getFallbackImage(category) {
    const fallbacks = {
      health: 'https://images.unsplash.com/photo-1505751172107-59d004746612?q=80&w=1000&auto=format&fit=crop',
      medical_research: 'https://images.unsplash.com/photo-1532187863486-abf51ad95999?q=80&w=1000&auto=format&fit=crop',
      diseases: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=1000&auto=format&fit=crop',
      medications: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?q=80&w=1000&auto=format&fit=crop',
      mental_health: 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?q=80&w=1000&auto=format&fit=crop',
      public_health: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop',
      science: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1000&auto=format&fit=crop',
      technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
      default: 'https://images.unsplash.com/photo-1576091160550-2173bdb999ef?q=80&w=1000&auto=format&fit=crop'
    };
    return fallbacks[category] || fallbacks.default;
  }

  // Process article data
  processArticle(article, category, country) {
    const source = this.trustedSources.find(s => s.id === article.source.id);

    return {
      id: article.url ? this.generateArticleId(article.url) : `article_${Date.now()}`,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.urlToImage || this.getFallbackImage(category),
      publishedAt: article.publishedAt,
      source: article.source,
      author: article.author,
      category: category,
      country: country,
      reliability: source ? source.reliability : 0.7,
      readTime: this.estimateReadTime(article.content || article.description),
      isBookmarked: false,
      tags: this.extractTags(article.title + ' ' + article.description),
      provider: 'newsapi'
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

      let allArticles = [];
      const fetchPromises = [];

      if (this.isNewsAPIEnabled) fetchPromises.push(this.searchNewsAPI(query, page, pageSize, sortBy, language));
      if (this.isNewsDataEnabled) fetchPromises.push(this.searchNewsData(query, page));
      if (this.isCurrentsEnabled) fetchPromises.push(this.searchCurrents(query, page));
      if (this.isGNewsEnabled) fetchPromises.push(this.searchGNews(query, page));

      const results = await Promise.allSettled(fetchPromises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value && result.value.data && result.value.data.articles) {
          allArticles = [...allArticles, ...result.value.data.articles];
        }
      });

      if (allArticles.length === 0) {
        const mockResult = await this.searchMockNews(query, page, pageSize);
        allArticles = mockResult.data.articles;
      }

      const uniqueArticles = this.deduplicateArticles(allArticles);
      uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      return {
        success: true,
        data: {
          articles: uniqueArticles,
          totalResults: uniqueArticles.length,
          page: page,
          pageSize: pageSize,
          query: query
        }
      };

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

  // Search NewsData.io
  async searchNewsData(query, page) {
    try {
      const axios = require('axios');
      const url = `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=${encodeURIComponent(query)}&language=en`;
      const res = await axios.get(url);
      const data = res.data;
      if (data.status === 'success' && data.results) {
        return {
          data: {
            articles: data.results.map(art => ({
              id: art.article_id || this.generateArticleId(art.link),
              title: art.title,
              description: art.description,
              url: art.link,
              urlToImage: art.image_url,
              publishedAt: art.pubDate,
              source: { name: art.source_id, id: art.source_id },
              provider: 'newsdata'
            }))
          }
        };
      }
      return { data: { articles: [] } };
    } catch (error) { return { data: { articles: [] } }; }
  }

  // Search Currents API
  async searchCurrents(query, page) {
    try {
      const axios = require('axios');
      const url = `https://api.currentsapi.services/v1/search?apiKey=${process.env.CURRENTS_API_KEY}&keywords=${encodeURIComponent(query)}&language=en`;
      const res = await axios.get(url);
      const data = res.data;
      if (data.status === 'ok' && data.news) {
        return {
          data: {
            articles: data.news.map(art => ({
              id: art.id || this.generateArticleId(art.url),
              title: art.title,
              description: art.description,
              url: art.url,
              urlToImage: art.image,
              publishedAt: art.published,
              source: { name: art.author, id: 'currents' },
              provider: 'currents'
            }))
          }
        };
      }
      return { data: { articles: [] } };
    } catch (error) { return { data: { articles: [] } }; }
  }

  // Search GNews
  async searchGNews(query, page) {
    try {
      const axios = require('axios');
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&apikey=${process.env.GNEWS_API_KEY}`;
      const res = await axios.get(url);
      const data = res.data;
      if (data.articles) {
        return {
          data: {
            articles: data.articles.map(art => ({
              id: this.generateArticleId(art.url),
              title: art.title,
              description: art.description,
              url: art.url,
              urlToImage: art.image,
              publishedAt: art.publishedAt,
              source: art.source,
              provider: 'gnews'
            }))
          }
        };
      }
      return { data: { articles: [] } };
    } catch (error) { return { data: { articles: [] } }; }
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