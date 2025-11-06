#!/usr/bin/env node

/**
 * Development startup script for Mediot
 * This script helps you get the app running quickly
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Mediot Development Environment...\n');

// Check if MongoDB is running (optional)
const checkMongoDB = () => {
  console.log('🔍 Checking MongoDB connection...');
  
  const mongoose = require('mongoose');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediot-dev';
  
  mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 })
    .then(() => {
      console.log('✅ MongoDB is running and accessible');
      mongoose.connection.close();
    })
    .catch(() => {
      console.log('⚠️  MongoDB not accessible. You can:');
      console.log('   1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
      console.log('   2. Use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest');
      console.log('   3. Use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
      console.log('   4. Continue without database (some features will be limited)\n');
    });
};

// Check environment files
const checkEnvFiles = () => {
  const serverEnv = path.join(__dirname, 'server', '.env');
  const clientEnv = path.join(__dirname, 'client', '.env');
  
  if (!fs.existsSync(serverEnv)) {
    console.log('❌ server/.env file missing');
    return false;
  }
  
  if (!fs.existsSync(clientEnv)) {
    console.log('❌ client/.env file missing');
    return false;
  }
  
  console.log('✅ Environment files found');
  return true;
};

// Check dependencies
const checkDependencies = () => {
  const serverNodeModules = path.join(__dirname, 'server', 'node_modules');
  const clientNodeModules = path.join(__dirname, 'client', 'node_modules');
  
  if (!fs.existsSync(serverNodeModules)) {
    console.log('❌ Server dependencies not installed');
    console.log('   Run: cd server && npm install');
    return false;
  }
  
  if (!fs.existsSync(clientNodeModules)) {
    console.log('❌ Client dependencies not installed');
    console.log('   Run: cd client && npm install');
    return false;
  }
  
  console.log('✅ Dependencies installed');
  return true;
};

// Main startup function
const startDevelopment = () => {
  console.log('🎯 Starting development servers...\n');
  
  // Start server
  console.log('📡 Starting backend server on http://localhost:3001');
  const server = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit',
    shell: true
  });
  
  // Wait a bit then start client
  setTimeout(() => {
    console.log('🌐 Starting frontend client on http://localhost:3000');
    const client = spawn('npm', ['start'], {
      cwd: path.join(__dirname, 'client'),
      stdio: 'inherit',
      shell: true
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development servers...');
      server.kill();
      client.kill();
      process.exit(0);
    });
    
  }, 3000);
  
  // Show helpful information
  setTimeout(() => {
    console.log('\n🎉 Development servers should be starting up!');
    console.log('📱 Frontend: http://localhost:3000');
    console.log('🔧 Backend API: http://localhost:3001');
    console.log('🏥 Health Check: http://localhost:3001/health');
    console.log('\n💡 Press Ctrl+C to stop both servers');
  }, 5000);
};

// Run checks and start
const main = () => {
  if (!checkEnvFiles()) {
    console.log('\n❌ Environment setup incomplete. Please check the files above.');
    process.exit(1);
  }
  
  if (!checkDependencies()) {
    console.log('\n❌ Dependencies missing. Please install them first:');
    console.log('   npm run install-all');
    process.exit(1);
  }
  
  // Check MongoDB (non-blocking)
  try {
    checkMongoDB();
  } catch (error) {
    console.log('⚠️  Could not check MongoDB status');
  }
  
  setTimeout(startDevelopment, 2000);
};

// Run the script
main();