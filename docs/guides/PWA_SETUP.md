# PWA Setup Guide

## Quick Start

Your Mediot app now has PWA capabilities! Follow these steps to complete the setup.

## 1. Generate Icons

You need to generate PWA icons from your app logo.

### Option A: Using the Script (Recommended)

```bash
# Install sharp for image processing
npm install sharp --save-dev

# Generate icons from your logo
node scripts/generate-pwa-icons.js path/to/your/logo.png
```

This will generate all required icon sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- Shortcut icons for quick actions

### Option B: Manual Generation

Use an online tool like [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator):

1. Upload your logo (512x512 recommended)
2. Download generated icons
3. Place in `client/public/icons/` folder

Required icons:
```
client/public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
├── icon-512x512.png
├── scan-shortcut.png
├── sos-shortcut.png
├── chat-shortcut.png
└── reminder-shortcut.png
```

## 2. Configure Environment Variables

Add to your `.env` file:

```env
# PWA Configuration
REACT_APP_PWA_ENABLED=true

# Push Notifications (optional)
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key
REACT_APP_VAPID_PRIVATE_KEY=your_vapid_private_key
```

### Generate VAPID Keys (for Push Notifications)

```bash
npm install web-push --save-dev
npx web-push generate-vapid-keys
```

## 3. Update Manifest

Edit `client/public/manifest.json` if needed:

```json
{
  "name": "Your App Name",
  "short_name": "App",
  "description": "Your app description",
  "theme_color": "#2563eb",
  "background_color": "#ffffff"
}
```

## 4. Test PWA Features

### Local Testing

```bash
# Build production version
npm run build

# Serve with HTTPS (required for PWA)
npx serve -s build -l 3000 --ssl-cert cert.pem --ssl-key key.pem
```

### Generate Self-Signed Certificate (for local testing)

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### Test Checklist

- [ ] Service worker registers successfully
- [ ] App works offline
- [ ] Install prompt appears
- [ ] App can be installed
- [ ] Icons display correctly
- [ ] Offline page shows when no connection
- [ ] Cache updates properly
- [ ] Push notifications work (if enabled)

## 5. Deploy

### Vercel

```bash
# Deploy to Vercel
vercel --prod
```

Vercel automatically serves with HTTPS, perfect for PWA.

### Netlify

```bash
# Deploy to Netlify
netlify deploy --prod
```

### Custom Server

Ensure your server:
1. Serves over HTTPS
2. Serves `manifest.json` with correct MIME type
3. Serves `sw.js` with correct headers
4. Has proper CORS headers

## 6. Verify PWA

### Chrome DevTools

1. Open DevTools (F12)
2. Go to **Application** tab
3. Check **Manifest** - should show all properties
4. Check **Service Workers** - should be registered
5. Run **Lighthouse** audit - aim for 100 PWA score

### Online Tools

- [PWA Builder](https://www.pwabuilder.com/) - Test and validate
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Audit tool
- [Web.dev Measure](https://web.dev/measure/) - Performance check

## 7. Monitor

### Service Worker Updates

The app automatically checks for updates and prompts users. Monitor:
- Update adoption rate
- Service worker errors
- Cache hit rates

### Analytics

Track PWA-specific metrics:
- Install rate
- Offline usage
- Push notification engagement
- Standalone mode usage

## Troubleshooting

### Service Worker Not Registering

**Problem:** Console shows "Service Worker registration failed"

**Solutions:**
1. Ensure HTTPS is enabled
2. Check `sw.js` is accessible at `/sw.js`
3. Clear browser cache
4. Check for JavaScript errors

### Install Prompt Not Showing

**Problem:** No install prompt appears

**Solutions:**
1. Verify manifest.json is valid
2. Check all required icons exist
3. Visit site at least twice
4. Wait 30 seconds for auto-prompt
5. Check browser support (Chrome/Edge only)

### Offline Mode Not Working

**Problem:** App doesn't work offline

**Solutions:**
1. Check service worker is active
2. Verify cache strategy in sw.js
3. Test with DevTools offline mode
4. Check cached resources in Application tab

### Icons Not Displaying

**Problem:** Default icons show instead of custom ones

**Solutions:**
1. Verify icon paths in manifest.json
2. Check icons exist in public/icons/
3. Clear browser cache
4. Check icon file sizes and formats

## Advanced Configuration

### Custom Cache Strategy

Edit `client/public/sw.js` to customize caching:

```javascript
// Example: Cache API responses for 1 hour
const API_CACHE_TIME = 60 * 60 * 1000; // 1 hour
```

### Background Sync

Enable background sync for offline actions:

```javascript
// In your component
if ('serviceWorker' in navigator && 'sync' in registration) {
  await registration.sync.register('sync-offline-actions');
}
```

### Push Notifications

Set up push notifications:

```javascript
import { usePushNotifications } from './hooks/usePWA';

const { subscribe } = usePushNotifications();
await subscribe();
```

## Best Practices

1. **Test on Real Devices** - Emulators don't catch everything
2. **Monitor Performance** - Use Lighthouse regularly
3. **Update Service Worker** - Increment version on changes
4. **Handle Errors** - Show helpful offline messages
5. **Optimize Cache** - Don't cache everything
6. **Test Offline** - Ensure critical features work
7. **Update Manifest** - Keep app info current

## Resources

- [PWA Guide](./PWA_GUIDE.md) - Detailed feature documentation
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox](https://developers.google.com/web/tools/workbox) - Advanced SW library

## Support

For issues or questions:
1. Check the [PWA Guide](./PWA_GUIDE.md)
2. Review browser console for errors
3. Test with Lighthouse audit
4. Check service worker status in DevTools
