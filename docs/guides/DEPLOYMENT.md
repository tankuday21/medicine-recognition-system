# Mediot Deployment Guide

This guide covers the deployment process for the Mediot application to Vercel and production setup.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Deployment Process](#deployment-process)
- [Production Configuration](#production-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Node.js 18+ 
- npm 8+
- Git
- Vercel CLI (`npm install -g vercel`)

### Required Accounts
- [Vercel](https://vercel.com) account
- [MongoDB Atlas](https://www.mongodb.com/atlas) account
- [OpenAI](https://openai.com) API account
- [SendGrid](https://sendgrid.com) account (for emails)
- [Cloudinary](https://cloudinary.com) account (for file uploads)

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd mediot-app
npm run install-all
```

### 2. Environment Variables

Create the following environment files:

#### `.env.local` (for local development)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/mediot-dev

# Authentication
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret

# APIs
OPENAI_API_KEY=your-openai-api-key
SENDGRID_API_KEY=your-sendgrid-api-key

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

#### `.env.production` (for production)
See the `.env.production` file for all required production environment variables.

### 3. Database Setup

#### MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster
2. Create a database user
3. Whitelist your IP addresses
4. Get the connection string
5. Update `MONGODB_URI` in your environment variables

#### Local MongoDB (Development)
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Local Development

### 1. Start Development Server
```bash
npm run dev
```

This starts:
- Client development server on `http://localhost:3000`
- Server development server on `http://localhost:3001`

### 2. Build for Production
```bash
npm run build
```

### 3. Run Tests
```bash
npm test
```

### 4. Lint Code
```bash
npm run lint
```

## Deployment Process

### 1. Automated Deployment (Recommended)

The application uses GitHub Actions for automated deployment:

1. **Push to `develop` branch** → Deploys to staging
2. **Push to `main` branch** → Deploys to production

#### Setup GitHub Actions
1. Add the following secrets to your GitHub repository:
   ```
   VERCEL_TOKEN=your-vercel-token
   VERCEL_ORG_ID=your-vercel-org-id
   VERCEL_PROJECT_ID=your-vercel-project-id
   STAGING_URL=https://your-staging-url.vercel.app
   PRODUCTION_URL=https://your-production-url.vercel.app
   SLACK_WEBHOOK_URL=your-slack-webhook (optional)
   ```

2. Push to your repository:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

### 2. Manual Deployment

#### Using Deployment Script
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

#### Using Vercel CLI
```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 3. Environment Variables in Vercel

Set the following environment variables in your Vercel dashboard:

#### Required Variables
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `OPENAI_API_KEY`
- `SENDGRID_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

#### Optional Variables
- `SENTRY_DSN` (error tracking)
- `GOOGLE_ANALYTICS_ID` (analytics)
- `VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY` (push notifications)

## Production Configuration

### 1. Domain Setup
1. Add your custom domain in Vercel dashboard
2. Configure DNS records
3. SSL certificates are automatically managed by Vercel

### 2. Performance Optimization
- Static assets are automatically optimized by Vercel
- Images are optimized using Vercel's Image Optimization
- Gzip compression is enabled
- CDN distribution is automatic

### 3. Security Configuration
- HTTPS is enforced
- Security headers are configured in `vercel.json`
- CORS is properly configured
- Rate limiting is implemented

### 4. Database Optimization
- Connection pooling is configured
- Indexes are optimized for queries
- Backup strategy is implemented

## Monitoring and Maintenance

### 1. Health Monitoring
- Health check endpoint: `/health`
- Detailed health check: `/health/detailed`
- Metrics endpoint: `/health/metrics`

### 2. Error Tracking
- Sentry integration for error tracking
- Custom error logging
- Performance monitoring

### 3. Performance Monitoring
- Lighthouse CI for performance testing
- Core Web Vitals monitoring
- Response time tracking

### 4. Backup Strategy
- Automated database backups
- Environment configuration backups
- Code repository backups

### 5. Maintenance Tasks

#### Weekly Tasks
- Review error logs
- Check performance metrics
- Update dependencies (if needed)

#### Monthly Tasks
- Security audit (`npm run security-audit`)
- Performance optimization review
- Backup verification

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules client/node_modules server/node_modules
npm run install-all
npm run build
```

#### 2. Environment Variable Issues
- Verify all required environment variables are set
- Check for typos in variable names
- Ensure sensitive values are properly escaped

#### 3. Database Connection Issues
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas
- Verify database user permissions

#### 4. API Integration Issues
- Verify API keys are correct and active
- Check API rate limits
- Review API endpoint URLs

### Debugging

#### 1. Check Logs
```bash
# Vercel function logs
vercel logs

# Local development logs
npm run dev
```

#### 2. Health Check
```bash
# Check application health
curl https://your-app.vercel.app/health

# Check detailed health
curl https://your-app.vercel.app/health/detailed
```

#### 3. Performance Testing
```bash
# Run Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

### Support

For deployment issues:
1. Check the [Vercel documentation](https://vercel.com/docs)
2. Review GitHub Actions logs
3. Check application health endpoints
4. Contact support team

## Security Considerations

### 1. Environment Variables
- Never commit sensitive environment variables
- Use Vercel's environment variable management
- Rotate secrets regularly

### 2. Dependencies
- Regularly update dependencies
- Run security audits
- Monitor for vulnerabilities

### 3. Access Control
- Limit Vercel team access
- Use proper authentication
- Monitor access logs

### 4. Data Protection
- Encrypt sensitive data
- Implement proper CORS
- Use HTTPS everywhere

## Performance Optimization

### 1. Frontend Optimization
- Code splitting is implemented
- Lazy loading for components
- Image optimization
- Service worker caching

### 2. Backend Optimization
- Database query optimization
- Response caching
- Compression enabled
- Connection pooling

### 3. Monitoring
- Performance metrics collection
- Error rate monitoring
- Response time tracking
- Resource usage monitoring

## Rollback Procedure

If issues occur after deployment:

### 1. Immediate Rollback
```bash
# Rollback to previous deployment
vercel rollback
```

### 2. Database Rollback
- Restore from latest backup
- Verify data integrity
- Update application if needed

### 3. Verification
- Run health checks
- Verify functionality
- Monitor error rates

## Conclusion

This deployment guide provides comprehensive instructions for deploying and maintaining the Mediot application. Follow the automated deployment process for the best results, and regularly monitor the application health and performance.

For questions or issues, refer to the troubleshooting section or contact the development team.