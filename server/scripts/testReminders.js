const reminderService = require('../services/reminderService');

const testReminderService = async () => {
  console.log('🧪 Testing Reminder Service...');

  try {
    // Test creating a reminder (without database)
    console.log('\n📅 Testing reminder creation...');
    const reminderData = {
      medicineName: 'Paracetamol',
      dosage: '500mg',
      frequency: 'twice',
      startDate: new Date().toISOString(),
      times: ['08:00', '20:00'],
      notes: 'Take with food'
    };

    const createResult = await reminderService.createReminder('test-user-id', reminderData);
    console.log('Create result:', JSON.stringify(createResult, null, 2));

    // Test getting default times for frequency
    console.log('\n⏰ Testing default times for frequency...');
    const frequencies = ['once', 'twice', 'thrice', 'four_times', 'custom'];
    
    frequencies.forEach(frequency => {
      const times = reminderService.getDefaultTimesForFrequency(frequency);
      const expectedCount = reminderService.getExpectedTimesForFrequency(frequency);
      console.log(`${frequency}: ${times.join(', ')} (expected: ${expectedCount})`);
    });

    console.log('\n🎉 Reminder service tests completed!');
  } catch (error) {
    console.error('❌ Reminder service test failed:', error);
  }
};

// Run the test
testReminderService();