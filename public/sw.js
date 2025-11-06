// Service Worker for Premium Mobile UI
// Handles caching, offline functionality, and background sync

const CACHE_NAME = 'mediot-premium-ui-v1';
const STATIC_CACHE_NAME = 'mediot-static-v1';
const DYNAMIC_CACHE_NAME = 'mediot-dynamic-v1';
const API_CACHE_NAME = 'mediot-api-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// API endpoints to cache with stale-while-revalidate
const API_ENDPOINTS = [
  '/api/patients',
  '/api/medications',
  '/api/appointments',
  '/api/vitals',
  '/api/reports'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim all clients
      self.clients.claim()
    ])
  );
});

/**
 * Fetch Event - Handle all network requests
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - stale-while-revalidate
    event.respondWith(handleAPIRequest(request));
  } else if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
    // Static assets - cache first
    event.respondWith(handleStaticRequest(request));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
    // Other static resources - cache first
    event.respondWith(handleStaticRequest(request));
  } else {
    // HTML pages - network first with cache fallback
    event.respondWith(handlePageRequest(request));
  }
});

/**
 * Handle API requests with stale-while-revalidate strategy
 */
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkPromise = fetch(request).then(async (response) => {
    if (response.ok) {
      // Cache successful responses
      const responseClone = response.clone();
      await cache.put(request, responseClone);
      
      // Notify clients of updated data
      notifyClients('api-updated', {
        url: request.url,
        timestamp: Date.now()
      });
    }
    return response;
  }).catch((error) => {
    console.warn('Network request failed:', error);
    return null;
  });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    // Start network request in background
    networkPromise;
    return cachedResponse;
  }
  
  // Wait for network response if no cache
  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }
  
  // Return offline response if both cache and network fail
  return new Response(
    JSON.stringify({ 
      error: 'Offline', 
      message: 'Data not available offline',
      timestamp: Date.now()
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Handle static asset requests with cache-first strategy
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    console.warn('Failed to fetch static asset:', error);
    
    // Return offline fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#f3f4f6"/><text x="100" y="75" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="14">Image unavailable</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

/**
 * Handle page requests with network-first strategy
 */
async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    console.warn('Network request failed, trying cache:', error);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Offline - MedIoT</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8fafc; }
          .offline-container { max-width: 400px; margin: 0 auto; }
          .offline-icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: #374151; margin-bottom: 10px; }
          p { color: #6b7280; margin-bottom: 30px; }
          .retry-btn { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; }
          .retry-btn:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">📱</div>
          <h1>You're Offline</h1>
          <p>Please check your internet connection and try again.</p>
          <button class="retry-btn" onclick="window.location.reload()">Retry</button>
        </div>
      </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

/**
 * Background Sync Event - Handle offline actions
 */
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'offline-sync') {
    event.waitUntil(syncOfflineActions());
  }
});

/**
 * Sync offline actions when connection is restored
 */
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB
    const db = await openIndexedDB();
    const transaction = db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');
    const actions = await getAllFromStore(store);
    
    console.log(`Syncing ${actions.length} offline actions`);
    
    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method || 'POST',
          headers: action.headers || { 'Content-Type': 'application/json' },
          body: action.body ? JSON.stringify(action.body) : undefined
        });
        
        if (response.ok) {
          // Remove successful action
          await removeOfflineAction(db, action.id);
          
          // Notify client of successful sync
          notifyClients('sync-success', { action });
        } else {
          console.warn('Sync failed for action:', action.id, response.status);
        }
      } catch (error) {
        console.error('Sync error for action:', action.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

/**
 * Message Event - Handle messages from clients
 */
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then((status) => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', data: status });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'PRELOAD_ROUTES':
      preloadRoutes(data.routes);
      break;
  }
});

/**
 * Push Event - Handle push notifications
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Notification Click Event
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const { action, data } = event;
  let url = '/';
  
  if (action) {
    url = data.actionUrls?.[action] || '/';
  } else if (data.url) {
    url = data.url;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

/**
 * Utility Functions
 */

function notifyClients(type, data) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type, data });
    });
  });
}

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = {
      size: keys.length,
      keys: keys.map(key => key.url)
    };
  }
  
  return status;
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

async function preloadRoutes(routes) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  for (const route of routes) {
    try {
      const response = await fetch(route);
      if (response.ok) {
        await cache.put(route, response);
      }
    } catch (error) {
      console.warn('Failed to preload route:', route, error);
    }
  }
}

async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MedIoTOfflineDB', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removeOfflineAction(db, actionId) {
  const transaction = db.transaction(['offlineActions'], 'readwrite');
  const store = transaction.objectStore('offlineActions');
  return store.delete(actionId);
}

console.log('Service Worker: Loaded successfully');