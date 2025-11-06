# Gemini AI Pill Identification Prompt

## Overview
This document contains the exact prompt used for pill identification with Gemini Vision API.

## Prompt Structure

The prompt is designed to:
1. Establish expert pharmaceutical context
2. Request structured JSON output
3. Analyze visual characteristics
4. Provide safety warnings
5. Include confidence scoring

## Full Prompt

```
You are a pharmaceutical expert specializing in pill identification. Analyze this pill image carefully.

Provide a JSON response with this EXACT structure:
{
  "identified": true/false,
  "confidence": 1-10,
  "medicineName": {
    "brandName": "brand/trade name if visible or identifiable",
    "genericName": "generic/chemical name if identifiable",
    "primaryName": "the most likely medicine name"
  },
  "physicalCharacteristics": {
    "shape": "detailed shape description (round, oval, capsule, etc.)",
    "color": "detailed color description",
    "size": "approximate size description",
    "imprint": "any text, numbers, or symbols visible on the pill",
    "scoring": "description of any score lines or divisions",
    "coating": "coated, uncoated, film-coated, etc."
  },
  "possibleMatches": [
    {
      "name": "medicine name",
      "strength": "dosage strength",
      "manufacturer": "manufacturer if identifiable",
      "matchConfidence": 1-10
    }
  ],
  "activeIngredients": ["list of active ingredients if identifiable"],
  "commonUses": ["common medical uses if identifiable"],
  "safetyWarning": "important safety information or warnings",
  "verificationNeeded": true/false,
  "reasoning": "detailed explanation of identification process and confidence level"
}

CRITICAL INSTRUCTIONS:
1. Carefully examine all visible markings, imprints, colors, and shapes
2. Provide confidence score based on clarity and distinctiveness of features
3. List multiple possible matches if uncertain
4. Always include safety warnings about proper identification
5. Set verificationNeeded to true if identification is uncertain
6. DO NOT make definitive claims if features are unclear
7. Recommend consulting a pharmacist for verification

SAFETY NOTICE: This is an AI-assisted identification tool. Always verify with a licensed pharmacist or healthcare provider before taking any medication.
```

## Response Format

### Example Response (High Confidence)
```json
{
  "identified": true,
  "confidence": 9,
  "medicineName": {
    "brandName": "Tylenol",
    "genericName": "Acetaminophen",
    "primaryName": "Tylenol"
  },
  "physicalCharacteristics": {
    "shape": "Oval caplet",
    "color": "White",
    "size": "Medium (approximately 18mm)",
    "imprint": "TYLENOL 500",
    "scoring": "None",
    "coating": "Film-coated"
  },
  "possibleMatches": [
    {
      "name": "Tylenol Extra Strength",
      "strength": "500mg",
      "manufacturer": "Johnson & Johnson",
      "matchConfidence": 9
    }
  ],
  "activeIngredients": ["Acetaminophen 500mg"],
  "commonUses": [
    "Pain relief",
    "Fever reduction",
    "Headache treatment"
  ],
  "safetyWarning": "Do not exceed 4000mg in 24 hours. May cause liver damage if taken with alcohol or in excessive amounts.",
  "verificationNeeded": false,
  "reasoning": "Clear imprint 'TYLENOL 500' visible on white oval caplet. Physical characteristics match Tylenol Extra Strength 500mg tablets. High confidence due to distinctive branding and clear markings."
}
```

### Example Response (Low Confidence)
```json
{
  "identified": false,
  "confidence": 3,
  "medicineName": {
    "brandName": null,
    "genericName": null,
    "primaryName": "Unable to identify with confidence"
  },
  "physicalCharacteristics": {
    "shape": "Round tablet",
    "color": "White",
    "size": "Small (approximately 8mm)",
    "imprint": "Partially visible, appears to be '44' or '144'",
    "scoring": "Single score line",
    "coating": "Uncoated"
  },
  "possibleMatches": [
    {
      "name": "Generic Aspirin",
      "strength": "81mg",
      "manufacturer": "Various",
      "matchConfidence": 3
    },
    {
      "name": "Generic Acetaminophen",
      "strength": "325mg",
      "manufacturer": "Various",
      "matchConfidence": 2
    }
  ],
  "activeIngredients": [],
  "commonUses": [],
  "safetyWarning": "Unable to identify pill with confidence. DO NOT take this medication without proper identification. Consult a pharmacist immediately.",
  "verificationNeeded": true,
  "reasoning": "Imprint is partially obscured or unclear. Generic white round tablet matches many common medications. Cannot make confident identification without clearer markings. Professional verification required."
}
```

## Key Elements

### 1. Confidence Scoring (1-10)
- **9-10**: Clear markings, distinctive features, high certainty
- **7-8**: Good visibility, recognizable characteristics
- **5-6**: Some features visible, moderate uncertainty
- **3-4**: Poor visibility, generic appearance
- **1-2**: Very unclear, cannot identify

### 2. Physical Characteristics
- **Shape**: Round, oval, capsule, oblong, diamond, etc.
- **Color**: Specific color description (white, blue, pink, etc.)
- **Size**: Small, medium, large with approximate measurements
- **Imprint**: Exact text, numbers, or symbols visible
- **Scoring**: None, single line, cross, etc.
- **Coating**: Film-coated, sugar-coated, uncoated, etc.

### 3. Safety Warnings
Always include:
- Dosage warnings
- Interaction warnings
- Storage requirements
- Verification recommendations
- Professional consultation advice

### 4. Verification Flag
Set `verificationNeeded: true` when:
- Confidence score < 7
- Imprints unclear or partially visible
- Generic appearance
- Multiple possible matches
- Any uncertainty in identification

## Prompt Optimization Tips

### For Better Results:
1. **Image Quality**: Ensure high-resolution, well-lit images
2. **Background**: Use contrasting background color
3. **Angle**: Capture from directly above
4. **Focus**: Ensure imprints are in focus
5. **Multiple Angles**: Consider multiple images for better accuracy

### Common Issues:
1. **Blurry Images**: Results in low confidence
2. **Poor Lighting**: May miss important details
3. **Partial Visibility**: Leads to uncertain identification
4. **Generic Pills**: Harder to identify without clear markings

## Integration Notes

The prompt is used in `server/services/geminiService.js`:
```javascript
async identifyPillFromImage(imagePath) {
  // ... image processing ...
  
  const prompt = `[PROMPT TEXT HERE]`;
  
  const result = await this.model.generateContent([prompt, imageData]);
  // ... response processing ...
}
```

## Testing the Prompt

To test prompt effectiveness:
1. Use various pill images (clear, blurry, different angles)
2. Check confidence scores match image quality
3. Verify safety warnings are always included
4. Ensure JSON parsing works correctly
5. Test with generic vs. branded pills
6. Validate verification flags are set appropriately

## Future Improvements

Potential prompt enhancements:
- Add multi-language support
- Include dosage form identification
- Add expiration date detection
- Include packaging information
- Cross-reference with FDA database
- Add interaction warnings
- Include storage requirements
