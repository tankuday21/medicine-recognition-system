const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkDB() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting to:', uri ? uri.substring(0, 20) + '...' : 'undefined');
    if (!uri) {
        console.error('❌ MONGODB_URI is not defined in .env');
        process.exit(1);
    }
    await mongoose.connect(uri);
    console.log('✅ Connection successful');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

checkDB();
