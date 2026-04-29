/**
 * Test Configuration for SOS Messaging
 * 
 * UPDATE THESE VALUES before running the test script!
 */

module.exports = {
  // Your test contact details - UPDATE THESE!
  testPhone: '+919876543210',      // Your Indian mobile number
  testEmail: 'your-email@gmail.com', // Your email to receive test
  testWhatsApp: '919876543210',    // Your WhatsApp number (without +)
  
  // Test emergency data (can leave as-is for testing)
  emergency: {
    userName: 'Test User',
    userPhone: '+91 98765 43210',
    emergencyType: 'Medical Emergency',
    location: {
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'Connaught Place, New Delhi, India'
    },
    message: 'This is a TEST emergency alert. Please ignore.',
    timestamp: new Date().toISOString()
  }
};
