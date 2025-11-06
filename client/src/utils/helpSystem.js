// Help System Utilities
// Comprehensive help and documentation management system

/**
 * Help Content Manager
 * Manages help articles, contextual tips, and documentation
 */
export class HelpContentManager {
  constructor() {
    this.helpArticles = new Map();
    this.contextualTips = new Map();
    this.videoTutorials = new Map();
    this.searchIndex = new Map();
    this.userContext = null;
    this.viewHistory = [];
    this.searchHistory = [];
    
    this.init();
  }

  /**
   * Initialize help system
   */
  init() {
    this.loadHelpContent();
    this.buildSearchIndex();
    this.loadUserContext();
  }

  /**
   * Load help content and articles
   */
  loadHelpContent() {
    // Patient Management Help
    this.helpArticles.set('patient-management', {
      id: 'patient-management',
      title: 'Patient Management',
      category: 'core-features',
      tags: ['patients', 'records', 'management'],
      difficulty: 'beginner',
      estimatedReadTime: 5,
      lastUpdated: Date.now(),
      content: {
        overview: 'Learn how to effectively manage patient records and information in MedIoT Premium.',
        sections: [
          {
            id: 'adding-patients',
            title: 'Adding New Patients',
            content: 'Step-by-step guide to adding new patient records to the system.',
            steps: [
              'Navigate to the Patients section',
              'Click the "Add New Patient" button',
              'Fill in required patient information',
              'Save the patient record'
            ],
            tips: [
              'Required fields are marked with an asterisk (*)',
              'Use the barcode scanner for insurance cards',
              'Patient photos help with identification'
            ]
          },
          {
            id: 'editing-records',
            title: 'Editing Patient Records',
            content: 'How to update and modify existing patient information.',
            steps: [
              'Search for the patient using the search bar',
              'Click on the patient name to open their record',
              'Click the "Edit" button',
              'Make necessary changes and save'
            ],
            tips: [
              'Changes are logged for audit purposes',
              'Some fields may require special permissions to edit'
            ]
          }
        ],
        relatedArticles: ['appointment-scheduling', 'medical-records'],
        faqs: [
          {
            question: 'How do I merge duplicate patient records?',
            answer: 'Contact your system administrator to merge duplicate records safely.'
          },
          {
            question: 'Can I delete a patient record?',
            answer: 'Patient records cannot be deleted for compliance reasons, but can be archived.'
          }
        ]
      }
    });

    // Dashboard Help
    this.helpArticles.set('dashboard-overview', {
      id: 'dashboard-overview',
      title: 'Dashboard Overview',
      category: 'getting-started',
      tags: ['dashboard', 'overview', 'widgets'],
      difficulty: 'beginner',
      estimatedReadTime: 3,
      lastUpdated: Date.now(),
      content: {
        overview: 'Your dashboard provides a personalized view of important information and quick access to key features.',
        sections: [
          {
            id: 'dashboard-widgets',
            title: 'Understanding Dashboard Widgets',
            content: 'Learn about the different widgets available on your dashboard.',
            widgets: [
              {
                name: 'Patient Summary',
                description: 'Quick overview of patient statistics',
                customizable: true
              },
              {
                name: 'Upcoming Appointments',
                description: 'Your next scheduled appointments',
                customizable: true
              },
              {
                name: 'Recent Activity',
                description: 'Latest actions and updates',
                customizable: false
              }
            ]
          },
          {
            id: 'customizing-dashboard',
            title: 'Customizing Your Dashboard',
            content: 'Personalize your dashboard layout and widgets.',
            steps: [
              'Click the "Customize" button in the top right',
              'Drag widgets to rearrange them',
              'Click the "+" button to add new widgets',
              'Click "Save" to apply your changes'
            ]
          }
        ],
        relatedArticles: ['getting-started', 'user-preferences']
      }
    });

    // Appointment Scheduling Help
    this.helpArticles.set('appointment-scheduling', {
      id: 'appointment-scheduling',
      title: 'Appointment Scheduling',
      category: 'core-features',
      tags: ['appointments', 'scheduling', 'calendar'],
      difficulty: 'intermediate',
      estimatedReadTime: 7,
      lastUpdated: Date.now(),
      content: {
        overview: 'Efficiently schedule and manage patient appointments using the integrated calendar system.',
        sections: [
          {
            id: 'creating-appointments',
            title: 'Creating New Appointments',
            content: 'Schedule appointments for patients with available time slots.',
            steps: [
              'Navigate to the Calendar or Appointments section',
              'Click on an available time slot',
              'Select or search for the patient',
              'Choose appointment type and duration',
              'Add notes if necessary',
              'Save the appointment'
            ],
            tips: [
              'Double-booking prevention is automatically enabled',
              'Recurring appointments can be set up for regular patients',
              'Appointment reminders are sent automatically'
            ]
          },
          {
            id: 'managing-appointments',
            title: 'Managing Existing Appointments',
            content: 'Modify, reschedule, or cancel appointments as needed.',
            actions: [
              'Reschedule: Drag appointment to new time slot',
              'Edit: Click appointment and modify details',
              'Cancel: Right-click and select cancel',
              'Mark as completed: Check off finished appointments'
            ]
          }
        ],
        relatedArticles: ['patient-management', 'calendar-integration']
      }
    });

    // Contextual Tips
    this.contextualTips.set('patient-form', {
      id: 'patient-form',
      context: 'patient-form',
      tips: [
        {
          element: '#patient-name',
          title: 'Patient Name',
          content: 'Enter the patient\'s full legal name as it appears on their ID.',
          position: 'right',
          trigger: 'focus'
        },
        {
          element: '#patient-dob',
          title: 'Date of Birth',
          content: 'Use MM/DD/YYYY format. This helps prevent duplicate records.',
          position: 'bottom',
          trigger: 'focus'
        },
        {
          element: '#insurance-info',
          title: 'Insurance Information',
          content: 'Scan the insurance card or enter details manually. This information is used for billing.',
          position: 'left',
          trigger: 'hover'
        }
      ]
    });

    this.contextualTips.set('dashboard', {
      id: 'dashboard',
      context: 'dashboard',
      tips: [
        {
          element: '#customize-btn',
          title: 'Customize Dashboard',
          content: 'Click here to rearrange widgets and personalize your dashboard layout.',
          position: 'bottom',
          trigger: 'hover'
        },
        {
          element: '.widget-patient-summary',
          title: 'Patient Summary Widget',
          content: 'This widget shows your patient statistics. Click to view detailed reports.',
          position: 'top',
          trigger: 'hover'
        }
      ]
    });

    // Video Tutorials
    this.videoTutorials.set('getting-started', {
      id: 'getting-started',
      title: 'Getting Started with MedIoT Premium',
      description: 'A comprehensive introduction to the platform',
      duration: 480, // 8 minutes
      thumbnail: '/videos/thumbnails/getting-started.jpg',
      videoUrl: '/videos/getting-started.mp4',
      captions: '/videos/captions/getting-started.vtt',
      chapters: [
        { time: 0, title: 'Welcome and Overview' },
        { time: 60, title: 'Dashboard Tour' },
        { time: 180, title: 'Patient Management Basics' },
        { time: 300, title: 'Scheduling Appointments' },
        { time: 420, title: 'Next Steps' }
      ],
      relatedArticles: ['dashboard-overview', 'patient-management']
    });

    this.videoTutorials.set('advanced-features', {
      id: 'advanced-features',
      title: 'Advanced Features and Workflows',
      description: 'Learn about advanced features for power users',
      duration: 720, // 12 minutes
      thumbnail: '/videos/thumbnails/advanced-features.jpg',
      videoUrl: '/videos/advanced-features.mp4',
      captions: '/videos/captions/advanced-features.vtt',
      chapters: [
        { time: 0, title: 'Advanced Search and Filters' },
        { time: 120, title: 'Bulk Operations' },
        { time: 240, title: 'Custom Reports' },
        { time: 360, title: 'Integration Features' },
        { time: 480, title: 'Automation Setup' },
        { time: 600, title: 'Best Practices' }
      ],
      relatedArticles: ['reporting', 'integrations', 'automation']
    });
  }

  /**
   * Build search index for fast content discovery
   */
  buildSearchIndex() {
    // Index help articles
    for (const [id, article] of this.helpArticles) {
      const searchTerms = [
        article.title.toLowerCase(),
        ...article.tags,
        article.category,
        article.content.overview.toLowerCase()
      ];

      // Index section content
      if (article.content.sections) {
        article.content.sections.forEach(section => {
          searchTerms.push(section.title.toLowerCase());
          searchTerms.push(section.content.toLowerCase());
        });
      }

      // Index FAQ content
      if (article.content.faqs) {
        article.content.faqs.forEach(faq => {
          searchTerms.push(faq.question.toLowerCase());
          searchTerms.push(faq.answer.toLowerCase());
        });
      }

      searchTerms.forEach(term => {
        if (!this.searchIndex.has(term)) {
          this.searchIndex.set(term, []);
        }
        this.searchIndex.get(term).push({
          type: 'article',
          id: id,
          title: article.title,
          relevance: this.calculateRelevance(term, article)
        });
      });
    }

    // Index video tutorials
    for (const [id, video] of this.videoTutorials) {
      const searchTerms = [
        video.title.toLowerCase(),
        video.description.toLowerCase()
      ];

      if (video.chapters) {
        video.chapters.forEach(chapter => {
          searchTerms.push(chapter.title.toLowerCase());
        });
      }

      searchTerms.forEach(term => {
        if (!this.searchIndex.has(term)) {
          this.searchIndex.set(term, []);
        }
        this.searchIndex.get(term).push({
          type: 'video',
          id: id,
          title: video.title,
          relevance: this.calculateRelevance(term, video)
        });
      });
    }
  }

  /**
   * Calculate relevance score for search results
   */
  calculateRelevance(term, content) {
    let score = 0;
    
    // Title match gets highest score
    if (content.title.toLowerCase().includes(term)) {
      score += 10;
    }
    
    // Tag match gets medium score
    if (content.tags && content.tags.some(tag => tag.includes(term))) {
      score += 5;
    }
    
    // Content match gets base score
    if (content.content && content.content.overview && 
        content.content.overview.toLowerCase().includes(term)) {
      score += 1;
    }
    
    return score;
  }

  /**
   * Search help content
   */
  search(query, options = {}) {
    const {
      category = null,
      type = null, // 'article' or 'video'
      limit = 10,
      includePartialMatches = true
    } = options;

    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
    const results = new Map();

    searchTerms.forEach(term => {
      // Exact matches
      if (this.searchIndex.has(term)) {
        this.searchIndex.get(term).forEach(result => {
          if (!results.has(result.id)) {
            results.set(result.id, { ...result, score: 0 });
          }
          results.get(result.id).score += result.relevance;
        });
      }

      // Partial matches
      if (includePartialMatches) {
        for (const [indexTerm, indexResults] of this.searchIndex) {
          if (indexTerm.includes(term) && indexTerm !== term) {
            indexResults.forEach(result => {
              if (!results.has(result.id)) {
                results.set(result.id, { ...result, score: 0 });
              }
              results.get(result.id).score += result.relevance * 0.5; // Partial match penalty
            });
          }
        }
      }
    });

    // Convert to array and sort by score
    let sortedResults = Array.from(results.values())
      .sort((a, b) => b.score - a.score);

    // Apply filters
    if (category) {
      sortedResults = sortedResults.filter(result => {
        const content = this.getContentById(result.id, result.type);
        return content && content.category === category;
      });
    }

    if (type) {
      sortedResults = sortedResults.filter(result => result.type === type);
    }

    // Add search to history
    this.addToSearchHistory(query, sortedResults.length);

    return sortedResults.slice(0, limit);
  }

  /**
   * Get content by ID and type
   */
  getContentById(id, type) {
    switch (type) {
      case 'article':
        return this.helpArticles.get(id);
      case 'video':
        return this.videoTutorials.get(id);
      default:
        return this.helpArticles.get(id) || this.videoTutorials.get(id);
    }
  }

  /**
   * Get contextual tips for current context
   */
  getContextualTips(context) {
    const tips = this.contextualTips.get(context);
    if (!tips) return [];

    // Filter tips based on user progress and preferences
    return tips.tips.filter(tip => this.shouldShowTip(tip, context));
  }

  /**
   * Check if tip should be shown based on user context
   */
  shouldShowTip(tip, context) {
    // Check if user has dismissed this tip
    const dismissedTips = this.getUserPreference('dismissedTips', []);
    if (dismissedTips.includes(`${context}:${tip.element}`)) {
      return false;
    }

    // Check user experience level
    const userLevel = this.getUserContext()?.experience || 'beginner';
    if (tip.minLevel && this.getLevelOrder(userLevel) < this.getLevelOrder(tip.minLevel)) {
      return false;
    }

    return true;
  }

  /**
   * Get level order for comparison
   */
  getLevelOrder(level) {
    const levels = { beginner: 0, intermediate: 1, advanced: 2 };
    return levels[level] || 0;
  }

  /**
   * Get recommended content based on user context
   */
  getRecommendedContent(context = null) {
    const userContext = this.getUserContext();
    const recommendations = [];

    // Get content based on user role
    if (userContext?.role) {
      const roleContent = this.getContentByRole(userContext.role);
      recommendations.push(...roleContent);
    }

    // Get content based on current context
    if (context) {
      const contextContent = this.getContentByContext(context);
      recommendations.push(...contextContent);
    }

    // Get popular content
    const popularContent = this.getPopularContent();
    recommendations.push(...popularContent);

    // Remove duplicates and sort by relevance
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map(item => [item.id, item])).values()
    );

    return uniqueRecommendations.slice(0, 5);
  }

  /**
   * Get content by user role
   */
  getContentByRole(role) {
    const roleContentMap = {
      doctor: ['patient-management', 'appointment-scheduling', 'medical-records'],
      nurse: ['patient-care', 'medication-management', 'vital-signs'],
      admin: ['user-management', 'system-settings', 'reports'],
      student: ['getting-started', 'basic-features', 'learning-resources']
    };

    const contentIds = roleContentMap[role] || [];
    return contentIds.map(id => this.helpArticles.get(id)).filter(Boolean);
  }

  /**
   * Get content by context
   */
  getContentByContext(context) {
    const contextMap = {
      'patient-form': ['patient-management'],
      'dashboard': ['dashboard-overview'],
      'appointments': ['appointment-scheduling'],
      'reports': ['reporting', 'analytics']
    };

    const contentIds = contextMap[context] || [];
    return contentIds.map(id => this.helpArticles.get(id)).filter(Boolean);
  }

  /**
   * Get popular content based on view history
   */
  getPopularContent() {
    // This would typically come from analytics
    const popularIds = ['dashboard-overview', 'patient-management', 'appointment-scheduling'];
    return popularIds.map(id => this.helpArticles.get(id)).filter(Boolean);
  }

  /**
   * Track content view
   */
  trackView(contentId, contentType, context = null) {
    const view = {
      contentId,
      contentType,
      context,
      timestamp: Date.now(),
      userId: this.getUserContext()?.id
    };

    this.viewHistory.push(view);
    
    // Keep only last 100 views
    if (this.viewHistory.length > 100) {
      this.viewHistory = this.viewHistory.slice(-100);
    }

    this.saveViewHistory();
  }

  /**
   * Add to search history
   */
  addToSearchHistory(query, resultCount) {
    const searchEntry = {
      query,
      resultCount,
      timestamp: Date.now()
    };

    this.searchHistory.push(searchEntry);
    
    // Keep only last 50 searches
    if (this.searchHistory.length > 50) {
      this.searchHistory = this.searchHistory.slice(-50);
    }

    this.saveSearchHistory();
  }

  /**
   * Get search suggestions based on history
   */
  getSearchSuggestions(partialQuery) {
    if (!partialQuery || partialQuery.length < 2) {
      return this.getPopularSearches();
    }

    const suggestions = this.searchHistory
      .filter(entry => entry.query.toLowerCase().includes(partialQuery.toLowerCase()))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(entry => entry.query);

    // Add content-based suggestions
    const contentSuggestions = [];
    for (const [id, article] of this.helpArticles) {
      if (article.title.toLowerCase().includes(partialQuery.toLowerCase())) {
        contentSuggestions.push(article.title);
      }
    }

    return [...new Set([...suggestions, ...contentSuggestions.slice(0, 3)])];
  }

  /**
   * Get popular searches
   */
  getPopularSearches() {
    return ['patient management', 'appointments', 'dashboard', 'reports', 'settings'];
  }

  /**
   * Load user context
   */
  loadUserContext() {
    try {
      const stored = localStorage.getItem('help-user-context');
      if (stored) {
        this.userContext = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load user context:', error);
    }
  }

  /**
   * Set user context
   */
  setUserContext(context) {
    this.userContext = { ...this.userContext, ...context };
    try {
      localStorage.setItem('help-user-context', JSON.stringify(this.userContext));
    } catch (error) {
      console.warn('Failed to save user context:', error);
    }
  }

  /**
   * Get user context
   */
  getUserContext() {
    return this.userContext;
  }

  /**
   * Get user preference
   */
  getUserPreference(key, defaultValue = null) {
    const context = this.getUserContext();
    return context?.preferences?.[key] || defaultValue;
  }

  /**
   * Set user preference
   */
  setUserPreference(key, value) {
    const context = this.getUserContext() || {};
    if (!context.preferences) {
      context.preferences = {};
    }
    context.preferences[key] = value;
    this.setUserContext(context);
  }

  /**
   * Save view history
   */
  saveViewHistory() {
    try {
      localStorage.setItem('help-view-history', JSON.stringify(this.viewHistory));
    } catch (error) {
      console.warn('Failed to save view history:', error);
    }
  }

  /**
   * Save search history
   */
  saveSearchHistory() {
    try {
      localStorage.setItem('help-search-history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  /**
   * Get help statistics
   */
  getHelpStats() {
    return {
      totalArticles: this.helpArticles.size,
      totalVideos: this.videoTutorials.size,
      totalViews: this.viewHistory.length,
      totalSearches: this.searchHistory.length,
      lastActivity: this.viewHistory.length > 0 ? 
        Math.max(...this.viewHistory.map(v => v.timestamp)) : null
    };
  }

  /**
   * Export help data
   */
  exportData() {
    return {
      articles: Array.from(this.helpArticles.entries()),
      videos: Array.from(this.videoTutorials.entries()),
      viewHistory: this.viewHistory,
      searchHistory: this.searchHistory,
      userContext: this.userContext,
      exportedAt: Date.now()
    };
  }
}

// Create singleton instance
export const helpContentManager = new HelpContentManager();

export default {
  HelpContentManager,
  helpContentManager
};