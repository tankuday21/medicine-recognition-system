# Firebase + Vercel Deployment Guide

## Architecture Overview

```
┌─────────────────┐
│  Vercel         │
│  (Frontend)     │ ← React PWA App
│  FREE           │
└────────┬────────┘
         │
         │ HTTPS API Calls
         │
┌────────▼────────┐
│  Firebase       │
│  (Backend)      │ ← Cloud Functions + Firestore
│  FREE Spark     │
└─────────────────┘
```

## Free Tier Limits

### Vercel (Frontend)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS & SSL
- ✅ Custom domains
- ✅ Serverless functions: 100 GB-hours/month

### Firebase (Backend)
- ✅ Cloud Functions: 2M invocations/month
- ✅ Firestore: 1 GB storage, 50K reads/day, 20K writes/day
- ✅ Authentication: Unlimited users
- ✅ Cloud Storage: 5 GB storage, 1 GB/day download
- ✅ Hosting: 10 GB storage, 360 MB/day

## Step 1: Firebase Setup

### 1.1 Create Firebase Project

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init
```

Select:
- ✅ Functions (Cloud Functions)
- ✅ Firestore (Database)
- ✅ Storage (File storage)
- ✅ Hosting (Optional)

### 1.2 Project Structure

```
medicine-recognition-system/
├── client/                 # Frontend (Vercel)
├── functions/             # Firebase Functions (NEW)
│   ├── index.js
│   ├── package.json
│   └── .env
├── firestore.rules        # Firestore security rules
├── storage.rules          # Storage security rules
└── firebase.json          # Firebase config
```

### 1.3 Install Firebase Admin SDK

```bash
cd functions
npm install firebase-admin firebase-functions
npm install @google-cloud/vision  # For OCR
npm install axios dotenv
```

## Step 2: Migrate Backend to Firebase Functions

### 2.1 Create Firebase Functions

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Medicine Scanner API
app.post('/api/scanner/medicine', async (req, res) => {
  try {
    const { image } = req.body;
    
    // Your Gemini AI logic here
    const result = await analyzeMedicine(image);
    
    // Save to Firestore
    await db.collection('scans').add({
      result,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reminders API
app.get('/api/reminders', async (req, res) => {
  try {
    const userId = req.query.userId;
    const snapshot = await db.collection('reminders')
      .where('userId', '==', userId)
      .get();
    
    const reminders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reminders', async (req, res) => {
  try {
    const reminder = req.body;
    const docRef = await db.collection('reminders').add({
      ...reminder,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    // Your Gemini AI chat logic here
    const response = await processChat(message);
    
    // Save to Firestore
    await db.collection('chats').add({
      userId,
      message,
      response,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);

// Scheduled function for reminders (runs every hour)
exports.sendReminders = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = new Date();
    const snapshot = await db.collection('reminders')
      .where('nextReminder', '<=', now)
      .get();
    
    // Send notifications
    for (const doc of snapshot.docs) {
      const reminder = doc.data();
      await sendNotification(reminder);
    }
    
    return null;
  });
```

### 2.2 Environment Variables

Create `functions/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
NEWS_API_KEY=your_news_api_key
```

### 2.3 Firestore Security Rules

Create `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reminders
    match /reminders/{reminderId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Scans
    match /scans/{scanId} {
      allow read, write: if request.auth != null;
    }
    
    // Chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### 2.4 Storage Rules

Create `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 3: Deploy Firebase Functions

```bash
# Deploy all Firebase services
firebase deploy

# Or deploy specific services
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

Your API will be available at:
```
https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api
```

## Step 4: Update Frontend for Firebase

### 4.1 Install Firebase SDK

```bash
cd client
npm install firebase
```

### 4.2 Create Firebase Config

Create `client/src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

### 4.3 Update API Base URL

Update `client/src/index.js`:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api'
  : 'http://localhost:5001/YOUR_PROJECT_ID/us-central1/api';

axios.defaults.baseURL = API_BASE_URL;
```

### 4.4 Environment Variables

Create `client/.env.production`:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Step 5: Deploy Frontend to Vercel

### 5.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 5.2 Deploy

```bash
cd client
vercel
```

Follow the prompts:
- Link to existing project or create new
- Set environment variables
- Deploy

### 5.3 Add Environment Variables in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all REACT_APP_* variables

### 5.4 Configure Build Settings

Vercel will auto-detect React, but verify:
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

## Step 6: Configure CORS

Update Firebase Functions to allow Vercel domain:

```javascript
const cors = require('cors')({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app'
  ]
});

app.use(cors);
```

## Step 7: Test the Setup

### Test Firebase Functions Locally

```bash
cd functions
firebase emulators:start
```

Access at: http://localhost:5001

### Test Vercel Deployment

```bash
cd client
vercel dev
```

Access at: http://localhost:3000

## Cost Monitoring

### Firebase Console
- Monitor usage: https://console.firebase.google.com
- Set up budget alerts
- Check quotas regularly

### Vercel Dashboard
- Monitor bandwidth: https://vercel.com/dashboard
- Check function invocations
- Review build minutes

## Optimization Tips

### 1. Reduce Firebase Reads
```javascript
// Bad: Multiple reads
const docs = await db.collection('items').get();

// Good: Use where clauses
const docs = await db.collection('items')
  .where('userId', '==', userId)
  .limit(10)
  .get();
```

### 2. Cache Firestore Data
```javascript
// Enable offline persistence
enableIndexedDbPersistence(db);
```

### 3. Optimize Cloud Functions
```javascript
// Use function memory efficiently
exports.api = functions
  .runWith({ memory: '256MB', timeoutSeconds: 60 })
  .https.onRequest(app);
```

### 4. Use CDN for Static Assets
- Store images in Firebase Storage
- Use Vercel's CDN for static files

## Troubleshooting

### CORS Errors
```javascript
// Add to functions/index.js
const cors = require('cors')({ origin: true });
app.use(cors);
```

### Function Timeout
```javascript
// Increase timeout
exports.api = functions
  .runWith({ timeoutSeconds: 300 })
  .https.onRequest(app);
```

### Firestore Permission Denied
- Check firestore.rules
- Verify user authentication
- Test rules in Firebase Console

## Migration Checklist

- [ ] Create Firebase project
- [ ] Initialize Firebase in project
- [ ] Migrate Express routes to Cloud Functions
- [ ] Set up Firestore collections
- [ ] Configure security rules
- [ ] Deploy Firebase Functions
- [ ] Update frontend API URLs
- [ ] Add Firebase SDK to frontend
- [ ] Deploy frontend to Vercel
- [ ] Test all features
- [ ] Set up monitoring
- [ ] Configure budget alerts

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Vercel Pricing](https://vercel.com/pricing)
