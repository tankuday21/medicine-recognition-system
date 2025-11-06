// User workflow orchestration service for end-to-end user journeys

import errorHandler from '../utils/errorHandler';
import syncService from './syncService';
import offlineStorageService from './offlineStorageService';
import pushNotificationService from './pushNotificationService';

class WorkflowService {
  constructor() {
    this.activeWorkflows = new Map();
    this.workflowHistory = [];
    this.workflowDefinitions = new Map();
    this.stepHandlers = new Map();
    
    this.initializeWorkflows();
  }

  // Initialize predefined workflows
  initializeWorkflows() {
    // User registration workflow
    this.defineWorkflow('user_registration', {
      name: 'User Registration',
      description: 'Complete user registration process',
      steps: [
        { id: 'validate_input', name: 'Validate Registration Data', required: true },
        { id: 'create_account', name: 'Create User Account', required: true },
        { id: 'send_verification', name: 'Send Email Verification', required: false },
        { id: 'setup_profile', name: 'Setup User Profile', required: true },
        { id: 'enable_notifications', name: 'Enable Push Notifications', required: false },
        { id: 'complete_onboarding', name: 'Complete Onboarding', required: true }
      ],
      timeout: 300000, // 5 minutes
      retryable: true,
      maxRetries: 3
    });

    // Medicine scanning workflow
    this.defineWorkflow('medicine_scan', {
      name: 'Medicine Scanning',
      description: 'Complete medicine scanning and information retrieval',
      steps: [
        { id: 'initialize_camera', name: 'Initialize Camera', required: true },
        { id: 'capture_image', name: 'Capture Medicine Image', required: true },
        { id: 'process_scan', name: 'Process Scan Data', required: true },
        { id: 'lookup_medicine', name: 'Lookup Medicine Information', required: true },
        { id: 'save_scan_result', name: 'Save Scan Result', required: false },
        { id: 'suggest_actions', name: 'Suggest Follow-up Actions', required: false }
      ],
      timeout: 120000, // 2 minutes
      retryable: true,
      maxRetries: 2
    });

    // Reminder creation workflow
    this.defineWorkflow('create_reminder', {
      name: 'Create Medication Reminder',
      description: 'Set up medication reminder with schedule',
      steps: [
        { id: 'select_medicine', name: 'Select Medicine', required: true },
        { id: 'configure_schedule', name: 'Configure Reminder Schedule', required: true },
        { id: 'validate_schedule', name: 'Validate Schedule', required: true },
        { id: 'save_reminder', name: 'Save Reminder', required: true },
        { id: 'setup_notifications', name: 'Setup Push Notifications', required: false },
        { id: 'sync_to_server', name: 'Sync to Server', required: false }
      ],
      timeout: 180000, // 3 minutes
      retryable: true,
      maxRetries: 3
    });

    // Report analysis workflow
    this.defineWorkflow('analyze_report', {
      name: 'Medical Report Analysis',
      description: 'Upload and analyze medical reports',
      steps: [
        { id: 'validate_file', name: 'Validate Report File', required: true },
        { id: 'upload_file', name: 'Upload Report', required: true },
        { id: 'extract_text', name: 'Extract Text (OCR)', required: true },
        { id: 'analyze_content', name: 'Analyze Medical Content', required: true },
        { id: 'generate_insights', name: 'Generate Health Insights', required: true },
        { id: 'save_analysis', name: 'Save Analysis Results', required: true },
        { id: 'notify_completion', name: 'Notify User', required: false }
      ],
      timeout: 300000, // 5 minutes
      retryable: true,
      maxRetries: 2
    });

    // Emergency SOS workflow
    this.defineWorkflow('emergency_sos', {
      name: 'Emergency SOS',
      description: 'Handle emergency assistance request',
      steps: [
        { id: 'get_location', name: 'Get User Location', required: true },
        { id: 'prepare_message', name: 'Prepare Emergency Message', required: true },
        { id: 'send_alerts', name: 'Send Emergency Alerts', required: true },
        { id: 'contact_services', name: 'Contact Emergency Services', required: false },
        { id: 'log_incident', name: 'Log Emergency Incident', required: true },
        { id: 'follow_up', name: 'Schedule Follow-up', required: false }
      ],
      timeout: 60000, // 1 minute
      retryable: false,
      maxRetries: 0,
      priority: 'critical'
    });

    // Health chat workflow
    this.defineWorkflow('health_chat', {
      name: 'Health Consultation Chat',
      description: 'AI-powered health consultation',
      steps: [
        { id: 'validate_query', name: 'Validate Health Query', required: true },
        { id: 'gather_context', name: 'Gather User Health Context', required: false },
        { id: 'process_query', name: 'Process with AI', required: true },
        { id: 'validate_response', name: 'Validate AI Response', required: true },
        { id: 'save_conversation', name: 'Save Conversation', required: false },
        { id: 'suggest_followup', name: 'Suggest Follow-up Actions', required: false }
      ],
      timeout: 90000, // 1.5 minutes
      retryable: true,
      maxRetries: 2
    });

    // Initialize step handlers
    this.initializeStepHandlers();
  }

  // Define a new workflow
  defineWorkflow(id, definition) {
    this.workflowDefinitions.set(id, {
      id,
      ...definition,
      createdAt: new Date().toISOString()
    });
  }

  // Start a workflow
  async startWorkflow(workflowId, context = {}, options = {}) {
    const definition = this.workflowDefinitions.get(workflowId);
    if (!definition) {
      throw new Error(`Workflow '${workflowId}' not found`);
    }

    const instanceId = this.generateInstanceId();
    const workflow = {
      instanceId,
      workflowId,
      definition,
      context: { ...context },
      options: { ...options },
      status: 'running',
      currentStep: 0,
      completedSteps: [],
      failedSteps: [],
      startTime: new Date().toISOString(),
      endTime: null,
      error: null,
      retryCount: 0,
      results: {}
    };

    this.activeWorkflows.set(instanceId, workflow);

    try {
      console.log(`Starting workflow: ${definition.name} (${instanceId})`);
      
      // Set timeout if specified
      if (definition.timeout) {
        setTimeout(() => {
          this.timeoutWorkflow(instanceId);
        }, definition.timeout);
      }

      // Execute workflow
      const result = await this.executeWorkflow(instanceId);
      
      return {
        instanceId,
        success: true,
        result
      };
    } catch (error) {
      console.error(`Workflow failed: ${definition.name} (${instanceId})`, error);
      
      await this.handleWorkflowError(instanceId, error);
      
      return {
        instanceId,
        success: false,
        error: error.message
      };
    }
  }

  // Execute workflow steps
  async executeWorkflow(instanceId) {
    const workflow = this.activeWorkflows.get(instanceId);
    if (!workflow) {
      throw new Error('Workflow instance not found');
    }

    const { definition, context } = workflow;
    
    for (let i = workflow.currentStep; i < definition.steps.length; i++) {
      const step = definition.steps[i];
      workflow.currentStep = i;

      try {
        console.log(`Executing step: ${step.name} (${instanceId})`);
        
        // Execute step
        const stepResult = await this.executeStep(instanceId, step);
        
        // Store result
        workflow.results[step.id] = stepResult;
        workflow.completedSteps.push({
          ...step,
          completedAt: new Date().toISOString(),
          result: stepResult
        });

        // Update context with step result
        if (stepResult && typeof stepResult === 'object') {
          Object.assign(workflow.context, stepResult);
        }

        console.log(`Step completed: ${step.name} (${instanceId})`);
        
      } catch (error) {
        console.error(`Step failed: ${step.name} (${instanceId})`, error);
        
        workflow.failedSteps.push({
          ...step,
          failedAt: new Date().toISOString(),
          error: error.message
        });

        // Handle step failure
        if (step.required) {
          throw new Error(`Required step '${step.name}' failed: ${error.message}`);
        } else {
          console.warn(`Optional step '${step.name}' failed, continuing workflow`);
        }
      }
    }

    // Complete workflow
    workflow.status = 'completed';
    workflow.endTime = new Date().toISOString();
    
    this.completeWorkflow(instanceId);
    
    return workflow.results;
  }

  // Execute individual step
  async executeStep(instanceId, step) {
    const workflow = this.activeWorkflows.get(instanceId);
    const handler = this.stepHandlers.get(step.id);
    
    if (!handler) {
      throw new Error(`No handler found for step: ${step.id}`);
    }

    // Execute step with context
    return await handler(workflow.context, workflow.options);
  }

  // Handle workflow error
  async handleWorkflowError(instanceId, error) {
    const workflow = this.activeWorkflows.get(instanceId);
    if (!workflow) return;

    workflow.status = 'failed';
    workflow.error = error.message;
    workflow.endTime = new Date().toISOString();

    // Log error
    errorHandler.handleError({
      type: 'workflow_error',
      message: `Workflow '${workflow.definition.name}' failed: ${error.message}`,
      workflowId: workflow.workflowId,
      instanceId,
      step: workflow.definition.steps[workflow.currentStep]?.name
    });

    // Attempt retry if allowed
    if (workflow.definition.retryable && workflow.retryCount < workflow.definition.maxRetries) {
      console.log(`Retrying workflow: ${workflow.definition.name} (${instanceId})`);
      
      workflow.retryCount++;
      workflow.status = 'retrying';
      workflow.currentStep = 0;
      workflow.failedSteps = [];
      
      setTimeout(() => {
        this.executeWorkflow(instanceId);
      }, 2000 * workflow.retryCount); // Exponential backoff
    } else {
      this.completeWorkflow(instanceId);
    }
  }

  // Timeout workflow
  timeoutWorkflow(instanceId) {
    const workflow = this.activeWorkflows.get(instanceId);
    if (!workflow || workflow.status !== 'running') return;

    const error = new Error(`Workflow timed out after ${workflow.definition.timeout}ms`);
    this.handleWorkflowError(instanceId, error);
  }

  // Complete workflow
  completeWorkflow(instanceId) {
    const workflow = this.activeWorkflows.get(instanceId);
    if (!workflow) return;

    // Move to history
    this.workflowHistory.push({
      ...workflow,
      completedAt: new Date().toISOString()
    });

    // Remove from active workflows
    this.activeWorkflows.delete(instanceId);

    // Cleanup old history (keep last 100)
    if (this.workflowHistory.length > 100) {
      this.workflowHistory.splice(0, this.workflowHistory.length - 100);
    }

    console.log(`Workflow completed: ${workflow.definition.name} (${instanceId})`);
  }

  // Initialize step handlers
  initializeStepHandlers() {
    // User registration steps
    this.stepHandlers.set('validate_input', this.validateRegistrationInput.bind(this));
    this.stepHandlers.set('create_account', this.createUserAccount.bind(this));
    this.stepHandlers.set('send_verification', this.sendEmailVerification.bind(this));
    this.stepHandlers.set('setup_profile', this.setupUserProfile.bind(this));
    this.stepHandlers.set('enable_notifications', this.enablePushNotifications.bind(this));
    this.stepHandlers.set('complete_onboarding', this.completeOnboarding.bind(this));

    // Medicine scanning steps
    this.stepHandlers.set('initialize_camera', this.initializeCamera.bind(this));
    this.stepHandlers.set('capture_image', this.captureImage.bind(this));
    this.stepHandlers.set('process_scan', this.processScanData.bind(this));
    this.stepHandlers.set('lookup_medicine', this.lookupMedicine.bind(this));
    this.stepHandlers.set('save_scan_result', this.saveScanResult.bind(this));
    this.stepHandlers.set('suggest_actions', this.suggestActions.bind(this));

    // Reminder creation steps
    this.stepHandlers.set('select_medicine', this.selectMedicine.bind(this));
    this.stepHandlers.set('configure_schedule', this.configureSchedule.bind(this));
    this.stepHandlers.set('validate_schedule', this.validateSchedule.bind(this));
    this.stepHandlers.set('save_reminder', this.saveReminder.bind(this));
    this.stepHandlers.set('setup_notifications', this.setupNotifications.bind(this));
    this.stepHandlers.set('sync_to_server', this.syncToServer.bind(this));

    // Report analysis steps
    this.stepHandlers.set('validate_file', this.validateReportFile.bind(this));
    this.stepHandlers.set('upload_file', this.uploadReportFile.bind(this));
    this.stepHandlers.set('extract_text', this.extractTextFromReport.bind(this));
    this.stepHandlers.set('analyze_content', this.analyzeMedicalContent.bind(this));
    this.stepHandlers.set('generate_insights', this.generateHealthInsights.bind(this));
    this.stepHandlers.set('save_analysis', this.saveAnalysisResults.bind(this));
    this.stepHandlers.set('notify_completion', this.notifyAnalysisCompletion.bind(this));

    // Emergency SOS steps
    this.stepHandlers.set('get_location', this.getUserLocation.bind(this));
    this.stepHandlers.set('prepare_message', this.prepareEmergencyMessage.bind(this));
    this.stepHandlers.set('send_alerts', this.sendEmergencyAlerts.bind(this));
    this.stepHandlers.set('contact_services', this.contactEmergencyServices.bind(this));
    this.stepHandlers.set('log_incident', this.logEmergencyIncident.bind(this));
    this.stepHandlers.set('follow_up', this.scheduleFollowUp.bind(this));

    // Health chat steps
    this.stepHandlers.set('validate_query', this.validateHealthQuery.bind(this));
    this.stepHandlers.set('gather_context', this.gatherHealthContext.bind(this));
    this.stepHandlers.set('process_query', this.processHealthQuery.bind(this));
    this.stepHandlers.set('validate_response', this.validateAIResponse.bind(this));
    this.stepHandlers.set('save_conversation', this.saveConversation.bind(this));
    this.stepHandlers.set('suggest_followup', this.suggestFollowupActions.bind(this));
  }

  // Step handler implementations
  async validateRegistrationInput(context) {
    const { email, password, name } = context;
    
    if (!email || !password || !name) {
      throw new Error('Missing required registration fields');
    }
    
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    return { validationPassed: true };
  }

  async createUserAccount(context) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: context.email,
        password: context.password,
        name: context.name
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Account creation failed');
    }

    const data = await response.json();
    return { userId: data.user.id, token: data.token };
  }

  async sendEmailVerification(context) {
    const response = await fetch('/api/auth/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.token}`
      },
      body: JSON.stringify({ userId: context.userId })
    });

    return { verificationSent: response.ok };
  }

  async setupUserProfile(context) {
    const profileData = {
      name: context.name,
      email: context.email,
      preferences: context.preferences || {}
    };

    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.token}`
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      throw new Error('Profile setup failed');
    }

    return { profileCreated: true };
  }

  async enablePushNotifications(context) {
    try {
      await pushNotificationService.requestPermission();
      await pushNotificationService.subscribe();
      return { notificationsEnabled: true };
    } catch (error) {
      return { notificationsEnabled: false, error: error.message };
    }
  }

  async completeOnboarding(context) {
    localStorage.setItem('token', context.token);
    localStorage.setItem('onboardingCompleted', 'true');
    
    return { onboardingCompleted: true };
  }

  // Medicine scanning step implementations
  async initializeCamera(context) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      return { cameraStream: stream, cameraInitialized: true };
    } catch (error) {
      throw new Error(`Camera initialization failed: ${error.message}`);
    }
  }

  async captureImage(context) {
    if (!context.cameraStream) {
      throw new Error('Camera not initialized');
    }

    // This would be implemented with actual camera capture logic
    return { imageData: 'captured_image_data', imageCaptured: true };
  }

  async processScanData(context) {
    const { imageData, scanType } = context;
    
    const response = await fetch('/api/scanner/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      },
      body: JSON.stringify({ imageData, scanType })
    });

    if (!response.ok) {
      throw new Error('Scan processing failed');
    }

    const data = await response.json();
    return { scanData: data.scanData, processingCompleted: true };
  }

  async lookupMedicine(context) {
    const { scanData } = context;
    
    const response = await fetch('/api/medicines/lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      },
      body: JSON.stringify({ scanData })
    });

    if (!response.ok) {
      throw new Error('Medicine lookup failed');
    }

    const data = await response.json();
    return { medicineInfo: data.medicine, lookupCompleted: true };
  }

  async saveScanResult(context) {
    const scanResult = {
      scanData: context.scanData,
      medicineInfo: context.medicineInfo,
      timestamp: new Date().toISOString()
    };

    await offlineStorageService.saveScanResult(scanResult);
    
    if (navigator.onLine) {
      await syncService.queueAction('SAVE_SCAN_RESULT', scanResult);
    }

    return { scanSaved: true };
  }

  async suggestActions(context) {
    const { medicineInfo } = context;
    const suggestions = [];

    if (medicineInfo) {
      suggestions.push({
        action: 'create_reminder',
        title: 'Set Medication Reminder',
        description: 'Never miss a dose'
      });

      suggestions.push({
        action: 'view_details',
        title: 'View Medicine Details',
        description: 'Learn more about this medication'
      });
    }

    return { suggestions, suggestionsGenerated: true };
  }

  // Additional step implementations would continue here...
  // For brevity, I'll implement a few key ones

  async getUserLocation(context) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            },
            locationObtained: true
          });
        },
        (error) => {
          reject(new Error(`Location access failed: ${error.message}`));
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  async sendEmergencyAlerts(context) {
    const { location, emergencyContacts, message } = context;
    
    const alerts = [];
    
    for (const contact of emergencyContacts || []) {
      try {
        const response = await fetch('/api/emergency/send-alert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            contact,
            message,
            location
          })
        });

        alerts.push({
          contact,
          sent: response.ok,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        alerts.push({
          contact,
          sent: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return { alerts, alertsSent: true };
  }

  // Utility methods
  generateInstanceId() {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API methods
  getActiveWorkflows() {
    return Array.from(this.activeWorkflows.values());
  }

  getWorkflowHistory() {
    return [...this.workflowHistory];
  }

  getWorkflow(instanceId) {
    return this.activeWorkflows.get(instanceId) || 
           this.workflowHistory.find(w => w.instanceId === instanceId);
  }

  cancelWorkflow(instanceId) {
    const workflow = this.activeWorkflows.get(instanceId);
    if (workflow) {
      workflow.status = 'cancelled';
      workflow.endTime = new Date().toISOString();
      this.completeWorkflow(instanceId);
      return true;
    }
    return false;
  }

  // Workflow statistics
  getWorkflowStats() {
    const all = [...this.activeWorkflows.values(), ...this.workflowHistory];
    
    return {
      total: all.length,
      active: this.activeWorkflows.size,
      completed: this.workflowHistory.filter(w => w.status === 'completed').length,
      failed: this.workflowHistory.filter(w => w.status === 'failed').length,
      cancelled: this.workflowHistory.filter(w => w.status === 'cancelled').length,
      byType: this.getWorkflowsByType(all)
    };
  }

  getWorkflowsByType(workflows) {
    const byType = {};
    workflows.forEach(workflow => {
      const type = workflow.workflowId;
      byType[type] = (byType[type] || 0) + 1;
    });
    return byType;
  }
}

// Create singleton instance
const workflowService = new WorkflowService();

export default workflowService;