import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Initialize i18n
import './i18n';

// Set up axios base URL for API calls
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-vercel-app.vercel.app' 
  : 'http://localhost:3003';

axios.defaults.baseURL = API_BASE_URL;

// Override fetch to use correct base URL for API calls
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  // If URL starts with /api/, prepend the base URL
  if (typeof url === 'string' && url.startsWith('/api/')) {
    url = API_BASE_URL + url;
  }
  return originalFetch(url, options);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker with enhanced features
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('✅ Service Worker registered successfully');
  },
  onUpdate: (registration) => {
    console.log('🔄 New version available');
  }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();