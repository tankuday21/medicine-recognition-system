# Debugging Pill Identifier

## Issue
After clicking photo, `pillInfo` is `undefined` in the scan result.

## What to Check

### 1. Check Browser Console
Open browser console (F12) and look for:
- ✅ "Processing pill image with Gemini AI"
- ✅ "Image data length: [number]"
- ✅ "Blob size: [number] type: image/jpeg"
- ✅ "Sending request to /api/scanner/pill..."
- ✅ "API Response status: [number]"
- ✅ "API Response data: [object]"

**If you see errors here, note them down.**

### 2. Check Server Console
Look at your server terminal for:
- ✅ "✅ Gemini AI service initialized with gemini-2.5-pro"
- ✅ "🔍 Processing pill image for identification with Gemini AI"
- ✅ "🤖 Sending pill identification request to Gemini..."
- ✅ "📝 Received pill identification response from Gemini"

**If you see errors here, note them down.**

### 3. Common Issues & Solutions

#### Issue: "GEMINI_API_KEY is required"
**Solution:**
```bash
cd server
# Check if .env has the key
cat .env | grep GEMINI_API_KEY
# Should show: GEMINI_API_KEY=AIzaSy...
```

#### Issue: API returns 500 error
**Possible causes:**
- Gemini API key is invalid
- Gemini API quota exceeded
- Network issue
- Image too large

**Check:**
1. Verify API key at: https://makersuite.google.com/app/apikey
2. Check API quota/billing
3. Check image size (should be < 10MB)

#### Issue: Request times out
**Solution:**
- Check internet connection
- Gemini API might be slow (can take 10-15 seconds)
- Increase timeout if needed

#### Issue: "Failed to parse JSON response"
**Solution:**
- Gemini might be returning non-JSON
- Check server logs for raw response
- API might be rate-limited

### 4. Manual API Test

Test the API directly using curl:

```bash
# Create a test image file (or use an existing one)
# Then test the endpoint:

curl -X POST http://localhost:3001/api/scanner/pill \
  -F "image=@path/to/pill-image.jpg" \
  -H "Content-Type: multipart/form-data"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "type": "pill",
    "confidence": 85,
    "pillInfo": {
      "identified": true,
      "medicineName": {...},
      ...
    }
  },
  "message": "Pill identified successfully"
}
```

### 5. Check Network Tab

In browser DevTools:
1. Open Network tab (F12 → Network)
2. Capture a pill image
3. Look for request to `/api/scanner/pill`
4. Check:
   - Request payload (should have image file)
   - Response status (should be 200)
   - Response body (should have pillInfo)

### 6. Verify Server is Running

```bash
# Check if server is running on correct port
curl http://localhost:3001/api/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

### 7. Check Gemini Service

Test Gemini service directly:

```bash
# In server directory
node -e "
const gemini = require('./services/geminiService');
console.log('Gemini service loaded:', !!gemini);
"
```

Should not throw errors.

### 8. Enable Detailed Logging

Add more logging to see what's happening:

**In `server/services/scannerService.js`:**
```javascript
console.log('📸 Image buffer size:', imageBuffer.length);
console.log('📸 Processed image size:', processedImage.size);
console.log('📸 Temp image path:', tempImagePath);
console.log('📸 Calling Gemini service...');
```

**In `server/services/geminiService.js`:**
```javascript
console.log('🔍 Image path:', imagePath);
console.log('🔍 Image data prepared');
console.log('🔍 Sending to Gemini API...');
console.log('🔍 Raw response:', text);
```

### 9. Test with Simple Image

Try with a very simple, clear pill image:
- High resolution
- Good lighting
- Clear imprints
- White background
- Single pill

### 10. Check Error Object

In browser console, when error occurs:
```javascript
// The error object should show:
{
  pillInfo: undefined,
  medicineInfo: { found: false, ... }
}
```

Look at the `error` property for details.

## Quick Fix Checklist

- [ ] Server is running (port 3001)
- [ ] Client is running (port 3000)
- [ ] GEMINI_API_KEY is in server/.env
- [ ] API key is valid (test at Google AI Studio)
- [ ] Internet connection is working
- [ ] Image is < 10MB
- [ ] Image is valid format (JPEG, PNG, GIF, WebP)
- [ ] No errors in server console
- [ ] No errors in browser console
- [ ] Network request completes (check Network tab)
- [ ] Response has pillInfo object

## Expected Flow

1. User captures image ✅
2. Image converted to blob ✅
3. FormData created with image ✅
4. POST request to /api/scanner/pill ✅
5. Server receives image ✅
6. Server processes image ✅
7. Server calls Gemini API ⚠️ (This is where it might fail)
8. Gemini returns analysis ⚠️
9. Server returns response ⚠️
10. Client receives response ⚠️
11. Client navigates to results page ✅

**Focus on steps 7-10 - that's where the issue likely is.**

## Debugging Commands

```bash
# Check server logs
cd server
npm start | tee server.log

# In another terminal, check the log
tail -f server.log

# Test Gemini API key
curl https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

## Next Steps

1. **Check browser console** - Look for the detailed logs we added
2. **Check server console** - Look for Gemini API errors
3. **Test API key** - Verify it works at Google AI Studio
4. **Check network tab** - See the actual API response
5. **Try simple image** - Use a very clear pill photo
6. **Check API quota** - Make sure you haven't exceeded limits

## Contact Support

If issue persists, provide:
- Browser console logs
- Server console logs
- Network tab screenshot
- API response (if any)
- Image size and format
- Steps to reproduce

---

**Most likely cause:** Gemini API call is failing or timing out. Check server logs first!
