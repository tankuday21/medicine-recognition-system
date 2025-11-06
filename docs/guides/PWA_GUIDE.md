# Progressive Web App (PWA) Guide

## Overview

Mediot is now a fully-featured Progressive Web App (PWA) that provides:
- **Offline functionality** - Access key features without internet
- **Install to home screen** - Native app-like experience
- **Push notifications** - Stay updated with medication reminders
- **Background sync** - Sync data when connection is restored
- **Fast loading** - Cached assets for instant access

## Features

### 1. Installability

Users can install Mediot as a standalone app on their devices:

**Desktop:**
- Chrome/Edge: Click the install icon in the address bar
- Safari: Not supported (use as web app)

**Mobile:**
- Android: "Add to Home Screen" prompt or browser menu
- iOS: Safari → Share → "Add to Home Screen"

**Automatic Install Prompt:**
- Shows after 30 seconds of usage
- Only appears if app is installable
- Can be dismissed and shown again later

### 2. Offline Support

**Cached Content:**
- Static assets (JS, CSS, images)
- Previously viewed medicine information
- Medication reminders
- Scan history
- Health metrics

**Offline Strategies:**
- **Cache First**: Static assets, images
- **Network First**: Dynamic content, API calls
- **Stale While Revalidate**: Critical API data

**Offline Indicator:**
- Yellow banner when offline
- Green banner when connection restored
- Auto-hides after 3 seconds online

### 3. Background Sync

When offline, actions are queued and synced when connection is restored:
- Medicine scans
- Reminder updates
- Health metric entries
- Chat messages

### 4. Push Notifications

**Supported Notifications:**
- Medication reminders
- Health alerts
- Emergency notifications
- App updates

**Setup:**
```javascript
import { usePushNotifications } from './hooks/usePWA';

const { subscribe, permission } = usePushNotifications();

// Request permission and subscribe
await subscribe();
```

### 5. App Updates

**Automatic Update Detection:**
- Checks for updates on page load
- Shows update prompt when available
- User can update immediately or later

**Manual Update:**
```javascript
import { useAppUpdate } from './hooks/usePWA';

const { updateAvailable, updateApp } = useAppUpdate();

if (updateAvailable) {
  updateApp(); // Reloads with new version
}
```

## Implementation Details

### Service Worker

Location: `client/public/sw.js`

**Cache Names:**
- `mediot-static-v1` - Static assets
- `mediot-dynamic-v1` - Dynamic content
- `mediot-api-v1` - API responses
- `mediot-images-v1` - Images

**Cache Configuration:**
```javascript
{
  maxAge: {
    static: 7 days,
    dynamic: 1 day,
    api: 5 minutes,
    images: 30 days
  },
  maxEntries: {
    dynamic: 50,
    api: 100,
    images: 200
  }
}
```

### Manifest

Location: `client/public/manifest.json`

**Key Features:**
- App name and description
- Icons (72x72 to 512x512)
- Theme colors
- Display mode: standalone
- Shortcuts to key features
- File handlers for images
- Share target for medicine images

### Custom Hooks

**usePWA:**
```javascript
const { 
  isInstallable,    // Can app be installed?
  isInstalled,      // Is app installed?
  isOnline,         // Online status
  installApp        // Trigger install prompt
} = usePWA();
```

**useStandalone:**
```javascript
const isStandalone = useStandalone(); // Running as installed app?
```

**useAppUpdate:**
```javascript
const { 
  updateAvailable,  // Is update available?
  updateApp         // Apply update
} = useAppUpdate();
```

**usePushNotifications:**
```javascript
const { 
  permission,       // Notification permission status
  subscription,     // Push subscription object
  isSubscribed,     // Is user subscribed?
  subscribe,        // Subscribe to notifications
  unsubscribe       // Unsubscribe
} = usePushNotifications();
```

### Offline Storage

Location: `client/src/utils/offlineStorage.js`

**IndexedDB Stores:**
- `medicines` - Medicine information
- `reminders` - Medication reminders
- `healthMetrics` - Health data
- `chatHistory` - Chat conversations
- `scanHistory` - Scan results
- `offlineQueue` - Pending sync actions

**Usage:**
```javascript
import { offlineStorage, STORES } from './utils/offlineStorage';

// Initialize
await offlineStorage.init();

// Add data
await offlineStorage.add(STORES.MEDICINES, medicineData);

// Get all data
const medicines = await offlineStorage.getAll(STORES.MEDICINES);

// Sync offline queue
await offlineStorage.syncOfflineQueue();
```

## Components

### InstallPrompt

Shows install prompt after 30 seconds if app is installable.

Location: `client/src/components/PWA/InstallPrompt.js`

### UpdatePrompt

Shows when new version is available.

Location: `client/src/components/PWA/UpdatePrompt.js`

### OfflineIndicator

Shows online/offline status banner.

Location: `client/src/components/PWA/OfflineIndicator.js`

## Testing PWA Features

### 1. Test Offline Mode

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Reload page - should show offline page or cached content

### 2. Test Install

**Desktop:**
1. Open app in Chrome/Edge
2. Look for install icon in address bar
3. Click to install
4. App opens in standalone window

**Mobile:**
1. Open app in Chrome (Android) or Safari (iOS)
2. Wait for install prompt or use browser menu
3. Add to home screen
4. Open from home screen

### 3. Test Service Worker

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Service Workers"
4. See registered service worker
5. Test "Update on reload" and "Bypass for network"

### 4. Test Cache

**Chrome DevTools:**
1. Application tab → Cache Storage
2. See all cache entries
3. Inspect cached files
4. Clear cache to test re-caching

### 5. Test Manifest

**Chrome DevTools:**
1. Application tab → Manifest
2. See all manifest properties
3. Test icon display
4. Check installability criteria

## Lighthouse PWA Audit

Run Lighthouse audit to check PWA compliance:

```bash
npm install -g lighthouse
lighthouse https://your-app-url --view
```

**Target Scores:**
- PWA: 100
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Install Prompt | ✅ | ❌ | ❌ | ✅ |
| Push Notifications | ✅ | ✅ | ❌ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |
| Offline Support | ✅ | ✅ | ✅ | ✅ |

## Troubleshooting

### Service Worker Not Registering

1. Check HTTPS (required for SW)
2. Check browser console for errors
3. Verify sw.js is accessible
4. Clear browser cache and reload

### Install Prompt Not Showing

1. Check manifest.json is valid
2. Verify all required icons exist
3. Ensure HTTPS is enabled
4. Check browser support
5. App must be visited at least once

### Offline Mode Not Working

1. Check service worker is active
2. Verify cache strategy
3. Check network tab for cached responses
4. Clear cache and re-cache

### Push Notifications Not Working

1. Check notification permission
2. Verify VAPID keys are set
3. Check browser support
4. Test with simple notification first

## Best Practices

1. **Always use HTTPS** - Required for service workers
2. **Keep service worker updated** - Increment version on changes
3. **Test offline thoroughly** - Ensure critical features work
4. **Optimize cache size** - Don't cache everything
5. **Handle errors gracefully** - Show helpful offline messages
6. **Update manifest** - Keep app info current
7. **Monitor performance** - Use Lighthouse regularly
8. **Test on real devices** - Emulators don't catch everything

## Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox](https://developers.google.com/web/tools/workbox) - Advanced SW library
