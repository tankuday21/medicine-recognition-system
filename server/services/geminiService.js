const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs-extra');
const path = require('path');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is required');
      throw new Error('GEMINI_API_KEY is required');
    }

    try {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      console.log('✅ Gemini AI service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI service:', error);
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
      console.log('🔍 Starting quick medicine name verification...');

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
      console.log('🤖 Sending quick verification request to Gemini...');
      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();
      console.log('📝 Received quick verification response from Gemini');

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
        console.warn('⚠️ Failed to parse JSON response, creating fallback...');
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

      console.log('✅ Quick medicine verification completed');

      return {
        success: true,
        data: verificationData,
        rawResponse: text
      };

    } catch (error) {
      console.error('❌ Quick verification error:', error);

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
      console.log(`🔍 Starting multi-image medicine name verification with ${imagePaths.length} images...`);

      // Process each image for verification
      const imageAnalyses = [];

      for (let i = 0; i < imagePaths.length; i++) {
        const imagePath = imagePaths[i];
        console.log(`📸 Processing image ${i + 1}/${imagePaths.length}: ${imagePath}`);

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
      console.log('🤖 Sending multi-image verification request to gemini-2.5-pro...');
      const imageDataArray = imageAnalyses.map(img => img.imageData);
      const result = await this.model.generateContent([prompt, ...imageDataArray]);
      const response = await result.response;
      const text = response.text();
      console.log('📝 Received multi-image verification response from Gemini');

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
        console.warn('⚠️ Failed to parse multi-image JSON response, creating fallback...');
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

      console.log('✅ Multi-image medicine verification completed');

      return {
        success: true,
        data: verificationData,
        rawResponse: text
      };

    } catch (error) {
      console.error('❌ Multi-image verification error:', error);

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
      console.log('🔍 Starting comprehensive medicine analysis...');

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
      console.log('🤖 Sending comprehensive analysis request to Gemini...');
      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();
      console.log('📝 Received comprehensive response from Gemini');

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
        console.warn('⚠️ Failed to parse comprehensive JSON, creating fallback...');
        analysisData = this.createComprehensiveFallbackResponse(text, verifiedMedicineName);
      }

      // Validate and enhance response
      analysisData = this.validateAndEnhanceResponse(analysisData);

      console.log('✅ Comprehensive medicine analysis completed');

      return {
        success: true,
        data: analysisData,
        rawResponse: text
      };

    } catch (error) {
      console.error('❌ Comprehensive analysis error:', error);

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
      console.log(`🔍 Starting multi-image comprehensive analysis for: ${verifiedMedicineName}`);

      // Process each image
      const imageAnalyses = [];

      for (let i = 0; i < imagePaths.length; i++) {
        const imagePath = imagePaths[i];
        console.log(`📸 Processing image ${i + 1}/${imagePaths.length}: ${imagePath}`);

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
      console.log('🤖 Sending multi-image comprehensive analysis request to Gemini...');
      const imageDataArray = imageAnalyses.map(img => img.imageData);
      const result = await this.model.generateContent([prompt, ...imageDataArray]);
      const response = await result.response;
      const text = response.text();
      console.log('📝 Received multi-image comprehensive response from Gemini');

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
        console.warn('⚠️ Failed to parse multi-image comprehensive JSON, creating fallback...');
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

      console.log('✅ Multi-image comprehensive medicine analysis completed');

      return {
        success: true,
        data: analysisData,
        rawResponse: text
      };

    } catch (error) {
      console.error('❌ Multi-image comprehensive analysis error:', error);

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
      console.log('🔍 Starting Gemini Vision analysis...');
      
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
      console.log('🤖 Sending request to Gemini...');
      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();
      console.log('📝 Received response from Gemini');

      console.log('📝 Raw Gemini response received');

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
        console.warn('⚠️ Failed to parse JSON response, creating structured response...');
        analysisData = this.createFallbackResponse(text);
      }

      // Validate and enhance response
      analysisData = this.validateAndEnhanceResponse(analysisData);

      console.log('✅ Gemini analysis completed successfully');
      
      return {
        success: true,
        data: analysisData,
        rawResponse: text
      };

    } catch (error) {
      console.error('❌ Gemini analysis error:', error);
      
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
}

module.exports = new GeminiService();
