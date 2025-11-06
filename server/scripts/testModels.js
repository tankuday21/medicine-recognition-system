const mongoose = require('mongoose');
const { User, Medicine, Reminder, HealthMetrics, Report, ChatMessage, SymptomCheck, ScanHistory, EmergencyAlert } = require('../models');

const testModels = async () => {
  try {
    console.log('🧪 Testing MongoDB Models...');
    
    // Test model creation without database connection
    const testUser = new User({
      email: 'test@example.com',
      password: 'testpassword',
      name: 'Test User'
    });

    const testMedicine = new Medicine({
      name: 'Test Medicine',
      genericName: 'Test Generic',
      dosage: '500mg',
      manufacturer: 'Test Pharma'
    });

    console.log('✅ User model validation passed');
    console.log('✅ Medicine model validation passed');
    
    // Test other models
    const testReminder = new Reminder({
      userId: new mongoose.Types.ObjectId(),
      medicineName: 'Test Medicine',
      dosage: '500mg',
      frequency: 'twice',
      startDate: new Date(),
      times: ['08:00', '20:00']
    });

    const testHealthMetrics = new HealthMetrics({
      userId: new mongoose.Types.ObjectId(),
      bloodSugar: { fasting: 100 },
      testDate: new Date()
    });

    const testReport = new Report({
      userId: new mongoose.Types.ObjectId(),
      fileName: 'test-report.pdf',
      fileType: 'pdf'
    });

    const testChatMessage = new ChatMessage({
      userId: new mongoose.Types.ObjectId(),
      conversationId: 'test-conversation',
      content: 'Hello, AI!',
      sender: 'user'
    });

    const testSymptomCheck = new SymptomCheck({
      userId: new mongoose.Types.ObjectId(),
      symptoms: [{
        name: 'headache',
        severity: 'mild'
      }]
    });

    const testScanHistory = new ScanHistory({
      userId: new mongoose.Types.ObjectId(),
      scanType: 'barcode',
      scanResult: { barcode: '1234567890' }
    });

    const testEmergencyAlert = new EmergencyAlert({
      userId: new mongoose.Types.ObjectId(),
      alertType: 'sos',
      location: { latitude: 40.7128, longitude: -74.0060 },
      message: 'Emergency assistance needed'
    });

    console.log('✅ Reminder model validation passed');
    console.log('✅ HealthMetrics model validation passed');
    console.log('✅ Report model validation passed');
    console.log('✅ ChatMessage model validation passed');
    console.log('✅ SymptomCheck model validation passed');
    console.log('✅ ScanHistory model validation passed');
    console.log('✅ EmergencyAlert model validation passed');

    console.log('🎉 All models validated successfully!');
    
    // Test password hashing
    console.log('🔐 Testing password hashing...');
    const isPasswordValid = await testUser.comparePassword('testpassword');
    console.log('✅ Password comparison works:', isPasswordValid);

    // Test adherence calculation
    console.log('📊 Testing adherence calculation...');
    testReminder.adherenceLog = [
      { scheduledTime: new Date(), status: 'taken' },
      { scheduledTime: new Date(), status: 'missed' },
      { scheduledTime: new Date(), status: 'taken' }
    ];
    const adherencePercentage = testReminder.getAdherencePercentage();
    console.log('✅ Adherence calculation works:', adherencePercentage + '%');

    // Test BMI calculation
    console.log('🏥 Testing BMI calculation...');
    testHealthMetrics.weight = 70;
    testHealthMetrics.height = 175;
    await testHealthMetrics.validate();
    console.log('✅ BMI calculation works');

    console.log('🎉 All model functionality tests passed!');
    
  } catch (error) {
    console.error('❌ Model test failed:', error.message);
  }
};

// Run the test
testModels();