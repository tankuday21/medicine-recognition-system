const express = require('express');
const router = express.Router();
const medicineService = require('../services/medicineService');
const geminiService = require('../services/geminiService');
const comprehensiveMedicineService = require('../services/comprehensiveMedicineService');

// Phase 1: Quick medicine name verification (single image)
router.post('/verify-name', async (req, res) => {
  try {
    const { imagePath, imageData } = req.body;

    if (!imagePath && !imageData) {
      return res.status(400).json({
        error: 'Missing image data',
        message: 'Please provide either imagePath or imageData'
      });
    }

    console.log('🔍 Starting quick medicine name verification...');
    const verificationResult = await geminiService.quickMedicineVerification(imagePath || imageData);

    if (!verificationResult.success) {
      return res.status(400).json({
        error: 'Verification failed',
        message: verificationResult.error || 'Could not verify medicine name from image'
      });
    }

    console.log('✅ Quick verification completed successfully');

    res.json({
      success: true,
      data: {
        verification: verificationResult.data,
        timestamp: new Date().toISOString(),
        phase: 'name_verification'
      }
    });

  } catch (error) {
    console.error('❌ Medicine name verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'An error occurred while verifying the medicine name'
    });
  }
});

// Phase 1: Quick medicine name verification (multiple images)
router.post('/verify-multi-name', async (req, res) => {
  try {
    const { imagePaths } = req.body;

    if (!imagePaths || !Array.isArray(imagePaths) || imagePaths.length === 0) {
      return res.status(400).json({
        error: 'Missing image data',
        message: 'Please provide an array of image paths'
      });
    }

    if (imagePaths.length > 3) {
      return res.status(400).json({
        error: 'Too many images',
        message: 'Maximum 3 images allowed per analysis'
      });
    }

    console.log(`🔍 Starting multi-image medicine name verification with ${imagePaths.length} images...`);
    const verificationResult = await geminiService.quickMultiMedicineVerification(imagePaths);

    if (!verificationResult.success) {
      return res.status(400).json({
        error: 'Verification failed',
        message: verificationResult.error || 'Could not verify medicine name from images'
      });
    }

    console.log('✅ Multi-image verification completed successfully');

    res.json({
      success: true,
      data: {
        verification: verificationResult.data,
        timestamp: new Date().toISOString(),
        phase: 'multi_name_verification',
        imageCount: imagePaths.length
      }
    });

  } catch (error) {
    console.error('❌ Multi-image medicine name verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'An error occurred while verifying the medicine name from multiple images'
    });
  }
});

// Phase 2: Get comprehensive medicine details after user confirmation
router.post('/comprehensive-details', async (req, res) => {
  try {
    const { imagePath, imagePaths, imageData, verifiedMedicineName, includeReadMore = false } = req.body;

    console.log('🔍 Comprehensive details request received:');
    console.log('- imagePath:', imagePath);
    console.log('- imagePaths:', imagePaths);
    console.log('- imageData:', imageData ? 'Present' : 'Not present');
    console.log('- verifiedMedicineName:', verifiedMedicineName);
    console.log('- includeReadMore:', includeReadMore);

    // Handle both single and multiple image paths for backward compatibility
    let pathsToUse = [];
    if (imagePaths && Array.isArray(imagePaths)) {
      pathsToUse = imagePaths;
    } else if (imagePath) {
      pathsToUse = [imagePath];
    } else if (imageData) {
      pathsToUse = [imageData];
    }

    if (pathsToUse.length === 0) {
      return res.status(400).json({
        error: 'Missing image data',
        message: 'Please provide either imagePath, imagePaths array, or imageData'
      });
    }

    if (!verifiedMedicineName) {
      return res.status(400).json({
        error: 'Missing verified medicine name',
        message: 'Please provide the user-verified medicine name'
      });
    }

    console.log(`🔬 Getting comprehensive details for verified medicine: ${verifiedMedicineName}`);
    console.log(`📁 Processing ${pathsToUse.length} image(s):`, pathsToUse);

    // Get comprehensive details from Gemini
    const comprehensiveAnalysis = pathsToUse.length === 1
      ? await geminiService.getComprehensiveMedicineDetails(pathsToUse[0], verifiedMedicineName)
      : await geminiService.getMultiComprehensiveMedicineDetails(pathsToUse, verifiedMedicineName);

    if (!comprehensiveAnalysis.success) {
      return res.status(400).json({
        error: 'Comprehensive analysis failed',
        message: comprehensiveAnalysis.error || 'Could not get comprehensive medicine details'
      });
    }

    // Prepare essential information (always included)
    const essentialInfo = {
      identification: {
        verifiedName: verifiedMedicineName,
        brandName: comprehensiveAnalysis.data.medicine?.brandName,
        genericName: comprehensiveAnalysis.data.medicine?.genericName,
        strength: comprehensiveAnalysis.data.medicine?.strength,
        dosageForm: comprehensiveAnalysis.data.medicine?.dosageForm,
        manufacturer: comprehensiveAnalysis.data.medicine?.manufacturer
      },
      basicUsage: {
        indication: comprehensiveAnalysis.data.comprehensiveInfo?.indication,
        dosageInstructions: comprehensiveAnalysis.data.comprehensiveInfo?.dosageInstructions,
        route: comprehensiveAnalysis.data.medicine?.route
      },
      safetyHighlights: {
        keyWarnings: comprehensiveAnalysis.data.comprehensiveInfo?.warnings?.slice(0, 3) || [],
        commonSideEffects: comprehensiveAnalysis.data.comprehensiveInfo?.sideEffects?.slice(0, 5) || [],
        storageInstructions: comprehensiveAnalysis.data.comprehensiveInfo?.storageInstructions
      },
      physicalInfo: comprehensiveAnalysis.data.physicalCharacteristics,
      extractedText: comprehensiveAnalysis.data.extractedText,
      manufacturingInfo: comprehensiveAnalysis.data.manufacturingInfo
    };

    let result = {
      analysis: comprehensiveAnalysis.data,
      essentialInfo: essentialInfo,
      timestamp: new Date().toISOString(),
      phase: 'essential_info',
      hasReadMore: true
    };

    // If "Read More" is requested, include comprehensive details
    if (includeReadMore) {
      console.log('📚 Including comprehensive "Read More" details...');

      // Use faster approach: get additional details directly from Gemini comprehensive info
      const readMoreInfo = {
        detailedPharmacology: {
          mechanism: comprehensiveAnalysis.data.comprehensiveInfo?.mechanism || 'Information not available from image analysis',
          pharmacokinetics: comprehensiveAnalysis.data.comprehensiveInfo?.pharmacokinetics || 'Information not available from image analysis',
          therapeuticClass: comprehensiveAnalysis.data.medicine?.therapeuticClass || 'Not identified'
        },
        comprehensiveSafety: {
          allWarnings: comprehensiveAnalysis.data.comprehensiveInfo?.warnings || [],
          contraindications: comprehensiveAnalysis.data.comprehensiveInfo?.contraindications || [],
          allSideEffects: comprehensiveAnalysis.data.comprehensiveInfo?.sideEffects || [],
          drugInteractions: comprehensiveAnalysis.data.comprehensiveInfo?.drugInteractions || [],
          pregnancyCategory: comprehensiveAnalysis.data.comprehensiveInfo?.pregnancyCategory || 'Not specified'
        },
        regulatoryInfo: {
          fdaApprovalDate: 'Information not available from image analysis',
          rxOnly: comprehensiveAnalysis.data.regulatoryInfo?.rxOnly || false,
          controlledSubstance: comprehensiveAnalysis.data.regulatoryInfo?.controlledSubstance || 'Not specified',
          blackBoxWarning: comprehensiveAnalysis.data.regulatoryInfo?.blackBoxWarning || null
        },
        clinicalData: {
          indication: comprehensiveAnalysis.data.comprehensiveInfo?.indication || 'Not specified',
          dosageInstructions: comprehensiveAnalysis.data.comprehensiveInfo?.dosageInstructions || 'Consult healthcare provider',
          storageInstructions: comprehensiveAnalysis.data.comprehensiveInfo?.storageInstructions || 'Store as directed on package'
        },
        additionalSources: {
          'Gemini AI Analysis': {
            status: 'success',
            dataPoints: Object.keys(comprehensiveAnalysis.data.comprehensiveInfo || {}).length,
            confidence: comprehensiveAnalysis.data.confidence || 5
          }
        },
        dataQuality: {
          completeness: 75,
          accuracy: comprehensiveAnalysis.data.confidence * 10 || 50,
          verificationLevel: 'ai_analysis'
        },
        verificationLevel: 'ai_analysis'
      };

      result.readMoreInfo = readMoreInfo;
      result.phase = 'comprehensive_details';
      result.disclaimer = 'This comprehensive information is based on AI analysis of the medicine image and general medical knowledge. Always consult with healthcare professionals for accurate medical advice.';
    }

    console.log('✅ Comprehensive medicine details completed successfully');

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Comprehensive medicine details error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: 'An error occurred while getting comprehensive medicine details'
    });
  }
});

// Analyze medicine from uploaded image
router.post('/analyze', async (req, res) => {
  try {
    const { imagePath, imageData } = req.body;
    
    if (!imagePath && !imageData) {
      return res.status(400).json({
        error: 'Missing image data',
        message: 'Please provide either imagePath or imageData'
      });
    }

    // Step 1: Use Gemini Vision to identify the medicine
    console.log('🔍 Analyzing image with Gemini Vision API...');
    const geminiAnalysis = await geminiService.analyzeMedicineImage(imagePath || imageData);
    
    if (!geminiAnalysis.success) {
      return res.status(400).json({
        error: 'Image analysis failed',
        message: geminiAnalysis.error || 'Could not identify medicine from image'
      });
    }

    // Step 2: Execute comprehensive 4-phase analysis workflow
    console.log('🔬 Executing comprehensive medicine analysis workflow...');
    const comprehensiveResult = await comprehensiveMedicineService.processComprehensiveMedicineAnalysis(geminiAnalysis.data);

    if (!comprehensiveResult) {
      // Fallback to basic analysis if comprehensive analysis fails
      console.log('⚠️ Comprehensive analysis failed, falling back to basic analysis...');
      const basicMedicineInfo = await medicineService.getMedicineInfo(geminiAnalysis.data);

      const fallbackResult = {
        analysis: geminiAnalysis.data,
        medicineInfo: basicMedicineInfo,
        timestamp: new Date().toISOString(),
        disclaimer: 'Comprehensive analysis unavailable. This basic information is for educational purposes only. Always consult with healthcare professionals before making any medical decisions.',
        analysisType: 'basic'
      };

      return res.json({
        success: true,
        data: fallbackResult
      });
    }

    console.log('✅ Comprehensive medicine analysis completed successfully');

    // Step 3: Format result for frontend compatibility
    const result = {
      analysis: geminiAnalysis.data,
      medicineInfo: {
        basicInfo: extractBasicInfo(geminiAnalysis.data),
        comprehensiveInfo: comprehensiveResult.medicineProfile,
        dataSources: comprehensiveResult.sourceAttribution,
        sources: Object.keys(comprehensiveResult.sourceAttribution).filter(source =>
          comprehensiveResult.sourceAttribution[source].status === 'success'
        ),
        dataQuality: comprehensiveResult.dataQuality,
        discrepancies: comprehensiveResult.discrepancies,
        recommendations: comprehensiveResult.recommendations,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      disclaimer: comprehensiveResult.disclaimer,
      analysisType: 'comprehensive',
      verificationLevel: comprehensiveResult.dataQuality.verificationLevel
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Comprehensive medicine analysis error:', error);

    // Attempt fallback to basic analysis
    try {
      console.log('🔄 Attempting fallback to basic analysis...');
      const { imagePath, imageData } = req.body;
      const geminiAnalysis = await geminiService.analyzeMedicineImage(imagePath || imageData);

      if (geminiAnalysis.success) {
        const basicMedicineInfo = await medicineService.getMedicineInfo(geminiAnalysis.data);

        const fallbackResult = {
          analysis: geminiAnalysis.data,
          medicineInfo: basicMedicineInfo,
          timestamp: new Date().toISOString(),
          disclaimer: 'System error occurred during comprehensive analysis. This basic information is for educational purposes only. Always consult with healthcare professionals.',
          analysisType: 'basic_fallback',
          error: 'Comprehensive analysis failed'
        };

        return res.json({
          success: true,
          data: fallbackResult
        });
      }
    } catch (fallbackError) {
      console.error('❌ Fallback analysis also failed:', fallbackError);
    }

    res.status(500).json({
      error: 'Analysis failed',
      message: 'An error occurred while analyzing the medicine image'
    });
  }
});

// Search medicine by name
router.get('/search/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid search term',
        message: 'Please provide a medicine name with at least 2 characters'
      });
    }

    console.log(`🔍 Searching for medicine: ${name}`);
    const medicineInfo = await medicineService.searchMedicineByName(name.trim());
    
    res.json({
      success: true,
      data: medicineInfo
    });

  } catch (error) {
    console.error('Medicine search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'An error occurred while searching for the medicine'
    });
  }
});

// Get medicine information by NDC (National Drug Code)
router.get('/ndc/:ndc', async (req, res) => {
  try {
    const { ndc } = req.params;
    
    if (!ndc || !/^\d{4,5}-\d{3,4}-\d{1,2}$/.test(ndc)) {
      return res.status(400).json({
        error: 'Invalid NDC format',
        message: 'Please provide a valid NDC in format: XXXXX-XXXX-XX'
      });
    }

    console.log(`🔍 Looking up medicine by NDC: ${ndc}`);
    const medicineInfo = await medicineService.getMedicineByNDC(ndc);
    
    res.json({
      success: true,
      data: medicineInfo
    });

  } catch (error) {
    console.error('NDC lookup error:', error);
    res.status(500).json({
      error: 'Lookup failed',
      message: 'An error occurred while looking up the medicine by NDC'
    });
  }
});

// Helper function to extract basic info for compatibility
function extractBasicInfo(geminiAnalysis) {
  return {
    identified: geminiAnalysis.identified || false,
    confidence: geminiAnalysis.confidence || 1,
    brandName: geminiAnalysis.medicine?.brandName || null,
    genericName: geminiAnalysis.medicine?.genericName || null,
    strength: geminiAnalysis.medicine?.strength || null,
    dosageForm: geminiAnalysis.medicine?.dosageForm || null,
    manufacturer: geminiAnalysis.medicine?.manufacturer || null,
    ndc: geminiAnalysis.medicine?.ndc || null,
    physicalCharacteristics: geminiAnalysis.physicalCharacteristics || {},
    extractedText: geminiAnalysis.extractedText?.allText || [],
    expirationDate: geminiAnalysis.manufacturingInfo?.expirationDate || null,
    lotNumber: geminiAnalysis.manufacturingInfo?.lotNumber || null
  };
}

module.exports = router;
