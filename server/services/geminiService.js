require('dotenv').config();
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const nvidiaService = require('./nvidiaService');

class GeminiService {
  constructor() {
    console.log('[DEBUG-STARTUP] process.env.SAMBANOVA_API_KEY present:', !!process.env.SAMBANOVA_API_KEY);
    console.log('[DEBUG-STARTUP] process.env.AI_MODEL:', process.env.AI_MODEL);
    console.log('🔑 Gemini API Key present:', !!process.env.GEMINI_API_KEY);

    if (!process.env.GEMINI_API_KEY) {
      console.error('[ERROR] GEMINI_API_KEY is required');
      throw new Error('GEMINI_API_KEY is required');
    }

    try {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      // Primary and Backup Models as requested by user
      this.models = [
        'models/gemini-3.1-flash-lite-preview',
        'models/gemini-3.1-pro',
        'models/gemini-3.1-flash',
        'models/gemini-3.0-pro',
        'models/gemini-2.5-pro'
      ];

      this.currentModelIndex = 0;
      this.safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ];

      // Initialize with the primary model
      this.initModel(this.models[0]);

      // Initialize SambaNova clients for faster chat (Multi-Key Rotation)
      this.sambaNovaClients = [];
      const sambaKeys = [
        process.env.SAMBANOVA_API_KEY, 
        process.env.SAMBANOVA_API_KEY_2, 
        process.env.SAMBANOVA_API_KEY_3
      ].filter(Boolean);
      
      sambaKeys.forEach((key, index) => {
        try {
          const client = new OpenAI({
            apiKey: key,
            baseURL: "https://api.sambanova.ai/v1",
          });
          this.sambaNovaClients.push(client);
          console.log(`[INFO] SambaNova client ${index + 1} initialized.`);
        } catch (e) {
          console.error(`[ERROR] Failed to init SambaNova client ${index + 1}:`, e.message);
        }
      });

      this.sambaNovaModel = process.env.AI_MODEL || 'DeepSeek-V3.1';
      
      // Smart API: State tracking for clients
      this.clientStates = this.sambaNovaClients.map(() => ({
        disabledUntil: 0
      }));
      
      // Start proactive health check service (Disabled as requested)
      // this.startHealthCheck();
    } catch (error) {
      console.error('[ERROR] Failed to initialize Gemini AI service:', error);
      throw error;
    }
  }

  initModel(modelName) {
    console.log(`[INFO] Initializing Gemini model: ${modelName}`);
    this.model = this.genAI.getGenerativeModel({
      model: modelName,
      safetySettings: this.safetySettings,
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 1,
        maxOutputTokens: 8192,
      }
    });
  }

  /**
   * Helper to format mixed parts (strings, images) for the SDK
   */
  _formatParts(args) {
    if (!Array.isArray(args)) args = [args];
    return args.map(arg => {
      if (typeof arg === 'string') return { text: arg };
      // If it has inlineData, it's already a Part object
      return arg;
    });
  }

  /**
   * Helper to generate content with model fallback
   */
  async generateContentWithFallback(promptArgs, options = {}) {
    // Try NVIDIA first as requested by user
    try {
      console.log(`[INFO] Attempting generation with NVIDIA (${nvidiaService.model})...`);
      
      // Convert promptArgs to NVIDIA messages format
      let messages = [];
      if (typeof promptArgs === 'string') {
        messages = [{ role: 'user', content: promptArgs }];
      } else if (Array.isArray(promptArgs)) {
        const content = promptArgs.map(arg => {
          if (typeof arg === 'string') return { type: 'text', text: arg };
          if (arg.inlineData) return { 
            type: 'image_url', 
            image_url: { url: `data:${arg.inlineData.mimeType};base64,${arg.inlineData.data}` } 
          };
          return null;
        }).filter(Boolean);
        messages = [{ role: 'user', content }];
      }

      const nvidiaResult = await nvidiaService.client.chat.completions.create({
        model: nvidiaService.model,
        messages: messages,
        temperature: options.generationConfig?.temperature || 0.2,
        max_tokens: options.generationConfig?.maxOutputTokens || 4096,
      });

      // Wrap in a result object compatible with the rest of the code
      return {
        response: {
          text: () => nvidiaResult.choices[0].message.content
        }
      };
    } catch (nvidiaError) {
      console.warn('[WARN] NVIDIA failed in generateContentWithFallback, falling back to Gemini:', nvidiaError.message);
    }

    for (let i = 0; i < this.models.length; i++) {
      const modelName = this.models[i];
      try {
        if (i > 0) this.initModel(modelName); // Switch model if not first attempt

        console.log(`[INFO] Attempting generation with ${modelName}...`);

        // Prepare request
        let request = promptArgs;
        if (options && options.generationConfig) {
          // If config is provided, we must use the object format for generateContent
          // promptArgs is expected to be [prompt, image] or similar array of parts
          // We need to ensure it's in the format expected by 'contents' if strictly required, 
          // but the SDK often is flexible. However, strictly:
          // request = { contents: [{ role: 'user', parts: ... }], generationConfig: ... }
          // To be safe and simple: pass options as 2nd arg? No, SDK method signature: generateContent(request)

          // Construct the request object merging content and config
          request = {
            contents: [{ role: 'user', parts: this._formatParts(promptArgs) }],
            generationConfig: options.generationConfig
          };
        }

        const result = await this.model.generateContent(request);
        return result; // Success!
      } catch (error) {
        console.warn(`[WARN] Failed with ${modelName}:`, error.message);

        // If it's the last model, throw the error
        if (i === this.models.length - 1) {
          console.error('[ERROR] All fallback models failed.');
          throw error;
        }
        console.log(`[INFO] Switching to backup model...`);
      }
    }
  }

  /**
   * Summarize a batch of news articles using DeepSeek (via SambaNova) or Gemini
   * @param {Array} articles - Array of article objects { title, description, content }
   * @returns {Object} Summarized articles
   */
  async summarizeNewsBatch(articles) {
    try {
      console.log(`[AI-NEWS] Summarizing ${articles.length} news articles with AI (NVIDIA Primary)...`);

      const articlesText = articles.slice(0, 10).map((a, i) => 
        `Article ${i + 1}:\nTitle: ${a.title}\nDescription: ${a.description || ''}\nContent: ${a.content || ''}`
      ).join('\n\n---\n\n');

      const prompt = `
        You are a premium medical news editor. I will provide you with a list of ${articles.length} news articles.
        Your task is to create an extremely concise, "one-liner" summary for each one (strictly between 5 to 8 words).
        
        Style Guidelines:
        1. Ultra-Short: Must be between 5 and 8 words maximum.
        2. Impactful: Capture only the most critical "bottom line" health takeaway.
        3. Professional: Keep it medical but very punchy.
        4. Mobile-First: Designed for quick scanning on a phone screen.

        Return ONLY a JSON array of strings, where each string corresponds to the summary of the article at that index.
        Example: ["New antibody shows promise in Alzheimer's treatment.", "FDA approves faster acting diabetes insulin drug.", "Daily exercise reduces heart disease risk significantly."]

        Articles:
        ${articlesText}
      `;

      let summaries = null;
      let usedFallback = false;

      // Try NVIDIA first as requested by user
      try {
        console.log(`[AI-NEWS] Attempting summarization with NVIDIA (${nvidiaService.model})...`);
        const nvidiaResult = await nvidiaService.client.chat.completions.create({
          model: nvidiaService.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 4096,
          // Disable thinking/reasoning to get clean JSON
          reasoning_budget: 0,
          chat_template_kwargs: {"enable_thinking": false}
        });
        const responseText = nvidiaResult.choices[0].message.content;
        summaries = this._extractJsonArray(responseText);
        
        if (summaries && summaries.length > 0) {
          console.log(`[AI-NEWS] Summarization successful with NVIDIA (${summaries.length} articles)`);
        } else {
          console.warn(`[AI-NEWS] NVIDIA returned empty or invalid summaries, falling back...`);
          summaries = null; // Trigger fallback
        }
      } catch (nvidiaError) {
        console.warn(`[AI-NEWS] NVIDIA failed for summarization, falling back to SambaNova/Gemini:`, nvidiaError.message);
        
        // Try each SambaNova client in rotation
        if (this.sambaNovaClients && this.sambaNovaClients.length > 0) {
          for (let i = 0; i < this.sambaNovaClients.length; i++) {
            // Check if key is currently disabled
            if (Date.now() < this.clientStates[i].disabledUntil) {
              console.log(`[AI-NEWS] Skipping SambaNova Key ${i + 1} (Cooldown: ${Math.round((this.clientStates[i].disabledUntil - Date.now()) / 60000)}m remaining)`);
              if (i === this.sambaNovaClients.length - 1) {
                console.warn(`[AI-NEWS] All SambaNova keys are on cooldown, falling back to Gemini.`);
                usedFallback = true;
              }
              continue;
            }

            try {
              console.log(`[AI-NEWS] Using SambaNova Key ${i + 1} (${this.sambaNovaModel})...`);
              const completion = await this.sambaNovaClients[i].chat.completions.create({
                model: this.sambaNovaModel,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1
              });
              const responseText = completion.choices[0].message.content;
              summaries = this._extractJsonArray(responseText);
              if (summaries && summaries.length > 0) break; // Success!
              summaries = null; // Reset for next attempt or fallback
            } catch (sambaError) {
              console.warn(`[AI-NEWS] SambaNova Key ${i + 1} failed:`, sambaError.message);
              
              // If rate limited, disable for 1 hour
              if (sambaError.status === 429) {
                this._disableKey(i, 3600000);
              }

              if (i === this.sambaNovaClients.length - 1) {
                console.warn(`[AI-NEWS] All SambaNova keys failed, falling back to Gemini.`);
                usedFallback = true;
              }
            }
          }
        } else {
          usedFallback = true;
        }
      }

      if (usedFallback || !summaries || summaries.length === 0) {
        console.log(`[AI-NEWS] Using Gemini for summarization...`);
        const result = await this.generateContentWithFallback(prompt);
        const response = await result.response;
        summaries = this._extractJsonArray(response.text());
      }

      console.log(`[AI-NEWS] Successfully summarized ${summaries.length} articles`);
      return { success: true, data: summaries };

    } catch (error) {
      console.error('[AI-NEWS] Summarization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper to extract JSON array from text
   */
  _extractJsonArray(text) {
    try {
      if (!text) return [];
      
      // Remove potential markdown code blocks
      let cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      
      // Remove <thought> tags if present
      cleanedText = cleanedText.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();

      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.warn('[WARN] JSON array parse failed, attempting deep clean:', parseError.message);
          // Try to clean trailing commas and other common issues
          const deepCleaned = jsonMatch[0]
            .replace(/,\s*\]/g, ']')
            .replace(/,\s*}/g, '}')
            .replace(/'/g, '"');
          try {
            return JSON.parse(deepCleaned);
          } catch (e) {
             console.error('[ERROR] Deep clean also failed');
          }
        }
      }
      
      console.warn('[WARN] No JSON array found in response, falling back to line splitting');
      // Fallback: split by lines if it looks like a list
      return text.split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove leading numbers
        .filter(line => line.length > 20 && !line.startsWith('{') && !line.startsWith('['))
        .slice(0, 10);
    } catch (e) {
      console.error('[ERROR] JSON array extraction failed:', e.message);
      return [];
    }
  }

  /**
   * Quick medicine name verification using Gemini Vision API
   * @param {string} imagePath - Path to the uploaded image
   * @returns {Object} Quick verification result with medicine name only
   */
  async quickMedicineVerification(imagePath) {
    try {
      console.log('[INFO] Starting quick medicine name verification...');

      // Read image file
      let imageData;
      if (imagePath.startsWith('data:')) {
        // Handle base64 data URLs
        imageData = imagePath;
      } else {
        // Handle file paths
        const imageBuffer = await fs.readFile(imagePath);
        const mimeType = this.getMimeType(imagePath);
        imageData = {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType
          }
        };
      }

      // Quick verification prompt focused on medicine name identification
      const prompt = `
        You are a pharmaceutical expert. Look at this medicine image and provide ONLY the medicine name identification.

        Provide a JSON response with this EXACT structure:
        {
          "identified": true/false,
          "confidence": 1-10,
          "medicineName": {
            "brandName": "primary brand/trade name if visible",
            "genericName": "generic/chemical name if identifiable",
            "primaryName": "the most prominent name visible on the medicine"
          },
          "quickIdentification": {
            "shape": "basic shape description",
            "color": "basic color description",
            "visibleText": ["key text visible on medicine"],
            "markings": "main imprints or markings"
          },
          "verificationNeeded": true/false,
          "reasoning": "brief explanation of identification"
        }

        CRITICAL INSTRUCTIONS:
        1. Focus ONLY on identifying the medicine name
        2. Extract the most prominent medicine name visible
        3. Provide confidence score based on name clarity
        4. Keep response concise and fast
        5. Set verificationNeeded to true if identification is uncertain
      `;

      // Generate content with image and prompt
      console.log('[INFO]🤖 Sending quick verification request to NVIDIA...');
      let text = '';
      try {
        const base64Data = imagePath.startsWith('data:') 
          ? imagePath.split(',')[1] 
          : (await fs.readFile(imagePath)).toString('base64');
        const mimeType = imagePath.startsWith('data:') 
          ? imagePath.split(';')[0].split(':')[1] 
          : this.getMimeType(imagePath);

        const nvidiaResult = await nvidiaService.client.chat.completions.create({
          model: nvidiaService.model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 4096,
        });
        text = nvidiaResult.choices[0].message.content;
        console.log('[INFO] Received quick verification response from NVIDIA');
      } catch (nvidiaError) {
        console.warn('[WARN] NVIDIA vision failed, falling back to Gemini:', nvidiaError.message);
        console.log('[INFO]🤖 Sending quick verification request to Gemini...');
        const result = await this.model.generateContent([prompt, imageData]);
        const response = await result.response;
        text = response.text();
        console.log('[INFO] Received quick verification response from Gemini');
      }

      // Parse JSON response
      const verificationData = this._extractJson(text, {
        identified: false,
        confidence: 1,
        medicineName: {
          brandName: null,
          genericName: null,
          primaryName: null
        },
        quickIdentification: {
          shape: null,
          color: null,
          visibleText: [],
          markings: null
        }
      });

      console.log('[INFO][SUCCESS] Quick medicine verification completed');

      return {
        success: true,
        data: verificationData,
        rawResponse: text
      };

    } catch (error) {
      console.error('[ERROR] Quick verification error:', error);

      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Quick medicine name verification using multiple images
   * @param {string[]} imagePaths - Array of paths to uploaded images
   * @returns {Object} Quick verification result with medicine name from multiple sources
   */
  async quickMultiMedicineVerification(imagePaths) {
    try {
      console.log(`[INFO] Starting multi-image medicine name verification with ${imagePaths.length} images...`);

      // Process each image for verification
      const imageAnalyses = [];

      for (let i = 0; i < imagePaths.length; i++) {
        const imagePath = imagePaths[i];
        console.log(`[INFO] Processing image ${i + 1}/${imagePaths.length}: ${imagePath}`);

        // Read image file
        let imageData;
        if (imagePath.startsWith('data:')) {
          imageData = imagePath;
        } else {
          const imageBuffer = await fs.readFile(imagePath);
          const mimeType = this.getMimeType(imagePath);
          imageData = {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType: mimeType
            }
          };
        }

        imageAnalyses.push({
          imageIndex: i,
          imageData: imageData,
          imagePath: imagePath,
          imageLabel: i === 0 ? 'Front' : i === 1 ? 'Back' : 'Side'
        });
      }

      // Multi-image verification prompt
      const prompt = `
        You are a pharmaceutical expert analyzing ${imagePaths.length} images of the same medicine from different angles.

        Images provided:
        ${imageAnalyses.map(img => `- Image ${img.imageIndex + 1} (${img.imageLabel}): Different angle/side of the medicine`).join('\n')}

        Analyze ALL images together and provide a consolidated medicine identification.

        Provide a JSON response with this EXACT structure:
        {
          "identified": true/false,
          "confidence": 1-10,
          "medicineName": {
            "brandName": "primary brand/trade name found across images",
            "genericName": "generic/chemical name found across images",
            "primaryName": "the most prominent name visible across all images"
          },
          "quickIdentification": {
            "shape": "consolidated shape description",
            "color": "consolidated color description",
            "visibleText": ["all key text visible across all images"],
            "markings": "all imprints or markings found"
          },
          "imageContributions": {
            "image1": "what information this image provided",
            "image2": "what information this image provided",
            "image3": "what information this image provided (if exists)"
          },
          "verificationNeeded": true/false,
          "reasoning": "explanation of how multiple images helped identification",
          "dataQuality": {
            "completeness": 1-10,
            "consistency": 1-10,
            "conflictingInfo": ["any conflicting information found between images"]
          }
        }

        CRITICAL INSTRUCTIONS:
        1. Cross-reference information from ALL images
        2. Prioritize consistent information found across multiple images
        3. Note any conflicting information between images
        4. Provide higher confidence if multiple images confirm the same medicine
        5. Extract the most complete medicine name from all available sources
        6. Keep response focused on name identification for user verification
      `;

      // Generate content with all images and prompt
      console.log(`[INFO]🤖 Sending multi-image verification request to NVIDIA...`);
      let text = '';
      try {
        const nvidiaContent = [{ type: "text", text: prompt }];
        
        for (const imgAnalysis of imageAnalyses) {
          const imagePath = imgAnalysis.imagePath;
          const base64Data = imagePath.startsWith('data:') 
            ? imagePath.split(',')[1] 
            : (await fs.readFile(imagePath)).toString('base64');
          const mimeType = imagePath.startsWith('data:') 
            ? imagePath.split(';')[0].split(':')[1] 
            : this.getMimeType(imagePath);
            
          nvidiaContent.push({
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`,
            },
          });
        }

        const nvidiaResult = await nvidiaService.client.chat.completions.create({
          model: nvidiaService.model,
          messages: [
            {
              role: "user",
              content: nvidiaContent,
            },
          ],
          max_tokens: 4096,
        });
        text = nvidiaResult.choices[0].message.content;
        console.log('[INFO] Received multi-image verification response from NVIDIA');
      } catch (nvidiaError) {
        console.warn('[WARN] NVIDIA multi-vision failed, falling back to Gemini:', nvidiaError.message);
        console.log(`[INFO]🤖 Sending multi-image verification request to Gemini...`);
        const imageDataArray = imageAnalyses.map(img => img.imageData);
        const result = await this.model.generateContent([prompt, ...imageDataArray]);
        const response = await result.response;
        text = response.text();
        console.log('[INFO] Received multi-image verification response from Gemini');
      }

      // Parse JSON response
      const verificationData = this._extractJson(text, {
        identified: false,
        confidence: 1,
        medicineName: {
          brandName: null,
          genericName: null,
          primaryName: null
        },
        quickIdentification: {
          shape: null,
          color: null,
          visibleText: [],
          markings: null
        },
        imageContributions: {},
        verificationNeeded: true,
        reasoning: "Failed to parse multi-image AI response",
        dataQuality: {
          completeness: 1,
          consistency: 1,
          conflictingInfo: []
        }
      });

      // Add metadata about the multi-image analysis
      verificationData.multiImageAnalysis = {
        totalImages: imagePaths.length,
        imageLabels: imageAnalyses.map(img => img.imageLabel),
        analysisType: 'multi_image_verification'
      };

      console.log('[INFO][SUCCESS] Multi-image medicine verification completed');

      return {
        success: true,
        data: verificationData,
        rawResponse: text
      };

    } catch (error) {
      console.error('[ERROR] Multi-image verification error:', error);

      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Get comprehensive medicine details using Gemini after user verification
   * @param {string} imagePath - Path to the uploaded image
   * @param {string} verifiedMedicineName - User-verified medicine name
   * @returns {Object} Comprehensive analysis result
   */
  async getComprehensiveMedicineDetails(imagePath, verifiedMedicineName) {
    try {
      console.log('[INFO] Starting comprehensive medicine analysis...');

      // Read image file
      let imageData;
      if (imagePath.startsWith('data:')) {
        imageData = imagePath;
      } else {
        const imageBuffer = await fs.readFile(imagePath);
        const mimeType = this.getMimeType(imagePath);
        imageData = {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType
          }
        };
      }

      // Comprehensive prompt with verified medicine name
      const prompt = `
        You are a pharmaceutical expert analyzing a medicine image. The user has verified this medicine is: "${verifiedMedicineName}"

        Using this verified name, provide comprehensive medicine information from the image and your knowledge.
        Focus on finding ALL details from multiple reliable sources and websites.

        Provide a comprehensive JSON response with this EXACT structure:
        {
          "identified": true,
          "confidence": 9,
          "verifiedName": "${verifiedMedicineName}",
          "medicine": {
            "brandName": "complete brand/trade name",
            "genericName": "generic/chemical name",
            "activeIngredients": ["list all active ingredients with amounts"],
            "inactiveIngredients": ["list all inactive ingredients"],
            "strength": "complete strength information",
            "dosageForm": "tablet/capsule/liquid/injection/cream/etc",
            "route": "oral/topical/injection/etc",
            "ndc": "National Drug Code if visible or known",
            "manufacturer": "manufacturer name",
            "distributedBy": "distributor if different",
            "therapeuticClass": "drug class"
          },
          "comprehensiveInfo": {
            "indication": "what condition it treats",
            "mechanism": "how the medicine works",
            "pharmacokinetics": "absorption, distribution, metabolism, excretion",
            "dosageInstructions": "detailed dosing information",
            "contraindications": ["when not to use"],
            "warnings": ["important warnings"],
            "sideEffects": ["common and serious side effects"],
            "drugInteractions": ["important drug interactions"],
            "pregnancyCategory": "pregnancy safety category",
            "storageInstructions": "how to store properly"
          },
          "manufacturingInfo": {
            "lotNumber": "lot/batch number from image",
            "expirationDate": "expiration date from image",
            "manufacturingDate": "mfg date if visible",
            "facilityCode": "facility code if visible",
            "upc": "UPC barcode if visible"
          },
          "physicalCharacteristics": {
            "shape": "detailed shape description",
            "color": "detailed color description",
            "size": "size measurements if visible",
            "markings": "ALL imprints, scores, embossing",
            "coating": "coating type",
            "packaging": "bottle/blister/box/tube/etc"
          },
          "extractedText": {
            "allText": ["every piece of visible text"],
            "drugNames": ["all drug names found"],
            "warnings": ["warning text found"],
            "directions": ["usage directions found"],
            "codes": ["all codes/numbers found"]
          },
          "dataSourcesUsed": ["list of reliable medical websites and databases consulted"],
          "reasoning": "detailed explanation of comprehensive analysis"
        }

        CRITICAL INSTRUCTIONS:
        1. Use the verified medicine name to provide accurate information
        2. Search your knowledge of reliable medical databases and websites
        3. Include information from FDA, RxList, WebMD, Drugs.com, DailyMed
        4. Extract ALL visible text and markings from the image
        5. Provide comprehensive medical information for healthcare use
        6. Be extremely thorough - this is for medical verification
      `;

      // Generate comprehensive content
      console.log('[INFO]🤖 Sending comprehensive analysis request to NVIDIA...');
      let text = '';
      try {
        const base64Data = imagePath.startsWith('data:') 
          ? imagePath.split(',')[1] 
          : (await fs.readFile(imagePath)).toString('base64');
        const mimeType = imagePath.startsWith('data:') 
          ? imagePath.split(';')[0].split(':')[1] 
          : this.getMimeType(imagePath);

        const nvidiaResult = await nvidiaService.client.chat.completions.create({
          model: nvidiaService.model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 4096,
        });
        text = nvidiaResult.choices[0].message.content;
        console.log('[INFO] Received comprehensive response from NVIDIA');
      } catch (nvidiaError) {
        console.warn('[WARN] NVIDIA vision failed, falling back to Gemini:', nvidiaError.message);
        console.log('[INFO]🤖 Sending comprehensive analysis request to Gemini...');
        const result = await this.model.generateContent([prompt, imageData]);
        const response = await result.response;
        text = response.text();
        console.log('[INFO] Received comprehensive response from Gemini');
      }

      // Parse JSON response
      const analysisData = this._extractJson(text, this.createComprehensiveFallbackResponse(text, verifiedMedicineName));

      // Validate and enhance response
      analysisData = this.validateAndEnhanceResponse(analysisData);

      console.log('[SUCCESS] Comprehensive medicine analysis completed');

      return {
        success: true,
        data: analysisData,
        rawResponse: text
      };

    } catch (error) {
      console.error('[ERROR] Comprehensive analysis error:', error);

      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Get comprehensive medicine details using multiple images
   * @param {string[]} imagePaths - Array of paths to uploaded images
   * @param {string} verifiedMedicineName - User-verified medicine name
   * @returns {Object} Comprehensive analysis result from multiple images
   */
  async getMultiComprehensiveMedicineDetails(imagePaths, verifiedMedicineName) {
    try {
      console.log(`[INFO] Starting multi-image comprehensive analysis for: ${verifiedMedicineName}`);

      // Process each image
      const imageAnalyses = [];

      for (let i = 0; i < imagePaths.length; i++) {
        const imagePath = imagePaths[i];
        console.log(`[INFO] Processing image ${i + 1}/${imagePaths.length}: ${imagePath}`);

        // Read image file
        let imageData;
        if (imagePath.startsWith('data:')) {
          imageData = imagePath;
        } else {
          const imageBuffer = await fs.readFile(imagePath);
          const mimeType = this.getMimeType(imagePath);
          imageData = {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType: mimeType
            }
          };
        }

        imageAnalyses.push({
          imageIndex: i,
          imageData: imageData,
          imagePath: imagePath,
          imageLabel: i === 0 ? 'Front' : i === 1 ? 'Back' : 'Side'
        });
      }

      // Multi-image comprehensive prompt
      const prompt = `
        You are a pharmaceutical expert analyzing ${imagePaths.length} images of the verified medicine: "${verifiedMedicineName}"

        Images provided:
        ${imageAnalyses.map(img => `- Image ${img.imageIndex + 1} (${img.imageLabel}): Different angle/side of the medicine`).join('\n')}

        Using the verified medicine name and ALL images, provide the most comprehensive medicine information possible.
        Cross-reference and combine information from all images to create a complete profile.

        Provide a comprehensive JSON response with this EXACT structure:
        {
          "identified": true,
          "confidence": 9,
          "verifiedName": "${verifiedMedicineName}",
          "medicine": {
            "brandName": "complete brand/trade name from all images",
            "genericName": "generic/chemical name from all images",
            "activeIngredients": ["all active ingredients with amounts from all images"],
            "inactiveIngredients": ["all inactive ingredients from all images"],
            "strength": "complete strength information from all images",
            "dosageForm": "tablet/capsule/liquid/injection/cream/etc",
            "route": "oral/topical/injection/etc",
            "ndc": "National Drug Code if visible",
            "manufacturer": "manufacturer name from any image",
            "distributedBy": "distributor if different",
            "therapeuticClass": "drug class"
          },
          "comprehensiveInfo": {
            "indication": "what condition it treats",
            "mechanism": "how the medicine works",
            "pharmacokinetics": "absorption, distribution, metabolism, excretion",
            "dosageInstructions": "detailed dosing information from all images",
            "contraindications": ["when not to use"],
            "warnings": ["all warnings from all images"],
            "sideEffects": ["common and serious side effects"],
            "drugInteractions": ["important drug interactions"],
            "pregnancyCategory": "pregnancy safety category",
            "storageInstructions": "how to store properly from all images"
          },
          "manufacturingInfo": {
            "lotNumber": "lot/batch number from any image",
            "expirationDate": "expiration date from any image",
            "manufacturingDate": "mfg date if visible",
            "facilityCode": "facility code if visible",
            "upc": "UPC barcode if visible"
          },
          "physicalCharacteristics": {
            "shape": "detailed shape description from all angles",
            "color": "detailed color description from all angles",
            "size": "size measurements if visible",
            "markings": "ALL imprints, scores, embossing from all images",
            "coating": "coating type",
            "packaging": "bottle/blister/box/tube/etc"
          },
          "extractedText": {
            "allText": ["every piece of visible text from all images"],
            "drugNames": ["all drug names found across images"],
            "warnings": ["warning text found across images"],
            "directions": ["usage directions found across images"],
            "codes": ["all codes/numbers found across images"]
          },
          "imageContributions": {
            "image1": {
              "label": "${imageAnalyses[0]?.imageLabel}",
              "contributedInfo": ["specific information extracted from this image"]
            },
            "image2": {
              "label": "${imageAnalyses[1]?.imageLabel}",
              "contributedInfo": ["specific information extracted from this image"]
            },
            "image3": {
              "label": "${imageAnalyses[2]?.imageLabel}",
              "contributedInfo": ["specific information extracted from this image"]
            }
          },
          "dataQuality": {
            "completeness": 1-10,
            "consistency": 1-10,
            "conflictingInfo": ["any conflicting information between images"],
            "verificationLevel": "multi_image_verified"
          },
          "dataSourcesUsed": ["Gemini AI Multi-Image Analysis", "Cross-referenced visual data"],
          "reasoning": "detailed explanation of multi-image comprehensive analysis"
        }

        CRITICAL INSTRUCTIONS:
        1. Use the verified medicine name as the authoritative identification
        2. Extract and combine ALL visible information from every image
        3. Cross-reference data between images for accuracy
        4. Note which specific image contributed each piece of information
        5. Provide the most complete medical information possible
        6. Flag any inconsistencies between images
        7. Be extremely thorough - this is for comprehensive medical verification
      `;

      // Generate comprehensive content with all images
      console.log('[INFO]🤖 Sending multi-image comprehensive analysis request to Gemini...');
      const imageDataArray = imageAnalyses.map(img => img.imageData);
      const result = await this.model.generateContent([prompt, ...imageDataArray]);
      const response = await result.response;
      const text = response.text();
      console.log('[INFO] Received multi-image comprehensive response from Gemini');

      // Parse JSON response
      let analysisData;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.warn('[WARN] Failed to parse multi-image comprehensive JSON, creating fallback...');
        analysisData = this.createMultiComprehensiveFallbackResponse(text, verifiedMedicineName, imageAnalyses);
      }

      // Validate and enhance response
      analysisData = this.validateAndEnhanceResponse(analysisData);

      // Add multi-image metadata
      analysisData.multiImageAnalysis = {
        totalImages: imagePaths.length,
        imageLabels: imageAnalyses.map(img => img.imageLabel),
        analysisType: 'multi_image_comprehensive'
      };

      console.log('[SUCCESS] Multi-image comprehensive medicine analysis completed');

      return {
        success: true,
        data: analysisData,
        rawResponse: text
      };

    } catch (error) {
      console.error('[ERROR] Multi-image comprehensive analysis error:', error);

      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Create multi-image comprehensive fallback response when JSON parsing fails
   */
  createMultiComprehensiveFallbackResponse(text, verifiedMedicineName, imageAnalyses) {
    return {
      identified: true,
      confidence: 5,
      verifiedName: verifiedMedicineName,
      medicine: {
        brandName: verifiedMedicineName,
        genericName: null,
        activeIngredients: [],
        inactiveIngredients: [],
        strength: null,
        dosageForm: null,
        route: null,
        ndc: null,
        manufacturer: null,
        distributedBy: null,
        therapeuticClass: null
      },
      comprehensiveInfo: {
        indication: null,
        mechanism: null,
        pharmacokinetics: null,
        dosageInstructions: null,
        contraindications: [],
        warnings: [],
        sideEffects: [],
        drugInteractions: [],
        pregnancyCategory: null,
        storageInstructions: null
      },
      manufacturingInfo: {
        lotNumber: null,
        expirationDate: null,
        manufacturingDate: null,
        facilityCode: null,
        upc: null
      },
      physicalCharacteristics: {
        shape: null,
        color: null,
        size: null,
        markings: null,
        coating: null,
        packaging: null
      },
      extractedText: {
        allText: [],
        drugNames: [verifiedMedicineName],
        warnings: [],
        directions: [],
        codes: []
      },
      imageContributions: imageAnalyses.reduce((acc, img) => {
        acc[`image${img.imageIndex + 1}`] = {
          label: img.imageLabel,
          contributedInfo: ['Failed to parse AI response']
        };
        return acc;
      }, {}),
      dataQuality: {
        completeness: 3,
        consistency: 3,
        conflictingInfo: [],
        verificationLevel: 'multi_image_fallback'
      },
      dataSourcesUsed: ['Gemini AI Multi-Image Analysis (Fallback)'],
      reasoning: "Failed to parse multi-image comprehensive AI response",
      rawAnalysis: text
    };
  }

  /**
   * Analyze medicine image using Gemini Vision API (Legacy method for backward compatibility)
   * @param {string} imagePath - Path to the uploaded image
   * @returns {Object} Analysis result with medicine information
   */
  async analyzeMedicineImage(imagePath) {
    try {
      console.log('[INFO] Starting Gemini Vision analysis...');

      // Read image file
      let imageData;
      if (imagePath.startsWith('data:')) {
        // Handle base64 data URLs
        imageData = imagePath;
      } else {
        // Handle file paths
        const imageBuffer = await fs.readFile(imagePath);
        const mimeType = this.getMimeType(imagePath);
        imageData = {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType
          }
        };
      }

      // Comprehensive prompt for detailed medicine analysis
      const prompt = `
        You are a pharmaceutical expert analyzing a medicine image. Extract ALL possible information with maximum detail and accuracy.

        Provide a comprehensive JSON response with this EXACT structure:
        {
          "identified": true/false,
          "confidence": 1-10,
          "medicine": {
            "brandName": "complete brand/trade name",
            "genericName": "generic/chemical name",
            "activeIngredients": ["list all active ingredients with amounts"],
            "inactiveIngredients": ["list all inactive ingredients if visible"],
            "strength": "complete strength information",
            "dosageForm": "tablet/capsule/liquid/injection/cream/etc",
            "route": "oral/topical/injection/etc",
            "ndc": "National Drug Code if visible",
            "manufacturer": "manufacturer name",
            "distributedBy": "distributor if different from manufacturer",
            "therapeuticClass": "drug class if identifiable"
          },
          "manufacturingInfo": {
            "lotNumber": "lot/batch number",
            "expirationDate": "expiration date",
            "manufacturingDate": "mfg date if visible",
            "facilityCode": "facility code if visible",
            "upc": "UPC barcode if visible",
            "serialNumber": "serial number if visible"
          },
          "physicalCharacteristics": {
            "shape": "detailed shape description",
            "color": "detailed color description",
            "size": "size measurements if visible",
            "markings": "ALL imprints, scores, embossing",
            "coating": "coating type if visible",
            "packaging": "bottle/blister/box/tube/etc",
            "packagingMaterial": "plastic/glass/aluminum/etc",
            "packagingSize": "package size/count"
          },
          "extractedText": {
            "allText": ["every piece of visible text"],
            "drugNames": ["all drug names found"],
            "warnings": ["warning text found"],
            "directions": ["usage directions found"],
            "ingredients": ["ingredient text found"],
            "codes": ["all codes/numbers found"]
          },
          "prescribingInfo": {
            "indication": "what condition it treats if visible",
            "dosage": "dosing information if visible",
            "frequency": "how often to take if visible",
            "duration": "treatment duration if visible",
            "specialInstructions": "special instructions if visible"
          },
          "safetyInfo": {
            "warnings": ["all warning text"],
            "contraindications": ["contraindication text if visible"],
            "sideEffects": ["side effect text if visible"],
            "drugInteractions": ["interaction warnings if visible"],
            "pregnancyCategory": "pregnancy category if visible",
            "storageInstructions": "storage requirements if visible"
          },
          "regulatoryInfo": {
            "fdaApprovalDate": "approval date if visible",
            "rxOnly": true/false,
            "controlledSubstance": "schedule if controlled",
            "blackBoxWarning": "black box warning text if present"
          },
          "reasoning": "detailed explanation of identification process",
          "alternatives": ["possible alternative identifications"],
          "analysisWarnings": ["any concerns about identification accuracy"],
          "recommendedVerification": ["suggested verification steps"]
        }

        CRITICAL INSTRUCTIONS:
        1. Extract EVERY piece of visible text, no matter how small
        2. Identify ALL markings, imprints, scores, and physical features
        3. Look for NDC numbers, lot numbers, expiration dates carefully
        4. Identify manufacturer information and regulatory markings
        5. Extract any dosing, warning, or instruction text
        6. Be extremely thorough - this is for healthcare purposes
        7. If uncertain about any detail, note it in analysisWarnings
        8. Provide confidence score based on clarity and completeness of identification
      `;

      // Generate content with image and prompt
      console.log('[INFO]🤖 Sending request to Gemini...');
      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();
      console.log('[INFO] Received response from Gemini');

      console.log('[INFO] Raw Gemini response received');

      // Parse JSON response
      let analysisData;
      try {
        // Extract JSON from response (in case there's additional text)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.warn('[WARN] Failed to parse JSON response, creating structured response...');
        analysisData = this.createFallbackResponse(text);
      }

      // Validate and enhance response
      analysisData = this.validateAndEnhanceResponse(analysisData);

      console.log('[SUCCESS] Gemini analysis completed successfully');

      return {
        success: true,
        data: analysisData,
        rawResponse: text
      };

    } catch (error) {
      console.error('[ERROR] Gemini analysis error:', error);

      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Get MIME type from file extension
   */
  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  /**
   * Create comprehensive fallback response when JSON parsing fails
   */
  createComprehensiveFallbackResponse(text, verifiedMedicineName) {
    return {
      identified: true,
      confidence: 5,
      verifiedName: verifiedMedicineName,
      medicine: {
        brandName: verifiedMedicineName,
        genericName: null,
        activeIngredients: [],
        inactiveIngredients: [],
        strength: null,
        dosageForm: null,
        route: null,
        ndc: null,
        manufacturer: null,
        distributedBy: null,
        therapeuticClass: null
      },
      comprehensiveInfo: {
        indication: null,
        mechanism: null,
        pharmacokinetics: null,
        dosageInstructions: null,
        contraindications: [],
        warnings: [],
        sideEffects: [],
        drugInteractions: [],
        pregnancyCategory: null,
        storageInstructions: null
      },
      manufacturingInfo: {
        lotNumber: null,
        expirationDate: null,
        manufacturingDate: null,
        facilityCode: null,
        upc: null
      },
      physicalCharacteristics: {
        shape: null,
        color: null,
        size: null,
        markings: null,
        coating: null,
        packaging: null
      },
      extractedText: {
        allText: [],
        drugNames: [verifiedMedicineName],
        warnings: [],
        directions: [],
        codes: []
      },
      dataSourcesUsed: [],
      reasoning: "Failed to parse comprehensive AI response",
      rawAnalysis: text
    };
  }

  /**
   * Create fallback response when JSON parsing fails
   */
  createFallbackResponse(text) {
    return {
      identified: false,
      confidence: 1,
      medicine: {
        brandName: null,
        genericName: null,
        strength: null,
        dosageForm: null,
        ndc: null,
        manufacturer: null
      },
      physicalCharacteristics: {
        shape: null,
        color: null,
        size: null,
        markings: null,
        packaging: null
      },
      extractedText: [],
      expirationDate: null,
      lotNumber: null,
      reasoning: "Failed to parse structured response from AI analysis",
      alternatives: [],
      warnings: ["Could not properly analyze the image"],
      rawAnalysis: text
    };
  }

  /**
   * Validate and enhance the comprehensive AI response
   */
  validateAndEnhanceResponse(data) {
    // Comprehensive default structure
    const defaultStructure = {
      identified: false,
      confidence: 1,
      medicine: {
        brandName: null,
        genericName: null,
        activeIngredients: [],
        inactiveIngredients: [],
        strength: null,
        dosageForm: null,
        route: null,
        ndc: null,
        manufacturer: null,
        distributedBy: null,
        therapeuticClass: null
      },
      manufacturingInfo: {
        lotNumber: null,
        expirationDate: null,
        manufacturingDate: null,
        facilityCode: null,
        upc: null,
        serialNumber: null
      },
      physicalCharacteristics: {
        shape: null,
        color: null,
        size: null,
        markings: null,
        coating: null,
        packaging: null,
        packagingMaterial: null,
        packagingSize: null
      },
      extractedText: {
        allText: [],
        drugNames: [],
        warnings: [],
        directions: [],
        ingredients: [],
        codes: []
      },
      prescribingInfo: {
        indication: null,
        dosage: null,
        frequency: null,
        duration: null,
        specialInstructions: null
      },
      safetyInfo: {
        warnings: [],
        contraindications: [],
        sideEffects: [],
        drugInteractions: [],
        pregnancyCategory: null,
        storageInstructions: null
      },
      regulatoryInfo: {
        fdaApprovalDate: null,
        rxOnly: false,
        controlledSubstance: null,
        blackBoxWarning: null
      },
      reasoning: "",
      alternatives: [],
      analysisWarnings: [],
      recommendedVerification: []
    };

    // Deep merge with defaults
    const result = this.deepMerge(defaultStructure, data || {});

    // Validate confidence score
    if (typeof result.confidence !== 'number' || result.confidence < 1 || result.confidence > 10) {
      result.confidence = 1;
    }

    // Ensure arrays are arrays
    this.ensureArrays(result, [
      'medicine.activeIngredients',
      'medicine.inactiveIngredients',
      'extractedText.allText',
      'extractedText.drugNames',
      'extractedText.warnings',
      'extractedText.directions',
      'extractedText.ingredients',
      'extractedText.codes',
      'safetyInfo.warnings',
      'safetyInfo.contraindications',
      'safetyInfo.sideEffects',
      'safetyInfo.drugInteractions',
      'alternatives',
      'analysisWarnings',
      'recommendedVerification'
    ]);

    return result;
  }

  /**
   * Deep merge objects
   */
  deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Ensure specified paths are arrays
   */
  ensureArrays(obj, paths) {
    paths.forEach(path => {
      const keys = path.split('.');
      let current = obj;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      if (!Array.isArray(current[lastKey])) {
        current[lastKey] = [];
      }
    });
  }

  /**
   * Generate health-focused chat response using Gemini AI
   * @param {string} message - User's message
   * @param {Array} conversationHistory - Previous conversation context
   * @param {Object} userContext - User profile and health data context
   * @returns {Object} Chat response with AI-generated content
   */
  async generateChatResponse(message, conversationHistory = [], userContext = {}, preferredLanguage = 'en') {
    try {
      console.log(`[INFO] Conversation history has ${conversationHistory.length} messages`);

      // Build conversation context
      const contextPrompt = this.buildHealthChatContext(userContext);
      const historyPrompt = this.buildConversationHistory(conversationHistory);

      // Main health assistant prompt - Premium & Detailed
      const systemPrompt = `
        You are Mediot AI, a premium, professional, and friendly healthcare assistant. 

        [CRITICAL - LANGUAGE MATCHING]:
        - THE USER'S CURRENT SELECTED APP LANGUAGE IS: "${preferredLanguage}".
        - ALWAYS respond in the SAME LANGUAGE as the user's current message, UNLESS they switch to another language.
        - IF the user's message is in English but their preferred language is "${preferredLanguage}", you may respond in "${preferredLanguage}" but include English terms for clarity if needed.
        - IF the user's message is in "${preferredLanguage}", respond EXCLUSIVELY in "${preferredLanguage}".
        - Match their tone and style exactly.

        [PREMIUM FORMATTING RULES]:
        - ALWAYS use **bold text** for important medical terms, medicine names, and key insights.
        - ALWAYS use bullet points (-) or numbered lists (1.) for lists, instructions, or multiple points.
        - ALWAYS use the following keywords (with a colon) to highlight critical information:
          * "Warning:" for dangerous side effects or contraindications.
          * "Caution:" for things the user should be careful about.
          * "Note:" for helpful additional information.
          * "Tip:" for practical health advice.
          * "Important:" for essential instructions.
        - These keywords will be color-coded in the UI, so use them to make your response visually professional.

        [DETAILED RESPONSES]:
        - Provide detailed, informative, and structured responses. 
        - Do NOT give 1-sentence answers unless it's a simple greeting.
        - Explain the "why" behind your health advice.
        - Use simple language but maintain professional clinical depth.

        [CONVERSATION MEMORY]:
        - Reference the history below to provide context-aware answers.
        ${historyPrompt}

        [SAFETY]:
        - Recommend seeing a doctor for serious symptoms.
        - Never diagnose or prescribe.

        ${contextPrompt}

        User's current message: "${message}"

        Respond ONLY with a JSON object:
        {
          "response": "Your detailed, formatted response",
          "followUps": ["Follow-up question 1", "Follow-up question 2"]
        }`;

      const startTime = Date.now();
      let rawText = '';
      let provider = 'NVIDIA AI';
      let success = false;

      // Try NVIDIA first as requested by user
      try {
        console.log(`[INFO] Attempting to generate chat response with NVIDIA (${nvidiaService.model})...`);
        const nvidiaResult = await nvidiaService.client.chat.completions.create({
          model: nvidiaService.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          temperature: 0.2,
          top_p: 0.95,
          max_tokens: 65536,
          reasoning_budget: 16384,
          chat_template_kwargs: {"enable_thinking":false},
        });
        rawText = nvidiaResult.choices[0].message.content;
        success = true;
        console.log(`[PERF] NVIDIA response took ${Date.now() - startTime}ms`);
      } catch (nvidiaError) {
        console.warn('[WARN] NVIDIA failed, falling back to SambaNova/Gemini:', nvidiaError.message);
        
        const samba = this._getAvailableSambaClient();
        if (samba) {
          console.log(`[INFO] Generating chat response with DeepSeek-V3.1 (Key ${samba.index + 1})...`);
          try {
            const completion = await samba.client.chat.completions.create({
              model: this.sambaNovaModel,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
              ],
              temperature: 0.7,
              max_tokens: 1024,
            });
            rawText = completion.choices[0].message.content;
            provider = `SambaNova (${this.sambaNovaModel})`;
            success = true;
            console.log(`[PERF] DeepSeek-V3.1 response took ${Date.now() - startTime}ms`);
          } catch (sambaError) {
            console.warn('[WARN] SambaNova failed, falling back to Gemini:', sambaError.message);
            if (sambaError.status === 429) this._disableKey(samba.index, 3600000);
            const result = await this.model.generateContent(systemPrompt + "\n\nUser: " + message);
            rawText = (await result.response).text();
            provider = 'Gemini AI';
            success = true;
          }
        } else {
          const result = await this.model.generateContent(systemPrompt + "\n\nUser: " + message);
          rawText = (await result.response).text();
          provider = 'Gemini AI';
          success = true;
        }
      }

      console.log('[SUCCESS] Chat response generated successfully');

      // Parse JSON response
      let aiResponse = '';
      let followUpSuggestions = [];

      try {
        // Extract JSON from response
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiResponse = parsed.response || rawText;
          followUpSuggestions = parsed.followUps || [];
        } else {
          // Fallback if no JSON found
          aiResponse = rawText;
          followUpSuggestions = this.generateFollowUpSuggestions(message, rawText, userContext);
        }
      } catch (parseError) {
        console.warn('[WARN] Failed to parse JSON response, using raw text');
        aiResponse = rawText.replace(/```json|```/g, '').trim();
        // Try to extract if it looks like JSON was attempted
        if (aiResponse.includes('"response"')) {
          try {
            const retryParse = JSON.parse(aiResponse);
            aiResponse = retryParse.response || aiResponse;
            followUpSuggestions = retryParse.followUps || [];
          } catch (e) {
            followUpSuggestions = this.generateFollowUpSuggestions(message, aiResponse, userContext);
          }
        } else {
          followUpSuggestions = this.generateFollowUpSuggestions(message, aiResponse, userContext);
        }
      }

      // Final safety check to ensure we never return empty content
      if (!aiResponse || typeof aiResponse !== 'string' || aiResponse.trim().length === 0) {
        console.warn('[WARN] AI response was empty, using fallback');
        aiResponse = rawText && rawText.trim().length > 0 ? rawText : "I'm sorry, I couldn't process that request properly. Could you please rephrase it?";
      }

      return {
        success: true,
        data: {
          message: aiResponse,
          timestamp: new Date().toISOString(),
          followUpSuggestions: followUpSuggestions.slice(0, 2),
          provider: provider,
          context: {
            conversationLength: conversationHistory.length + 1,
            userContextUsed: Object.keys(userContext).length > 0,
            responseType: this.categorizeResponse(message)
          }
        }
      };

    } catch (error) {
      console.error('[ERROR] Chat response generation error:', error);

      return {
        success: false,
        error: error.message,
        data: {
          message: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment, or contact your healthcare provider if this is urgent.",
          timestamp: new Date().toISOString(),
          followUpSuggestions: [
            "Try asking again",
            "Contact a doctor"
          ]
        }
      };
    }
  }

  /**
   * Build health context from user profile and health data
   */
  buildHealthChatContext(userContext) {
    if (!userContext || Object.keys(userContext).length === 0) {
      return "User context: No specific health profile available.";
    }

    let context = "User context:\n";

    if (userContext.age) {
      context += `- Age: ${userContext.age}\n`;
    }

    if (userContext.medicalConditions && userContext.medicalConditions.length > 0) {
      context += `- Medical conditions: ${userContext.medicalConditions.join(', ')}\n`;
    }

    if (userContext.currentMedications && userContext.currentMedications.length > 0) {
      context += `- Current medications: ${userContext.currentMedications.join(', ')}\n`;
    }

    if (userContext.allergies && userContext.allergies.length > 0) {
      context += `- Allergies: ${userContext.allergies.join(', ')}\n`;
    }

    if (userContext.recentScans && userContext.recentScans.length > 0) {
      context += `- Recently scanned medicines: ${userContext.recentScans.join(', ')}\n`;
    }

    return context;
  }

  /**
   * Build conversation history for context
   */
  buildConversationHistory(history) {
    if (!history || history.length === 0) {
      return "";
    }

    let historyText = "\n[CONVERSATION HISTORY - Remember this context]:\n";

    history.forEach((msg, index) => {
      const role = msg.sender === 'user' ? 'User' : 'You (Assistant)';
      historyText += `${role}: ${msg.message}\n`;
    });

    historyText += "\n[END OF HISTORY - Continue the conversation naturally, remembering what was discussed above]\n";

    return historyText;
  }

  /**
   * Generate contextual follow-up suggestions
   */
  generateFollowUpSuggestions(userMessage, aiResponse, userContext) {
    const suggestions = [];
    const messageLower = userMessage.toLowerCase();

    // Medicine-related suggestions
    if (messageLower.includes('medicine') || messageLower.includes('medication') || messageLower.includes('drug')) {
      suggestions.push("Tell me about side effects");
      suggestions.push("How should I store this medication?");
      suggestions.push("Can I take this with other medicines?");
    }

    // Symptom-related suggestions
    if (messageLower.includes('symptom') || messageLower.includes('pain') || messageLower.includes('feel')) {
      suggestions.push("When should I see a doctor?");
      suggestions.push("What can I do to feel better?");
      suggestions.push("Are there warning signs to watch for?");
    }

    // General health suggestions
    if (suggestions.length === 0) {
      suggestions.push("Tell me about my medications");
      suggestions.push("Help me understand my symptoms");
      suggestions.push("What should I ask my doctor?");
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Categorize the type of response for analytics
   */
  categorizeResponse(message) {
    const messageLower = message.toLowerCase();

    if (messageLower.includes('medicine') || messageLower.includes('medication') || messageLower.includes('drug')) {
      return 'medication_inquiry';
    }

    if (messageLower.includes('symptom') || messageLower.includes('pain') || messageLower.includes('sick')) {
      return 'symptom_inquiry';
    }

    if (messageLower.includes('doctor') || messageLower.includes('appointment') || messageLower.includes('hospital')) {
      return 'healthcare_navigation';
    }

    if (messageLower.includes('emergency') || messageLower.includes('urgent') || messageLower.includes('help')) {
      return 'emergency_inquiry';
    }

    return 'general_health';
  }

  /**
   * Generate response for medicine-specific queries
   * @param {string} message - User's question about the medicine
   * @param {string} medicineContext - Context about the scanned medicine
   * @param {Array} conversationHistory - Previous messages for context
   * @returns {Object} AI response
   */
  async generateMedicineQueryResponse(message, medicineContext, conversationHistory = [], preferredLanguage = 'en') {
    try {
      let provider = 'Gemini AI';
      console.log(`[INFO] Generating medicine query response with ${provider}...`);
      
      const historyText = conversationHistory.map(m => `${m.sender}: ${m.message}`).join('\n');

      const messages = [
        { role: "system", content: "You are Mediot AI, a premium, professional, and friendly healthcare assistant." },
        { role: "system", content: `
          [CRITICAL - LANGUAGE MATCHING]:
          - THE USER'S CURRENT SELECTED APP LANGUAGE IS: "${preferredLanguage}".
          - ALWAYS respond in the SAME LANGUAGE as the user's current message, UNLESS they switch to another language.
          - IF the user's message is in English but their preferred language is "${preferredLanguage}", you may respond in "${preferredLanguage}" but include English terms for clarity if needed.
          - IF the user's message is in "${preferredLanguage}", respond EXCLUSIVELY in "${preferredLanguage}".
          - Match their tone and style exactly.

          [PREMIUM FORMATTING RULES]:
          - ALWAYS use **bold text** for medicine names, dosages, and key health terms.
          - ALWAYS use bullet points (-) or numbered lists (1.) for clarity.
          - ALWAYS use structural keywords: "Warning:", "Caution:", "Note:", "Tip:", "Important:".
          - Provide detailed, professional, yet easy-to-understand clinical insights.
        ` },
        { role: "system", content: `MEDICINE CONTEXT:\n${medicineContext}` }
      ];

      if (historyText) {
        messages.push({ role: "system", content: `CONVERSATION HISTORY:\n${historyText}` });
      }

      messages.push({ role: "user", content: message });

      const startTime = Date.now();
      let text = '';
      let success = false;
      provider = 'NVIDIA AI';

      // Try NVIDIA first as requested by user
      try {
        console.log(`[INFO] Attempting to generate medicine query with NVIDIA (${nvidiaService.model})...`);
        const nvidiaResult = await nvidiaService.client.chat.completions.create({
          model: nvidiaService.model,
          messages: messages,
          temperature: 0.2,
          top_p: 0.95,
          max_tokens: 65536,
          reasoning_budget: 16384,
          chat_template_kwargs: {"enable_thinking":false},
        });
        text = nvidiaResult.choices[0].message.content;
        success = true;
        console.log(`[PERF] NVIDIA medicine query took ${Date.now() - startTime}ms`);
      } catch (nvidiaError) {
        console.warn('[WARN] NVIDIA failed for medicine query, falling back to SambaNova/Gemini:', nvidiaError.message);
        
        const samba = this._getAvailableSambaClient();
        if (samba) {
          console.log(`[INFO] Generating medicine query with DeepSeek-V3.1 (Key ${samba.index + 1})...`);
          try {
            const completion = await samba.client.chat.completions.create({
              model: this.sambaNovaModel,
              messages: messages,
              temperature: 0.5,
            });
            text = completion.choices[0].message.content;
            provider = `SambaNova (${this.sambaNovaModel})`;
            success = true;
            console.log(`[PERF] DeepSeek-V3.1 medicine query took ${Date.now() - startTime}ms`);
          } catch (sambaError) {
            console.warn('[WARN] DeepSeek-V3.1 failed for medicine query, falling back to Gemini:', sambaError.message);
            if (sambaError.status === 429) this._disableKey(samba.index, 3600000);
            const result = await this.model.generateContent(`Context: ${medicineContext}\nHistory: ${historyText}\nQuestion: ${message}`);
            text = (await result.response).text();
            provider = 'Gemini AI';
            success = true;
          }
        } else {
          const result = await this.model.generateContent(`Context: ${medicineContext}\nHistory: ${historyText}\nQuestion: ${message}`);
          text = (await result.response).text();
          provider = 'Gemini AI';
          success = true;
        }
      }

      console.log('[SUCCESS] Medicine query response generated');

      return {
        success: true,
        data: {
          message: text.trim(),
          timestamp: new Date().toISOString(),
          provider: provider
        }
      };

    } catch (error) {
      console.error('[ERROR] Medicine query error:', error);
      return {
        success: false,
        error: error.message,
        data: {
          message: "I'm sorry, I couldn't process your question. Please try again.",
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate response for report-specific queries (Chat about report)
   * @param {string} message - User's question about the report
   * @param {string} reportContext - Extracted data from the report
   * @param {Array} conversationHistory - Previous messages for context
   * @returns {Object} AI response
   */
  async generateReportQueryResponse(message, reportContext, conversationHistory = [], preferredLanguage = 'en') {
    try {
      let provider = 'Gemini AI';
      console.log(`[INFO] Generating report query response with ${provider}...`);

      const historyText = conversationHistory.map(m => `${m.sender}: ${m.message}`).join('\n');
      
      const systemPrompt = `You are a medical data expert. You are helping a user understand their medical report.
      
REPORT CONTEXT (Extracted Data):
${reportContext}

INSTRUCTIONS:
1. Answer the user's question specifically based on the report data provided.
2. Be professional, clear, and reassuring.
3. Explain medical terms in simple language.
4. ALWAYS remind the user that this is an AI analysis and they MUST consult their doctor for final interpretation.
5. If the user asks about something not in the report, state so and avoid speculation.
6. Match the user's language style.
7. [CRITICAL - LANGUAGE]: THE USER'S CURRENT SELECTED APP LANGUAGE IS: "${preferredLanguage}". ALWAYS respond in "${preferredLanguage}" or the same language as the user's current message. Match their tone and style exactly.`;

      const messages = [
        { role: "system", content: systemPrompt }
      ];

      if (historyText) {
        messages.push({ role: "system", content: `CONVERSATION HISTORY:\n${historyText}` });
      }

      messages.push({ role: "user", content: message });

      const samba = this._getAvailableSambaClient();
      let text = '';
      if (samba) {
        console.log(`[INFO] Generating report query with DeepSeek-V3.1 (Key ${samba.index + 1})...`);
        try {
          const completion = await samba.client.chat.completions.create({
            model: this.sambaNovaModel,
            messages: messages,
            temperature: 0.4,
          });
          text = completion.choices[0].message.content;
          provider = `SambaNova (${this.sambaNovaModel})`;
        } catch (sambaError) {
          console.warn('[WARN] DeepSeek-V3.1 failed for report, falling back to Gemini:', sambaError.message);
          if (sambaError.status === 429) this._disableKey(samba.index, 3600000);
          const result = await this.model.generateContent(systemPrompt + "\nHistory: " + historyText + "\nUser: " + message);
          text = (await result.response).text();
        }
      } else {
        const result = await this.model.generateContent(systemPrompt + "\nHistory: " + historyText + "\nUser: " + message);
        text = (await result.response).text();
      }

      return {
        success: true,
        data: {
          message: text.trim(),
          timestamp: new Date().toISOString(),
          provider: provider
        }
      };
    } catch (error) {
      console.error('[ERROR] Report query error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate a proactive insight summary for a scanned medicine
   * Used to "warm up" the chat context and provide instant value
   */
  async generateProactiveInsight(medicineData) {
    try {
      const name = medicineData.medicineName?.primaryName || medicineData.name || 'this medicine';
      
      const prompt = `You are Mediot AI. I have just scanned a medicine: ${name}.
      Based on this data: ${JSON.stringify(medicineData)}
      
      Provide a very concise "Proactive Insight" for the user. 
      FORMATTING RULES:
      - Use **bold** for the medicine name and critical terms.
      - Use bullet points if listing multiple facts.
      - Keep it under 3 sentences total.
      - Focus on the most important thing they should know (e.g., a critical use, a major warning, or a helpful tip).
      
      Be professional, friendly, and brief.
      End with a friendly prompt like "Feel free to ask me anything about it!"`;

      let success = false;
      let text = '';

      // Try NVIDIA first as requested by user
      try {
        console.log(`[PROACTIVE] Attempting to generate insight with NVIDIA (${nvidiaService.model})...`);
        const nvidiaResult = await nvidiaService.client.chat.completions.create({
          model: nvidiaService.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          top_p: 0.95,
          max_tokens: 1024,
        });
        text = nvidiaResult.choices[0].message.content;
        success = true;
        console.log(`[PROACTIVE] Insight generated successfully with NVIDIA`);
      } catch (nvidiaError) {
        console.warn('[WARN] NVIDIA failed for proactive insight, falling back to SambaNova/Gemini:', nvidiaError.message);
        
        const samba = this._getAvailableSambaClient();
        if (samba) {
          console.log(`[INFO] Generating proactive insight with DeepSeek-V3.1 (Key ${samba.index + 1})...`);
          try {
            const completion = await samba.client.chat.completions.create({
              model: this.sambaNovaModel,
              messages: [{ role: "user", content: prompt }],
              temperature: 0.7,
              max_tokens: 150
            });
            text = completion.choices[0].message.content;
            success = true;
          } catch (sambaError) {
            console.warn('[WARN] DeepSeek-V3.1 failed for insight, falling back to Gemini:', sambaError.message);
            if (sambaError.status === 429) this._disableKey(samba.index, 3600000);
            const result = await this.model.generateContent(prompt);
            text = (await result.response).text();
            success = true;
          }
        } else {
          const result = await this.model.generateContent(prompt);
          text = (await result.response).text();
          success = true;
        }
      }

      return { success, text };
    } catch (error) {
      console.error('Proactive insight error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Identify pill from image using Gemini Vision API
   * @param {string} imagePath - Path to the pill image
   * @returns {Object} Pill identification result
   */
  async identifyPillFromImage(imagePath) {
    try {
      console.log('[INFO] Starting pill identification with AI (NVIDIA Primary)...');

      // Read image file
      let imageData;
      if (imagePath.startsWith('data:')) {
        // Handle base64 data URLs
        imageData = imagePath;
      } else {
        // Handle file paths
        const imageBuffer = await fs.readFile(imagePath);
        const mimeType = this.getMimeType(imagePath);
        imageData = {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType
          }
        };
      }

      // Medicine identification prompt (works for pills, creams, syrups, tablets, etc.)
      const prompt = `
        You are a pharmaceutical expert. Analyze this medicine image and identify it.
        Look for: medicine name, brand, strength, manufacturer, ingredients on packaging/label.

        IMPORTANT: You MUST return ALL fields in the JSON below. Do not skip any fields.

        Return this EXACT JSON structure:
        {
          "identified": true,
          "confidence": 7,
          "medicineType": "tablet",
          "medicineName": {
            "brandName": "Brand Name Here",
            "genericName": "Generic Name Here",
            "primaryName": "Primary Name Here"
          },
          "physicalCharacteristics": {
            "form": "tablet/capsule/cream/syrup",
            "shape": "round/oval/rectangular",
            "color": "white/blue/etc",
            "size": "small/medium/large",
            "packaging": "blister/bottle/tube",
            "imprint": "any markings"
          },
          "dosageInformation": {
            "strength": "500mg",
            "form": "tablet",
            "quantity": "10 tablets"
          },
          "activeIngredients": ["ingredient1", "ingredient2"],
          "commonUses": ["use1", "use2", "use3"],
          "administrationRoute": "oral",
          "safetyWarning": "Do not exceed recommended dose",
          "storageInstructions": "Store below 25°C",
          "expiryInfo": "Check packaging",
          "manufacturerInfo": "Manufacturer name",
          "verificationNeeded": true,
          "reasoning": "Identified based on visible text",
          "sideEffects": {
            "common": ["headache", "nausea", "dizziness"],
            "serious": ["allergic reaction", "difficulty breathing"]
          },
          "drugInteractions": ["alcohol", "blood thinners"],
          "howToTake": {
            "withFood": "Can be taken with or without food",
            "timeOfDay": "As prescribed",
            "instructions": "Swallow whole with water"
          },
          "pregnancySafety": {
            "category": "Consult Doctor",
            "breastfeeding": "Consult Doctor"
          },
          "ageRestrictions": {
            "pediatric": "Consult pediatrician for children",
            "elderly": "Use with caution"
          },
          "prescriptionRequired": false,
          "priceInfo": {
            "mrp": null,
            "priceRange": "₹50-200"
          },
          "foodAlcoholInteractions": {
            "food": [],
            "alcohol": "Avoid"
          }
        }

        RULES:
        1. Read ALL text visible on medicine/packaging
        2. If you can identify the medicine, set identified=true and provide real info
        3. If you cannot identify, still fill all fields with best guesses based on appearance
        4. For price: Use null for mrp unless you know exact price
        5. Return ONLY the JSON, nothing else
      `;

      // Generate content with image and prompt
      console.log('[INFO]🤖 Sending pill identification request to NVIDIA...');
      let text = '';
      try {
        const base64Data = imagePath.startsWith('data:') 
          ? imagePath.split(',')[1] 
          : (await fs.readFile(imagePath)).toString('base64');
        const mimeType = imagePath.startsWith('data:') 
          ? imagePath.split(';')[0].split(':')[1] 
          : this.getMimeType(imagePath);

        const nvidiaResult = await nvidiaService.client.chat.completions.create({
          model: nvidiaService.model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 4096,
        });
        text = nvidiaResult.choices[0].message.content;
        console.log('[INFO] Received pill identification response from NVIDIA');
      } catch (nvidiaError) {
        console.warn('[WARN] NVIDIA vision failed, falling back to Gemini:', nvidiaError.message);
        console.log('[INFO]🤖 Sending pill identification request to Gemini...');
        const result = await this.model.generateContent([prompt, imageData]);
        const response = await result.response;
        text = response.text();
        console.log('[INFO] Received pill identification response from Gemini');
      }

      // Parse JSON response
      const pillData = this._extractJson(text, {
        identified: false,
        confidence: 1,
        medicineName: {
          brandName: null,
          genericName: null,
          primaryName: "Unable to identify"
        },
        physicalCharacteristics: {
          shape: "Unable to determine",
          color: "Unable to determine",
          size: "Unable to determine",
          imprint: "Not visible",
          scoring: "Unable to determine",
          coating: "Unable to determine"
        },
        possibleMatches: [],
        activeIngredients: [],
        commonUses: [],
        safetyWarning: "Unable to identify pill. Please consult a pharmacist or healthcare provider.",
        verificationNeeded: true,
        reasoning: "Failed to parse AI response. Manual verification required."
      });

      console.log('[SUCCESS] Pill identification completed');

      return {
        success: true,
        data: pillData,
        rawResponse: text
      };

    } catch (error) {
      console.error('[ERROR] Pill identification error:', error);

      return {
        success: false,
        error: error.message,
        data: {
          identified: false,
          confidence: 0,
          medicineName: {
            brandName: null,
            genericName: null,
            primaryName: "Identification failed"
          },
          physicalCharacteristics: {
            shape: "Error",
            color: "Error",
            size: "Error",
            imprint: "Error",
            scoring: "Error",
            coating: "Error"
          },
          possibleMatches: [],
          activeIngredients: [],
          commonUses: [],
          safetyWarning: "Service error. Please consult a pharmacist or healthcare provider for pill identification.",
          verificationNeeded: true,
          reasoning: `Service error: ${error.message}`
        }
      };
    }
  }

  /**
   * Identify medicine from multiple images using Gemini Vision API
   * @param {string[]} imagePaths - Array of paths to medicine images
   * @returns {Object} Medicine identification result
   */
  async identifyPillFromMultipleImages(imagePaths) {
    try {
      console.log(`[INFO] Starting medicine identification with ${imagePaths.length} images using Gemini Vision...`);

      // Read all image files
      const imageDataArray = [];
      for (const imagePath of imagePaths) {
        const imageBuffer = await fs.readFile(imagePath);
        const mimeType = this.getMimeType(imagePath);
        imageDataArray.push({
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType
          }
        });
      }

      // Enhanced prompt for multiple images
      const prompt = `
        You are a pharmaceutical expert. Analyze these ${imagePaths.length} medicine images and identify the medicine.
        Look for: medicine name, brand, strength, manufacturer, ingredients on packaging/label.

        IMPORTANT: You MUST return ALL fields in the JSON below. Do not skip any fields.

        Return this EXACT JSON structure:
        {
          "identified": true,
          "confidence": 7,
          "medicineType": "tablet",
          "medicineName": {
            "brandName": "Brand Name Here",
            "genericName": "Generic Name Here",
            "primaryName": "Primary Name Here"
          },
          "physicalCharacteristics": {
            "form": "tablet/capsule/cream/syrup",
            "shape": "round/oval/rectangular",
            "color": "white/blue/etc",
            "size": "small/medium/large",
            "packaging": "blister/bottle/tube",
            "imprint": "any markings"
          },
          "dosageInformation": {
            "strength": "500mg",
            "form": "tablet",
            "quantity": "10 tablets"
          },
          "activeIngredients": ["ingredient1", "ingredient2"],
          "commonUses": ["use1", "use2", "use3"],
          "administrationRoute": "oral",
          "safetyWarning": "Do not exceed recommended dose",
          "storageInstructions": "Store below 25°C",
          "expiryInfo": "Check packaging",
          "manufacturerInfo": "Manufacturer name",
          "verificationNeeded": true,
          "reasoning": "Identified based on visible text",
          "sideEffects": {
            "common": ["headache", "nausea", "dizziness"],
            "serious": ["allergic reaction", "difficulty breathing"]
          },
          "drugInteractions": ["alcohol", "blood thinners"],
          "howToTake": {
            "withFood": "Can be taken with or without food",
            "timeOfDay": "As prescribed",
            "instructions": "Swallow whole with water"
          },
          "pregnancySafety": {
            "category": "Consult Doctor",
            "breastfeeding": "Consult Doctor"
          },
          "ageRestrictions": {
            "pediatric": "Consult pediatrician for children",
            "elderly": "Use with caution"
          },
          "prescriptionRequired": false,
          "priceInfo": {
            "mrp": null,
            "priceRange": "₹50-200"
          },
          "foodAlcoholInteractions": {
            "food": [],
            "alcohol": "Avoid"
          }
        }

        RULES:
        1. Combine info from all ${imagePaths.length} images
        2. Read ALL text visible on medicine/packaging
        3. If you can identify the medicine, set identified=true and provide real info
        4. For price: Use null for mrp unless you know exact price
        5. Return ONLY the JSON, nothing else
      `;

      // Generate content with all images and prompt
      // Generate content with all images and prompt
      console.log(`[INFO]🤖 Sending ${imagePaths.length} images to AI (NVIDIA Primary) for identification...`);
      let text = '';
      try {
        const nvidiaContent = [{ type: "text", text: prompt }];
        
        for (const imagePath of imagePaths) {
          const imageBuffer = await fs.readFile(imagePath);
          const base64Data = imageBuffer.toString('base64');
          const mimeType = this.getMimeType(imagePath);
          nvidiaContent.push({
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`,
            },
          });
        }

        const nvidiaResult = await nvidiaService.client.chat.completions.create({
          model: nvidiaService.model,
          messages: [
            {
              role: "user",
              content: nvidiaContent,
            },
          ],
          max_tokens: 4096,
        });
        text = nvidiaResult.choices[0].message.content;
        console.log(`[INFO] Received medicine identification response from NVIDIA (${imagePaths.length} images)`);
      } catch (nvidiaError) {
        console.warn(`[WARN] NVIDIA vision failed for multiple images, falling back to Gemini:`, nvidiaError.message);
        console.log(`[INFO]🤖 Sending ${imagePaths.length} images to Gemini for identification...`);
        const result = await this.model.generateContent([prompt, ...imageDataArray]);
        const response = await result.response;
        text = response.text();
        console.log(`[INFO] Received medicine identification response from Gemini (${imagePaths.length} images)`);
      }

      // Parse JSON response (same parsing logic as single image)
      const medicineData = this._extractJson(text, {
        identified: false,
        confidence: 1,
        medicineType: 'unknown',
        medicineName: {
          brandName: null,
          genericName: null,
          primaryName: "Unable to identify"
        },
        physicalCharacteristics: {
          form: "Unable to determine",
          shape: "Unable to determine",
          color: "Unable to determine",
          size: "Unable to determine",
          packaging: "Unable to determine",
          visibleText: "Not visible",
          imprint: "Not visible",
          appearance: "Unable to determine"
        },
        dosageInformation: {},
        possibleMatches: [],
        activeIngredients: [],
        commonUses: [],
        safetyWarning: "Unable to identify medicine. Please consult a pharmacist or healthcare provider.",
        verificationNeeded: true,
        reasoning: "Failed to parse AI response from multiple images. Manual verification required."
      });

      console.log(`[SUCCESS] Medicine identification completed using ${imagePaths.length} images`);

      return {
        success: true,
        data: medicineData,
        rawResponse: text,
        imageCount: imagePaths.length
      };

    } catch (error) {
      console.error(`[ERROR] Medicine identification error (${imagePaths.length} images):`, error);

      return {
        success: false,
        error: error.message,
        data: {
          identified: false,
          confidence: 0,
          medicineType: 'unknown',
          medicineName: {
            brandName: null,
            genericName: null,
            primaryName: "Identification failed"
          },
          physicalCharacteristics: {
            form: "Error",
            shape: "Error",
            color: "Error",
            size: "Error",
            packaging: "Error",
            visibleText: "Error",
            imprint: "Error",
            appearance: "Error"
          },
          dosageInformation: {},
          possibleMatches: [],
          activeIngredients: [],
          commonUses: [],
          administrationRoute: "unknown",
          storageInstructions: null,
          expiryInfo: null,
          manufacturerInfo: null,
          safetyWarning: "Service error. Please consult a pharmacist or healthcare provider for medicine identification.",
          verificationNeeded: true,
          reasoning: `Service error with ${imagePaths.length} images: ${error.message}`
        },
        imageCount: imagePaths.length
      };
    }
  }

  /**
   * Get medicine information from barcode using AI
   * @param {string} barcode - Barcode number
   * @returns {Object} Medicine information
   */
  async getMedicineInfoFromBarcode(barcode) {
    try {
      console.log(`[INFO] Getting medicine info for barcode: ${barcode}`);

      const prompt = `
        You are a pharmaceutical expert. A barcode "${barcode}" was scanned from a medicine package.
        
        Provide medicine information in JSON format:
        {
          "identified": true/false,
          "confidence": 1-10,
          "medicineName": {
            "brandName": "brand name if identifiable from barcode pattern",
            "genericName": "generic name if known",
            "primaryName": "most likely name"
          },
          "barcodeInfo": {
            "type": "EAN-13/UPC/etc",
            "country": "country of origin if identifiable",
            "manufacturer": "manufacturer if identifiable"
          },
          "possibleMatches": ["list of possible medicine names"],
          "reasoning": "explanation of identification"
        }

        Note: Provide best guess based on barcode pattern and pharmaceutical knowledge.
      `;

      console.log(`[INFO]🤖 Requesting medicine info for barcode ${barcode} from AI (NVIDIA Primary)...`);
      let text = '';
      try {
        const nvidiaResult = await nvidiaService.client.chat.completions.create({
          model: nvidiaService.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 1024,
        });
        text = nvidiaResult.choices[0].message.content;
        console.log(`[INFO] Received barcode info from NVIDIA`);
      } catch (nvidiaError) {
        console.warn(`[WARN] NVIDIA failed for barcode ${barcode}, falling back to Gemini:`, nvidiaError.message);
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        console.log(`[INFO] Received barcode info from Gemini`);
      }

      const data = this._extractJson(text, { identified: false, confidence: 1 });

      return { success: true, data };
    } catch (error) {
      console.error('[ERROR] Barcode processing error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Parse QR code data using AI
   * @param {string} qrData - QR code content
   * @returns {Object} Parsed information
   */
  async parseQRCodeData(qrData) {
    try {
      console.log(`[INFO] Parsing QR code data with AI`);

      const prompt = `
        You are a pharmaceutical expert. Parse this QR code data: "${qrData}"
        
        Provide parsed information in JSON format:
        {
          "confidence": 1-10,
          "parsedData": {
            "type": "medicine/url/text/json",
            "content": "interpreted content"
          },
          "medicineInfo": {
            "identified": true/false,
            "name": "medicine name if found",
            "details": "any medicine details found"
          },
          "reasoning": "explanation of what was found"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const data = this._extractJson(text, { confidence: 1, parsedData: { type: 'text', content: qrData } });

      return { success: true, data };
    } catch (error) {
      console.error('[ERROR] QR code parsing error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract text from document image using Gemini Vision OCR
   * @param {string} imagePath - Path to document image
   * @returns {Object} Extracted text and information
   */
  async extractTextFromDocument(imagePath) {
    try {
      console.log('[INFO] Extracting text from document with AI OCR (NVIDIA Primary)');

      const imageBuffer = await fs.readFile(imagePath);
      const mimeType = this.getMimeType(imagePath);
      const imageData = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType
        }
      };

      const prompt = `
        You are an OCR expert. Extract ALL text from this document image.
        
        Provide extracted information in JSON format:
        {
          "confidence": 1-10,
          "extractedText": "all text found in the document",
          "documentType": "prescription/lab report/medical document/other",
          "structuredData": {
            "patientName": "if found",
            "doctorName": "if found",
            "date": "if found",
            "medicines": ["list of medicines mentioned"],
            "dosages": ["dosage information"],
            "instructions": ["usage instructions"]
          },
          "reasoning": "brief description of document content"
        }

        Extract ALL visible text accurately, maintaining structure and formatting.
      `;

      console.log('[INFO] Extracting text from document with NVIDIA Vision OCR');
      let text = '';
      try {
        const base64Data = imageBuffer.toString('base64');

        const nvidiaResult = await nvidiaService.client.chat.completions.create({
          model: nvidiaService.model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 4096,
        });
        text = nvidiaResult.choices[0].message.content;
        console.log('[INFO] Received document OCR response from NVIDIA');
      } catch (nvidiaError) {
        console.warn('[WARN] NVIDIA document OCR failed, falling back to Gemini:', nvidiaError.message);
        console.log('[INFO]🤖 Sending document OCR request to Gemini...');
        const result = await this.model.generateContent([prompt, imageData]);
        const response = await result.response;
        text = response.text();
        console.log('[INFO] Received document OCR response from Gemini');
      }

      const data = this._extractJson(text, { confidence: 1, extractedText: text });

      return { success: true, data };
    } catch (error) {
      console.error('[ERROR] Document OCR error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze medicine interactions using AI
   * @param {Array} medications - List of medications to analyze
   * @param {Object} userContext - User health context
   * @returns {Object} Interaction analysis results
   */
  async analyzeMedicineInteractions(medications, userContext = {}) {
    try {
      console.log('[INFO] Analyzing medicine interactions with Gemini AI...');

      const interactionPrompt = `
        You are a pharmaceutical expert analyzing potential drug interactions. 

        Medications to analyze: ${medications.join(', ')}
        
        User context:
        ${this.buildHealthChatContext(userContext)}

        Provide a comprehensive interaction analysis in JSON format:
        {
          "overallRisk": "low/moderate/high",
          "interactions": [
            {
              "medications": ["drug1", "drug2"],
              "severity": "minor/moderate/major",
              "description": "detailed interaction description",
              "clinicalSignificance": "clinical impact explanation",
              "recommendations": ["specific recommendations"],
              "monitoring": "what to monitor for"
            }
          ],
          "contraindications": [
            {
              "medication": "drug name",
              "condition": "medical condition",
              "reason": "why it's contraindicated",
              "alternatives": ["alternative medications"]
            }
          ],
          "generalRecommendations": [
            "general advice for this medication combination"
          ],
          "warningFlags": [
            "important warnings or red flags"
          ],
          "consultationRecommended": true/false,
          "reasoning": "detailed explanation of analysis"
        }

        IMPORTANT: Base analysis on established pharmaceutical knowledge. Always recommend consulting healthcare providers for medication changes.
      `;

      console.log('[INFO]🤖 Requesting interaction analysis from AI (NVIDIA Primary)...');
      let text = '';
      try {
        const nvidiaResult = await nvidiaService.client.chat.completions.create({
          model: nvidiaService.model,
          messages: [{ role: "user", content: interactionPrompt }],
          temperature: 0.1,
          max_tokens: 4096,
        });
        text = nvidiaResult.choices[0].message.content;
        console.log('[INFO] Received interaction analysis from NVIDIA');
      } catch (nvidiaError) {
        console.warn('[WARN] NVIDIA failed for interaction analysis, falling back to Gemini:', nvidiaError.message);
        const result = await this.model.generateContent(interactionPrompt);
        const response = await result.response;
        text = response.text();
        console.log('[INFO] Received interaction analysis from Gemini');
      }

      // Parse JSON response
      const analysisData = this._extractJson(text, {
        overallRisk: "unknown",
        interactions: [],
        contraindications: [],
        generalRecommendations: ["Consult your healthcare provider about these medications"],
        warningFlags: ["Unable to complete automated analysis"],
        consultationRecommended: true,
        reasoning: "Failed to parse AI analysis response"
      });

      console.log('[SUCCESS] Medicine interaction analysis completed');

      return {
        success: true,
        data: analysisData,
        rawResponse: text
      };

    } catch (error) {
      console.error('[ERROR] Medicine interaction analysis error:', error);

      return {
        success: false,
        error: error.message,
        data: {
          overallRisk: "unknown",
          interactions: [],
          contraindications: [],
          generalRecommendations: ["Please consult your healthcare provider"],
          warningFlags: ["Analysis service temporarily unavailable"],
          consultationRecommended: true,
          reasoning: "Service error occurred during analysis"
        }
      };
    }
  }

  /**
   * Get conversation history (stub for compatibility)
   * Note: Gemini service doesn't store conversations, returns empty for now
   */
  async getConversationHistory(userId, conversationId = null, limit = 20) {
    return {
      success: true,
      data: {
        messages: [],
        conversationId: conversationId,
        totalMessages: 0
      }
    };
  }

  /**
   * Get conversation summaries (stub for compatibility)
   * Note: Gemini service doesn't store conversations, returns empty for now
   */
  async getConversationSummaries(userId, limit = 10) {
    return {
      success: true,
      data: []
    };
  }

  /**
   * Check if service is initialized
   */
  get isInitialized() {
    return !!this.model;
  }

  /**
   * Smart API: Proactively check key health every 3 minutes
   */
  startHealthCheck() {
    console.log('[SMART-API] Initializing 3-minute proactive health check service...');
    setInterval(async () => {
      for (let i = 0; i < this.sambaNovaClients.length; i++) {
        const now = Date.now();
        
        // If it's disabled, we only check if it's almost time to revive it (last 5 mins of cooldown)
        if (now < this.clientStates[i].disabledUntil - 300000) continue;

        try {
          // Send a tiny request to verify key health
          await this.sambaNovaClients[i].chat.completions.create({
            model: this.sambaNovaModel,
            messages: [{ role: 'user', content: 'hi' }],
            max_tokens: 1
          });
          
          // If successful and was previously disabled, revive it
          if (this.clientStates[i].disabledUntil > 0) {
            console.log(`[SMART-API] Key ${i + 1} has recovered and is now ACTIVE.`);
            this.clientStates[i].disabledUntil = 0;
          }
        } catch (e) {
          if (e.status === 429) {
            // Still rate limited or just failed, ensure it's disabled for 1 hour from now
            this._disableKey(i, 3600000);
          }
        }
      }
    }, 180000); // 180,000ms = 3 minutes
  }

  /**
   * Disable a key for a specific duration
   */
  _disableKey(index, durationMs) {
    this.clientStates[index].disabledUntil = Date.now() + durationMs;
    const minutes = Math.round(durationMs / 60000);
    console.warn(`[SMART-API] 🚨 Key ${index + 1} is rate-limited. Put on cooldown for ${minutes} minutes.`);
  }

  /**
   * Helper to get the best available SambaNova client using rotation and health tracking
   */
  _getAvailableSambaClient() {
    if (!this.sambaNovaClients || this.sambaNovaClients.length === 0) {
      console.log('[DEBUG] No SambaNova clients initialized.');
      return null;
    }

    const now = Date.now();
    for (let i = 0; i < this.sambaNovaClients.length; i++) {
      const state = this.clientStates[i];
      if (now >= state.disabledUntil) {
        return { client: this.sambaNovaClients[i], index: i };
      } else {
        console.log(`[DEBUG] SambaNova Key ${i + 1} is on cooldown for another ${Math.round((state.disabledUntil - now) / 1000)}s`);
      }
    }
    console.log('[DEBUG] All SambaNova clients are currently on cooldown.');
    return null; // All clients are currently on cooldown
  }

  /**
   * Helper to extract JSON from text with robust parsing
   */
  _extractJson(text, fallback = {}) {
    try {
      if (!text) return fallback;
      
      // Remove potential markdown code blocks
      const cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      
      // Try parsing direct text first
      try {
        return JSON.parse(cleanedText);
      } catch (e) {
        // Continue to regex extraction
      }

      // Find the first { and the last }
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = cleanedText.substring(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(jsonStr);
        } catch (innerError) {
          console.warn('[WARN] Regex JSON extraction failed, attempting deep clean:', innerError.message);
          
          // Last ditch effort: try to clean up the string (remove trailing commas, etc)
          const deepCleaned = jsonStr
            .replace(/,\s*([\]}])/g, '$1') // Trailing commas
            .replace(/(\w+):/g, '"$1":') // Unquoted keys (if any)
            .replace(/'/g, '"'); // Single to double quotes
            
          try {
            return JSON.parse(deepCleaned);
          } catch (finalError) {
            console.error('[ERROR] Final JSON parsing attempt failed');
          }
        }
      }
      
      console.warn('[WARN] No valid JSON structure found in response');
      return fallback;
    } catch (error) {
      console.error('[ERROR] _extractJson error:', error);
      return fallback;
    }
  }
}

module.exports = new GeminiService();
