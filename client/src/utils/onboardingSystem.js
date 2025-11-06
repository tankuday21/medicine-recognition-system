// Onboarding System Utilities
// Comprehensive onboarding and tutorial management

/**
 * Onboarding Flow Manager
 * Manages progressive onboarding flows and user progress
 */
export class OnboardingFlowManager {
  constructor() {
    this.flows = new Map();
    this.userProgress = new Map();
    this.completedFlows = new Set();
    this.skippedSteps = new Set();
    this.personalizedPaths = new Map();
    
    this.init();
  }

  /**
   * Initialize onboarding system
   */
  init() {
    this.loadUserProgress();
    this.defineOnboardingFlows();
  }

  /**
   * Load user progress from storage
   */
  loadUserProgress() {
    try {
      const stored = localStorage.getItem('onboarding-progress');
      if (stored) {
        const data = JSON.parse(stored);
        this.userProgress = new Map(data.progress || []);
        this.completedFlows = new Set(data.completed || []);
        this.skippedSteps = new Set(data.skipped || []);
        this.personalizedPaths = new Map(data.personalized || []);
      }
    } catch (error) {
      console.warn('Failed to load onboarding progress:', error);
    }
  }

  /**
   * Save user progress to storage
   */
  saveProgress() {
    try {
      const data = {
        progress: Array.from(this.userProgress.entries()),
        completed: Array.from(this.completedFlows),
        skipped: Array.from(this.skippedSteps),
        personalized: Array.from(this.personalizedPaths.entries()),
        lastUpdated: Date.now()
      };
      localStorage.setItem('onboarding-progress', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save onboarding progress:', error);
    }
  }

  /**
   * Define onboarding flows
   */
  defineOnboardingFlows() {
    // Basic onboarding flow
    this.flows.set('basic', {
      id: 'basic',
      title: 'Welcome to MedIoT',
      description: 'Get started with the essential features',
      estimatedTime: 5,
      steps: [
        {
          id: 'welcome',
          title: 'Welcome',
          description: 'Welcome to your premium medical interface',
          type: 'intro',
          skippable: false,
          content: {
            title: 'Welcome to MedIoT Premium',
            description: 'Your intelligent medical interface designed for healthcare professionals',
            features: ['Smart Dashboard', 'Patient Management', 'Real-time Analytics']
          }
        },
        {
          id: 'dashboard',
          title: 'Dashboard Overview',
          description: 'Learn about your personalized dashboard',
          type: 'tour',
          skippable: true,
          target: '#dashboard',
          content: {
            title: 'Your Personalized Dashboard',
            description: 'This dashboard adapts to your workflow and shows the most relevant information',
            tips: ['Widgets can be rearranged', 'Click the customize button to add widgets']
          }
        },
        {
          id: 'navigation',
          title: 'Navigation',
          description: 'Discover navigation options',
          type: 'tour',
          skippable: true,
          target: '#navigation',
          content: {
            title: 'Easy Navigation',
            description: 'Access all features through the main navigation menu',
            tips: ['Use keyboard shortcuts for faster access', 'Breadcrumbs show your current location']
          }
        },
        {
          id: 'quick-actions',
          title: 'Quick Actions',
          description: 'Learn about quick action shortcuts',
          type: 'interactive',
          skippable: true,
          target: '#quick-actions',
          content: {
            title: 'Quick Actions',
            description: 'Access frequently used features with one click',
            action: 'Try clicking a quick action button'
          }
        },
        {
          id: 'complete',
          title: 'Setup Complete',
          description: 'You\'re ready to start using MedIoT',
          type: 'completion',
          skippable: false,
          content: {
            title: 'You\'re All Set!',
            description: 'Your MedIoT interface is ready for use',
            rewards: ['Dashboard customized', 'Shortcuts configured', 'Help system activated'],
            nextSteps: ['Explore patient management', 'Set up your preferences', 'Import existing data']
          }
        }
      ]
    });

    // Advanced onboarding flow
    this.flows.set('advanced', {
      id: 'advanced',
      title: 'Advanced Features Tour',
      description: 'Discover powerful features for experienced users',
      estimatedTime: 10,
      prerequisite: 'basic',
      steps: [
        {
          id: 'analytics',
          title: 'Analytics Dashboard',
          description: 'Advanced reporting and analytics',
          type: 'tour',
          target: '#analytics',
          content: {
            title: 'Advanced Analytics',
            description: 'Generate insights from your patient data',
            tips: ['Create custom reports', 'Set up automated alerts']
          }
        },
        {
          id: 'automation',
          title: 'Workflow Automation',
          description: 'Automate repetitive tasks',
          type: 'interactive',
          target: '#automation',
          content: {
            title: 'Smart Automation',
            description: 'Set up rules to automate common workflows',
            action: 'Create your first automation rule'
          }
        }
      ]
    });

    // Role-specific flows
    this.flows.set('doctor', {
      id: 'doctor',
      title: 'Doctor Workflow',
      description: 'Optimized for medical practitioners',
      estimatedTime: 8,
      steps: [
        {
          id: 'patient-management',
          title: 'Patient Management',
          description: 'Manage patient records efficiently',
          type: 'tour',
          target: '#patients'
        },
        {
          id: 'diagnosis-tools',
          title: 'Diagnosis Tools',
          description: 'Access diagnostic and decision support tools',
          type: 'interactive',
          target: '#diagnosis'
        }
      ]
    });

    this.flows.set('nurse', {
      id: 'nurse',
      title: 'Nursing Workflow',
      description: 'Optimized for nursing staff',
      estimatedTime: 6,
      steps: [
        {
          id: 'vital-signs',
          title: 'Vital Signs Entry',
          description: 'Quick vital signs recording',
          type: 'interactive',
          target: '#vitals'
        },
        {
          id: 'medication-admin',
          title: 'Medication Administration',
          description: 'Safe medication tracking',
          type: 'tour',
          target: '#medications'
        }
      ]
    });
  }

  /**
   * Get appropriate onboarding flow for user
   */
  getOnboardingFlow(userRole = 'general', userLevel = 'beginner') {
    // Check if basic flow is completed
    const hasCompletedBasic = this.completedFlows.has('basic');
    
    if (!hasCompletedBasic) {
      return this.flows.get('basic');
    }

    // Return role-specific flow if available
    if (this.flows.has(userRole)) {
      return this.flows.get(userRole);
    }

    // Return advanced flow for experienced users
    if (userLevel === 'advanced' && !this.completedFlows.has('advanced')) {
      return this.flows.get('advanced');
    }

    return null; // No onboarding needed
  }

  /**
   * Start onboarding flow
   */
  startFlow(flowId) {
    const flow = this.flows.get(flowId);
    if (!flow) return null;

    const progress = {
      flowId,
      currentStep: 0,
      startedAt: Date.now(),
      completedSteps: [],
      skippedSteps: []
    };

    this.userProgress.set(flowId, progress);
    this.saveProgress();

    return {
      flow,
      progress,
      currentStepData: flow.steps[0]
    };
  }

  /**
   * Complete onboarding step
   */
  completeStep(flowId, stepId) {
    const progress = this.userProgress.get(flowId);
    if (!progress) return false;

    progress.completedSteps.push(stepId);
    progress.currentStep++;

    const flow = this.flows.get(flowId);
    if (progress.currentStep >= flow.steps.length) {
      // Flow completed
      this.completedFlows.add(flowId);
      progress.completedAt = Date.now();
    }

    this.userProgress.set(flowId, progress);
    this.saveProgress();

    return true;
  }

  /**
   * Skip onboarding step
   */
  skipStep(flowId, stepId) {
    const progress = this.userProgress.get(flowId);
    if (!progress) return false;

    const flow = this.flows.get(flowId);
    const step = flow.steps[progress.currentStep];
    
    if (!step.skippable) return false;

    progress.skippedSteps.push(stepId);
    progress.currentStep++;
    this.skippedSteps.add(`${flowId}:${stepId}`);

    if (progress.currentStep >= flow.steps.length) {
      this.completedFlows.add(flowId);
      progress.completedAt = Date.now();
    }

    this.userProgress.set(flowId, progress);
    this.saveProgress();

    return true;
  }

  /**
   * Get current step data
   */
  getCurrentStep(flowId) {
    const progress = this.userProgress.get(flowId);
    const flow = this.flows.get(flowId);
    
    if (!progress || !flow) return null;

    if (progress.currentStep >= flow.steps.length) {
      return null; // Flow completed
    }

    return {
      step: flow.steps[progress.currentStep],
      progress: {
        current: progress.currentStep + 1,
        total: flow.steps.length,
        percentage: ((progress.currentStep + 1) / flow.steps.length) * 100
      }
    };
  }

  /**
   * Get onboarding statistics
   */
  getOnboardingStats() {
    const stats = {
      totalFlows: this.flows.size,
      completedFlows: this.completedFlows.size,
      inProgressFlows: this.userProgress.size - this.completedFlows.size,
      totalSteps: 0,
      completedSteps: 0,
      skippedSteps: this.skippedSteps.size,
      averageCompletionTime: 0
    };

    let totalCompletionTime = 0;
    let completedFlowsWithTime = 0;

    for (const flow of this.flows.values()) {
      stats.totalSteps += flow.steps.length;
    }

    for (const [flowId, progress] of this.userProgress) {
      stats.completedSteps += progress.completedSteps.length;
      
      if (progress.completedAt && progress.startedAt) {
        totalCompletionTime += progress.completedAt - progress.startedAt;
        completedFlowsWithTime++;
      }
    }

    if (completedFlowsWithTime > 0) {
      stats.averageCompletionTime = totalCompletionTime / completedFlowsWithTime;
    }

    return stats;
  }

  /**
   * Create personalized onboarding path
   */
  createPersonalizedPath(userId, userProfile) {
    const { role, experience, interests, goals } = userProfile;
    
    const path = {
      userId,
      flows: [],
      estimatedTime: 0,
      createdAt: Date.now()
    };

    // Always start with basic flow
    path.flows.push('basic');
    path.estimatedTime += this.flows.get('basic').estimatedTime;

    // Add role-specific flow
    if (this.flows.has(role)) {
      path.flows.push(role);
      path.estimatedTime += this.flows.get(role).estimatedTime;
    }

    // Add advanced flow for experienced users
    if (experience === 'advanced') {
      path.flows.push('advanced');
      path.estimatedTime += this.flows.get('advanced').estimatedTime;
    }

    // Add interest-based flows
    if (interests.includes('analytics') && this.flows.has('analytics')) {
      path.flows.push('analytics');
    }

    this.personalizedPaths.set(userId, path);
    this.saveProgress();

    return path;
  }

  /**
   * Get next recommended flow
   */
  getNextRecommendedFlow(userId) {
    const personalizedPath = this.personalizedPaths.get(userId);
    if (!personalizedPath) return null;

    for (const flowId of personalizedPath.flows) {
      if (!this.completedFlows.has(flowId)) {
        return this.flows.get(flowId);
      }
    }

    return null; // All flows completed
  }

  /**
   * Reset onboarding progress
   */
  resetProgress(flowId = null) {
    if (flowId) {
      this.userProgress.delete(flowId);
      this.completedFlows.delete(flowId);
      
      // Remove skipped steps for this flow
      for (const skipped of this.skippedSteps) {
        if (skipped.startsWith(`${flowId}:`)) {
          this.skippedSteps.delete(skipped);
        }
      }
    } else {
      // Reset all progress
      this.userProgress.clear();
      this.completedFlows.clear();
      this.skippedSteps.clear();
      this.personalizedPaths.clear();
    }
    
    this.saveProgress();
  }

  /**
   * Export onboarding data
   */
  exportData() {
    return {
      flows: Array.from(this.flows.entries()),
      userProgress: Array.from(this.userProgress.entries()),
      completedFlows: Array.from(this.completedFlows),
      skippedSteps: Array.from(this.skippedSteps),
      personalizedPaths: Array.from(this.personalizedPaths.entries()),
      stats: this.getOnboardingStats(),
      exportedAt: Date.now()
    };
  }
}

/**
 * Interactive Tutorial System
 * Manages guided tours and interactive tutorials
 */
export class InteractiveTutorialSystem {
  constructor() {
    this.tutorials = new Map();
    this.activeTutorial = null;
    this.tutorialProgress = new Map();
    this.init();
  }

  /**
   * Initialize tutorial system
   */
  init() {
    this.defineTutorials();
    this.loadTutorialProgress();
  }

  /**
   * Define available tutorials
   */
  defineTutorials() {
    this.tutorials.set('patient-management', {
      id: 'patient-management',
      title: 'Patient Management Tutorial',
      description: 'Learn how to manage patient records effectively',
      difficulty: 'beginner',
      estimatedTime: 8,
      steps: [
        {
          id: 'create-patient',
          title: 'Creating a New Patient',
          description: 'Learn how to add a new patient to the system',
          type: 'interactive',
          target: '#new-patient-btn',
          action: 'click',
          validation: (state) => state.patientCreated,
          hint: 'Click the "New Patient" button to get started'
        },
        {
          id: 'fill-details',
          title: 'Patient Details',
          description: 'Fill in the patient information form',
          type: 'form-guide',
          target: '#patient-form',
          requiredFields: ['name', 'email', 'phone'],
          hint: 'Fill in all required fields marked with *'
        },
        {
          id: 'save-patient',
          title: 'Save Patient Record',
          description: 'Save the patient information',
          type: 'interactive',
          target: '#save-btn',
          action: 'click',
          validation: (state) => state.patientSaved,
          hint: 'Click Save to store the patient record'
        }
      ]
    });

    this.tutorials.set('dashboard-customization', {
      id: 'dashboard-customization',
      title: 'Dashboard Customization',
      description: 'Personalize your dashboard layout',
      difficulty: 'intermediate',
      estimatedTime: 5,
      steps: [
        {
          id: 'customize-mode',
          title: 'Enter Customize Mode',
          description: 'Enable dashboard customization',
          type: 'interactive',
          target: '#customize-btn',
          action: 'click',
          hint: 'Click the Customize button to start'
        },
        {
          id: 'add-widget',
          title: 'Add a Widget',
          description: 'Add a new widget to your dashboard',
          type: 'interactive',
          target: '.add-widget-btn',
          action: 'click',
          hint: 'Click any "Add Widget" button'
        },
        {
          id: 'arrange-widgets',
          title: 'Arrange Widgets',
          description: 'Drag widgets to rearrange them',
          type: 'drag-drop',
          target: '.dashboard-widget',
          hint: 'Drag widgets to reorder them'
        }
      ]
    });
  }

  /**
   * Load tutorial progress
   */
  loadTutorialProgress() {
    try {
      const stored = localStorage.getItem('tutorial-progress');
      if (stored) {
        const data = JSON.parse(stored);
        this.tutorialProgress = new Map(data.progress || []);
      }
    } catch (error) {
      console.warn('Failed to load tutorial progress:', error);
    }
  }

  /**
   * Save tutorial progress
   */
  saveTutorialProgress() {
    try {
      const data = {
        progress: Array.from(this.tutorialProgress.entries()),
        lastUpdated: Date.now()
      };
      localStorage.setItem('tutorial-progress', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save tutorial progress:', error);
    }
  }

  /**
   * Start tutorial
   */
  startTutorial(tutorialId) {
    const tutorial = this.tutorials.get(tutorialId);
    if (!tutorial) return null;

    const progress = {
      tutorialId,
      currentStep: 0,
      startedAt: Date.now(),
      completedSteps: [],
      interactions: []
    };

    this.tutorialProgress.set(tutorialId, progress);
    this.activeTutorial = tutorialId;
    this.saveTutorialProgress();

    return {
      tutorial,
      progress,
      currentStep: tutorial.steps[0]
    };
  }

  /**
   * Complete tutorial step
   */
  completeStep(tutorialId, stepId, interactionData = {}) {
    const progress = this.tutorialProgress.get(tutorialId);
    const tutorial = this.tutorials.get(tutorialId);
    
    if (!progress || !tutorial) return false;

    progress.completedSteps.push(stepId);
    progress.interactions.push({
      stepId,
      ...interactionData,
      timestamp: Date.now()
    });

    progress.currentStep++;

    if (progress.currentStep >= tutorial.steps.length) {
      progress.completedAt = Date.now();
      this.activeTutorial = null;
    }

    this.tutorialProgress.set(tutorialId, progress);
    this.saveTutorialProgress();

    return true;
  }

  /**
   * Get current tutorial step
   */
  getCurrentTutorialStep() {
    if (!this.activeTutorial) return null;

    const progress = this.tutorialProgress.get(this.activeTutorial);
    const tutorial = this.tutorials.get(this.activeTutorial);

    if (!progress || !tutorial || progress.currentStep >= tutorial.steps.length) {
      return null;
    }

    return {
      tutorial,
      step: tutorial.steps[progress.currentStep],
      progress: {
        current: progress.currentStep + 1,
        total: tutorial.steps.length,
        percentage: ((progress.currentStep + 1) / tutorial.steps.length) * 100
      }
    };
  }

  /**
   * Validate step completion
   */
  validateStepCompletion(stepId, state) {
    const currentStep = this.getCurrentTutorialStep();
    if (!currentStep || currentStep.step.id !== stepId) return false;

    if (currentStep.step.validation) {
      return currentStep.step.validation(state);
    }

    return true; // No validation required
  }

  /**
   * Get available tutorials
   */
  getAvailableTutorials(userRole = 'general', userLevel = 'beginner') {
    const available = [];

    for (const [id, tutorial] of this.tutorials) {
      const progress = this.tutorialProgress.get(id);
      const isCompleted = progress && progress.completedAt;
      const isInProgress = progress && !progress.completedAt;

      if (!isCompleted) {
        available.push({
          ...tutorial,
          status: isInProgress ? 'in-progress' : 'available',
          progress: progress ? {
            current: progress.currentStep + 1,
            total: tutorial.steps.length,
            percentage: ((progress.currentStep + 1) / tutorial.steps.length) * 100
          } : null
        });
      }
    }

    return available.sort((a, b) => {
      // Sort by difficulty and status
      const statusOrder = { 'in-progress': 0, 'available': 1 };
      const difficultyOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 };
      
      if (a.status !== b.status) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
  }

  /**
   * Reset tutorial progress
   */
  resetTutorial(tutorialId) {
    this.tutorialProgress.delete(tutorialId);
    if (this.activeTutorial === tutorialId) {
      this.activeTutorial = null;
    }
    this.saveTutorialProgress();
  }
}

// Create singleton instances
export const onboardingFlowManager = new OnboardingFlowManager();
export const interactiveTutorialSystem = new InteractiveTutorialSystem();

export default {
  OnboardingFlowManager,
  InteractiveTutorialSystem,
  onboardingFlowManager,
  interactiveTutorialSystem
};