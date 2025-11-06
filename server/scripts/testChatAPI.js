const axios = require('axios');

const testChatAPI = async () => {
  console.log('🧪 Testing Chat API...');

  try {
    const baseURL = 'http://localhost:3001';

    // Test basic message
    console.log('\n💬 Testing basic message...');
    const messageResponse = await axios.post(`${baseURL}/api/chat/message`, {
      message: 'What is paracetamol used for?'
    });
    console.log('Message response:', JSON.stringify(messageResponse.data, null, 2));

    // Test medicine interaction analysis
    console.log('\n⚠️ Testing medicine interaction analysis...');
    const interactionResponse = await axios.post(`${baseURL}/api/chat/analyze-interactions`, {
      medicines: [
        { name: 'Paracetamol', dosage: '500mg' },
        { name: 'Ibuprofen', dosage: '400mg' }
      ]
    });
    console.log('Interaction response:', JSON.stringify(interactionResponse.data, null, 2));

    // Test health check
    console.log('\n🏥 Testing AI health check...');
    const healthResponse = await axios.get(`${baseURL}/api/chat/health`);
    console.log('Health response:', JSON.stringify(healthResponse.data, null, 2));

    console.log('\n🎉 Chat API tests completed successfully!');
  } catch (error) {
    console.error('❌ Chat API test failed:', error.response?.data || error.message);
  }
};

// Run the test
testChatAPI();