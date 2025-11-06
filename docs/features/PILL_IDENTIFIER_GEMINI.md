# Pill Identifier with Gemini AI Integration

## Overview
The pill identifier feature now uses Google's Gemini AI Vision API to identify pills from images. This provides intelligent, AI-powered pill identification with detailed information about the medicine.

## Features

### 1. AI-Powered Identification
- Uses Gemini Vision API to analyze pill images
- Identifies pills based on:
  - Shape and color
  - Imprints and markings
  - Size and coating
  - Physical characteristics

### 2. Detailed Information
The system provides:
- **Medicine Name**: Brand name, generic name, and primary name
- **Physical Characteristics**: Shape, color, size, imprint, scoring, coating
- **Active Ingredients**: List of active pharmaceutical ingredients
- **Common Uses**: Medical conditions the medicine treats
- **Possible Matches**: Alternative matches if identification is uncertain
- **Safety Warnings**: Important safety information
- **Confidence Score**: 1-10 scale indicating identification certainty

### 3. Safety Features
- Verification recommendations for uncertain identifications
- Safety warnings and disclaimers
- Recommendation to consult pharmacist for verification
- Clear confidence scoring

## How It Works

### Client Side (Scanner.js)
1. User captures pill image using camera
2. Image is sent to backend API endpoint `/api/scanner/pill`
3. Results are displayed with detailed information

### Server Side (scannerService.js)
1. Receives image from client
2. Processes and optimizes image
3. Saves temporary image file
4. Calls Gemini AI service for identification
5. Returns structured pill information

### Gemini Service (geminiService.js)
1. Reads image file
2. Sends to Gemini Vision API with detailed prompt
3. Receives AI analysis in JSON format
4. Parses and validates response
5. Returns structured pill data

## API Endpoint

### POST `/api/scanner/pill`
**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Image file (JPEG, PNG, GIF, WebP)
- Headers: Authorization (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "pill",
    "confidence": 85,
    "pillInfo": {
      "identified": true,
      "medicineName": {
        "brandName": "Tylenol",
        "genericName": "Acetaminophen",
        "primaryName": "Tylenol"
      },
      "physicalCharacteristics": {
        "shape": "Oval",
        "color": "White",
        "imprint": "TYLENOL 500",
        "size": "Medium",
        "scoring": "None",
        "coating": "Film-coated"
      },
      "activeIngredients": ["Acetaminophen 500mg"],
      "commonUses": ["Pain relief", "Fever reduction"],
      "possibleMatches": [],
      "safetyWarning": "Do not exceed recommended dosage",
      "verificationNeeded": false
    }
  },
  "message": "Pill identified successfully"
}
```

## Configuration

### Environment Variables
Add to `server/.env`:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

### Getting Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to your `.env` file

## Usage

### For Users
1. Navigate to Scanner page
2. Select "Pill Identifier"
3. Take a clear photo of the pill
4. View AI-generated identification results
5. Verify with pharmacist if recommended

### Best Practices for Scanning
- Use good lighting
- Place pill on contrasting background
- Ensure imprints are visible
- Take photo from directly above
- Keep camera steady
- Clean the pill if dusty

## Safety Disclaimers

⚠️ **Important Safety Information:**
- This is an AI-assisted tool, not a replacement for professional advice
- Always verify pill identity with a licensed pharmacist
- Never take medication you cannot positively identify
- Consult healthcare provider before taking any medication
- AI identification may not be 100% accurate

## Error Handling

The system handles various error scenarios:
- **No Gemini API Key**: Falls back to error message
- **Image Processing Error**: Returns error with details
- **AI Service Unavailable**: Provides fallback response
- **Parse Error**: Returns structured error data
- **Low Confidence**: Flags for manual verification

## Future Enhancements

Potential improvements:
- Multi-image analysis for better accuracy
- Integration with FDA pill database
- Barcode scanning for packaged medicines
- History of identified pills
- Interaction checking with user's medications
- Offline pill database for common medicines

## Testing

To test the pill identifier:
1. Ensure Gemini API key is configured
2. Start the server: `npm start` in server directory
3. Start the client: `npm start` in client directory
4. Navigate to Scanner → Pill Identifier
5. Upload or capture a pill image
6. Verify results are displayed correctly

## Troubleshooting

### "AI service unavailable"
- Check Gemini API key is set in `.env`
- Verify API key is valid
- Check internet connection
- Review server logs for errors

### "Failed to identify pill"
- Ensure image is clear and well-lit
- Check pill imprints are visible
- Try different angle or lighting
- Verify image file is valid format

### Low confidence scores
- Retake photo with better lighting
- Ensure imprints are clearly visible
- Try multiple angles
- Consult pharmacist for verification

## Dependencies

Required npm packages:
- `@google/generative-ai` - Gemini AI SDK
- `sharp` - Image processing
- `multer` - File upload handling
- `fs-extra` - File system operations

## License & Attribution

This feature uses Google's Gemini AI API. Please review Google's terms of service and usage policies.
