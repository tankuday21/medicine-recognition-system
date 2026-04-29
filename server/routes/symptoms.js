const express = require('express');
const { auth } = require('../middleware/auth');
const symptomCheckerService = require('../services/symptomCheckerService');

const router = express.Router();

// ─── Fuzzy matching helper (Levenshtein distance) ───
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

// Search symptoms (with fuzzy matching for typos)
router.get('/search', async (req, res) => {
  try {
    const { q: query, bodyPart } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid query',
        message: 'Search query must be at least 2 characters long'
      });
    }

    // First try exact search
    const result = symptomCheckerService.searchSymptoms(query.trim(), bodyPart);

    // If no results, try fuzzy matching
    if (result.success && result.data.length === 0) {
      const searchTerm = query.trim().toLowerCase();
      const allSymptoms = Object.entries(symptomCheckerService.symptoms);
      const fuzzyResults = [];

      allSymptoms.forEach(([key, symptom]) => {
        const nameLower = symptom.name.toLowerCase();
        // Check Levenshtein distance for each word
        const queryWords = searchTerm.split(/\s+/);
        const nameWords = nameLower.split(/\s+/);

        let bestDistance = Infinity;
        for (const qw of queryWords) {
          for (const nw of nameWords) {
            const dist = levenshtein(qw, nw);
            bestDistance = Math.min(bestDistance, dist);
          }
          // Also check against the key
          const keyDist = levenshtein(qw, key.replace(/_/g, ''));
          bestDistance = Math.min(bestDistance, keyDist);
        }

        // Allow up to 2 character difference for short words, 3 for longer
        const threshold = searchTerm.length <= 4 ? 2 : 3;
        if (bestDistance <= threshold) {
          fuzzyResults.push({
            id: key,
            ...symptom,
            _fuzzyDistance: bestDistance
          });
        }
      });

      // Sort by closest match
      fuzzyResults.sort((a, b) => a._fuzzyDistance - b._fuzzyDistance);
      result.data = fuzzyResults.slice(0, 10).map(({ _fuzzyDistance, ...rest }) => rest);
    }

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({ error: 'Search failed', message: result.message });
    }
  } catch (error) {
    console.error('Symptom search error:', error);
    res.status(500).json({ error: 'Search failed', message: 'Internal server error' });
  }
});

// AI-powered symptom search (handles natural language, typos, related suggestions)
router.post('/ai-search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Query too short' });
    }

    let geminiService;
    try { geminiService = require('../services/geminiService'); } catch(e) {}

    if (!geminiService) {
      return res.json({ success: true, data: [] });
    }

    const prompt = `You are a medical symptom search assistant for a health app. The user typed: "${query.trim()}"

This may contain spelling mistakes, abbreviations, or natural language descriptions.

Your job:
1. Identify what medical symptom(s) the user is trying to search for
2. Suggest related symptoms they might also be experiencing
3. Handle any spelling mistakes gracefully

Return ONLY a valid JSON array of symptoms (max 8). Each symptom object must have:
- "id": snake_case identifier (e.g., "headache", "chest_pain")
- "name": Human-readable name (e.g., "Headache", "Chest Pain")
- "category": One of: general, neurological, respiratory, cardiovascular, gastrointestinal, musculoskeletal, dermatological, ent, ophthalmological
- "bodyParts": Array of body areas (e.g., ["head"], ["chest", "throat"])
- "isRelated": true if this is a related suggestion, false if it directly matches the query

Example response:
[{"id":"headache","name":"Headache","category":"neurological","bodyParts":["head"],"isRelated":false}]

RESPOND WITH ONLY THE JSON ARRAY. No markdown, no code fences, no explanation.`;

    let aiResult = null;

    // Try DeepSeek (SambaNova) first as requested
    if (geminiService.sambaNovaClients && geminiService.sambaNovaClients.length > 0) {
      for (let i = 0; i < geminiService.sambaNovaClients.length; i++) {
        try {
          const completion = await geminiService.sambaNovaClients[i].chat.completions.create({
            model: geminiService.sambaNovaModel || 'DeepSeek-V3.1',
            messages: [
              { role: 'system', content: 'You are a medical symptom search assistant. Always respond with valid JSON only.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 1024
          });
          let text = completion.choices[0].message.content;
          text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
          aiResult = JSON.parse(text);
          if (aiResult) break;
        } catch (dsErr) {
          console.log(`⚠️ DeepSeek key ${i + 1} failed for AI symptom search:`, dsErr.message);
        }
      }
    }

    // Fallback to Gemini if DeepSeek fails
    if (!aiResult) {
      try {
        const result = await geminiService.generateContentWithFallback(prompt);
        const response = await result.response;
        let text = response.text().replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        aiResult = JSON.parse(text);
      } catch (geminiErr) {
        console.error('Gemini fallback for AI symptom search failed:', geminiErr.message);
      }
    }

    if (aiResult && Array.isArray(aiResult)) {
      // Validate and clean results
      const cleaned = aiResult
        .filter(s => s.id && s.name)
        .map(s => ({
          id: s.id,
          name: s.name,
          category: s.category || 'general',
          bodyParts: s.bodyParts || ['general'],
          isAISuggestion: true,
          isRelated: s.isRelated || false
        }));
      return res.json({ success: true, data: cleaned });
    }

    res.json({ success: true, data: [] });
  } catch (error) {
    console.error('AI symptom search error:', error);
    res.json({ success: true, data: [] }); // Fail silently, return empty
  }
});

// Search for pre-existing conditions using AI
router.post('/search-conditions', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    let geminiService;
    try { geminiService = require('../services/geminiService'); } catch(e) {}

    if (!geminiService) return res.json({ success: true, data: [] });

    const prompt = `User is searching for their pre-existing medical conditions: "${query.trim()}"

Return a JSON array of up to 5 matching or related medical conditions. 
Each must have:
- "key": snake_case (e.g. "type_2_diabetes")
- "label": Proper Name (e.g. "Type 2 Diabetes")

RESPOND WITH ONLY THE JSON ARRAY.`;

    let aiResult = null;

    // Try DeepSeek (SambaNova) first as requested
    if (geminiService.sambaNovaClients && geminiService.sambaNovaClients.length > 0) {
      for (let i = 0; i < geminiService.sambaNovaClients.length; i++) {
        try {
          const completion = await geminiService.sambaNovaClients[i].chat.completions.create({
            model: geminiService.sambaNovaModel || 'DeepSeek-V3.1',
            messages: [
              { role: 'system', content: 'You are a medical condition search assistant. Always respond with valid JSON only.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 512
          });
          let text = completion.choices[0].message.content;
          text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
          aiResult = JSON.parse(text);
          if (aiResult) break;
        } catch (dsErr) {
          console.log(`⚠️ DeepSeek key ${i + 1} failed for condition search:`, dsErr.message);
        }
      }
    }

    // Fallback to Gemini if DeepSeek fails
    if (!aiResult) {
      try {
        const result = await geminiService.generateContentWithFallback(prompt);
        const response = await result.response;
        let text = response.text().replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        aiResult = JSON.parse(text);
      } catch (err) {
        console.error('Gemini fallback for condition search failed:', err.message);
      }
    }

    res.json({ success: true, data: Array.isArray(aiResult) ? aiResult : [] });
  } catch (error) {
    console.error('Condition search error:', error);
    res.json({ success: true, data: [] });
  }
});

// Get body parts
router.get('/body-parts', async (req, res) => {
  try {
    const result = symptomCheckerService.getBodyParts();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Failed to get body parts',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Get body parts error:', error);
    res.status(500).json({
      error: 'Failed to get body parts',
      message: 'Internal server error'
    });
  }
});

// Get symptoms by body part
router.get('/body-parts/:bodyPart', async (req, res) => {
  try {
    const { bodyPart } = req.params;
    const result = symptomCheckerService.getSymptomsByBodyPart(bodyPart);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Failed to get symptoms',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Get symptoms by body part error:', error);
    res.status(500).json({
      error: 'Failed to get symptoms',
      message: 'Internal server error'
    });
  }
});

// Analyze symptoms (requires authentication for tracking)
router.post('/analyze', auth, async (req, res) => {
  try {
    const { symptoms, age, gender, medicalHistory, notes } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        error: 'Invalid symptoms',
        message: 'Please provide at least one symptom'
      });
    }

    console.log(`🩺 AI Analyzing symptoms for user: ${req.user._id}`);

    // Try AI-powered analysis (Gemini first, DeepSeek fallback)
    let geminiService;
    try { geminiService = require('../services/geminiService'); } catch(e) { console.error('GeminiService not available'); }

    if (geminiService) {
      try {
        const symptomList = symptoms.map(s => `${s.name} (severity: ${s.severity}, duration: ${s.duration})`).join(', ');
        const conditionsList = medicalHistory && medicalHistory.length > 0 ? medicalHistory.join(', ') : 'none reported';

        const prompt = `You are a clinical decision support assistant for a health app called Mediot. Analyze these patient-reported symptoms using structured medical reasoning. This is NOT a diagnosis — it is educational health information only.

PATIENT CASE:
- Age Group: ${age || 'not specified'}
- Gender: ${gender || 'not specified'}
- Pre-existing Conditions: ${conditionsList}
- Additional Notes: ${notes || 'none'}
- Reported Symptoms: ${symptomList}

INSTRUCTIONS — Follow EACH step carefully:

1. CLINICAL SUMMARY: Summarize the chief complaint. Identify any alarming patterns or red flags.

2. DIFFERENTIAL DIAGNOSIS: Provide 3-5 ranked possible conditions. For EACH condition include:
   - "condition": Name of the condition
   - "probability": A percentage (0-100) reflecting how well symptoms match
   - "severity": "mild", "moderate", or "critical"
   - "reasoning": 1-2 sentences explaining WHY this condition fits
   - "distinguishing_factors": What would confirm OR rule out this condition
   - "selfCare": Array of 3-4 evidence-based home care tips (empty array for critical conditions)
   - "seeDoctor": When to see a doctor for this specific condition

3. EMERGENCY CHECK: Set "hasEmergencySymptoms" to true ONLY if symptoms suggest stroke, heart attack, severe allergic reaction, or other immediate life threats.

4. FOLLOW-UP QUESTIONS: Suggest 2-3 questions a doctor would ask to narrow the diagnosis further.

5. GENERAL ADVICE: 2-3 general wellness recommendations.

RESPOND ONLY WITH VALID JSON matching this exact schema (no markdown, no code fences, just raw JSON):
{
  "clinicalSummary": "string",
  "conditions": [
    {
      "condition": "string",
      "probability": number,
      "severity": "mild|moderate|critical",
      "reasoning": "string",
      "distinguishing_factors": "string",
      "selfCare": ["string"],
      "seeDoctor": "string"
    }
  ],
  "hasEmergencySymptoms": boolean,
  "recommendSeekCare": boolean,
  "criticalSymptoms": [],
  "followUpQuestions": ["string"],
  "generalAdvice": ["string"],
  "analysisDate": "${new Date().toISOString()}"
}`;

        // Try Gemini first
        let aiResult = null;
        try {
          console.log('🤖 Trying Gemini AI...');
          const result = await geminiService.generateContentWithFallback(prompt);
          const response = await result.response;
          let text = response.text().replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
          aiResult = JSON.parse(text);
          console.log('✅ Gemini AI analysis successful');
        } catch (geminiErr) {
          console.log('⚠️ Gemini failed, trying DeepSeek...', geminiErr.message);
          // Fallback to DeepSeek via SambaNova clients
          if (geminiService.sambaNovaClients && geminiService.sambaNovaClients.length > 0) {
            for (let i = 0; i < geminiService.sambaNovaClients.length; i++) {
              try {
                console.log(`🔄 Trying SambaNova Key ${i + 1}...`);
                const completion = await geminiService.sambaNovaClients[i].chat.completions.create({
                  model: geminiService.sambaNovaModel || 'DeepSeek-V3.1',
                  messages: [
                    { role: 'system', content: 'You are a medical AI assistant. Always respond with valid JSON only. No markdown, no code fences.' },
                    { role: 'user', content: prompt }
                  ],
                  temperature: 0.3
                });
                let text = completion.choices[0].message.content;
                text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
                aiResult = JSON.parse(text);
                console.log(`✅ DeepSeek analysis successful (key ${i + 1})`);
                break;
              } catch (dsErr) {
                console.log(`⚠️ SambaNova Key ${i + 1} failed:`, dsErr.message);
              }
            }
          }
        }

        if (aiResult) {
          // Ensure required fields exist
          aiResult.analysisDate = aiResult.analysisDate || new Date().toISOString();
          aiResult.conditions = aiResult.conditions || [];
          aiResult.hasEmergencySymptoms = aiResult.hasEmergencySymptoms || false;
          aiResult.recommendSeekCare = aiResult.recommendSeekCare || false;
          aiResult.criticalSymptoms = aiResult.criticalSymptoms || [];

          console.log(`📊 AI Analysis completed: ${aiResult.conditions.length} conditions found`);
          return res.json({ success: true, data: aiResult });
        }
      } catch (aiError) {
        console.error('AI analysis error:', aiError.message);
      }
    }

    // Fallback to hardcoded analysis
    console.log('⚠️ Falling back to hardcoded analysis');
    const result = symptomCheckerService.analyzeSymptoms(symptoms);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({ error: 'Analysis failed', message: result.message });
    }
  } catch (error) {
    console.error('Symptom analysis error:', error);
    res.status(500).json({ error: 'Analysis failed', message: 'Internal server error' });
  }
});

// Get service status
router.get('/status', async (req, res) => {
  try {
    const status = symptomCheckerService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get symptom checker status error:', error);
    res.status(500).json({
      error: 'Failed to get status',
      message: 'Internal server error'
    });
  }
});

module.exports = router;