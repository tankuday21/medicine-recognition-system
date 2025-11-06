const scannerService = require('../services/scannerService');

const testScannerService = async () => {
  console.log('🧪 Testing Scanner Service...');

  try {
    // Test barcode scanning
    console.log('\n📊 Testing barcode scanning...');
    const barcodeResult = await scannerService.scanBarcode('8901030895012');
    console.log('Barcode result:', JSON.stringify(barcodeResult, null, 2));

    // Test QR code processing
    console.log('\n🔲 Testing QR code processing...');
    const qrResult = await scannerService.processQRCode('{"medicine": {"name": "Paracetamol", "barcode": "8901030895012"}}');
    console.log('QR result:', JSON.stringify(qrResult, null, 2));

    // Test medicine search
    console.log('\n🔍 Testing medicine search...');
    const searchResult = await scannerService.searchMedicines('paracetamol');
    console.log('Search result:', JSON.stringify(searchResult, null, 2));

    // Test invalid barcode
    console.log('\n❌ Testing invalid barcode...');
    const invalidResult = await scannerService.scanBarcode('0000000000000');
    console.log('Invalid barcode result:', JSON.stringify(invalidResult, null, 2));

    console.log('\n🎉 Scanner service tests completed!');
  } catch (error) {
    console.error('❌ Scanner test failed:', error);
  }
};

// Run the test
testScannerService();