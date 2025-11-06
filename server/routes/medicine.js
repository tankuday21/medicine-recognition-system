const express = require('express');
const router = express.Router();

// Try to load services, but don't fail if they can't be loaded
let geminiService, medicineService, comprehensiveMedicineService;

try {
  geminiService = require('../services/geminiService');
  medicineService = require('../services/medicineService');
  comprehensiveMedicineService = require('../services/comprehensiveMedicineService');
  console.log('✅ All services loaded successfully');
} catch (error) {
  console.error('❌ Error loading services:', error.message);
  // Services will be null, and we'll handle this in the routes
}

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

    if (!geminiService) {
      return res.status(500).json({
        error: 'Service unavailable',
        message: 'Gemini AI service is not available'
      });
    }

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

// Search medicines by name or category
router.get('/search', async (req, res) => {
  try {
    const { q: query, category, page = 1, limit = 10 } = req.query;
    
    if (!query && !category) {
      return res.status(400).json({
        error: 'Missing search parameters',
        message: 'Please provide either a search query (q) or category'
      });
    }

    console.log(`🔍 Searching medicines: query="${query}", category="${category}"`);

    // Get the full medicine database (in a real app, this would be from a database)
    const allMedicines = await getMedicineDatabase();
    
    let filteredMedicines = allMedicines;

    // Filter by search query
    if (query && query.trim().length >= 2) {
      const searchTerm = query.trim().toLowerCase();
      filteredMedicines = filteredMedicines.filter(medicine => 
        medicine.name.toLowerCase().includes(searchTerm) ||
        medicine.genericName.toLowerCase().includes(searchTerm) ||
        medicine.category.toLowerCase().includes(searchTerm) ||
        medicine.commonUses.some(use => use.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by category
    if (category) {
      filteredMedicines = filteredMedicines.filter(medicine => 
        medicine.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = filteredMedicines.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredMedicines.length,
        pages: Math.ceil(filteredMedicines.length / parseInt(limit))
      },
      searchInfo: {
        query: query || null,
        category: category || null,
        resultsFound: filteredMedicines.length
      }
    });

  } catch (error) {
    console.error('Medicine search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'An error occurred while searching for medicines'
    });
  }
});

// Search medicine by name (legacy endpoint)
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
    
    // Redirect to the new search endpoint
    const searchUrl = `/api/medicine/search?q=${encodeURIComponent(name.trim())}`;
    const response = await fetch(`http://localhost:${process.env.PORT || 3001}${searchUrl}`);
    const result = await response.json();
    
    res.json(result);

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

// Medicine lookup endpoint (for workflow service)
router.post('/lookup', async (req, res) => {
  try {
    const { scanData } = req.body;
    
    if (!scanData) {
      return res.status(400).json({
        error: 'Missing scan data',
        message: 'Please provide scan data for medicine lookup'
      });
    }

    console.log('🔍 Medicine lookup request received');

    // Use the existing search functionality
    if (scanData.medicine?.brandName || scanData.medicine?.genericName) {
      const searchTerm = scanData.medicine.brandName || scanData.medicine.genericName;
      const medicineInfo = await medicineService.searchMedicineByName(searchTerm);
      
      res.json({
        success: true,
        data: medicineInfo
      });
    } else {
      res.status(400).json({
        error: 'Insufficient data',
        message: 'No medicine name found in scan data'
      });
    }

  } catch (error) {
    console.error('Medicine lookup error:', error);
    res.status(500).json({
      error: 'Lookup failed',
      message: 'An error occurred while looking up the medicine'
    });
  }
});

// Get popular medicines endpoint (for sync service)
router.get('/popular', async (req, res) => {
  try {
    console.log('📊 Popular medicines request received');

    // Comprehensive medicine database with real data
    const popularMedicines = [
      // Pain Relief & Anti-inflammatory
      {
        id: '1',
        name: 'Aspirin',
        genericName: 'Acetylsalicylic acid',
        category: 'Pain reliever',
        strength: '325mg',
        dosageForm: 'Tablet',
        manufacturer: 'Bayer',
        commonUses: ['Pain relief', 'Fever reduction', 'Heart health', 'Stroke prevention'],
        sideEffects: ['Stomach upset', 'Bleeding risk', 'Allergic reactions'],
        warnings: ['Do not give to children under 16', 'Avoid with blood thinners'],
        price: { min: 5, max: 15, currency: 'USD' }
      },
      {
        id: '2',
        name: 'Ibuprofen',
        genericName: 'Ibuprofen',
        category: 'NSAID',
        strength: '200mg',
        dosageForm: 'Tablet',
        manufacturer: 'Advil',
        commonUses: ['Pain relief', 'Anti-inflammatory', 'Fever reduction', 'Headache'],
        sideEffects: ['Stomach irritation', 'Dizziness', 'Drowsiness'],
        warnings: ['Take with food', 'Avoid with kidney problems'],
        price: { min: 8, max: 20, currency: 'USD' }
      },
      {
        id: '3',
        name: 'Acetaminophen',
        genericName: 'Paracetamol',
        category: 'Pain reliever',
        strength: '500mg',
        dosageForm: 'Tablet',
        manufacturer: 'Tylenol',
        commonUses: ['Pain relief', 'Fever reduction', 'Headache'],
        sideEffects: ['Rare at normal doses', 'Liver damage with overdose'],
        warnings: ['Do not exceed 4000mg per day', 'Avoid with liver disease'],
        price: { min: 6, max: 18, currency: 'USD' }
      },

      // Cardiovascular
      {
        id: '4',
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        category: 'ACE inhibitor',
        strength: '10mg',
        dosageForm: 'Tablet',
        manufacturer: 'Prinivil',
        commonUses: ['High blood pressure', 'Heart failure', 'Kidney protection'],
        sideEffects: ['Dry cough', 'Dizziness', 'Fatigue'],
        warnings: ['Monitor kidney function', 'Avoid in pregnancy'],
        price: { min: 10, max: 30, currency: 'USD' }
      },
      {
        id: '5',
        name: 'Amlodipine',
        genericName: 'Amlodipine',
        category: 'Calcium channel blocker',
        strength: '5mg',
        dosageForm: 'Tablet',
        manufacturer: 'Norvasc',
        commonUses: ['High blood pressure', 'Chest pain', 'Coronary artery disease'],
        sideEffects: ['Swelling', 'Dizziness', 'Flushing'],
        warnings: ['Monitor blood pressure', 'Avoid grapefruit juice'],
        price: { min: 12, max: 35, currency: 'USD' }
      },

      // Diabetes
      {
        id: '6',
        name: 'Metformin',
        genericName: 'Metformin',
        category: 'Diabetes medication',
        strength: '500mg',
        dosageForm: 'Tablet',
        manufacturer: 'Glucophage',
        commonUses: ['Type 2 diabetes', 'Blood sugar control', 'PCOS'],
        sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
        warnings: ['Take with meals', 'Monitor kidney function'],
        price: { min: 15, max: 40, currency: 'USD' }
      },
      {
        id: '7',
        name: 'Glipizide',
        genericName: 'Glipizide',
        category: 'Sulfonylurea',
        strength: '5mg',
        dosageForm: 'Tablet',
        manufacturer: 'Glucotrol',
        commonUses: ['Type 2 diabetes', 'Blood sugar control'],
        sideEffects: ['Low blood sugar', 'Weight gain', 'Dizziness'],
        warnings: ['Monitor blood sugar', 'Take before meals'],
        price: { min: 20, max: 50, currency: 'USD' }
      },

      // Antibiotics
      {
        id: '8',
        name: 'Amoxicillin',
        genericName: 'Amoxicillin',
        category: 'Antibiotic',
        strength: '500mg',
        dosageForm: 'Capsule',
        manufacturer: 'Amoxil',
        commonUses: ['Bacterial infections', 'Pneumonia', 'Ear infections'],
        sideEffects: ['Nausea', 'Diarrhea', 'Allergic reactions'],
        warnings: ['Complete full course', 'Report allergic reactions'],
        price: { min: 25, max: 60, currency: 'USD' }
      },
      {
        id: '9',
        name: 'Azithromycin',
        genericName: 'Azithromycin',
        category: 'Antibiotic',
        strength: '250mg',
        dosageForm: 'Tablet',
        manufacturer: 'Zithromax',
        commonUses: ['Respiratory infections', 'Skin infections', 'STDs'],
        sideEffects: ['Nausea', 'Diarrhea', 'Abdominal pain'],
        warnings: ['Complete full course', 'Monitor heart rhythm'],
        price: { min: 30, max: 80, currency: 'USD' }
      },

      // Mental Health
      {
        id: '10',
        name: 'Sertraline',
        genericName: 'Sertraline',
        category: 'SSRI Antidepressant',
        strength: '50mg',
        dosageForm: 'Tablet',
        manufacturer: 'Zoloft',
        commonUses: ['Depression', 'Anxiety', 'PTSD', 'OCD'],
        sideEffects: ['Nausea', 'Insomnia', 'Sexual side effects'],
        warnings: ['Monitor mood changes', 'Gradual discontinuation'],
        price: { min: 25, max: 70, currency: 'USD' }
      },

      // Respiratory
      {
        id: '11',
        name: 'Albuterol',
        genericName: 'Albuterol',
        category: 'Bronchodilator',
        strength: '90mcg',
        dosageForm: 'Inhaler',
        manufacturer: 'ProAir',
        commonUses: ['Asthma', 'COPD', 'Bronchospasm'],
        sideEffects: ['Tremor', 'Nervousness', 'Rapid heartbeat'],
        warnings: ['Rinse mouth after use', 'Monitor heart rate'],
        price: { min: 40, max: 100, currency: 'USD' }
      },

      // Gastrointestinal
      {
        id: '12',
        name: 'Omeprazole',
        genericName: 'Omeprazole',
        category: 'Proton pump inhibitor',
        strength: '20mg',
        dosageForm: 'Capsule',
        manufacturer: 'Prilosec',
        commonUses: ['GERD', 'Stomach ulcers', 'Heartburn'],
        sideEffects: ['Headache', 'Nausea', 'Diarrhea'],
        warnings: ['Take before meals', 'Long-term use monitoring'],
        price: { min: 18, max: 45, currency: 'USD' }
      },

      // Cholesterol
      {
        id: '13',
        name: 'Atorvastatin',
        genericName: 'Atorvastatin',
        category: 'Statin',
        strength: '20mg',
        dosageForm: 'Tablet',
        manufacturer: 'Lipitor',
        commonUses: ['High cholesterol', 'Heart disease prevention'],
        sideEffects: ['Muscle pain', 'Liver enzyme elevation'],
        warnings: ['Monitor liver function', 'Report muscle pain'],
        price: { min: 22, max: 65, currency: 'USD' }
      },

      // Thyroid
      {
        id: '14',
        name: 'Levothyroxine',
        genericName: 'Levothyroxine',
        category: 'Thyroid hormone',
        strength: '50mcg',
        dosageForm: 'Tablet',
        manufacturer: 'Synthroid',
        commonUses: ['Hypothyroidism', 'Thyroid hormone replacement'],
        sideEffects: ['Heart palpitations', 'Insomnia', 'Weight loss'],
        warnings: ['Take on empty stomach', 'Monitor thyroid levels'],
        price: { min: 15, max: 40, currency: 'USD' }
      },

      // Blood Thinners
      {
        id: '15',
        name: 'Warfarin',
        genericName: 'Warfarin',
        category: 'Anticoagulant',
        strength: '5mg',
        dosageForm: 'Tablet',
        manufacturer: 'Coumadin',
        commonUses: ['Blood clot prevention', 'Atrial fibrillation'],
        sideEffects: ['Bleeding', 'Bruising', 'Hair loss'],
        warnings: ['Regular blood monitoring', 'Avoid vitamin K foods'],
        price: { min: 20, max: 55, currency: 'USD' }
      }
    ];

    // Add pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedMedicines = popularMedicines.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedMedicines,
      pagination: {
        page,
        limit,
        total: popularMedicines.length,
        pages: Math.ceil(popularMedicines.length / limit)
      }
    });

  } catch (error) {
    console.error('Popular medicines error:', error);
    res.status(500).json({
      error: 'Failed to get popular medicines',
      message: 'An error occurred while fetching popular medicines'
    });
  }
});

// Get comprehensive medicine database
async function getMedicineDatabase() {
  // In a real application, this would come from a database
  // For now, we'll return the same comprehensive list
  return [
    // Pain Relief & Anti-inflammatory
    {
      id: '1',
      name: 'Aspirin',
      genericName: 'Acetylsalicylic acid',
      category: 'Pain reliever',
      strength: '325mg',
      dosageForm: 'Tablet',
      manufacturer: 'Bayer',
      commonUses: ['Pain relief', 'Fever reduction', 'Heart health', 'Stroke prevention'],
      sideEffects: ['Stomach upset', 'Bleeding risk', 'Allergic reactions'],
      warnings: ['Do not give to children under 16', 'Avoid with blood thinners'],
      price: { min: 5, max: 15, currency: 'USD' }
    },
    {
      id: '2',
      name: 'Ibuprofen',
      genericName: 'Ibuprofen',
      category: 'NSAID',
      strength: '200mg',
      dosageForm: 'Tablet',
      manufacturer: 'Advil',
      commonUses: ['Pain relief', 'Anti-inflammatory', 'Fever reduction', 'Headache'],
      sideEffects: ['Stomach irritation', 'Dizziness', 'Drowsiness'],
      warnings: ['Take with food', 'Avoid with kidney problems'],
      price: { min: 8, max: 20, currency: 'USD' }
    },
    {
      id: '3',
      name: 'Acetaminophen',
      genericName: 'Paracetamol',
      category: 'Pain reliever',
      strength: '500mg',
      dosageForm: 'Tablet',
      manufacturer: 'Tylenol',
      commonUses: ['Pain relief', 'Fever reduction', 'Headache'],
      sideEffects: ['Rare at normal doses', 'Liver damage with overdose'],
      warnings: ['Do not exceed 4000mg per day', 'Avoid with liver disease'],
      price: { min: 6, max: 18, currency: 'USD' }
    },
    // Cardiovascular
    {
      id: '4',
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      category: 'ACE inhibitor',
      strength: '10mg',
      dosageForm: 'Tablet',
      manufacturer: 'Prinivil',
      commonUses: ['High blood pressure', 'Heart failure', 'Kidney protection'],
      sideEffects: ['Dry cough', 'Dizziness', 'Fatigue'],
      warnings: ['Monitor kidney function', 'Avoid in pregnancy'],
      price: { min: 10, max: 30, currency: 'USD' }
    },
    {
      id: '5',
      name: 'Amlodipine',
      genericName: 'Amlodipine',
      category: 'Calcium channel blocker',
      strength: '5mg',
      dosageForm: 'Tablet',
      manufacturer: 'Norvasc',
      commonUses: ['High blood pressure', 'Chest pain', 'Coronary artery disease'],
      sideEffects: ['Swelling', 'Dizziness', 'Flushing'],
      warnings: ['Monitor blood pressure', 'Avoid grapefruit juice'],
      price: { min: 12, max: 35, currency: 'USD' }
    },
    // Diabetes
    {
      id: '6',
      name: 'Metformin',
      genericName: 'Metformin',
      category: 'Diabetes medication',
      strength: '500mg',
      dosageForm: 'Tablet',
      manufacturer: 'Glucophage',
      commonUses: ['Type 2 diabetes', 'Blood sugar control', 'PCOS'],
      sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
      warnings: ['Take with meals', 'Monitor kidney function'],
      price: { min: 15, max: 40, currency: 'USD' }
    },
    {
      id: '7',
      name: 'Glipizide',
      genericName: 'Glipizide',
      category: 'Sulfonylurea',
      strength: '5mg',
      dosageForm: 'Tablet',
      manufacturer: 'Glucotrol',
      commonUses: ['Type 2 diabetes', 'Blood sugar control'],
      sideEffects: ['Low blood sugar', 'Weight gain', 'Dizziness'],
      warnings: ['Monitor blood sugar', 'Take before meals'],
      price: { min: 20, max: 50, currency: 'USD' }
    },
    // Antibiotics
    {
      id: '8',
      name: 'Amoxicillin',
      genericName: 'Amoxicillin',
      category: 'Antibiotic',
      strength: '500mg',
      dosageForm: 'Capsule',
      manufacturer: 'Amoxil',
      commonUses: ['Bacterial infections', 'Pneumonia', 'Ear infections'],
      sideEffects: ['Nausea', 'Diarrhea', 'Allergic reactions'],
      warnings: ['Complete full course', 'Report allergic reactions'],
      price: { min: 25, max: 60, currency: 'USD' }
    },
    {
      id: '9',
      name: 'Azithromycin',
      genericName: 'Azithromycin',
      category: 'Antibiotic',
      strength: '250mg',
      dosageForm: 'Tablet',
      manufacturer: 'Zithromax',
      commonUses: ['Respiratory infections', 'Skin infections', 'STDs'],
      sideEffects: ['Nausea', 'Diarrhea', 'Abdominal pain'],
      warnings: ['Complete full course', 'Monitor heart rhythm'],
      price: { min: 30, max: 80, currency: 'USD' }
    },
    // Mental Health
    {
      id: '10',
      name: 'Sertraline',
      genericName: 'Sertraline',
      category: 'SSRI Antidepressant',
      strength: '50mg',
      dosageForm: 'Tablet',
      manufacturer: 'Zoloft',
      commonUses: ['Depression', 'Anxiety', 'PTSD', 'OCD'],
      sideEffects: ['Nausea', 'Insomnia', 'Sexual side effects'],
      warnings: ['Monitor mood changes', 'Gradual discontinuation'],
      price: { min: 25, max: 70, currency: 'USD' }
    },
    // Additional medicines...
    {
      id: '11',
      name: 'Albuterol',
      genericName: 'Albuterol',
      category: 'Bronchodilator',
      strength: '90mcg',
      dosageForm: 'Inhaler',
      manufacturer: 'ProAir',
      commonUses: ['Asthma', 'COPD', 'Bronchospasm'],
      sideEffects: ['Tremor', 'Nervousness', 'Rapid heartbeat'],
      warnings: ['Rinse mouth after use', 'Monitor heart rate'],
      price: { min: 40, max: 100, currency: 'USD' }
    },
    {
      id: '12',
      name: 'Omeprazole',
      genericName: 'Omeprazole',
      category: 'Proton pump inhibitor',
      strength: '20mg',
      dosageForm: 'Capsule',
      manufacturer: 'Prilosec',
      commonUses: ['GERD', 'Stomach ulcers', 'Heartburn'],
      sideEffects: ['Headache', 'Nausea', 'Diarrhea'],
      warnings: ['Take before meals', 'Long-term use monitoring'],
      price: { min: 18, max: 45, currency: 'USD' }
    }
  ];
}

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
