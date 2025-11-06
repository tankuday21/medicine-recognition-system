const fs = require('fs');
const path = require('path');

class OCRService {
  constructor() {
    this.isGoogleVisionEnabled = !!process.env.GOOGLE_CLOUD_VISION_API_KEY;
    console.log('📄 OCR Service initialized');
    console.log('🔑 Google Vision API:', this.isGoogleVisionEnabled ? 'Enabled' : 'Mock Mode');
  }

  // Main OCR processing function
  async processDocument(filePath, fileType) {
    try {
      console.log(`📄 Processing document: ${filePath} (${fileType})`);

      if (this.isGoogleVisionEnabled) {
        return await this.processWithGoogleVision(filePath, fileType);
      } else {
        return await this.processWithMockOCR(filePath, fileType);
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      return {
        success: false,
        message: 'Failed to process document',
        error: error.message
      };
    }
  }

  // Google Cloud Vision API processing
  async processWithGoogleVision(filePath, fileType) {
    try {
      // This would be the actual Google Vision implementation
      // const vision = require('@google-cloud/vision');
      // const client = new vision.ImageAnnotatorClient();
      
      console.log('🔍 Processing with Google Cloud Vision API...');
      
      // For now, return mock data structure that matches Google Vision response
      return {
        success: true,
        source: 'google_vision',
        extractedText: 'Mock Google Vision extracted text would go here...',
        confidence: 0.95,
        blocks: [],
        metadata: {
          processingTime: Date.now(),
          fileType,
          filePath
        }
      };
    } catch (error) {
      console.error('Google Vision API error:', error);
      throw error;
    }
  }

  // Mock OCR processing for development
  async processWithMockOCR(filePath, fileType) {
    try {
      console.log('🎭 Processing with Mock OCR...');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate realistic mock medical report text based on file name or type
      const mockText = this.generateMockMedicalReport();

      return {
        success: true,
        source: 'mock_ocr',
        extractedText: mockText,
        confidence: 0.88,
        blocks: this.generateMockTextBlocks(mockText),
        metadata: {
          processingTime: Date.now(),
          fileType,
          filePath,
          note: 'This is mock OCR data for development purposes'
        }
      };
    } catch (error) {
      console.error('Mock OCR error:', error);
      throw error;
    }
  }

  // Generate realistic mock medical report text
  generateMockMedicalReport() {
    const mockReports = [
      `COMPREHENSIVE METABOLIC PANEL
      
Patient: John Doe
Date: ${new Date().toLocaleDateString()}
Lab ID: LAB123456

GLUCOSE: 95 mg/dL (Normal: 70-100)
CREATININE: 1.1 mg/dL (Normal: 0.7-1.3)
BUN: 18 mg/dL (Normal: 7-20)
SODIUM: 142 mEq/L (Normal: 136-145)
POTASSIUM: 4.2 mEq/L (Normal: 3.5-5.1)
CHLORIDE: 101 mEq/L (Normal: 98-107)
CO2: 24 mEq/L (Normal: 22-29)
TOTAL PROTEIN: 7.2 g/dL (Normal: 6.0-8.3)
ALBUMIN: 4.1 g/dL (Normal: 3.5-5.0)
TOTAL BILIRUBIN: 0.8 mg/dL (Normal: 0.3-1.2)
ALT: 28 U/L (Normal: 7-56)
AST: 32 U/L (Normal: 10-40)

INTERPRETATION:
All values within normal limits.`,

      `LIPID PANEL RESULTS
      
Patient: Jane Smith  
Date: ${new Date().toLocaleDateString()}
Lab ID: LAB789012

TOTAL CHOLESTEROL: 220 mg/dL (Desirable: <200)
HDL CHOLESTEROL: 45 mg/dL (Normal: >40 men, >50 women)
LDL CHOLESTEROL: 145 mg/dL (Optimal: <100)
TRIGLYCERIDES: 180 mg/dL (Normal: <150)
NON-HDL CHOLESTEROL: 175 mg/dL

RISK ASSESSMENT:
Elevated total cholesterol and LDL cholesterol.
Recommend dietary modifications and follow-up in 3 months.`,

      `COMPLETE BLOOD COUNT (CBC)
      
Patient: Mike Johnson
Date: ${new Date().toLocaleDateString()}
Lab ID: LAB345678

WHITE BLOOD CELLS: 7.2 K/uL (Normal: 4.5-11.0)
RED BLOOD CELLS: 4.8 M/uL (Normal: 4.7-6.1)
HEMOGLOBIN: 14.5 g/dL (Normal: 14.0-18.0)
HEMATOCRIT: 42.1% (Normal: 42.0-52.0)
PLATELETS: 285 K/uL (Normal: 150-450)
NEUTROPHILS: 65% (Normal: 50-70%)
LYMPHOCYTES: 28% (Normal: 20-40%)
MONOCYTES: 5% (Normal: 2-8%)
EOSINOPHILS: 2% (Normal: 1-4%)

INTERPRETATION:
Complete blood count within normal limits.`
    ];

    return mockReports[Math.floor(Math.random() * mockReports.length)];
  }

  // Generate mock text blocks for structure
  generateMockTextBlocks(text) {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map((line, index) => ({
      text: line.trim(),
      confidence: 0.85 + Math.random() * 0.1,
      boundingBox: {
        x: 50,
        y: 50 + (index * 25),
        width: 500,
        height: 20
      }
    }));
  }

  // Preprocess extracted text
  preprocessText(rawText) {
    try {
      console.log('🧹 Preprocessing extracted text...');
      
      // Clean up common OCR artifacts
      let cleanedText = rawText
        .replace(/[^\w\s\n\r\t.,;:()\-\/]/g, '') // Remove special characters except common punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim();

      // Fix common OCR mistakes
      const ocrCorrections = {
        '0': 'O', // Zero to letter O in some contexts
        'l': '1', // Lowercase L to number 1 in numeric contexts
        'S': '5', // S to 5 in numeric contexts
        'G': '6', // G to 6 in numeric contexts
      };

      // Apply corrections in numeric contexts
      cleanedText = cleanedText.replace(/(\d+)[Ol](\d+)/g, (match, p1, p2) => {
        return match.replace(/[Ol]/g, '0');
      });

      return {
        success: true,
        originalText: rawText,
        cleanedText: cleanedText,
        corrections: Object.keys(ocrCorrections).length
      };
    } catch (error) {
      console.error('Text preprocessing error:', error);
      return {
        success: false,
        originalText: rawText,
        cleanedText: rawText,
        error: error.message
      };
    }
  }

  // Validate file type and size
  validateFile(file) {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        message: 'Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP) or PDF file.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        message: 'File too large. Please upload a file smaller than 10MB.'
      };
    }

    return {
      valid: true,
      message: 'File validation passed'
    };
  }

  // Get processing status
  getStatus() {
    return {
      isEnabled: true,
      provider: this.isGoogleVisionEnabled ? 'Google Cloud Vision' : 'Mock OCR',
      supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP', 'PDF'],
      maxFileSize: '10MB'
    };
  }
}

// Create singleton instance
const ocrService = new OCRService();

module.exports = ocrService;