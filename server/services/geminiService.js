const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs-extra');
const path = require('path');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.error('[ERROR] GEMINI_API_KEY is required');
      throw new Error('GEMINI_API_KEY is required');
    }

    try {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      // Use gemini-1.5-flash for faster responses (or gemini-2.5-pro for better accuracy)
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      });
      console.log('[INFO][SUCCESS] Gemini AI service initialized with gemini-1.5-flash');
    } catch (error) {
      console.error('[ERROR] Failed to initialize Gemini AI service:', error);
      throw error;
    }
  }

  /**
   * Quick medicine name verification using Gemini Vision API
   * @param {string} imagePath - Path to the uploaded image
   * @returns {Object} Quick verification result with medicine name only
   */
  async quickMedicineVerification(imagePath) {
    try {
      console.log('[INFO][INFO] Starting quick medicine name verification...');

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
      console.log('[INFO]🤖 Sending quick verification request to Gemini...');
      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();
      console.log('[INFO][INFO] Received quick verification response from Gemini');

      // Parse JSON response
      let verificationData;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          verificationData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.warn('[WARN] Failed to parse JSON response, creating fallback...');
        verificationData = {
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
          verificationNeeded: true,
          reasoning: "Failed to parse AI response"
        };
      }

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
      console.log('[INFO]🤖 Sending multi-image verification request to gemini-2.5-pro...');
      const imageDataArray = imageAnalyses.map(img => img.imageData);
      const result = await this.model.generateContent([prompt, ...imageDataArray]);
      const response = await result.response;
      const text = response.text();
      console.log('[INFO][INFO] Received multi-image verification response from Gemini');

      // Parse JSON response
      let verificationData;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          verificationData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.warn('[WARN] Failed to parse multi-image JSON response, creating fallback...');
        verificationData = {
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
        };
      }

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
      console.log('[INFO]🤖 Sending comprehensive analysis request to Gemini...');
      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();
      console.log('[INFO] Received comprehensive response from Gemini');

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
        console.warn('[WARN] Failed to parse comprehensive JSON, creating fallback...');
        analysisData = this.createComprehensiveFallbackResponse(text, verifiedMedicineName);
      }

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
  async generateChatResponse(message, conversationHistory = [], userContext = {}) {
    try {
      console.log('[INFO] Generating chat response with Gemini AI...');

      // Build conversation context
      const contextPrompt = this.buildHealthChatContext(userContext);
      const historyPrompt = this.buildConversationHistory(conversationHistory);

      // Main health assistant prompt
      const systemPrompt = `
        You are Mediot AI, a knowledgeable and empathetic healthcare assistant. Your role is to:

        [PRIMARY FUNCTIONS]:
        - Provide accurate, evidence-based health information
        - Help users understand medications, symptoms, and health conditions
        - Offer guidance on when to seek professional medical care
        - Support medication adherence and health management
        - Provide emotional support for health-related concerns

        [CRITICAL SAFETY RULES]:
        - NEVER provide specific medical diagnoses
        - ALWAYS recommend consulting healthcare professionals for serious concerns
        - Do NOT prescribe medications or change dosages
        - Clearly state when information is general vs. personalized
        - Emphasize that you're an AI assistant, not a replacement for medical care

        [COMMUNICATION STYLE]:
        - Be warm, empathetic, and supportive
        - Use clear, non-technical language when possible
        - Provide actionable, practical advice
        - Ask clarifying questions when needed
        - Show genuine concern for the user's wellbeing

        [RESPONSE FORMAT]:
        - Keep responses concise but comprehensive
        - Use bullet points or numbered lists for clarity
        - Include relevant follow-up questions
        - Suggest next steps when appropriate

        ${contextPrompt}
        ${historyPrompt}

        User's current message: "${message}"

        Provide a helpful, accurate, and empathetic response:
      `;

      // Generate response using Gemini
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const aiResponse = response.text();

      console.log('[SUCCESS] Chat response generated successfully');

      // Analyze response for follow-up suggestions
      const followUpSuggestions = this.generateFollowUpSuggestions(message, aiResponse, userContext);

      return {
        success: true,
        data: {
          message: aiResponse,
          timestamp: new Date().toISOString(),
          followUpSuggestions,
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
            "Try rephrasing your question",
            "Contact your healthcare provider",
            "Visit our emergency resources if urgent"
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
      return "Conversation history: This is the start of the conversation.";
    }

    let historyText = "Recent conversation:\n";

    // Include last 5 messages for context
    const recentHistory = history.slice(-5);

    recentHistory.forEach((msg, index) => {
      const role = msg.sender === 'user' ? 'User' : 'Assistant';
      historyText += `${role}: ${msg.message}\n`;
    });

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
   * Identify pill from image using Gemini Vision API
   * @param {string} imagePath - Path to the pill image
   * @returns {Object} Pill identification result
   */
  async identifyPillFromImage(imagePath) {
    try {
      console.log('[INFO] Starting pill identification with Gemini Vision...');

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
        You are a pharmaceutical expert specializing in medicine identification. Analyze this medicine image carefully.
        This could be a pill, tablet, capsule, cream, ointment, syrup, injection, or any other medicine form.

        Provide a JSON response with this EXACT structure:
        {
          "identified": true/false,
          "confidence": 1-10,
          "medicineType": "pill/tablet/capsule/cream/ointment/syrup/injection/inhaler/drops/other",
          "medicineName": {
            "brandName": "brand/trade name visible on packaging or product",
            "genericName": "generic/chemical name if identifiable",
            "primaryName": "the most prominent medicine name"
          },
          "physicalCharacteristics": {
            "form": "tablet/capsule/cream/syrup/etc",
            "shape": "shape description if applicable",
            "color": "detailed color description",
            "size": "approximate size or volume",
            "packaging": "tube/bottle/blister pack/box/etc",
            "visibleText": "all text visible on medicine or packaging",
            "imprint": "any imprints, logos, or markings",
            "appearance": "overall appearance description"
          },
          "dosageInformation": {
            "strength": "dosage strength if visible (e.g., 500mg, 10ml, 2.5%)",
            "form": "tablet/capsule/cream/liquid/etc",
            "quantity": "quantity in package if visible"
          },
          "possibleMatches": [
            {
              "name": "medicine name",
              "strength": "dosage strength",
              "manufacturer": "manufacturer if identifiable",
              "matchConfidence": 1-10,
              "reason": "why this is a possible match"
            }
          ],
          "activeIngredients": ["list of active ingredients if visible or identifiable"],
          "commonUses": ["common medical uses based on identification"],
          "administrationRoute": "oral/topical/injection/inhalation/etc",
          "safetyWarning": "important safety information or warnings",
          "storageInstructions": "storage instructions if visible",
          "expiryInfo": "expiry date if visible",
          "manufacturerInfo": "manufacturer name and details if visible",
          "verificationNeeded": true/false,
          "reasoning": "detailed explanation of identification process and confidence level"
        }

        CRITICAL INSTRUCTIONS:
        1. Carefully examine ALL visible text, logos, markings, and packaging
        2. Read medicine name from packaging, labels, or product itself
        3. Identify medicine type (pill, cream, syrup, etc.)
        4. Extract dosage strength if visible (mg, ml, %, etc.)
        5. Note manufacturer name if visible
        6. Provide confidence score based on clarity of visible information
        7. List multiple possible matches if uncertain
        8. Always include safety warnings
        9. Set verificationNeeded to true if identification is uncertain
        10. DO NOT make definitive claims if information is unclear
        11. Focus on VISIBLE text and information on the product/packaging

        EXAMPLES OF WHAT TO LOOK FOR:
        - Medicine name on packaging or tube
        - Strength/dosage (500mg, 10ml, 2.5%, etc.)
        - Manufacturer logo or name
        - Batch number, expiry date
        - Usage instructions
        - Active ingredients list
        - "For external use only" or similar warnings

        SAFETY NOTICE: This is an AI-assisted identification tool. Always verify with a licensed pharmacist or healthcare provider before using any medication.
      `;

      // Generate content with image and prompt
      console.log('[INFO]🤖 Sending pill identification request to Gemini...');
      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();
      console.log('[INFO] Received pill identification response from Gemini');

      // Parse JSON response
      let pillData;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          pillData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.warn('[WARN] Failed to parse JSON response, creating fallback...');
        pillData = {
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
        };
      }

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
        You are a pharmaceutical expert specializing in medicine identification. Analyze these ${imagePaths.length} medicine images carefully.
        Multiple images provide different angles and views of the same medicine product.

        Provide a JSON response with this EXACT structure (same as single image, but with higher confidence due to multiple views):
        {
          "identified": true/false,
          "confidence": 1-10,
          "medicineType": "pill/tablet/capsule/cream/ointment/syrup/injection/inhaler/drops/other",
          "medicineName": {
            "brandName": "brand/trade name visible on packaging or product",
            "genericName": "generic/chemical name if identifiable",
            "primaryName": "the most prominent medicine name"
          },
          "physicalCharacteristics": {
            "form": "tablet/capsule/cream/syrup/etc",
            "shape": "shape description if applicable",
            "color": "detailed color description",
            "size": "approximate size or volume",
            "packaging": "tube/bottle/blister pack/box/etc",
            "visibleText": "all text visible on medicine or packaging across all images",
            "imprint": "any imprints, logos, or markings",
            "appearance": "overall appearance description"
          },
          "dosageInformation": {
            "strength": "dosage strength if visible (e.g., 500mg, 10ml, 2.5%)",
            "form": "tablet/capsule/cream/liquid/etc",
            "quantity": "quantity in package if visible"
          },
          "possibleMatches": [],
          "activeIngredients": ["list of active ingredients if visible or identifiable"],
          "commonUses": ["common medical uses based on identification"],
          "administrationRoute": "oral/topical/injection/inhalation/etc",
          "safetyWarning": "important safety information or warnings",
          "storageInstructions": "storage instructions if visible",
          "expiryInfo": "expiry date if visible",
          "manufacturerInfo": "manufacturer name and details if visible",
          "verificationNeeded": true/false,
          "reasoning": "detailed explanation combining information from all ${imagePaths.length} images"
        }

        CRITICAL INSTRUCTIONS:
        1. Analyze ALL ${imagePaths.length} images together
        2. Combine information from different angles/views
        3. Higher confidence due to multiple perspectives
        4. Extract ALL visible text from any image
        5. Cross-reference information across images
        6. Provide comprehensive identification
        7. Note any discrepancies between images
        8. Focus on VISIBLE text and information

        SAFETY NOTICE: This is an AI-assisted identification tool. Always verify with a licensed pharmacist or healthcare provider before using any medication.
      `;

      // Generate content with all images and prompt
      console.log(`🤖 Sending ${imagePaths.length} images to Gemini for identification...`);
      const result = await this.model.generateContent([prompt, ...imageDataArray]);
      const response = await result.response;
      const text = response.text();
      console.log(`[INFO] Received medicine identification response from Gemini (${imagePaths.length} images)`);

      // Parse JSON response (same parsing logic as single image)
      let medicineData;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          medicineData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.warn('[WARN] Failed to parse JSON response, creating fallback...');
        medicineData = {
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
          administrationRoute: "unknown",
          storageInstructions: null,
          expiryInfo: null,
          manufacturerInfo: null,
          safetyWarning: "Unable to identify medicine. Please consult a pharmacist or healthcare provider.",
          verificationNeeded: true,
          reasoning: "Failed to parse AI response from multiple images. Manual verification required."
        };
      }

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

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let data;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        data = jsonMatch ? JSON.parse(jsonMatch[0]) : { identified: false, confidence: 1 };
      } catch {
        data = { identified: false, confidence: 1 };
      }

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

      let data;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        data = jsonMatch ? JSON.parse(jsonMatch[0]) : { confidence: 1 };
      } catch {
        data = { confidence: 1, parsedData: { type: 'text', content: qrData } };
      }

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
      console.log('[INFO] Extracting text from document with Gemini Vision OCR');

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

      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();

      let data;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        data = jsonMatch ? JSON.parse(jsonMatch[0]) : { confidence: 1, extractedText: '' };
      } catch {
        data = { confidence: 1, extractedText: text };
      }

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

      const result = await this.model.generateContent(interactionPrompt);
      const response = await result.response;
      const text = response.text();

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
        console.warn('[WARN] Failed to parse interaction analysis JSON');
        analysisData = {
          overallRisk: "unknown",
          interactions: [],
          contraindications: [],
          generalRecommendations: ["Consult your healthcare provider about these medications"],
          warningFlags: ["Unable to complete automated analysis"],
          consultationRecommended: true,
          reasoning: "Failed to parse AI analysis response"
        };
      }

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
}

module.exports = new GeminiService();
