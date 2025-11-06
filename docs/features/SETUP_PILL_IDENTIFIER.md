# Quick Setup Guide - Pill Identifier with Gemini AI

## Prerequisites
- Node.js installed
- Existing MediOT application
- Google account for Gemini API key

## Step-by-Step Setup

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variable

**Option A: Using .env file (Recommended)**
```bash
cd server
echo "GEMINI_API_KEY=your-actual-api-key-here" >> .env
```

**Option B: Manual edit**
1. Open `server/.env` in a text editor
2. Add or update the line:
   ```
   GEMINI_API_KEY=your-actual-api-key-here
   ```
3. Save the file

### 3. Install Dependencies (if needed)

The required packages should already be installed, but verify:

```bash
cd server
npm install @google/generative-ai sharp multer fs-extra
```

### 4. Restart the Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
```

### 5. Verify Setup

**Check server logs for:**
```
✅ Gemini AI service initialized with gemini-2.5-pro
```

**Test the endpoint:**
```bash
# Windows PowerShell
curl http://localhost:3001/api/health
```

### 6. Test Pill Identifier

1. Open the application in browser: `http://localhost:3000`
2. Navigate to "Scanner" page
3. Click "Pill Identifier"
4. Either:
   - Take a photo using camera
   - Upload an existing pill image
5. Wait for AI processing
6. Review the identification results

## Verification Checklist

- [ ] Gemini API key obtained
- [ ] API key added to `server/.env`
- [ ] Server restarted successfully
- [ ] No errors in server console
- [ ] Can access Scanner page
- [ ] Pill Identifier option visible
- [ ] Can capture/upload images
- [ ] Results display after processing
- [ ] Confidence scores shown
- [ ] Safety warnings displayed

## Troubleshooting

### Error: "GEMINI_API_KEY is required"
**Solution:**
1. Check `server/.env` file exists
2. Verify API key is on a line: `GEMINI_API_KEY=your-key`
3. No spaces around the `=` sign
4. No quotes around the key
5. Restart server after adding

### Error: "AI service unavailable"
**Solution:**
1. Verify API key is valid (test at Google AI Studio)
2. Check internet connection
3. Review server logs for specific error
4. Ensure Gemini API is enabled in Google Cloud Console

### Error: "Failed to process pill image"
**Solution:**
1. Check image file size (< 10MB)
2. Verify image format (JPEG, PNG, GIF, WebP)
3. Ensure image is not corrupted
4. Try a different image

### Low confidence scores
**Solution:**
1. Retake photo with better lighting
2. Ensure pill imprints are clearly visible
3. Use contrasting background
4. Take photo from directly above
5. Keep camera steady and focused

### No results displayed
**Solution:**
1. Check browser console for errors (F12)
2. Verify network request completed (Network tab)
3. Check server logs for processing errors
4. Ensure client is connected to server

## Testing with Sample Images

### Good Test Images:
- Clear, well-lit photos
- Visible imprints/markings
- Contrasting background
- Focused and sharp
- Taken from above

### Poor Test Images (for error handling):
- Blurry photos
- Poor lighting
- No visible markings
- Multiple pills
- Partial visibility

## Configuration Options

### Adjust Image Processing (optional)

Edit `server/services/scannerService.js`:

```javascript
// Change max image size (default 10MB)
this.maxImageSize = 10 * 1024 * 1024;

// Change resize dimensions (default 1920x1080)
processedImage = image.resize(1920, 1080, {
  fit: 'inside',
  withoutEnlargement: true
});

// Change JPEG quality (default 85)
.jpeg({ quality: 85 })
```

### Adjust Gemini Model (optional)

Edit `server/services/geminiService.js`:

```javascript
// Change model (default: gemini-2.5-pro)
this.model = this.genAI.getGenerativeModel({ 
  model: 'gemini-2.5-pro'  // or 'gemini-1.5-pro'
});
```

## API Usage and Costs

### Gemini API Pricing
- Check current pricing: https://ai.google.dev/pricing
- Free tier available with limits
- Monitor usage in Google Cloud Console

### Optimize Usage:
1. Implement caching for repeated images
2. Add rate limiting
3. Compress images before sending
4. Use appropriate model (pro vs. flash)

## Security Considerations

### Protect API Key:
1. Never commit `.env` file to git
2. Use environment variables in production
3. Rotate keys periodically
4. Monitor for unauthorized usage

### Add to `.gitignore`:
```
server/.env
.env
*.env
```

## Production Deployment

### Environment Variables:
Set on your hosting platform:
- Heroku: `heroku config:set GEMINI_API_KEY=your-key`
- Vercel: Add in project settings
- AWS: Use Parameter Store or Secrets Manager
- Docker: Use secrets or env files

### Health Checks:
Monitor endpoint: `GET /api/health`

### Logging:
Review logs for:
- API errors
- Processing times
- Confidence scores
- User feedback

## Next Steps

After setup:
1. Test with various pill images
2. Gather user feedback
3. Monitor API usage and costs
4. Adjust confidence thresholds if needed
5. Consider adding pill database fallback
6. Implement caching for common pills
7. Add analytics for identification accuracy

## Support Resources

- **Gemini API Docs**: https://ai.google.dev/docs
- **Google AI Studio**: https://makersuite.google.com
- **Project Documentation**: See PILL_IDENTIFIER_GEMINI.md
- **Prompt Details**: See GEMINI_PILL_PROMPT.md
- **Changes Log**: See PILL_IDENTIFIER_CHANGES.md

## Quick Commands Reference

```bash
# Navigate to server
cd server

# Check if API key is set
echo $env:GEMINI_API_KEY  # Windows PowerShell
echo $GEMINI_API_KEY      # Linux/Mac

# Start server
npm start

# View logs
npm start | tee server.log

# Test API endpoint
curl http://localhost:3001/api/health

# Check server status
curl http://localhost:3001/api/test-gemini
```

## Success Indicators

You'll know it's working when:
- ✅ Server starts without errors
- ✅ "Gemini AI service initialized" in logs
- ✅ Can upload pill images
- ✅ Results appear within 5-10 seconds
- ✅ Confidence scores displayed
- ✅ Physical characteristics shown
- ✅ Safety warnings present
- ✅ No console errors

## Getting Help

If you encounter issues:
1. Check server logs first
2. Review browser console (F12)
3. Verify API key is valid
4. Test with simple pill image
5. Check network connectivity
6. Review documentation files
7. Check Gemini API status page

---

**Ready to test!** Follow the steps above and your pill identifier should be working with Gemini AI. 🎉
