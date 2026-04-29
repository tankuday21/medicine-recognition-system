const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediot';

const testUser = {
  email: 'test@mediot.com',
  password: 'Test@123',
  name: 'Test User',
  gender: 'other',
  preferences: {
    language: 'en',
    notifications: {
      reminders: true,
      news: true,
      emergency: true
    },
    theme: 'auto',
    units: 'metric'
  }
};

async function seedTestUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    
    if (existingUser) {
      console.log('Test user already exists. Updating password...');
      existingUser.password = testUser.password;
      await existingUser.save();
      console.log('Test user password updated!');
    } else {
      console.log('Creating test user...');
      const user = new User(testUser);
      await user.save();
      console.log('Test user created successfully!');
    }

    console.log('\n========================================');
    console.log('TEST CREDENTIALS:');
    console.log('Email: test@mediot.com');
    console.log('Password: Test@123');
    console.log('========================================\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test user:', error);
    process.exit(1);
  }
}

seedTestUser();
