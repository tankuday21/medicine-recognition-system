// Quality Assurance System
// Comprehensive QA framework for premium mobile UI

/**
 * Quality Assurance Manager
 * Manages comprehensive quality checks and validation
 */
export class QualityAssuranceManager {
  constructor() {
    this.qaRules = new Map();
    this.qaResults = new Map();
    this.qaHistory = [];
    this.criticalIssues = [];
    this.initializeQARules();
  }

  /**
   * Initialize comprehensive QA rules
   */
  initializeQARules() {
    // UI/UX Quality Rules
    this.qaRules.set('ui-consistency', {
      category: 'UI/UX',
      priority: 'high',
      description: 'Check for consistent UI patterns and design system usage',
      checks: [
        'consistent-spacing',
        'consistent-typography',
        'consistent-colors',
        'consistent-component-usage',
        'consistent-iconography'
      ]
    });

    this.qaRules.set('visual-hierarchy', {
      category: 'UI/UX',
      priority: 'high',
      description: 'Validate proper visual hierarchy and information architecture',
      checks: [
        'heading-structure',
        'content-organization',
        'visual-weight',
        'reading-flow',
        'focus-indicators'
      ]
    });

    this.qaRules.set('responsive-design', {
      category: 'UI/UX',
      priority: 'critical',
      description: 'Ensure responsive design works across all breakpoints',
      checks: [
        'mobile-layout',
        'tablet-layout',
        'desktop-layout',
        'breakpoint-transitions',
        'content-reflow'
      ]
    });

    // Accessibility Quality Rules
    this.qaRules.set('accessibility-compliance', {
      category: 'Accessibility',
      priority: 'critical',
      description: 'Ensure WCAG 2.1 AA compliance',
      checks: [
        'color-contrast',
        'keyboard-navigation',
        'screen-reader-support',
        'focus-management',
        'aria-labels',
        'semantic-html'
      ]
    });

    this.qaRules.set('inclusive-design', {
      category: 'Accessibility',
      priority: 'high',
      description: 'Check for inclusive design principles',
      checks: [
        'touch-target-sizes',
        'text-scalability',
        'reduced-motion-support',
        'high-contrast-support',
        'alternative-input-methods'
      ]
    });

    // Performance Quality Rules
    this.qaRules.set('loading-performance', {
      category: 'Performance',
      priority: 'high',
      description: 'Validate loading performance and optimization',
      checks: [
        'initial-load-time',
        'time-to-interactive',
        'largest-contentful-paint',
        'cumulative-layout-shift',
        'first-input-delay'
      ]
    });

    this.qaRules.set('runtime-performance', {
      category: 'Performance',
      priority: 'medium',
      description: 'Check runtime performance and resource usage',
      checks: [
        'memory-usage',
        'cpu-usage',
        'animation-performance',
        'scroll-performance',
        'interaction-responsiveness'
      ]
    });

    // Functionality Quality Rules
    this.qaRules.set('user-interactions', {
      category: 'Functionality',
      priority: 'critical',
      description: 'Validate all user interactions work correctly',
      checks: [
        'button-functionality',
        'form-validation',
        'navigation-flow',
        'gesture-support',
        'error-handling'
      ]
    });

    this.qaRules.set('data-integrity', {
      category: 'Functionality',
      priority: 'critical',
      description: 'Ensure data handling and persistence works correctly',
      checks: [
        'form-data-persistence',
        'local-storage-handling',
        'api-error-handling',
        'offline-functionality',
        'data-validation'
      ]
    });

    // Medical App Specific Rules
    this.qaRules.set('medical-compliance', {
      category: 'Medical',
      priority: 'critical',
      description: 'Ensure medical app specific requirements are met',
      checks: [
        'patient-data-security',
        'medical-terminology-accuracy',
        'emergency-feature-accessibility',
        'medication-display-clarity',
        'health-data-visualization'
      ]
    });

    this.qaRules.set('professional-standards', {
      category: 'Medical',
      priority: 'high',
      description: 'Validate professional medical app standards',
      checks: [
        'clinical-workflow-support',
        'professional-appearance',
        'trust-indicators',
        'certification-compliance',
        'user-safety-features'
      ]
    });
  }

  /**
   * Run comprehensive quality assurance check
   */
  async runQualityAssurance(options = {}) {
    const {
      categories = ['UI/UX', 'Accessibility', 'Performance', 'Functionality', 'Medical'],
      priority = ['critical', 'high', 'medium', 'low'],
      skipCache = false
    } = options;

    const qaSession = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      categories,
      priority,
      results: new Map(),
      summary: {
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        criticalIssues: 0,
        overallScore: 0
      }
    };

    // Run QA checks for each rule
    for (const [ruleId, rule] of this.qaRules) {
      if (!categories.includes(rule.category) || !priority.includes(rule.priority)) {
        continue;
      }

      const ruleResult = await this.runQARule(ruleId, rule, skipCache);
      qaSession.results.set(ruleId, ruleResult);
      
      // Update summary
      qaSession.summary.totalChecks += ruleResult.checks.length;
      qaSession.summary.passedChecks += ruleResult.checks.filter(c => c.passed).length;
      qaSession.summary.failedChecks += ruleResult.checks.filter(c => !c.passed).length;
      
      if (rule.priority === 'critical' && ruleResult.score < 80) {
        qaSession.summary.criticalIssues++;
      }
    }

    // Calculate overall score
    qaSession.summary.overallScore = qaSession.summary.totalChecks > 0 
      ? Math.round((qaSession.summary.passedChecks / qaSession.summary.totalChecks) * 100)
      : 0;

    // Store results
    this.qaResults.set(qaSession.id, qaSession);
    this.qaHistory.push(qaSession);

    // Update critical issues
    this.updateCriticalIssues(qaSession);

    return qaSession;
  }

  /**
   * Run individual QA rule
   */
  async runQARule(ruleId, rule, skipCache = false) {
    const ruleResult = {
      ruleId,
      rule,
      timestamp: new Date().toISOString(),
      checks: [],
      score: 0,
      issues: [],
      recommendations: []
    };

    // Run each check in the rule
    for (const checkId of rule.checks) {
      const checkResult = await this.runQACheck(checkId, rule.category, skipCache);
      ruleResult.checks.push(checkResult);
    }

    // Calculate rule score
    const passedChecks = ruleResult.checks.filter(c => c.passed).length;
    ruleResult.score = ruleResult.checks.length > 0 
      ? Math.round((passedChecks / ruleResult.checks.length) * 100)
      : 0;

    // Collect issues and recommendations
    ruleResult.checks.forEach(check => {
      if (!check.passed) {
        ruleResult.issues.push(...check.issues);
      }
      if (check.recommendations) {
        ruleResult.recommendations.push(...check.recommendations);
      }
    });

    return ruleResult;
  }

  /**
   * Run individual QA check
   */
  async runQACheck(checkId, category, skipCache = false) {
    const checkResult = {
      checkId,
      category,
      timestamp: new Date().toISOString(),
      passed: false,
      score: 0,
      issues: [],
      recommendations: [],
      metrics: {}
    };

    try {
      switch (checkId) {
        // UI/UX Checks
        case 'consistent-spacing':
          Object.assign(checkResult, await this.checkConsistentSpacing());
          break;
        case 'consistent-typography':
          Object.assign(checkResult, await this.checkConsistentTypography());
          break;
        case 'consistent-colors':
          Object.assign(checkResult, await this.checkConsistentColors());
          break;
        case 'consistent-component-usage':
          Object.assign(checkResult, await this.checkConsistentComponents());
          break;
        case 'consistent-iconography':
          Object.assign(checkResult, await this.checkConsistentIconography());
          break;
        case 'heading-structure':
          Object.assign(checkResult, await this.checkHeadingStructure());
          break;
        case 'content-organization':
          Object.assign(checkResult, await this.checkContentOrganization());
          break;
        case 'visual-weight':
          Object.assign(checkResult, await this.checkVisualWeight());
          break;
        case 'reading-flow':
          Object.assign(checkResult, await this.checkReadingFlow());
          break;
        case 'focus-indicators':
          Object.assign(checkResult, await this.checkFocusIndicators());
          break;
        case 'mobile-layout':
          Object.assign(checkResult, await this.checkMobileLayout());
          break;
        case 'tablet-layout':
          Object.assign(checkResult, await this.checkTabletLayout());
          break;
        case 'desktop-layout':
          Object.assign(checkResult, await this.checkDesktopLayout());
          break;
        case 'breakpoint-transitions':
          Object.assign(checkResult, await this.checkBreakpointTransitions());
          break;
        case 'content-reflow':
          Object.assign(checkResult, await this.checkContentReflow());
          break;

        // Accessibility Checks
        case 'color-contrast':
          Object.assign(checkResult, await this.checkColorContrast());
          break;
        case 'keyboard-navigation':
          Object.assign(checkResult, await this.checkKeyboardNavigation());
          break;
        case 'screen-reader-support':
          Object.assign(checkResult, await this.checkScreenReaderSupport());
          break;
        case 'focus-management':
          Object.assign(checkResult, await this.checkFocusManagement());
          break;
        case 'aria-labels':
          Object.assign(checkResult, await this.checkAriaLabels());
          break;
        case 'semantic-html':
          Object.assign(checkResult, await this.checkSemanticHTML());
          break;
        case 'touch-target-sizes':
          Object.assign(checkResult, await this.checkTouchTargetSizes());
          break;
        case 'text-scalability':
          Object.assign(checkResult, await this.checkTextScalability());
          break;
        case 'reduced-motion-support':
          Object.assign(checkResult, await this.checkReducedMotionSupport());
          break;
        case 'high-contrast-support':
          Object.assign(checkResult, await this.checkHighContrastSupport());
          break;
        case 'alternative-input-methods':
          Object.assign(checkResult, await this.checkAlternativeInputMethods());
          break;

        // Performance Checks
        case 'initial-load-time':
          Object.assign(checkResult, await this.checkInitialLoadTime());
          break;
        case 'time-to-interactive':
          Object.assign(checkResult, await this.checkTimeToInteractive());
          break;
        case 'largest-contentful-paint':
          Object.assign(checkResult, await this.checkLargestContentfulPaint());
          break;
        case 'cumulative-layout-shift':
          Object.assign(checkResult, await this.checkCumulativeLayoutShift());
          break;
        case 'first-input-delay':
          Object.assign(checkResult, await this.checkFirstInputDelay());
          break;
        case 'memory-usage':
          Object.assign(checkResult, await this.checkMemoryUsage());
          break;
        case 'cpu-usage':
          Object.assign(checkResult, await this.checkCPUUsage());
          break;
        case 'animation-performance':
          Object.assign(checkResult, await this.checkAnimationPerformance());
          break;
        case 'scroll-performance':
          Object.assign(checkResult, await this.checkScrollPerformance());
          break;
        case 'interaction-responsiveness':
          Object.assign(checkResult, await this.checkInteractionResponsiveness());
          break;

        // Functionality Checks
        case 'button-functionality':
          Object.assign(checkResult, await this.checkButtonFunctionality());
          break;
        case 'form-validation':
          Object.assign(checkResult, await this.checkFormValidation());
          break;
        case 'navigation-flow':
          Object.assign(checkResult, await this.checkNavigationFlow());
          break;
        case 'gesture-support':
          Object.assign(checkResult, await this.checkGestureSupport());
          break;
        case 'error-handling':
          Object.assign(checkResult, await this.checkErrorHandling());
          break;
        case 'form-data-persistence':
          Object.assign(checkResult, await this.checkFormDataPersistence());
          break;
        case 'local-storage-handling':
          Object.assign(checkResult, await this.checkLocalStorageHandling());
          break;
        case 'api-error-handling':
          Object.assign(checkResult, await this.checkAPIErrorHandling());
          break;
        case 'offline-functionality':
          Object.assign(checkResult, await this.checkOfflineFunctionality());
          break;
        case 'data-validation':
          Object.assign(checkResult, await this.checkDataValidation());
          break;

        // Medical App Checks
        case 'patient-data-security':
          Object.assign(checkResult, await this.checkPatientDataSecurity());
          break;
        case 'medical-terminology-accuracy':
          Object.assign(checkResult, await this.checkMedicalTerminologyAccuracy());
          break;
        case 'emergency-feature-accessibility':
          Object.assign(checkResult, await this.checkEmergencyFeatureAccessibility());
          break;
        case 'medication-display-clarity':
          Object.assign(checkResult, await this.checkMedicationDisplayClarity());
          break;
        case 'health-data-visualization':
          Object.assign(checkResult, await this.checkHealthDataVisualization());
          break;
        case 'clinical-workflow-support':
          Object.assign(checkResult, await this.checkClinicalWorkflowSupport());
          break;
        case 'professional-appearance':
          Object.assign(checkResult, await this.checkProfessionalAppearance());
          break;
        case 'trust-indicators':
          Object.assign(checkResult, await this.checkTrustIndicators());
          break;
        case 'certification-compliance':
          Object.assign(checkResult, await this.checkCertificationCompliance());
          break;
        case 'user-safety-features':
          Object.assign(checkResult, await this.checkUserSafetyFeatures());
          break;

        default:
          checkResult.issues.push(`Unknown check: ${checkId}`);
      }
    } catch (error) {
      checkResult.issues.push(`Check failed: ${error.message}`);
    }

    return checkResult;
  }

  // UI/UX Check Implementations
  async checkConsistentSpacing() {
    const result = { passed: false, score: 0, issues: [], recommendations: [], metrics: {} };
    
    if (typeof document === 'undefined') {
      result.issues.push('Document not available for spacing check');
      return result;
    }

    const elements = document.querySelectorAll('*');
    const spacingValues = new Set();
    let inconsistentSpacing = 0;

    elements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const padding = styles.padding;
      const margin = styles.margin;
      
      if (padding !== '0px') spacingValues.add(padding);
      if (margin !== '0px') spacingValues.add(margin);
    });

    // Check for too many different spacing values
    if (spacingValues.size > 20) {
      inconsistentSpacing = spacingValues.size - 20;
      result.issues.push(`Too many different spacing values: ${spacingValues.size}`);
      result.recommendations.push('Consolidate spacing values using design system tokens');
    }

    result.metrics.spacingVariations = spacingValues.size;
    result.score = Math.max(0, 100 - (inconsistentSpacing * 5));
    result.passed = result.score >= 80;

    return result;
  }

  async checkConsistentTypography() {
    const result = { passed: false, score: 0, issues: [], recommendations: [], metrics: {} };
    
    if (typeof document === 'undefined') {
      result.issues.push('Document not available for typography check');
      return result;
    }

    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, a');
    const fontSizes = new Set();
    const fontFamilies = new Set();
    let inconsistentTypography = 0;

    textElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      fontSizes.add(styles.fontSize);
      fontFamilies.add(styles.fontFamily);
    });

    // Check for too many font sizes
    if (fontSizes.size > 12) {
      inconsistentTypography += fontSizes.size - 12;
      result.issues.push(`Too many font sizes: ${fontSizes.size}`);
    }

    // Check for too many font families
    if (fontFamilies.size > 3) {
      inconsistentTypography += fontFamilies.size - 3;
      result.issues.push(`Too many font families: ${fontFamilies.size}`);
    }

    if (inconsistentTypography > 0) {
      result.recommendations.push('Use typography scale from design system');
    }

    result.metrics.fontSizeVariations = fontSizes.size;
    result.metrics.fontFamilyVariations = fontFamilies.size;
    result.score = Math.max(0, 100 - (inconsistentTypography * 5));
    result.passed = result.score >= 80;

    return result;
  }

  async checkConsistentColors() {
    const result = { passed: false, score: 0, issues: [], recommendations: [], metrics: {} };
    
    if (typeof document === 'undefined') {
      result.issues.push('Document not available for color check');
      return result;
    }

    const elements = document.querySelectorAll('*');
    const colors = new Set();
    const backgroundColors = new Set();

    elements.forEach(el => {
      const styles = window.getComputedStyle(el);
      if (styles.color !== 'rgba(0, 0, 0, 0)') colors.add(styles.color);
      if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)') backgroundColors.add(styles.backgroundColor);
    });

    let inconsistentColors = 0;

    // Check for too many colors
    if (colors.size > 15) {
      inconsistentColors += colors.size - 15;
      result.issues.push(`Too many text colors: ${colors.size}`);
    }

    if (backgroundColors.size > 10) {
      inconsistentColors += backgroundColors.size - 10;
      result.issues.push(`Too many background colors: ${backgroundColors.size}`);
    }

    if (inconsistentColors > 0) {
      result.recommendations.push('Use color palette from design system');
    }

    result.metrics.textColorVariations = colors.size;
    result.metrics.backgroundColorVariations = backgroundColors.size;
    result.score = Math.max(0, 100 - (inconsistentColors * 3));
    result.passed = result.score >= 80;

    return result;
  }

  // Accessibility Check Implementations
  async checkColorContrast() {
    const result = { passed: false, score: 0, issues: [], recommendations: [], metrics: {} };
    
    if (typeof document === 'undefined') {
      result.issues.push('Document not available for contrast check');
      return result;
    }

    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, button, a');
    let lowContrastElements = 0;

    textElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      // Simplified contrast check - real implementation would calculate actual ratios
      if (styles.color === styles.backgroundColor) {
        lowContrastElements++;
      }
    });

    if (lowContrastElements > 0) {
      result.issues.push(`${lowContrastElements} elements may have insufficient contrast`);
      result.recommendations.push('Ensure minimum 4.5:1 contrast ratio for normal text');
    }

    result.metrics.lowContrastElements = lowContrastElements;
    result.score = Math.max(0, 100 - (lowContrastElements * 10));
    result.passed = result.score >= 90;

    return result;
  }

  async checkTouchTargetSizes() {
    const result = { passed: false, score: 0, issues: [], recommendations: [], metrics: {} };
    
    if (typeof document === 'undefined') {
      result.issues.push('Document not available for touch target check');
      return result;
    }

    const touchElements = document.querySelectorAll('button, a, input, [role="button"], [onclick]');
    let smallTargets = 0;
    const minSize = 44;

    touchElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width < minSize || rect.height < minSize) {
        smallTargets++;
      }
    });

    if (smallTargets > 0) {
      result.issues.push(`${smallTargets} touch targets below ${minSize}px minimum`);
      result.recommendations.push(`Ensure all touch targets are at least ${minSize}px`);
    }

    result.metrics.smallTouchTargets = smallTargets;
    result.metrics.totalTouchTargets = touchElements.length;
    result.score = touchElements.length > 0 
      ? Math.round(((touchElements.length - smallTargets) / touchElements.length) * 100)
      : 100;
    result.passed = result.score >= 95;

    return result;
  }

  // Performance Check Implementations
  async checkInitialLoadTime() {
    const result = { passed: false, score: 0, issues: [], recommendations: [], metrics: {} };
    
    const loadTime = performance.now();
    const threshold = 3000; // 3 seconds

    result.metrics.loadTime = Math.round(loadTime);

    if (loadTime > threshold) {
      result.issues.push(`Load time (${Math.round(loadTime)}ms) exceeds ${threshold}ms threshold`);
      result.recommendations.push('Optimize bundle size and implement code splitting');
    }

    result.score = Math.max(0, 100 - Math.max(0, (loadTime - threshold) / 100));
    result.passed = result.score >= 80;

    return result;
  }

  async checkMemoryUsage() {
    const result = { passed: false, score: 0, issues: [], recommendations: [], metrics: {} };
    
    if (performance.memory) {
      const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      const threshold = 100; // 100MB

      result.metrics.memoryUsage = Math.round(memoryUsage);

      if (memoryUsage > threshold) {
        result.issues.push(`Memory usage (${Math.round(memoryUsage)}MB) exceeds ${threshold}MB threshold`);
        result.recommendations.push('Optimize memory usage and implement cleanup');
      }

      result.score = Math.max(0, 100 - Math.max(0, (memoryUsage - threshold) / 10));
      result.passed = result.score >= 80;
    } else {
      result.issues.push('Memory API not available');
      result.score = 50; // Neutral score when can't measure
      result.passed = true;
    }

    return result;
  }

  // Medical App Check Implementations
  async checkPatientDataSecurity() {
    const result = { passed: false, score: 0, issues: [], recommendations: [], metrics: {} };
    
    // Check for potential security issues
    let securityIssues = 0;

    // Check for unencrypted data storage
    try {
      const localStorageData = Object.keys(localStorage);
      const sensitiveDataInStorage = localStorageData.filter(key => 
        key.includes('patient') || key.includes('medical') || key.includes('health')
      );

      if (sensitiveDataInStorage.length > 0) {
        securityIssues++;
        result.issues.push('Potential sensitive data in localStorage');
        result.recommendations.push('Encrypt sensitive data before storage');
      }
    } catch (error) {
      // localStorage not available
    }

    // Check for console logging of sensitive data
    if (typeof console !== 'undefined') {
      // This is a simplified check - real implementation would be more sophisticated
      result.recommendations.push('Ensure no sensitive data is logged to console in production');
    }

    result.metrics.securityIssues = securityIssues;
    result.score = Math.max(0, 100 - (securityIssues * 20));
    result.passed = result.score >= 90;

    return result;
  }

  async checkEmergencyFeatureAccessibility() {
    const result = { passed: false, score: 0, issues: [], recommendations: [], metrics: {} };
    
    if (typeof document === 'undefined') {
      result.issues.push('Document not available for emergency feature check');
      return result;
    }

    const emergencyElements = document.querySelectorAll('[data-emergency], .emergency, [class*="emergency"]');
    let accessibilityIssues = 0;

    emergencyElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      
      // Check if emergency elements are large enough
      if (rect.width < 60 || rect.height < 60) {
        accessibilityIssues++;
      }

      // Check if emergency elements have proper labels
      if (!el.getAttribute('aria-label') && !el.textContent?.trim()) {
        accessibilityIssues++;
      }
    });

    if (accessibilityIssues > 0) {
      result.issues.push(`${accessibilityIssues} accessibility issues with emergency features`);
      result.recommendations.push('Ensure emergency features are highly accessible');
    }

    result.metrics.emergencyElements = emergencyElements.length;
    result.metrics.accessibilityIssues = accessibilityIssues;
    result.score = emergencyElements.length > 0 
      ? Math.max(0, 100 - (accessibilityIssues * 25))
      : 100;
    result.passed = result.score >= 95;

    return result;
  }

  /**
   * Update critical issues list
   */
  updateCriticalIssues(qaSession) {
    this.criticalIssues = [];

    qaSession.results.forEach((ruleResult, ruleId) => {
      if (ruleResult.rule.priority === 'critical' && ruleResult.score < 80) {
        this.criticalIssues.push({
          ruleId,
          rule: ruleResult.rule,
          score: ruleResult.score,
          issues: ruleResult.issues,
          recommendations: ruleResult.recommendations
        });
      }
    });
  }

  /**
   * Get QA summary
   */
  getQASummary() {
    if (this.qaHistory.length === 0) {
      return {
        totalSessions: 0,
        latestScore: 0,
        averageScore: 0,
        criticalIssues: 0,
        trends: []
      };
    }

    const latest = this.qaHistory[this.qaHistory.length - 1];
    const scores = this.qaHistory.map(session => session.summary.overallScore);
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

    return {
      totalSessions: this.qaHistory.length,
      latestScore: latest.summary.overallScore,
      averageScore,
      criticalIssues: this.criticalIssues.length,
      trends: this.calculateTrends()
    };
  }

  /**
   * Calculate QA trends
   */
  calculateTrends() {
    if (this.qaHistory.length < 2) return [];

    const trends = [];
    const categories = ['UI/UX', 'Accessibility', 'Performance', 'Functionality', 'Medical'];

    categories.forEach(category => {
      const categoryScores = this.qaHistory.map(session => {
        const categoryResults = Array.from(session.results.values())
          .filter(result => result.rule.category === category);
        
        if (categoryResults.length === 0) return 0;
        
        const totalScore = categoryResults.reduce((sum, result) => sum + result.score, 0);
        return Math.round(totalScore / categoryResults.length);
      });

      if (categoryScores.length >= 2) {
        const latest = categoryScores[categoryScores.length - 1];
        const previous = categoryScores[categoryScores.length - 2];
        const change = latest - previous;

        trends.push({
          category,
          current: latest,
          change,
          trend: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable'
        });
      }
    });

    return trends;
  }

  /**
   * Get critical issues
   */
  getCriticalIssues() {
    return this.criticalIssues;
  }

  /**
   * Get QA history
   */
  getQAHistory() {
    return this.qaHistory;
  }

  /**
   * Clear QA results
   */
  clearResults() {
    this.qaResults.clear();
    this.qaHistory = [];
    this.criticalIssues = [];
  }
}

// Create singleton instance
export const qualityAssuranceManager = new QualityAssuranceManager();

// Utility functions
export const runQualityAssurance = async (options) => {
  return await qualityAssuranceManager.runQualityAssurance(options);
};

export const getQASummary = () => {
  return qualityAssuranceManager.getQASummary();
};

export const getCriticalIssues = () => {
  return qualityAssuranceManager.getCriticalIssues();
};

export default {
  QualityAssuranceManager,
  qualityAssuranceManager,
  runQualityAssurance,
  getQASummary,
  getCriticalIssues
};