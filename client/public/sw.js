// Service Worker for Offline Functionality
// Advanced caching strategies and offline support

const CACHE_NAME = 'mediot-app-v1';
const STATIC_CACHE = 'mediot-static-v1';
const DYNAMIC_CACHE = 'mediot-dynamic-v1';
const API_CACHE = 'mediot-api-v1';
const IMAGE_CACHE = 'mediot-images-v1';

// Cache configuration
const CACHE_CONFIG = {
  maxAge: {
    static: 7 * 24 * 60 * 60 * 1000, // 7 days
    dynamic: 24 * 60 * 60 * 1000,     // 1 day
    api: 5 * 60 * 1000,               // 5 minutes
    images: 30 * 24 * 60 * 60 * 1000  // 30 days
  },
  maxEntries: {
    dynamic: 50,
    api: 100,
    images: 200
  }
};

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/offline.html'
];

// API endpoints that should be cached
const CACHEABLE_API_PATTERNS = [
  /\/api\/patients/,
  /\/api\/appointments/,
  /\/api\/medications/,
  /\/api\/reports/
];

// Critical API endpoints that need offline support
const CRITICAL_API_PATTERNS = [
  /\/api\/patients\/\d+$/,
  /\/api\/emergency/,
  /\/api\/vitals/
];

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old cache versions
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
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
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

/**
 * Handle API requests with stale-while-revalidate strategy
 */
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Check if this API should be cached
    const shouldCache = CACHEABLE_API_PATTERNS.some(pattern => pattern.test(url.pathname));
    const isCritical = CRITICAL_API_PATTERNS.some(pattern => pattern.test(url.pathname));
    
    if (!shouldCache && !isCritical) {
      return fetch(request);
    }

    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    
    // For critical APIs, return cached version immediately if available
    if (isCritical && cachedResponse) {
      // Update cache in background
      updateCacheInBackground(cache, request);
      return cachedResponse;
    }

    // Try network first
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Clone response for caching
        const responseClone = networkResponse.clone();
        
        // Add timestamp for cache management
        const responseWithTimestamp = new Response(responseClone.body, {
          status: responseClone.status,
          statusText: responseClone.statusText,
          headers: {
            ...Object.fromEntries(responseClone.headers.entries()),
            'sw-cached-at': Date.now().toString()
          }
        });
        
        cache.put(request, responseWithTimestamp);
        return networkResponse;
      }
    } catch (networkError) {
      console.log('Network failed for API request:', networkError);
    }

    // Return cached version if network fails
    if (cachedResponse) {
      console.log('Serving cached API response');
      return cachedResponse;
    }

    // Return offline response for critical APIs
    if (isCritical) {
      return new Response(
        JSON.stringify({ 
          error: 'Offline', 
          message: 'This data is not available offline',
          offline: true 
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    throw new Error('No cached response available');
    
  } catch (error) {
    console.error('API request failed:', error);
    return new Response(
      JSON.stringify({ error: 'Request failed', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle image requests with cache-first strategy
 */
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful image responses
      cache.put(request, networkResponse.clone());
      
      // Clean up old images if cache is getting full
      cleanupImageCache(cache);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('Image request failed:', error);
    
    // Return placeholder image for offline
    return new Response(
      '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" fill="#999">Image Unavailable</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

/**
 * Handle static assets with cache-first strategy
 */
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('Static asset request failed:', error);
    
    // Try to serve from cache anyway
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Handle dynamic requests with network-first strategy
 */
async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      
      // Clean up old dynamic cache entries
      cleanupDynamicCache(cache);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('Network failed for dynamic request, trying cache');
    
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    throw error;
  }
}

/**
 * Update cache in background
 */
async function updateCacheInBackground(cache, request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    console.log('Background cache update failed:', error);
  }
}

/**
 * Clean up image cache when it gets too large
 */
async function cleanupImageCache(cache) {
  const keys = await cache.keys();
  
  if (keys.length > CACHE_CONFIG.maxEntries.images) {
    // Remove oldest entries
    const entriesToRemove = keys.slice(0, keys.length - CACHE_CONFIG.maxEntries.images);
    await Promise.all(entriesToRemove.map(key => cache.delete(key)));
  }
}

/**
 * Clean up dynamic cache when it gets too large
 */
async function cleanupDynamicCache(cache) {
  const keys = await cache.keys();
  
  if (keys.length > CACHE_CONFIG.maxEntries.dynamic) {
    // Remove oldest entries
    const entriesToRemove = keys.slice(0, keys.length - CACHE_CONFIG.maxEntries.dynamic);
    await Promise.all(entriesToRemove.map(key => cache.delete(key)));
  }
}

/**
 * Check if request is for an image
 */
function isImageRequest(request) {
  const url = new URL(request.url);
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname) ||
         request.headers.get('accept')?.includes('image/');
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname) ||
         url.pathname.includes('/static/');
}

/**
 * Background Sync for offline actions
 */
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

/**
 * Sync offline actions when connection is restored
 */
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB or localStorage
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        // Remove successful action
        await removeOfflineAction(action.id);
        
        // Notify client of successful sync
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              action: action
            });
          });
        });
        
      } catch (error) {
        console.error('Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

/**
 * Get offline actions (placeholder - implement with IndexedDB)
 */
async function getOfflineActions() {
  // This would typically use IndexedDB to store offline actions
  return [];
}

/**
 * Remove offline action (placeholder - implement with IndexedDB)
 */
async function removeOfflineAction(actionId) {
  // This would typically remove the action from IndexedDB
  console.log('Removing offline action:', actionId);
}

/**
 * Push notification handling
 */
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  const options = {
    body: 'You have new medical updates',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icon-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MedIoT App', options)
  );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

/**
 * Message handling from main thread
 */
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      cacheUrls(event.data.urls)
    );
  }
});

/**
 * Cache specific URLs on demand
 */
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.error('Failed to cache URL:', url, error);
    }
  }
}

console.log('Service Worker loaded successfully');