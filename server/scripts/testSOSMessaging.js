/**
 * SOS Messaging Test Script
 * Tests all available messaging options for emergency alerts
 * 
 * Run: node scripts/testSOSMessaging.js
 */

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Load test configuration
let TEST_CONFIG;
try {
  TEST_CONFIG = require('./testSOSMessaging.config.js');
  console.log('📋 Loaded config from testSOSMessaging.config.js');
} catch (e) {
  // Default configuration
  TEST_CONFIG = {
    // Replace with your test contact details
    testPhone: '+919876543210',  // Indian mobile number
    testEmail: 'test@example.com', // Your email to receive test
    testWhatsApp: '919876543210', // WhatsApp number (without +)
    
    // Test emergency data
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
  console.log('📋 Using default config (edit testSOSMessaging.config.js to customize)');
}

// Generate Google Maps link
const getGoogleMapsLink = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

// Generate emergency message
const generateMessage = (emergency) => {
  const mapsLink = getGoogleMapsLink(emergency.location.latitude, emergency.location.longitude);
  return {
    short: `🚨 EMERGENCY: ${emergency.userName} needs help!\n` +
           `Type: ${emergency.emergencyType}\n` +
           `Location: ${mapsLink}\n` +
           `Call: ${emergency.userPhone}`,
    
    full: `🚨 EMERGENCY ALERT 🚨\n\n` +
          `${emergency.userName} needs immediate help!\n\n` +
          `Type: ${emergency.emergencyType}\n` +
          `Location: ${emergency.location.address}\n` +
          `Map: ${mapsLink}\n` +
          `Message: ${emergency.message}\n` +
          `Time: ${new Date(emergency.timestamp).toLocaleString('en-IN')}\n` +
          `Contact: ${emergency.userPhone}\n\n` +
          `Indian Emergency Numbers:\n` +
          `• 112 - Universal Emergency\n` +
          `• 100 - Police\n` +
          `• 108 - Ambulance`
  };
};

console.log('\n' + '='.repeat(60));
console.log('🚨 SOS MESSAGING TEST SCRIPT');
console.log('='.repeat(60) + '\n');

// ============================================
// TEST 1: SendGrid Email
// ============================================
async function testSendGridEmail() {
  console.log('\n📧 TEST 1: SendGrid Email');
  console.log('-'.repeat(40));
  
  if (!process.env.SENDGRID_API_KEY) {
    console.log('❌ SENDGRID_API_KEY not found in .env');
    console.log('   Add: SENDGRID_API_KEY=your_api_key');
    return { success: false, error: 'No API key' };
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = generateMessage(TEST_CONFIG.emergency);
  const mapsLink = getGoogleMapsLink(
    TEST_CONFIG.emergency.location.latitude,
    TEST_CONFIG.emergency.location.longitude
  );

  const emailContent = {
    to: TEST_CONFIG.testEmail,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@mediot.app',
    subject: `🚨 TEST - Emergency Alert from ${TEST_CONFIG.emergency.userName}`,
    text: msg.full,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1>🚨 TEST EMERGENCY ALERT</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd;">
          <p><strong>${TEST_CONFIG.emergency.userName}</strong> has triggered a test emergency alert.</p>
          <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0;">
            <p><strong>Type:</strong> ${TEST_CONFIG.emergency.emergencyType}</p>
            <p><strong>Location:</strong> ${TEST_CONFIG.emergency.location.address}</p>
            <p><strong>Contact:</strong> ${TEST_CONFIG.emergency.userPhone}</p>
          </div>
          <p><a href="${mapsLink}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">📍 View on Google Maps</a></p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This is a TEST alert from Mediot SOS system.</p>
        </div>
      </div>
    `
  };

  try {
    await sgMail.send(emailContent);
    console.log('✅ Email sent successfully to:', TEST_CONFIG.testEmail);
    return { success: true };
  } catch (error) {
    console.log('❌ Email failed:', error.response?.body?.errors?.[0]?.message || error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// TEST 2: WhatsApp Deep Link (Free)
// ============================================
function testWhatsAppDeepLink() {
  console.log('\n💬 TEST 2: WhatsApp Deep Link (FREE)');
  console.log('-'.repeat(40));
  
  const msg = generateMessage(TEST_CONFIG.emergency);
  const encodedMessage = encodeURIComponent(msg.short);
  
  // WhatsApp API URL (opens WhatsApp with pre-filled message)
  const whatsappUrl = `https://wa.me/${TEST_CONFIG.testWhatsApp}?text=${encodedMessage}`;
  
  // WhatsApp URL for sharing to multiple contacts
  const whatsappShareUrl = `https://wa.me/?text=${encodedMessage}`;
  
  console.log('✅ WhatsApp Deep Links Generated:');
  console.log('\n   Single Contact URL:');
  console.log(`   ${whatsappUrl}`);
  console.log('\n   Share to Any Contact URL:');
  console.log(`   ${whatsappShareUrl}`);
  console.log('\n   📱 Open these URLs on a phone to test WhatsApp messaging');
  console.log('   💡 This method is FREE and works without any API!');
  
  return { 
    success: true, 
    urls: { 
      singleContact: whatsappUrl, 
      shareAny: whatsappShareUrl 
    } 
  };
}

// ============================================
// TEST 3: SMS via Twilio
// ============================================
async function testTwilioSMS() {
  console.log('\n📱 TEST 3: Twilio SMS');
  console.log('-'.repeat(40));
  
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log('⚠️  Twilio not configured. To enable:');
    console.log('   1. Sign up at https://www.twilio.com');
    console.log('   2. Get $15 free trial credit');
    console.log('   3. Add to .env:');
    console.log('      TWILIO_ACCOUNT_SID=your_sid');
    console.log('      TWILIO_AUTH_TOKEN=your_token');
    console.log('      TWILIO_PHONE_NUMBER=+1234567890');
    return { success: false, error: 'Not configured' };
  }

  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const msg = generateMessage(TEST_CONFIG.emergency);
    
    const message = await client.messages.create({
      body: msg.short,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: TEST_CONFIG.testPhone
    });
    
    console.log('✅ SMS sent successfully!');
    console.log('   Message SID:', message.sid);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.log('❌ Twilio SMS failed:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// TEST 4: SMS via MSG91 (Indian)
// ============================================
async function testMSG91SMS() {
  console.log('\n📱 TEST 4: MSG91 SMS (Indian Service)');
  console.log('-'.repeat(40));
  
  if (!process.env.MSG91_AUTH_KEY) {
    console.log('⚠️  MSG91 not configured. To enable:');
    console.log('   1. Sign up at https://msg91.com');
    console.log('   2. Get 100 free SMS credits');
    console.log('   3. Add to .env:');
    console.log('      MSG91_AUTH_KEY=your_auth_key');
    console.log('      MSG91_SENDER_ID=MEDIOT (6 chars)');
    console.log('      MSG91_TEMPLATE_ID=your_template_id');
    return { success: false, error: 'Not configured' };
  }

  try {
    const msg = generateMessage(TEST_CONFIG.emergency);
    
    // MSG91 API call
    const response = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'authkey': process.env.MSG91_AUTH_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        template_id: process.env.MSG91_TEMPLATE_ID,
        sender: process.env.MSG91_SENDER_ID || 'MEDIOT',
        mobiles: TEST_CONFIG.testPhone.replace('+', ''),
        VAR1: TEST_CONFIG.emergency.userName,
        VAR2: TEST_CONFIG.emergency.emergencyType,
        VAR3: getGoogleMapsLink(
          TEST_CONFIG.emergency.location.latitude,
          TEST_CONFIG.emergency.location.longitude
        )
      })
    });
    
    const data = await response.json();
    
    if (data.type === 'success') {
      console.log('✅ MSG91 SMS sent successfully!');
      return { success: true };
    } else {
      console.log('❌ MSG91 failed:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.log('❌ MSG91 SMS failed:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// TEST 5: SMS via Fast2SMS (Indian - Budget)
// ============================================
async function testFast2SMS() {
  console.log('\n📱 TEST 5: Fast2SMS (Indian Budget Service)');
  console.log('-'.repeat(40));
  
  if (!process.env.FAST2SMS_API_KEY) {
    console.log('⚠️  Fast2SMS not configured. To enable:');
    console.log('   1. Sign up at https://www.fast2sms.com');
    console.log('   2. Get 50 free SMS credits');
    console.log('   3. Add to .env:');
    console.log('      FAST2SMS_API_KEY=your_api_key');
    return { success: false, error: 'Not configured' };
  }

  try {
    const msg = generateMessage(TEST_CONFIG.emergency);
    const phoneNumber = TEST_CONFIG.testPhone.replace('+91', '').replace(/\D/g, '');
    
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'q', // Quick SMS route
        message: msg.short,
        language: 'english',
        flash: 0,
        numbers: phoneNumber
      })
    });
    
    const data = await response.json();
    
    if (data.return === true) {
      console.log('✅ Fast2SMS sent successfully!');
      console.log('   Request ID:', data.request_id);
      return { success: true, requestId: data.request_id };
    } else {
      console.log('❌ Fast2SMS failed:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.log('❌ Fast2SMS failed:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// TEST 6: Native SMS Link (Free - User sends)
// ============================================
function testNativeSMSLink() {
  console.log('\n📱 TEST 6: Native SMS Link (FREE)');
  console.log('-'.repeat(40));
  
  const msg = generateMessage(TEST_CONFIG.emergency);
  const encodedMessage = encodeURIComponent(msg.short);
  const phoneNumber = TEST_CONFIG.testPhone;
  
  // SMS URL scheme (opens native SMS app)
  const smsUrl = `sms:${phoneNumber}?body=${encodedMessage}`;
  
  // For multiple recipients
  const smsMultipleUrl = `sms:${phoneNumber},+919999999999?body=${encodedMessage}`;
  
  console.log('✅ Native SMS Links Generated:');
  console.log('\n   Single Recipient:');
  console.log(`   ${smsUrl}`);
  console.log('\n   Multiple Recipients:');
  console.log(`   ${smsMultipleUrl}`);
  console.log('\n   📱 Open these URLs on a phone to test native SMS');
  console.log('   💡 This method is FREE - uses user\'s SMS plan!');
  
  return { success: true, urls: { single: smsUrl, multiple: smsMultipleUrl } };
}

// ============================================
// TEST 7: Phone Call Link
// ============================================
function testPhoneCallLink() {
  console.log('\n📞 TEST 7: Phone Call Links (FREE)');
  console.log('-'.repeat(40));
  
  const emergencyNumbers = {
    universal: 'tel:112',
    police: 'tel:100',
    ambulance: 'tel:108',
    fire: 'tel:101',
    women: 'tel:1091',
    contact: `tel:${TEST_CONFIG.testPhone}`
  };
  
  console.log('✅ Phone Call Links Generated:');
  console.log('\n   Emergency Services:');
  console.log(`   • Universal Emergency: ${emergencyNumbers.universal}`);
  console.log(`   • Police: ${emergencyNumbers.police}`);
  console.log(`   • Ambulance: ${emergencyNumbers.ambulance}`);
  console.log(`   • Fire: ${emergencyNumbers.fire}`);
  console.log(`   • Women Helpline: ${emergencyNumbers.women}`);
  console.log(`\n   Contact: ${emergencyNumbers.contact}`);
  console.log('\n   📱 These links open the phone dialer when clicked');
  
  return { success: true, urls: emergencyNumbers };
}

// ============================================
// RUN ALL TESTS
// ============================================
async function runAllTests() {
  const results = {};
  
  // Test 1: SendGrid Email
  results.sendgrid = await testSendGridEmail();
  
  // Test 2: WhatsApp Deep Link
  results.whatsapp = testWhatsAppDeepLink();
  
  // Test 3: Twilio SMS
  results.twilio = await testTwilioSMS();
  
  // Test 4: MSG91 SMS
  results.msg91 = await testMSG91SMS();
  
  // Test 5: Fast2SMS
  results.fast2sms = await testFast2SMS();
  
  // Test 6: Native SMS Link
  results.nativeSms = testNativeSMSLink();
  
  // Test 7: Phone Call Links
  results.phoneCall = testPhoneCallLink();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const summary = [
    { name: 'SendGrid Email', result: results.sendgrid, cost: 'Free (100/day)' },
    { name: 'WhatsApp Link', result: results.whatsapp, cost: 'FREE' },
    { name: 'Twilio SMS', result: results.twilio, cost: '$15 trial' },
    { name: 'MSG91 SMS', result: results.msg91, cost: '100 free SMS' },
    { name: 'Fast2SMS', result: results.fast2sms, cost: '50 free SMS' },
    { name: 'Native SMS Link', result: results.nativeSms, cost: 'FREE' },
    { name: 'Phone Call Link', result: results.phoneCall, cost: 'FREE' },
  ];
  
  console.log('\n');
  summary.forEach(item => {
    const status = item.result.success ? '✅' : '❌';
    console.log(`${status} ${item.name.padEnd(20)} | ${item.cost}`);
  });
  
  console.log('\n' + '-'.repeat(60));
  console.log('💡 RECOMMENDATION FOR INDIA:');
  console.log('-'.repeat(60));
  console.log('1. Use SendGrid for EMAIL (already configured)');
  console.log('2. Use WhatsApp Deep Links for instant messaging (FREE)');
  console.log('3. Use Native SMS Links as backup (FREE, uses user\'s plan)');
  console.log('4. Add MSG91 or Fast2SMS for server-sent SMS if needed');
  console.log('\n');
  
  return results;
}

// Run tests
runAllTests().catch(console.error);
