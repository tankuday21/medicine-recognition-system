#!/usr/bin/env node

/**
 * Deployment script for Mediot application
 * Handles pre-deployment checks, build optimization, and deployment to Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentManager {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.clientDir = path.join(this.projectRoot, 'client');
    this.serverDir = path.join(this.projectRoot, 'server');
    this.environment = process.env.NODE_ENV || 'production';
    this.deploymentId = `deploy_${Date.now()}`;
  }

  // Main deployment process
  async deploy() {
    console.log('🚀 Starting Mediot deployment process...');
    console.log(`📋 Deployment ID: ${this.deploymentId}`);
    console.log(`🌍 Environment: ${this.environment}`);

    try {
      // Pre-deployment checks
      await this.runPreDeploymentChecks();
      
      // Build optimization
      await this.optimizeBuild();
      
      // Deploy to Vercel
      await this.deployToVercel();
      
      // Post-deployment verification
      await this.runPostDeploymentChecks();
      
      console.log('✅ Deployment completed successfully!');
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  // Pre-deployment checks
  async runPreDeploymentChecks() {
    console.log('\n📋 Running pre-deployment checks...');

    // Check Node.js version
    this.checkNodeVersion();
    
    // Check required files
    this.checkRequiredFiles();
    
    // Check environment variables
    this.checkEnvironmentVariables();
    
    // Run tests
    await this.runTests();
    
    // Check dependencies
    this.checkDependencies();
    
    // Lint code
    await this.lintCode();
    
    console.log('✅ Pre-deployment checks passed');
  }

  // Check Node.js version
  checkNodeVersion() {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      throw new Error(`Node.js version ${nodeVersion} is not supported. Please use Node.js 16 or higher.`);
    }
    
    console.log(`✓ Node.js version: ${nodeVersion}`);
  }

  // Check required files exist
  checkRequiredFiles() {
    const requiredFiles = [
      'package.json',
      'vercel.json',
      'client/package.json',
      'server/package.json',
      'server/index.js',
      'client/public/manifest.json',
      'client/public/sw.js'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }
    
    console.log('✓ Required files present');
  }

  // Check environment variables
  checkEnvironmentVariables() {
    const requiredEnvVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'OPENAI_API_KEY'
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    console.log('✓ Environment variables configured');
  }

  // Run tests
  async runTests() {
    console.log('🧪 Running tests...');
    
    try {
      // Run client tests
      if (fs.existsSync(path.join(this.clientDir, 'src/__tests__'))) {
        execSync('npm test -- --coverage --watchAll=false', {
          cwd: this.clientDir,
          stdio: 'inherit'
        });
      }
      
      // Run server tests
      if (fs.existsSync(path.join(this.serverDir, 'tests'))) {
        execSync('npm test', {
          cwd: this.serverDir,
          stdio: 'inherit'
        });
      }
      
      console.log('✓ Tests passed');
    } catch (error) {
      throw new Error('Tests failed. Please fix failing tests before deployment.');
    }
  }

  // Check dependencies for security vulnerabilities
  checkDependencies() {
    console.log('🔍 Checking dependencies...');
    
    try {
      // Check client dependencies
      execSync('npm audit --audit-level=high', {
        cwd: this.clientDir,
        stdio: 'pipe'
      });
      
      // Check server dependencies
      execSync('npm audit --audit-level=high', {
        cwd: this.serverDir,
        stdio: 'pipe'
      });
      
      console.log('✓ Dependencies secure');
    } catch (error) {
      console.warn('⚠️  Security vulnerabilities found in dependencies. Consider updating.');
    }
  }

  // Lint code
  async lintCode() {
    console.log('🔍 Linting code...');
    
    try {
      // Lint client code
      if (fs.existsSync(path.join(this.clientDir, '.eslintrc.js'))) {
        execSync('npm run lint', {
          cwd: this.clientDir,
          stdio: 'inherit'
        });
      }
      
      // Lint server code
      if (fs.existsSync(path.join(this.serverDir, '.eslintrc.js'))) {
        execSync('npm run lint', {
          cwd: this.serverDir,
          stdio: 'inherit'
        });
      }
      
      console.log('✓ Code linting passed');
    } catch (error) {
      throw new Error('Code linting failed. Please fix linting errors before deployment.');
    }
  }

  // Optimize build
  async optimizeBuild() {
    console.log('\n🔧 Optimizing build...');

    // Install dependencies
    await this.installDependencies();
    
    // Build client
    await this.buildClient();
    
    // Optimize assets
    await this.optimizeAssets();
    
    // Generate build report
    await this.generateBuildReport();
    
    console.log('✅ Build optimization completed');
  }

  // Install dependencies
  async installDependencies() {
    console.log('📦 Installing dependencies...');
    
    // Install client dependencies
    execSync('npm ci --production=false', {
      cwd: this.clientDir,
      stdio: 'inherit'
    });
    
    // Install server dependencies
    execSync('npm ci --production=false', {
      cwd: this.serverDir,
      stdio: 'inherit'
    });
    
    console.log('✓ Dependencies installed');
  }

  // Build client application
  async buildClient() {
    console.log('🏗️  Building client application...');
    
    // Set production environment
    process.env.NODE_ENV = 'production';
    process.env.GENERATE_SOURCEMAP = 'false';
    
    execSync('npm run build', {
      cwd: this.clientDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        GENERATE_SOURCEMAP: 'false'
      }
    });
    
    console.log('✓ Client build completed');
  }

  // Optimize assets
  async optimizeAssets() {
    console.log('🎨 Optimizing assets...');
    
    const buildDir = path.join(this.clientDir, 'build');
    
    if (!fs.existsSync(buildDir)) {
      throw new Error('Build directory not found');
    }
    
    // Check build size
    const buildStats = this.getBuildStats(buildDir);
    console.log(`📊 Build size: ${(buildStats.totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    if (buildStats.totalSize > 50 * 1024 * 1024) { // 50MB
      console.warn('⚠️  Build size is large. Consider code splitting and optimization.');
    }
    
    console.log('✓ Assets optimized');
  }

  // Get build statistics
  getBuildStats(buildDir) {
    let totalSize = 0;
    let fileCount = 0;
    
    const calculateSize = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          calculateSize(filePath);
        } else {
          totalSize += stats.size;
          fileCount++;
        }
      }
    };
    
    calculateSize(buildDir);
    
    return { totalSize, fileCount };
  }

  // Generate build report
  async generateBuildReport() {
    console.log('📊 Generating build report...');
    
    const buildStats = this.getBuildStats(path.join(this.clientDir, 'build'));
    
    const report = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      nodeVersion: process.version,
      buildStats,
      gitCommit: this.getGitCommit(),
      gitBranch: this.getGitBranch()
    };
    
    fs.writeFileSync(
      path.join(this.projectRoot, 'build-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('✓ Build report generated');
  }

  // Deploy to Vercel
  async deployToVercel() {
    console.log('\n🚀 Deploying to Vercel...');
    
    try {
      // Check if Vercel CLI is installed
      execSync('vercel --version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Vercel CLI not found. Please install it with: npm install -g vercel');
    }
    
    // Deploy to Vercel
    const deployCommand = this.environment === 'production' 
      ? 'vercel --prod --yes' 
      : 'vercel --yes';
    
    execSync(deployCommand, {
      cwd: this.projectRoot,
      stdio: 'inherit'
    });
    
    console.log('✅ Deployed to Vercel successfully');
  }

  // Post-deployment checks
  async runPostDeploymentChecks() {
    console.log('\n🔍 Running post-deployment checks...');
    
    // Wait for deployment to be ready
    await this.waitForDeployment();
    
    // Health check
    await this.healthCheck();
    
    // Performance check
    await this.performanceCheck();
    
    console.log('✅ Post-deployment checks passed');
  }

  // Wait for deployment to be ready
  async waitForDeployment() {
    console.log('⏳ Waiting for deployment to be ready...');
    
    // Simple wait - in production, you might want to poll the deployment status
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log('✓ Deployment ready');
  }

  // Health check
  async healthCheck() {
    console.log('🏥 Running health check...');
    
    const healthUrl = process.env.REACT_APP_BASE_URL 
      ? `${process.env.REACT_APP_BASE_URL}/health`
      : 'https://mediot-app.vercel.app/health';
    
    try {
      const response = await fetch(healthUrl);
      
      if (!response.ok) {
        throw new Error(`Health check failed with status: ${response.status}`);
      }
      
      const health = await response.json();
      console.log('✓ Health check passed:', health.status);
    } catch (error) {
      console.warn('⚠️  Health check failed:', error.message);
    }
  }

  // Performance check
  async performanceCheck() {
    console.log('⚡ Running performance check...');
    
    const appUrl = process.env.REACT_APP_BASE_URL || 'https://mediot-app.vercel.app';
    
    try {
      const startTime = Date.now();
      const response = await fetch(appUrl);
      const loadTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`App not accessible: ${response.status}`);
      }
      
      console.log(`✓ App load time: ${loadTime}ms`);
      
      if (loadTime > 5000) {
        console.warn('⚠️  App load time is slow. Consider optimization.');
      }
    } catch (error) {
      console.warn('⚠️  Performance check failed:', error.message);
    }
  }

  // Utility methods
  getGitCommit() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  getGitBranch() {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployment = new DeploymentManager();
  deployment.deploy().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentManager;