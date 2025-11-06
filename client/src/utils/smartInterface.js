// Smart Interface and Personalization Utilities
// Advanced user behavior tracking and interface adaptation

/**
 * User Behavior Tracker
 * Tracks user interactions and patterns for personalization
 */
export class UserBehaviorTracker {
  constructor() {
    this.interactions = new Map();
    this.patterns = new Map();
    this.preferences = new Map();
    this.sessionData = {
      startTime: Date.now(),
      interactions: 0,
      features: new Set(),
      errors: [],
      completedTasks: []
    };
    
    this.init();
  }

  /**
   * Initialize behavior tracking
   */
  init() {
    // Load existing data
    this.loadStoredData();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start session tracking
    this.startSession();
  }

  /**
   * Load stored behavior data
   */
  loadStoredData() {
    try {
      const stored = localStorage.getItem('user-behavior-data');
      if (stored) {
        const data = JSON.parse(stored);
        this.interactions = new Map(data.interactions || []);
        this.patterns = new Map(data.patterns || []);
        this.preferences = new Map(data.preferences || []);
      }
    } catch (error) {
      console.warn('Failed to load behavior data:', error);
    }
  }

  /**
   * Save behavior data to storage
   */
  saveData() {
    try {
      const data = {
        interactions: Array.from(this.interactions.entries()),
        patterns: Array.from(this.patterns.entries()),
        preferences: Array.from(this.preferences.entries()),
        lastUpdated: Date.now()
      };
      localStorage.setItem('user-behavior-data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save behavior data:', error);
    }
  }

  /**
   * Set up global event listeners
   */
  setupEventListeners() {
    // Track clicks
    document.addEventListener('click', (e) => {
      this.trackInteraction('click', {
        element: e.target.tagName,
        className: e.target.className,
        id: e.target.id,
        timestamp: Date.now()
      });
    });

    // Track form interactions
    document.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea, select')) {
        this.trackInteraction('input', {
          type: e.target.type,
          name: e.target.name,
          timestamp: Date.now()
        });
      }
    });

    // Track navigation
    window.addEventListener('popstate', () => {
      this.trackInteraction('navigation', {
        path: window.location.pathname,
        timestamp: Date.now()
      });
    });

    // Track errors
    window.addEventListener('error', (e) => {
      this.trackError({
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        timestamp: Date.now()
      });
    });

    // Save data periodically
    setInterval(() => this.saveData(), 30000); // Every 30 seconds
    
    // Save on page unload
    window.addEventListener('beforeunload', () => this.saveData());
  }

  /**
   * Start session tracking
   */
  startSession() {
    this.sessionData.startTime = Date.now();
    this.sessionData.interactions = 0;
    this.sessionData.features.clear();
    this.sessionData.errors = [];
    this.sessionData.completedTasks = [];
  }

  /**
   * Track user interaction
   */
  trackInteraction(type, data) {
    const key = `${type}:${data.element || data.type || data.path || 'unknown'}`;
    
    // Update interaction count
    const current = this.interactions.get(key) || { count: 0, lastUsed: 0, data: [] };
    current.count++;
    current.lastUsed = Date.now();
    current.data.push(data);
    
    // Keep only last 10 interactions per type
    if (current.data.length > 10) {
      current.data = current.data.slice(-10);
    }
    
    this.interactions.set(key, current);
    
    // Update session data
    this.sessionData.interactions++;
    if (data.feature) {
      this.sessionData.features.add(data.feature);
    }

    // Analyze patterns
    this.analyzePatterns();
  }

  /**
   * Track errors
   */
  trackError(error) {
    this.sessionData.errors.push(error);
    
    // Store persistent error patterns
    const errorKey = `error:${error.message}`;
    const current = this.interactions.get(errorKey) || { count: 0, lastUsed: 0, data: [] };
    current.count++;
    current.lastUsed = Date.now();
    current.data.push(error);
    
    this.interactions.set(errorKey, current);
  }

  /**
   * Track completed task
   */
  trackTaskCompletion(taskId, duration, success = true) {
    const task = {
      id: taskId,
      duration,
      success,
      timestamp: Date.now()
    };
    
    this.sessionData.completedTasks.push(task);
    
    // Store task completion patterns
    const taskKey = `task:${taskId}`;
    const current = this.interactions.get(taskKey) || { 
      count: 0, 
      successRate: 0, 
      avgDuration: 0, 
      data: [] 
    };
    
    current.count++;
    current.data.push(task);
    
    // Calculate success rate and average duration
    const successfulTasks = current.data.filter(t => t.success);
    current.successRate = successfulTasks.length / current.data.length;
    current.avgDuration = current.data.reduce((sum, t) => sum + t.duration, 0) / current.data.length;
    
    this.interactions.set(taskKey, current);
  }

  /**
   * Analyze user patterns
   */
  analyzePatterns() {
    // Most used features
    const featureUsage = new Map();
    for (const [key, data] of this.interactions) {
      if (key.startsWith('click:') || key.startsWith('input:')) {
        const feature = this.extractFeature(key);
        if (feature) {
          featureUsage.set(feature, (featureUsage.get(feature) || 0) + data.count);
        }
      }
    }
    
    this.patterns.set('mostUsedFeatures', 
      Array.from(featureUsage.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    );

    // Time-based patterns
    this.analyzeTimePatterns();
    
    // Error patterns
    this.analyzeErrorPatterns();
    
    // Task completion patterns
    this.analyzeTaskPatterns();
  }

  /**
   * Extract feature name from interaction key
   */
  extractFeature(key) {
    // Simple feature extraction - can be enhanced
    if (key.includes('button')) return 'buttons';
    if (key.includes('form') || key.includes('input')) return 'forms';
    if (key.includes('nav')) return 'navigation';
    if (key.includes('modal')) return 'modals';
    if (key.includes('card')) return 'cards';
    return 'general';
  }

  /**
   * Analyze time-based usage patterns
   */
  analyzeTimePatterns() {
    const hourlyUsage = new Array(24).fill(0);
    const dailyUsage = new Array(7).fill(0);
    
    for (const [, data] of this.interactions) {
      for (const interaction of data.data || []) {
        const date = new Date(interaction.timestamp);
        hourlyUsage[date.getHours()]++;
        dailyUsage[date.getDay()]++;
      }
    }
    
    this.patterns.set('hourlyUsage', hourlyUsage);
    this.patterns.set('dailyUsage', dailyUsage);
  }

  /**
   * Analyze error patterns
   */
  analyzeErrorPatterns() {
    const errorTypes = new Map();
    
    for (const error of this.sessionData.errors) {
      const type = this.categorizeError(error.message);
      errorTypes.set(type, (errorTypes.get(type) || 0) + 1);
    }
    
    this.patterns.set('errorTypes', Array.from(errorTypes.entries()));
  }

  /**
   * Categorize error messages
   */
  categorizeError(message) {
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('permission') || message.includes('access')) return 'permissions';
    if (message.includes('validation') || message.includes('invalid')) return 'validation';
    if (message.includes('timeout')) return 'timeout';
    return 'general';
  }

  /**
   * Analyze task completion patterns
   */
  analyzeTaskPatterns() {
    const taskPerformance = new Map();
    
    for (const task of this.sessionData.completedTasks) {
      const current = taskPerformance.get(task.id) || {
        attempts: 0,
        successes: 0,
        totalDuration: 0
      };
      
      current.attempts++;
      if (task.success) current.successes++;
      current.totalDuration += task.duration;
      
      taskPerformance.set(task.id, current);
    }
    
    // Calculate difficulty scores
    const taskDifficulty = new Map();
    for (const [taskId, perf] of taskPerformance) {
      const successRate = perf.successes / perf.attempts;
      const avgDuration = perf.totalDuration / perf.attempts;
      
      // Higher score = more difficult (lower success rate, longer duration)
      const difficultyScore = (1 - successRate) * 0.7 + (avgDuration / 60000) * 0.3;
      taskDifficulty.set(taskId, difficultyScore);
    }
    
    this.patterns.set('taskDifficulty', Array.from(taskDifficulty.entries()));
  }

  /**
   * Get user preferences based on behavior
   */
  getUserPreferences() {
    const preferences = {
      mostUsedFeatures: this.patterns.get('mostUsedFeatures') || [],
      preferredTimeOfUse: this.getPreferredTimeOfUse(),
      interfaceDensity: this.getPreferredInterfaceDensity(),
      helpLevel: this.getPreferredHelpLevel(),
      errorProneness: this.getErrorProneness()
    };
    
    return preferences;
  }

  /**
   * Get preferred time of use
   */
  getPreferredTimeOfUse() {
    const hourlyUsage = this.patterns.get('hourlyUsage') || [];
    const maxUsage = Math.max(...hourlyUsage);
    const peakHour = hourlyUsage.indexOf(maxUsage);
    
    if (peakHour >= 6 && peakHour < 12) return 'morning';
    if (peakHour >= 12 && peakHour < 18) return 'afternoon';
    if (peakHour >= 18 && peakHour < 22) return 'evening';
    return 'night';
  }

  /**
   * Get preferred interface density
   */
  getPreferredInterfaceDensity() {
    const totalInteractions = this.sessionData.interactions;
    const sessionDuration = Date.now() - this.sessionData.startTime;
    const interactionRate = totalInteractions / (sessionDuration / 1000 / 60); // per minute
    
    if (interactionRate > 10) return 'dense';
    if (interactionRate > 5) return 'normal';
    return 'spacious';
  }

  /**
   * Get preferred help level
   */
  getPreferredHelpLevel() {
    const errorCount = this.sessionData.errors.length;
    const taskFailures = this.sessionData.completedTasks.filter(t => !t.success).length;
    const totalTasks = this.sessionData.completedTasks.length;
    
    if (errorCount > 5 || (totalTasks > 0 && taskFailures / totalTasks > 0.3)) {
      return 'high';
    }
    if (errorCount > 2 || (totalTasks > 0 && taskFailures / totalTasks > 0.1)) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Get error proneness level
   */
  getErrorProneness() {
    const errorCount = this.sessionData.errors.length;
    const sessionDuration = (Date.now() - this.sessionData.startTime) / 1000 / 60; // minutes
    const errorRate = errorCount / Math.max(sessionDuration, 1);
    
    if (errorRate > 0.5) return 'high';
    if (errorRate > 0.1) return 'medium';
    return 'low';
  }

  /**
   * Get smart defaults for UI elements
   */
  getSmartDefaults(context) {
    const preferences = this.getUserPreferences();
    const defaults = {};
    
    // Form defaults based on previous inputs
    if (context === 'form') {
      defaults.autoComplete = preferences.errorProneness === 'high';
      defaults.validation = preferences.errorProneness !== 'low' ? 'strict' : 'normal';
      defaults.helpText = preferences.helpLevel !== 'low';
    }
    
    // Navigation defaults
    if (context === 'navigation') {
      defaults.showLabels = preferences.helpLevel === 'high';
      defaults.breadcrumbs = preferences.helpLevel !== 'low';
      defaults.shortcuts = preferences.mostUsedFeatures.length > 3;
    }
    
    // Interface density
    defaults.density = preferences.interfaceDensity;
    defaults.spacing = preferences.interfaceDensity === 'dense' ? 'compact' : 'normal';
    
    return defaults;
  }

  /**
   * Get contextual recommendations
   */
  getContextualRecommendations(currentContext) {
    const preferences = this.getUserPreferences();
    const recommendations = [];
    
    // Feature recommendations based on usage patterns
    const unusedFeatures = this.getUnusedFeatures();
    if (unusedFeatures.length > 0) {
      recommendations.push({
        type: 'feature',
        title: 'Discover New Features',
        description: `Try ${unusedFeatures[0]} to enhance your workflow`,
        action: 'explore',
        priority: 'low'
      });
    }
    
    // Help recommendations based on error patterns
    if (preferences.errorProneness === 'high') {
      recommendations.push({
        type: 'help',
        title: 'Need Assistance?',
        description: 'Enable guided mode for step-by-step help',
        action: 'enable-help',
        priority: 'high'
      });
    }
    
    // Efficiency recommendations
    const inefficientTasks = this.getInefficientTasks();
    if (inefficientTasks.length > 0) {
      recommendations.push({
        type: 'efficiency',
        title: 'Improve Efficiency',
        description: `Learn shortcuts for ${inefficientTasks[0]}`,
        action: 'show-shortcuts',
        priority: 'medium'
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get unused features
   */
  getUnusedFeatures() {
    const allFeatures = ['search', 'filters', 'export', 'shortcuts', 'templates'];
    const usedFeatures = this.patterns.get('mostUsedFeatures') || [];
    const usedFeatureNames = usedFeatures.map(([name]) => name);
    
    return allFeatures.filter(feature => !usedFeatureNames.includes(feature));
  }

  /**
   * Get inefficient tasks
   */
  getInefficientTasks() {
    const taskDifficulty = this.patterns.get('taskDifficulty') || [];
    return taskDifficulty
      .filter(([, score]) => score > 0.7)
      .map(([taskId]) => taskId)
      .slice(0, 3);
  }

  /**
   * Clear all behavior data
   */
  clearData() {
    this.interactions.clear();
    this.patterns.clear();
    this.preferences.clear();
    this.startSession();
    localStorage.removeItem('user-behavior-data');
  }

  /**
   * Export behavior data
   */
  exportData() {
    return {
      interactions: Array.from(this.interactions.entries()),
      patterns: Array.from(this.patterns.entries()),
      preferences: Array.from(this.preferences.entries()),
      sessionData: this.sessionData,
      exportedAt: Date.now()
    };
  }

  /**
   * Import behavior data
   */
  importData(data) {
    try {
      this.interactions = new Map(data.interactions || []);
      this.patterns = new Map(data.patterns || []);
      this.preferences = new Map(data.preferences || []);
      this.saveData();
      return true;
    } catch (error) {
      console.error('Failed to import behavior data:', error);
      return false;
    }
  }
}

/**
 * Contextual Help System
 * Provides progressive disclosure and contextual assistance
 */
export class ContextualHelpSystem {
  constructor() {
    this.helpContent = new Map();
    this.userProgress = new Map();
    this.helpLevel = 'medium';
    this.init();
  }

  /**
   * Initialize help system
   */
  init() {
    this.loadHelpContent();
    this.loadUserProgress();
  }

  /**
   * Load help content definitions
   */
  loadHelpContent() {
    // Define help content for different contexts
    this.helpContent.set('forms', {
      beginner: {
        title: 'Filling Out Forms',
        content: 'Fill in all required fields marked with *. Click Save when done.',
        tips: ['Required fields must be completed', 'Use Tab to move between fields']
      },
      intermediate: {
        title: 'Form Tips',
        content: 'Use keyboard shortcuts and auto-complete for faster entry.',
        tips: ['Ctrl+S to save', 'Use arrow keys in dropdowns']
      },
      advanced: {
        title: 'Advanced Form Features',
        content: 'Bulk operations and templates available in the toolbar.',
        tips: ['Right-click for context menu', 'Drag to reorder items']
      }
    });

    this.helpContent.set('navigation', {
      beginner: {
        title: 'Getting Around',
        content: 'Use the menu to navigate between sections. Click the home icon to return to the dashboard.',
        tips: ['Menu button opens navigation', 'Breadcrumbs show your location']
      },
      intermediate: {
        title: 'Navigation Shortcuts',
        content: 'Use keyboard shortcuts and bookmarks for quick access.',
        tips: ['Alt+H for home', 'Ctrl+K for search']
      },
      advanced: {
        title: 'Power User Navigation',
        content: 'Customize your workspace and create custom shortcuts.',
        tips: ['Drag to rearrange items', 'Right-click to customize']
      }
    });
  }

  /**
   * Load user progress data
   */
  loadUserProgress() {
    try {
      const stored = localStorage.getItem('help-progress');
      if (stored) {
        const data = JSON.parse(stored);
        this.userProgress = new Map(data.progress || []);
        this.helpLevel = data.helpLevel || 'medium';
      }
    } catch (error) {
      console.warn('Failed to load help progress:', error);
    }
  }

  /**
   * Save user progress
   */
  saveProgress() {
    try {
      const data = {
        progress: Array.from(this.userProgress.entries()),
        helpLevel: this.helpLevel,
        lastUpdated: Date.now()
      };
      localStorage.setItem('help-progress', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save help progress:', error);
    }
  }

  /**
   * Get contextual help for a specific context
   */
  getContextualHelp(context, userLevel = null) {
    const level = userLevel || this.determineUserLevel(context);
    const content = this.helpContent.get(context);
    
    if (!content) {
      return {
        title: 'Help',
        content: 'No specific help available for this context.',
        tips: [],
        level: 'beginner'
      };
    }

    return {
      ...content[level],
      level,
      context
    };
  }

  /**
   * Determine user level for context
   */
  determineUserLevel(context) {
    const progress = this.userProgress.get(context) || {
      interactions: 0,
      completions: 0,
      errors: 0,
      helpRequests: 0
    };

    // Calculate proficiency score
    const interactionScore = Math.min(progress.interactions / 20, 1); // 0-1
    const completionRate = progress.completions / Math.max(progress.interactions, 1);
    const errorRate = progress.errors / Math.max(progress.interactions, 1);
    const helpDependency = progress.helpRequests / Math.max(progress.interactions, 1);

    const proficiencyScore = (
      interactionScore * 0.3 +
      completionRate * 0.4 -
      errorRate * 0.2 -
      helpDependency * 0.1
    );

    if (proficiencyScore > 0.7) return 'advanced';
    if (proficiencyScore > 0.4) return 'intermediate';
    return 'beginner';
  }

  /**
   * Track user interaction with context
   */
  trackInteraction(context, type, success = true) {
    const current = this.userProgress.get(context) || {
      interactions: 0,
      completions: 0,
      errors: 0,
      helpRequests: 0
    };

    current.interactions++;
    
    if (type === 'completion' && success) {
      current.completions++;
    } else if (type === 'error') {
      current.errors++;
    } else if (type === 'help-request') {
      current.helpRequests++;
    }

    this.userProgress.set(context, current);
    this.saveProgress();
  }

  /**
   * Get progressive disclosure recommendations
   */
  getProgressiveDisclosure(context, currentStep = 0) {
    const userLevel = this.determineUserLevel(context);
    const totalSteps = this.getTotalSteps(context);
    
    const disclosure = {
      currentStep,
      totalSteps,
      showAdvanced: userLevel === 'advanced',
      showTips: userLevel === 'beginner',
      nextSteps: this.getNextSteps(context, currentStep, userLevel)
    };

    return disclosure;
  }

  /**
   * Get total steps for context
   */
  getTotalSteps(context) {
    const stepMap = {
      'forms': 4,
      'navigation': 3,
      'search': 3,
      'settings': 5
    };
    
    return stepMap[context] || 3;
  }

  /**
   * Get next steps based on user level
   */
  getNextSteps(context, currentStep, userLevel) {
    const steps = {
      'forms': [
        { title: 'Fill Required Fields', level: 'beginner' },
        { title: 'Use Validation', level: 'beginner' },
        { title: 'Save and Submit', level: 'beginner' },
        { title: 'Use Advanced Features', level: 'advanced' }
      ]
    };

    const contextSteps = steps[context] || [];
    return contextSteps
      .slice(currentStep)
      .filter(step => userLevel === 'advanced' || step.level !== 'advanced')
      .slice(0, 3); // Show next 3 steps
  }

  /**
   * Set help level
   */
  setHelpLevel(level) {
    this.helpLevel = level;
    this.saveProgress();
  }

  /**
   * Reset progress for context
   */
  resetProgress(context) {
    this.userProgress.delete(context);
    this.saveProgress();
  }

  /**
   * Get help statistics
   */
  getHelpStatistics() {
    const stats = {
      totalContexts: this.userProgress.size,
      totalInteractions: 0,
      totalCompletions: 0,
      totalErrors: 0,
      totalHelpRequests: 0,
      averageProficiency: 0
    };

    let proficiencySum = 0;
    
    for (const [context, progress] of this.userProgress) {
      stats.totalInteractions += progress.interactions;
      stats.totalCompletions += progress.completions;
      stats.totalErrors += progress.errors;
      stats.totalHelpRequests += progress.helpRequests;
      
      const level = this.determineUserLevel(context);
      const levelScore = level === 'advanced' ? 3 : level === 'intermediate' ? 2 : 1;
      proficiencySum += levelScore;
    }

    if (this.userProgress.size > 0) {
      stats.averageProficiency = proficiencySum / this.userProgress.size;
    }

    return stats;
  }
}

// Create singleton instances
export const userBehaviorTracker = new UserBehaviorTracker();
export const contextualHelpSystem = new ContextualHelpSystem();

export default {
  UserBehaviorTracker,
  ContextualHelpSystem,
  userBehaviorTracker,
  contextualHelpSystem
};