const aiService = require('../services/aiService');

const testAIService = async () => {
  console.log('🧪 Testing AI Service...');

  try {
    // Test basic query
    console.log('\n💬 Testing basic health query...');
    const basicResult = await aiService.processQuery('What is paracetamol used for?');
    console.log('Basic query result:', JSON.stringify(basicResult, null, 2));

    // Test query with medicine context
    console.log('\n💊 Testing query with medicine context...');
    const medicineContext = {
      medicine: {
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        dosage: '500mg',
        uses: ['Pain relief', 'Fever reduction'],
        sideEffects: ['Nausea', 'Stomach upset'],
        interactions: ['Warfarin', 'Alcohol']
      }
    };
    
    const contextResult = await aiService.processQuery(
      'Is this medicine safe for children?',
      medicineContext
    );
    console.log('Context query result:', JSON.stringify(contextResult, null, 2));

    // Test medicine interaction analysis
    console.log('\n⚠️ Testing medicine interaction analysis...');
    const medicines = [
      { name: 'Paracetamol', dosage: '500mg' },
      { name: 'Ibuprofen', dosage: '400mg' }
    ];
    
    const interactionResult = await aiService.analyzeMedicineInteraction(medicines);
    console.log('Interaction analysis result:', JSON.stringify(interactionResult, null, 2));

    console.log('\n🎉 AI service tests completed!');
  } catch (error) {
    console.error('❌ AI service test failed:', error);
  }
};

// Run the test
testAIService();