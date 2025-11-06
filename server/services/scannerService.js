const { Medicine, ScanHistory } = require('../models');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

class ScannerService {
  constructor() {
    this.supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.maxImageSize = 10 * 1024 * 1024; // 10MB
  }

  // Scan barcode and use AI to get medicine information
  async scanBarcode(barcode, userId = null) {
    try {
      console.log(`🔍 Processing barcode with AI: ${barcode}`);
      
      // Use Gemini AI to get medicine information from barcode
      let geminiService;
      try {
        geminiService = require('./geminiService');
      } catch (error) {
        console.error('❌ Failed to load Gemini service:', error.message);
        throw new Error('AI service unavailable');
      }

      const aiResult = await geminiService.getMedicineInfoFromBarcode(barcode);
      
      const scanResult = {
        type: 'barcode',
        data: barcode,
        timestamp: new Date(),
        confidence: aiResult.success ? aiResult.data.confidence * 10 : 0,
        found: aiResult.success && aiResult.data.identified,
        medicineInfo: aiResult.success ? aiResult.data : null
      };

      // Log scan history if user is provided
      if (userId) {
        await this.logScanHistory(userId, scanResult);
      }

      return {
        success: true,
        data: scanResult,
        message: aiResult.success ? 'Barcode processed successfully' : 'Barcode not recognized'
      };
    } catch (error) {
      console.error('Barcode scan error:', error);
      return {
        success: false,
        message: 'Failed to process barcode scan',
        data: {
          type: 'barcode',
          data: barcode,
          timestamp: new Date(),
          confidence: 0,
          found: false,
          error: error.message
        }
      };
    }
  }

  // Process QR code data using AI
  async processQRCode(qrData, userId = null) {
    try {
      console.log(`🔍 Processing QR code with AI: ${qrData}`);
      
      // Use Gemini AI to parse and understand QR code data
      let geminiService;
      try {
        geminiService = require('./geminiService');
      } catch (error) {
        console.error('❌ Failed to load Gemini service:', error.message);
        throw new Error('AI service unavailable');
      }

      const aiResult = await geminiService.parseQRCodeData(qrData);
      
      const scanResult = {
        type: 'qr',
        data: qrData,
        timestamp: new Date(),
        confidence: aiResult.success ? aiResult.data.confidence * 10 : 0,
        parsedData: aiResult.success ? aiResult.data.parsedData : null,
        medicineInfo: aiResult.success ? aiResult.data.medicineInfo : null
      };

      // Log scan history if user is provided
      if (userId) {
        await this.logScanHistory(userId, scanResult);
      }

      return {
        success: true,
        data: scanResult
      };
    } catch (error) {
      console.error('QR code processing error:', error);
      return {
        success: false,
        message: 'Failed to process QR code'
      };
    }
  }

  // Process medicine images for identification using Gemini AI (supports multiple images)
  async identifyMedicine(imageBuffers, userId = null) {
    // Handle both single image and multiple images
    const buffers = Array.isArray(imageBuffers) ? imageBuffers : [imageBuffers];
    
    // Define these outside try block so they're accessible in catch
    let processedImages = [];
    let tempImagePaths = [];
    
    try {
      console.log(`🔍 Processing ${buffers.length} medicine image(s) for identification with Gemini AI`);
      
      // Process all images
      const tempDir = path.join(__dirname, '../temp');
      await fs.ensureDir(tempDir);
      
      for (let i = 0; i < buffers.length; i++) {
        const processedImage = await this.processImage(buffers[i]);
        processedImages.push(processedImage);
        
        const tempImagePath = path.join(tempDir, `medicine_${Date.now()}_${i}.jpg`);
        await fs.writeFile(tempImagePath, processedImage.buffer);
        tempImagePaths.push(tempImagePath);
      }
      
      console.log(`📸 Processed ${processedImages.length} image(s), total size: ${processedImages.reduce((sum, img) => sum + img.size, 0)} bytes`);
      
      try {
        // Use Gemini AI for pill identification
        let geminiService;
        try {
          geminiService = require('./geminiService');
          console.log('✅ Gemini service loaded successfully');
        } catch (error) {
          console.error('❌ Failed to load Gemini service:', error.message);
          console.error('Error stack:', error.stack);
          throw new Error(`AI service unavailable: ${error.message}`);
        }

        console.log(`📸 Calling Gemini with ${tempImagePaths.length} image(s)`);
        
        // Get medicine identification from Gemini (single or multiple images)
        const geminiResult = tempImagePaths.length === 1
          ? await geminiService.identifyPillFromImage(tempImagePaths[0])
          : await geminiService.identifyPillFromMultipleImages(tempImagePaths);
        
        console.log('📊 Gemini result received:', {
          success: geminiResult.success,
          hasData: !!geminiResult.data,
          error: geminiResult.error
        });
        
        // Clean up temp files
        for (const tempPath of tempImagePaths) {
          await fs.remove(tempPath).catch(() => {});
        }
        
        if (geminiResult.success && geminiResult.data) {
          const pillData = geminiResult.data;
          console.log('✅ Processing successful Gemini result');
          console.log('Pill data keys:', Object.keys(pillData));
          
          const scanResult = {
            type: 'pill',
            data: pillData.medicineName?.primaryName || 'Pill identified',
            timestamp: new Date(),
            confidence: pillData.confidence * 10, // Convert 1-10 scale to percentage
            imageProcessed: true,
            imageSize: processedImages.reduce((sum, img) => sum + img.size, 0),
            imageCount: processedImages.length,
            pillInfo: {
              identified: pillData.identified,
              medicineType: pillData.medicineType || 'unknown',
              medicineName: pillData.medicineName,
              physicalCharacteristics: pillData.physicalCharacteristics,
              dosageInformation: pillData.dosageInformation || {},
              possibleMatches: pillData.possibleMatches || [],
              activeIngredients: pillData.activeIngredients || [],
              commonUses: pillData.commonUses || [],
              administrationRoute: pillData.administrationRoute || 'unknown',
              storageInstructions: pillData.storageInstructions || null,
              expiryInfo: pillData.expiryInfo || null,
              manufacturerInfo: pillData.manufacturerInfo || null,
              safetyWarning: pillData.safetyWarning,
              verificationNeeded: pillData.verificationNeeded
            }
          };

          // Log scan history if user is provided
          if (userId) {
            await this.logScanHistory(userId, scanResult);
          }

          return {
            success: true,
            data: scanResult,
            message: pillData.identified ? 'Pill identified successfully' : 'Pill identification uncertain'
          };
        } else {
          throw new Error(geminiResult.error || 'Failed to identify pill');
        }
      } catch (aiError) {
        // Clean up temp files on error
        for (const tempPath of tempImagePaths) {
          await fs.remove(tempPath).catch(() => {});
        }
        
        console.error('AI identification error:', aiError);
        
        // Return fallback result
        const scanResult = {
          type: 'pill',
          data: 'Pill identification unavailable',
          timestamp: new Date(),
          confidence: 0,
          imageProcessed: true,
          imageSize: processedImages.reduce((sum, img) => sum + img.size, 0),
          imageCount: processedImages.length,
          pillInfo: {
            identified: false,
            error: aiError.message
          }
        };

        return {
          success: false,
          data: scanResult,
          message: 'AI service temporarily unavailable. Please try again later.'
        };
      }
    } catch (error) {
      console.error('Medicine identification error:', error);
      return {
        success: false,
        message: 'Failed to process medicine image(s)'
      };
    }
  }

  // Extract text from document image using Gemini AI OCR
  async extractTextFromDocument(imageBuffer, userId = null) {
    try {
      console.log('🔍 Processing document with Gemini AI OCR');
      
      // Validate and process image
      const processedImage = await this.processImage(imageBuffer);
      
      // Save image temporarily for Gemini processing
      const tempDir = path.join(__dirname, '../temp');
      await fs.ensureDir(tempDir);
      const tempImagePath = path.join(tempDir, `document_${Date.now()}.jpg`);
      await fs.writeFile(tempImagePath, processedImage.buffer);
      
      try {
        // Use Gemini AI for OCR
        let geminiService;
        try {
          geminiService = require('./geminiService');
        } catch (error) {
          console.error('❌ Failed to load Gemini service:', error.message);
          throw new Error('AI service unavailable');
        }

        const aiResult = await geminiService.extractTextFromDocument(tempImagePath);
        
        // Clean up temp file
        await fs.remove(tempImagePath).catch(() => {});
        
        const scanResult = {
          type: 'document',
          data: aiResult.success ? aiResult.data.extractedText : 'OCR failed',
          timestamp: new Date(),
          confidence: aiResult.success ? aiResult.data.confidence * 10 : 0,
          imageProcessed: true,
          imageSize: processedImage.size,
          extractedText: aiResult.success ? aiResult.data.extractedText : '',
          documentInfo: aiResult.success ? aiResult.data : null
        };

        // Log scan history if user is provided
        if (userId) {
          await this.logScanHistory(userId, scanResult);
        }

        return {
          success: true,
          data: scanResult,
          message: aiResult.success ? 'Document processed successfully' : 'OCR failed'
        };
      } catch (aiError) {
        // Clean up temp file on error
        await fs.remove(tempImagePath).catch(() => {});
        throw aiError;
      }
    } catch (error) {
      console.error('Document processing error:', error);
      return {
        success: false,
        message: 'Failed to process document',
        data: {
          type: 'document',
          data: 'Document processing failed',
          timestamp: new Date(),
          confidence: 0,
          imageProcessed: false,
          extractedText: '',
          error: error.message
        }
      };
    }
  }

  // Process and optimize image
  async processImage(imageBuffer) {
    try {
      // Validate image size
      if (imageBuffer.length > this.maxImageSize) {
        throw new Error('Image size exceeds maximum limit');
      }

      // Process image with Sharp
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      // Resize if too large (max 1920x1080)
      let processedImage = image;
      if (metadata.width > 1920 || metadata.height > 1080) {
        processedImage = image.resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Convert to JPEG for consistency and compression
      const optimizedBuffer = await processedImage
        .jpeg({ quality: 85 })
        .toBuffer();

      return {
        buffer: optimizedBuffer,
        size: optimizedBuffer.length,
        originalSize: imageBuffer.length,
        width: metadata.width,
        height: metadata.height,
        format: 'jpeg'
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process image');
    }
  }

  // Log scan history
  async logScanHistory(userId, scanResult) {
    try {
      const scanHistory = new ScanHistory({
        userId,
        scanType: scanResult.type,
        scanResult: {
          data: scanResult.data,
          confidence: scanResult.confidence,
          timestamp: scanResult.timestamp
        },
        medicineId: scanResult.medicine?.id || null,
        confidence: scanResult.confidence,
        isSuccessful: scanResult.confidence > 0,
        processingTime: 0 // TODO: Implement timing
      });

      await scanHistory.save();
      console.log('✅ Scan history logged');
    } catch (error) {
      console.error('Failed to log scan history:', error);
      // Don't throw error, just log it
    }
  }

  // Search medicines by name or generic name
  async searchMedicines(query, limit = 10) {
    try {
      const medicines = await Medicine.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: new RegExp(query, 'i') },
              { genericName: new RegExp(query, 'i') }
            ]
          }
        ]
      })
      .limit(limit)
      .select('name genericName dosage manufacturer uses price')
      .sort({ name: 1 });

      return {
        success: true,
        data: medicines
      };
    } catch (error) {
      console.error('Medicine search error:', error);
      return {
        success: false,
        message: 'Failed to search medicines'
      };
    }
  }

  // Get scan history for user
  async getScanHistory(userId, limit = 20, offset = 0) {
    try {
      const history = await ScanHistory.find({ userId })
        .populate('medicineId', 'name genericName dosage')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);

      const total = await ScanHistory.countDocuments({ userId });

      return {
        success: true,
        data: {
          history,
          total,
          hasMore: (offset + limit) < total
        }
      };
    } catch (error) {
      console.error('Scan history fetch error:', error);
      return {
        success: false,
        message: 'Failed to fetch scan history'
      };
    }
  }
}

module.exports = new ScannerService();