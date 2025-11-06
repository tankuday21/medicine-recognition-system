# 🚀 Getting Started with Mediot

Welcome! Let's get your Mediot app running in just a few steps.

## 📋 Prerequisites

- **Node.js 16+** ([Download here](https://nodejs.org/))
- **Git** ([Download here](https://git-scm.com/))
- **MongoDB** (optional - see options below)

## 🎯 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
npm run setup
```

### Step 2: Start the App
```bash
npm run quick-start
```

That's it! The app should open at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 🗄️ Database Options

### Option A: No Database (Quickest)
The app will work without a database, but some features will be limited.

### Option B: Local MongoDB
```bash
# Install MongoDB Community Edition
# OR use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option C: MongoDB Atlas (Free Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account and cluster
3. Get connection string
4. Update `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mediot
```

## 🔑 Adding Real Features

### 1. AI Chat (OpenAI)
1. Get API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add to `server/.env`:
```env
OPENAI_API_KEY=sk-your-key-here
ENABLE_AI_CHAT=true
```

### 2. Email Notifications (SendGrid)
1. Get API key from [SendGrid](https://sendgrid.com)
2. Add to `server/.env`:
```env
SENDGRID_API_KEY=SG.your-key-here
ENABLE_EMAIL=true
```

### 3. File Uploads (Cloudinary)
1. Get credentials from [Cloudinary](https://cloudinary.com)
2. Add to `server/.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🧪 Testing Features

### Basic Features (Work Immediately)
- ✅ User registration/login
- ✅ Medicine scanner (camera access)
- ✅ Medication reminders
- ✅ Health symptom checker
- ✅ Emergency SOS
- ✅ Price lookup
- ✅ News feed
- ✅ Multi-language support
- ✅ Mobile PWA features

### Advanced Features (Need API Keys)
- 🔑 AI health chat (needs OpenAI)
- 🔑 Email notifications (needs SendGrid)
- 🔑 File uploads (needs Cloudinary)
- 🔑 OCR report analysis (needs Google Cloud Vision)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 3000 and 3001
npx kill-port 3000 3001
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules client/node_modules server/node_modules
npm run setup
```

### Database Connection Issues
- Check if MongoDB is running: `mongosh` (if installed locally)
- Verify connection string in `server/.env`
- Check firewall/network settings

## 📱 Mobile Testing

1. Find your computer's IP address
2. Update `client/.env`:
```env
REACT_APP_API_URL=http://YOUR_IP:3001/api
```
3. Access `http://YOUR_IP:3000` on your phone

## 🚀 Next Steps

1. **Test basic features** - Register, scan medicines, set reminders
2. **Add API keys** - Enable AI chat and other advanced features
3. **Customize** - Modify colors, add your branding
4. **Deploy** - Use `npm run deploy:production` when ready

## 💡 Tips

- **Development**: Use `npm run quick-start` for daily development
- **Production**: Use `npm run deploy:production` to deploy
- **Health Check**: Visit http://localhost:3001/health to check server status
- **API Docs**: Visit http://localhost:3001/api to see available endpoints

## 🆘 Need Help?

- Check the console for error messages
- Verify all environment variables are set
- Ensure all dependencies are installed
- Check that ports 3000 and 3001 are available

---

**Happy coding! 🎉**