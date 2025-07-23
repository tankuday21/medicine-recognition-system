const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

/**
 * Comprehensive Medicine Information Service
 * Implements a 4-phase workflow for thorough medicine data collection and verification
 */
class ComprehensiveMedicineService {
  constructor() {
    // API Configuration
    this.apis = {
      fda: {
        drugsAtFDA: 'https://api.fda.gov/drug/drugsfda.json',
        adverseEvents: 'https://api.fda.gov/drug/event.json',
        labeling: 'https://api.fda.gov/drug/label.json',
        enforcement: 'https://api.fda.gov/drug/enforcement.json',
        ndc: 'https://api.fda.gov/drug/ndc.json'
      },
      rxnorm: {
        base: 'https://rxnav.nlm.nih.gov/REST',
        drugs: 'https://rxnav.nlm.nih.gov/REST/drugs.json',
        rxcui: 'https://rxnav.nlm.nih.gov/REST/rxcui',
        interaction: 'https://rxnav.nlm.nih.gov/REST/interaction'
      },
      dailymed: {
        base: 'https://dailymed.nlm.nih.gov/dailymed',
        search: 'https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json'
      },
      nih: {
        clinicalTrials: 'https://clinicaltrials.gov/api/query/study_fields',
        pubmed: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
      }
    };

    // Data quality thresholds
    this.qualityThresholds = {
      minimumSources: 3,
      highConfidenceScore: 85,
      mediumConfidenceScore: 70,
      minimumDataCompleteness: 90
    };

    // Source reliability weights (1-10 scale)
    this.sourceReliability = {
      'FDA Drugs@FDA': 10,
      'OpenFDA Labeling': 10,
      'DailyMed': 9,
      'RxNorm': 8,
      'OpenFDA Adverse Events': 8,
      'NIH Clinical Trials': 7,
      'PubMed': 7,
      'Local Database': 5,
      'Web Scraped': 4,
      'AI Analysis': 3
    };

    this.loadLocalDatabase();
  }

  /**
   * Load local medicine database
   */
  async loadLocalDatabase() {
    try {
      const dbPath = path.join(__dirname, '..', 'data', 'medicines.json');
      if (await fs.pathExists(dbPath)) {
        this.localDB = await fs.readJson(dbPath);
        console.log('📚 Local medicine database loaded');
      } else {
        this.localDB = [];
        console.log('⚠️ No local medicine database found');
      }
    } catch (error) {
      console.error('Error loading local database:', error);
      this.localDB = [];
    }
  }

  /**
   * Main workflow orchestrator - implements 4-phase comprehensive analysis
   * @param {Object} geminiAnalysis - Initial Gemini Vision analysis
   * @returns {Object} Comprehensive, verified medicine information
   */
  async processComprehensiveMedicineAnalysis(geminiAnalysis) {
    console.log('🚀 Starting comprehensive medicine analysis workflow...');
    
    const workflow = {
      startTime: new Date(),
      phases: {
        phase1: { status: 'pending', data: null, duration: 0 },
        phase2: { status: 'pending', data: null, duration: 0 },
        phase3: { status: 'pending', data: null, duration: 0 },
        phase4: { status: 'pending', data: null, duration: 0 }
      },
      finalResult: null,
      totalDuration: 0
    };

    try {
      // Phase 1: Enhanced Initial Medicine Identification
      workflow.phases.phase1 = await this.executePhase1(geminiAnalysis);
      
      // Phase 2: Comprehensive Data Collection
      workflow.phases.phase2 = await this.executePhase2(workflow.phases.phase1.data);
      
      // Phase 3: Cross-Verification and Data Quality Assurance
      workflow.phases.phase3 = await this.executePhase3(workflow.phases.phase2.data);
      
      // Phase 4: Comprehensive Results Compilation
      workflow.phases.phase4 = await this.executePhase4(workflow.phases.phase3.data);
      
      workflow.finalResult = workflow.phases.phase4.data;
      workflow.totalDuration = Date.now() - workflow.startTime.getTime();
      
      console.log(`✅ Comprehensive analysis completed in ${workflow.totalDuration}ms`);
      return workflow.finalResult;
      
    } catch (error) {
      console.error('❌ Comprehensive analysis failed:', error);
      workflow.error = error.message;
      workflow.totalDuration = Date.now() - workflow.startTime.getTime();
      
      // Return best available data even if workflow failed
      return this.createFallbackResult(geminiAnalysis, workflow);
    }
  }

  /**
   * Phase 1: Enhanced Initial Medicine Identification
   * Extract and validate basic identifiers from Gemini analysis
   */
  async executePhase1(geminiAnalysis) {
    const startTime = Date.now();
    console.log('📋 Phase 1: Enhanced Initial Medicine Identification');
    
    try {
      const identifiers = {
        primary: {
          brandName: this.extractBrandName(geminiAnalysis),
          genericName: this.extractGenericName(geminiAnalysis),
          ndc: this.extractNDC(geminiAnalysis),
          manufacturer: this.extractManufacturer(geminiAnalysis)
        },
        secondary: {
          activeIngredients: this.extractActiveIngredients(geminiAnalysis),
          strength: this.extractStrength(geminiAnalysis),
          dosageForm: this.extractDosageForm(geminiAnalysis),
          route: this.extractRoute(geminiAnalysis)
        },
        physical: {
          shape: geminiAnalysis.physicalCharacteristics?.shape,
          color: geminiAnalysis.physicalCharacteristics?.color,
          markings: geminiAnalysis.physicalCharacteristics?.markings,
          size: geminiAnalysis.physicalCharacteristics?.size,
          packaging: geminiAnalysis.physicalCharacteristics?.packaging
        },
        extracted: {
          allText: geminiAnalysis.extractedText?.allText || [],
          drugNames: geminiAnalysis.extractedText?.drugNames || [],
          codes: geminiAnalysis.extractedText?.codes || [],
          warnings: geminiAnalysis.extractedText?.warnings || []
        },
        confidence: {
          overall: geminiAnalysis.confidence || 1,
          identification: geminiAnalysis.identified ? 8 : 3,
          dataQuality: this.assessInitialDataQuality(geminiAnalysis)
        }
      };

      // Validate and clean identifiers
      identifiers.validated = this.validateIdentifiers(identifiers);
      
      // Generate search strategies
      identifiers.searchStrategies = this.generateSearchStrategies(identifiers);
      
      return {
        status: 'completed',
        data: identifiers,
        duration: Date.now() - startTime,
        dataPoints: this.countDataPoints(identifiers)
      };
      
    } catch (error) {
      console.error('Phase 1 error:', error);
      return {
        status: 'failed',
        error: error.message,
        duration: Date.now() - startTime,
        data: this.createMinimalIdentifiers(geminiAnalysis)
      };
    }
  }

  /**
   * Extract brand name with validation
   */
  extractBrandName(analysis) {
    const candidates = [];
    
    if (analysis.medicine?.brandName) candidates.push(analysis.medicine.brandName);
    if (analysis.extractedText?.drugNames) candidates.push(...analysis.extractedText.drugNames);
    
    // Filter and validate brand name candidates
    return this.selectBestCandidate(candidates, 'brandName');
  }

  /**
   * Extract generic name with validation
   */
  extractGenericName(analysis) {
    const candidates = [];
    
    if (analysis.medicine?.genericName) candidates.push(analysis.medicine.genericName);
    if (analysis.medicine?.activeIngredients) candidates.push(...analysis.medicine.activeIngredients);
    
    return this.selectBestCandidate(candidates, 'genericName');
  }

  /**
   * Extract NDC with validation
   */
  extractNDC(analysis) {
    const ndcPattern = /\d{4,5}-\d{3,4}-\d{1,2}/;
    
    // Check direct NDC field
    if (analysis.medicine?.ndc && ndcPattern.test(analysis.medicine.ndc)) {
      return analysis.medicine.ndc;
    }
    
    // Check manufacturing info
    if (analysis.manufacturingInfo?.ndc && ndcPattern.test(analysis.manufacturingInfo.ndc)) {
      return analysis.manufacturingInfo.ndc;
    }
    
    // Check extracted codes
    if (analysis.extractedText?.codes) {
      for (const code of analysis.extractedText.codes) {
        if (ndcPattern.test(code)) {
          return code;
        }
      }
    }
    
    return null;
  }

  /**
   * Extract manufacturer with validation
   */
  extractManufacturer(analysis) {
    const candidates = [];
    
    if (analysis.medicine?.manufacturer) candidates.push(analysis.medicine.manufacturer);
    if (analysis.medicine?.distributedBy) candidates.push(analysis.medicine.distributedBy);
    if (analysis.manufacturingInfo?.manufacturer) candidates.push(analysis.manufacturingInfo.manufacturer);
    
    return this.selectBestCandidate(candidates, 'manufacturer');
  }

  /**
   * Extract active ingredients
   */
  extractActiveIngredients(analysis) {
    const ingredients = new Set();
    
    if (analysis.medicine?.activeIngredients) {
      analysis.medicine.activeIngredients.forEach(ing => ingredients.add(ing));
    }
    
    if (analysis.medicine?.genericName) {
      ingredients.add(analysis.medicine.genericName);
    }
    
    return Array.from(ingredients);
  }

  /**
   * Extract strength information
   */
  extractStrength(analysis) {
    return analysis.medicine?.strength || null;
  }

  /**
   * Extract dosage form
   */
  extractDosageForm(analysis) {
    return analysis.medicine?.dosageForm || null;
  }

  /**
   * Extract route of administration
   */
  extractRoute(analysis) {
    return analysis.medicine?.route || null;
  }

  /**
   * Select best candidate from multiple options
   */
  selectBestCandidate(candidates, type) {
    if (!candidates || candidates.length === 0) return null;
    
    // Remove duplicates and filter valid candidates
    const validCandidates = [...new Set(candidates)]
      .filter(candidate => candidate && typeof candidate === 'string' && candidate.trim().length > 0)
      .map(candidate => candidate.trim());
    
    if (validCandidates.length === 0) return null;
    if (validCandidates.length === 1) return validCandidates[0];
    
    // Apply type-specific selection logic
    return this.applySelectionLogic(validCandidates, type);
  }

  /**
   * Apply selection logic based on candidate type
   */
  applySelectionLogic(candidates, type) {
    switch (type) {
      case 'brandName':
        // Prefer capitalized names, avoid generic-sounding names
        return candidates.find(c => /^[A-Z][a-z]+/.test(c)) || candidates[0];
      
      case 'genericName':
        // Prefer lowercase or scientific names
        return candidates.find(c => /^[a-z]/.test(c) || c.includes('acid') || c.includes('ine')) || candidates[0];
      
      case 'manufacturer':
        // Prefer known pharmaceutical company patterns
        const knownManufacturers = ['pfizer', 'johnson', 'merck', 'novartis', 'roche', 'abbott', 'bayer'];
        return candidates.find(c => knownManufacturers.some(m => c.toLowerCase().includes(m))) || candidates[0];
      
      default:
        return candidates[0];
    }
  }

  /**
   * Assess initial data quality from Gemini analysis
   */
  assessInitialDataQuality(analysis) {
    let score = 0;
    let maxScore = 0;
    
    // Check presence of key identifiers
    const checks = [
      { field: analysis.medicine?.brandName, weight: 15 },
      { field: analysis.medicine?.genericName, weight: 15 },
      { field: analysis.medicine?.activeIngredients?.length > 0, weight: 10 },
      { field: analysis.medicine?.strength, weight: 10 },
      { field: analysis.medicine?.manufacturer, weight: 10 },
      { field: analysis.medicine?.ndc, weight: 15 },
      { field: analysis.physicalCharacteristics?.markings, weight: 10 },
      { field: analysis.extractedText?.allText?.length > 0, weight: 10 },
      { field: analysis.manufacturingInfo?.lotNumber, weight: 5 }
    ];
    
    checks.forEach(check => {
      maxScore += check.weight;
      if (check.field) score += check.weight;
    });
    
    return Math.round((score / maxScore) * 100);
  }

  /**
   * Validate extracted identifiers
   */
  validateIdentifiers(identifiers) {
    const validation = {
      brandName: this.validateBrandName(identifiers.primary.brandName),
      genericName: this.validateGenericName(identifiers.primary.genericName),
      ndc: this.validateNDCFormat(identifiers.primary.ndc),
      manufacturer: this.validateManufacturer(identifiers.primary.manufacturer),
      overall: 0
    };
    
    // Calculate overall validation score
    const validationScores = Object.values(validation).filter(v => typeof v === 'number');
    validation.overall = validationScores.length > 0 
      ? Math.round(validationScores.reduce((a, b) => a + b, 0) / validationScores.length)
      : 0;
    
    return validation;
  }

  /**
   * Validate brand name format and characteristics
   */
  validateBrandName(brandName) {
    if (!brandName) return 0;
    
    let score = 50; // Base score for having a brand name
    
    // Check format characteristics
    if (/^[A-Z]/.test(brandName)) score += 20; // Starts with capital
    if (brandName.length >= 3 && brandName.length <= 20) score += 15; // Reasonable length
    if (!/\d/.test(brandName)) score += 10; // No numbers (usually)
    if (!/[^a-zA-Z\s-]/.test(brandName)) score += 5; // Only letters, spaces, hyphens
    
    return Math.min(100, score);
  }

  /**
   * Validate generic name format and characteristics
   */
  validateGenericName(genericName) {
    if (!genericName) return 0;
    
    let score = 50; // Base score for having a generic name
    
    // Check format characteristics
    if (genericName.length >= 4) score += 20; // Reasonable length
    if (genericName.includes('acid') || genericName.includes('ine') || genericName.includes('ol')) score += 15; // Common endings
    if (!/[^a-zA-Z\s-]/.test(genericName)) score += 15; // Only letters, spaces, hyphens
    
    return Math.min(100, score);
  }

  /**
   * Validate NDC format
   */
  validateNDCFormat(ndc) {
    if (!ndc) return 0;
    
    const ndcPattern = /^\d{4,5}-\d{3,4}-\d{1,2}$/;
    return ndcPattern.test(ndc) ? 100 : 20; // 20 points for having something that might be NDC
  }

  /**
   * Validate manufacturer name
   */
  validateManufacturer(manufacturer) {
    if (!manufacturer) return 0;
    
    let score = 50; // Base score for having a manufacturer
    
    // Check for known pharmaceutical companies
    const knownManufacturers = [
      'pfizer', 'johnson', 'merck', 'novartis', 'roche', 'abbott', 'bayer', 
      'glaxosmithkline', 'sanofi', 'astrazeneca', 'bristol', 'eli lilly'
    ];
    
    if (knownManufacturers.some(known => manufacturer.toLowerCase().includes(known))) {
      score += 40;
    }
    
    if (manufacturer.toLowerCase().includes('pharmaceutical') || 
        manufacturer.toLowerCase().includes('pharma') ||
        manufacturer.toLowerCase().includes('labs')) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  /**
   * Generate comprehensive search strategies for Phase 2
   */
  generateSearchStrategies(identifiers) {
    const strategies = [];
    
    // Primary search strategies
    if (identifiers.primary.ndc) {
      strategies.push({ type: 'ndc', value: identifiers.primary.ndc, priority: 1 });
    }
    
    if (identifiers.primary.brandName) {
      strategies.push({ type: 'brandName', value: identifiers.primary.brandName, priority: 2 });
    }
    
    if (identifiers.primary.genericName) {
      strategies.push({ type: 'genericName', value: identifiers.primary.genericName, priority: 2 });
    }
    
    // Combined search strategies
    if (identifiers.primary.brandName && identifiers.secondary.strength) {
      strategies.push({ 
        type: 'brandNameStrength', 
        value: `${identifiers.primary.brandName} ${identifiers.secondary.strength}`, 
        priority: 3 
      });
    }
    
    if (identifiers.primary.genericName && identifiers.secondary.strength) {
      strategies.push({ 
        type: 'genericNameStrength', 
        value: `${identifiers.primary.genericName} ${identifiers.secondary.strength}`, 
        priority: 3 
      });
    }
    
    // Active ingredient searches
    identifiers.secondary.activeIngredients.forEach(ingredient => {
      strategies.push({ type: 'activeIngredient', value: ingredient, priority: 4 });
    });
    
    // Manufacturer-specific searches
    if (identifiers.primary.manufacturer && identifiers.primary.brandName) {
      strategies.push({ 
        type: 'manufacturerBrand', 
        value: `${identifiers.primary.brandName} ${identifiers.primary.manufacturer}`, 
        priority: 5 
      });
    }
    
    // Sort by priority
    return strategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Count total data points extracted
   */
  countDataPoints(identifiers) {
    let count = 0;
    
    // Count primary identifiers
    Object.values(identifiers.primary).forEach(value => {
      if (value) count++;
    });
    
    // Count secondary identifiers
    Object.values(identifiers.secondary).forEach(value => {
      if (value) count++;
    });
    
    // Count physical characteristics
    Object.values(identifiers.physical).forEach(value => {
      if (value) count++;
    });
    
    // Count extracted text arrays
    Object.values(identifiers.extracted).forEach(array => {
      if (Array.isArray(array)) count += array.length;
    });
    
    return count;
  }

  /**
   * Create minimal identifiers for fallback
   */
  createMinimalIdentifiers(geminiAnalysis) {
    return {
      primary: {
        brandName: geminiAnalysis.medicine?.brandName || null,
        genericName: geminiAnalysis.medicine?.genericName || null,
        ndc: null,
        manufacturer: geminiAnalysis.medicine?.manufacturer || null
      },
      confidence: { overall: 1, identification: 1, dataQuality: 10 },
      searchStrategies: []
    };
  }

  /**
   * Create fallback result when workflow fails
   */
  createFallbackResult(geminiAnalysis, workflow) {
    return {
      medicineProfile: {
        identification: {
          brandName: geminiAnalysis.medicine?.brandName || 'Unknown',
          genericName: geminiAnalysis.medicine?.genericName || 'Unknown',
          confidence: 'Low'
        },
        dataQuality: {
          completeness: 10,
          accuracy: 30,
          sources: 1,
          verified: false
        },
        sources: ['AI Analysis Only'],
        workflow: workflow,
        disclaimer: 'Analysis incomplete due to system error. Consult healthcare professional.'
      }
    };
  }

  /**
   * Phase 2: Comprehensive Data Collection
   * Systematically gather detailed information from ALL available sources
   */
  async executePhase2(phase1Data) {
    const startTime = Date.now();
    console.log('🔍 Phase 2: Comprehensive Data Collection');

    const collectedData = {
      sources: {},
      totalDataPoints: 0,
      successfulSources: 0,
      failedSources: 0
    };

    try {
      // Execute all data collection tasks in parallel for efficiency
      const collectionTasks = [
        this.collectFDADrugsData(phase1Data.searchStrategies),
        this.collectOpenFDAAdverseEvents(phase1Data.searchStrategies),
        this.collectOpenFDALabeling(phase1Data.searchStrategies),
        this.collectOpenFDAEnforcement(phase1Data.searchStrategies),
        this.collectRxNormData(phase1Data.searchStrategies),
        this.collectDailyMedData(phase1Data.searchStrategies),
        this.collectNIHClinicalTrials(phase1Data.searchStrategies),
        this.collectPubMedData(phase1Data.searchStrategies),
        this.collectLocalDatabaseData(phase1Data.searchStrategies),
        this.collectWebScrapedData(phase1Data.searchStrategies)
      ];

      const results = await Promise.allSettled(collectionTasks);

      // Process results
      const sourceNames = [
        'fdaDrugs', 'openFDAAdverseEvents', 'openFDALabeling', 'openFDAEnforcement',
        'rxNorm', 'dailyMed', 'nihClinicalTrials', 'pubMed', 'localDatabase', 'webScraped'
      ];

      results.forEach((result, index) => {
        const sourceName = sourceNames[index];

        if (result.status === 'fulfilled' && result.value) {
          collectedData.sources[sourceName] = result.value;
          collectedData.totalDataPoints += result.value.dataPoints || 0;
          collectedData.successfulSources++;
        } else {
          collectedData.sources[sourceName] = {
            status: 'failed',
            error: result.reason?.message || 'Unknown error',
            dataPoints: 0
          };
          collectedData.failedSources++;
        }
      });

      console.log(`📊 Phase 2 completed: ${collectedData.successfulSources} successful, ${collectedData.failedSources} failed sources`);

      return {
        status: 'completed',
        data: collectedData,
        duration: Date.now() - startTime,
        dataPoints: collectedData.totalDataPoints
      };

    } catch (error) {
      console.error('Phase 2 error:', error);
      return {
        status: 'failed',
        error: error.message,
        duration: Date.now() - startTime,
        data: collectedData
      };
    }
  }

  /**
   * Collect FDA Drugs@FDA database information
   */
  async collectFDADrugsData(searchStrategies) {
    console.log('🏛️ Collecting FDA Drugs@FDA data...');

    for (const strategy of searchStrategies) {
      try {
        let searchQuery;

        switch (strategy.type) {
          case 'ndc':
            searchQuery = `openfda.product_ndc:"${strategy.value}"`;
            break;
          case 'brandName':
            searchQuery = `openfda.brand_name:"${strategy.value}"`;
            break;
          case 'genericName':
            searchQuery = `openfda.generic_name:"${strategy.value}"`;
            break;
          case 'activeIngredient':
            searchQuery = `openfda.substance_name:"${strategy.value}"`;
            break;
          default:
            searchQuery = `openfda.brand_name:"${strategy.value}" OR openfda.generic_name:"${strategy.value}"`;
        }

        const response = await axios.get(this.apis.fda.drugsAtFDA, {
          params: {
            search: searchQuery,
            limit: 10
          },
          timeout: 15000
        });

        if (response.data.results && response.data.results.length > 0) {
          return {
            status: 'success',
            source: 'FDA Drugs@FDA',
            searchStrategy: strategy,
            data: response.data.results,
            dataPoints: this.countFDADataPoints(response.data.results),
            reliability: this.sourceReliability['FDA Drugs@FDA']
          };
        }

      } catch (error) {
        console.warn(`FDA Drugs@FDA search failed for ${strategy.type}:`, error.message);
        continue;
      }
    }

    return null;
  }

  /**
   * Collect OpenFDA Adverse Events data
   */
  async collectOpenFDAAdverseEvents(searchStrategies) {
    console.log('⚠️ Collecting OpenFDA Adverse Events data...');

    for (const strategy of searchStrategies) {
      try {
        const searchQuery = `patient.drug.medicinalproduct:"${strategy.value}"`;

        const response = await axios.get(this.apis.fda.adverseEvents, {
          params: {
            search: searchQuery,
            count: 'patient.reaction.reactionmeddrapt.exact',
            limit: 100
          },
          timeout: 15000
        });

        if (response.data.results && response.data.results.length > 0) {
          return {
            status: 'success',
            source: 'OpenFDA Adverse Events',
            searchStrategy: strategy,
            data: response.data.results,
            dataPoints: response.data.results.length,
            reliability: this.sourceReliability['OpenFDA Adverse Events']
          };
        }

      } catch (error) {
        console.warn(`OpenFDA Adverse Events search failed for ${strategy.type}:`, error.message);
        continue;
      }
    }

    return null;
  }

  /**
   * Collect OpenFDA Drug Labeling data
   */
  async collectOpenFDALabeling(searchStrategies) {
    console.log('📋 Collecting OpenFDA Drug Labeling data...');

    for (const strategy of searchStrategies) {
      try {
        let searchQuery;

        switch (strategy.type) {
          case 'ndc':
            searchQuery = `openfda.product_ndc:"${strategy.value}"`;
            break;
          case 'brandName':
            searchQuery = `openfda.brand_name:"${strategy.value}"`;
            break;
          case 'genericName':
            searchQuery = `openfda.generic_name:"${strategy.value}"`;
            break;
          default:
            searchQuery = `openfda.brand_name:"${strategy.value}" OR openfda.generic_name:"${strategy.value}"`;
        }

        const response = await axios.get(this.apis.fda.labeling, {
          params: {
            search: searchQuery,
            limit: 5
          },
          timeout: 15000
        });

        if (response.data.results && response.data.results.length > 0) {
          return {
            status: 'success',
            source: 'OpenFDA Labeling',
            searchStrategy: strategy,
            data: response.data.results,
            dataPoints: this.countLabelingDataPoints(response.data.results),
            reliability: this.sourceReliability['OpenFDA Labeling']
          };
        }

      } catch (error) {
        console.warn(`OpenFDA Labeling search failed for ${strategy.type}:`, error.message);
        continue;
      }
    }

    return null;
  }

  /**
   * Collect OpenFDA Enforcement data
   */
  async collectOpenFDAEnforcement(searchStrategies) {
    console.log('🚨 Collecting OpenFDA Enforcement data...');

    for (const strategy of searchStrategies) {
      try {
        const searchQuery = `product_description:"${strategy.value}"`;

        const response = await axios.get(this.apis.fda.enforcement, {
          params: {
            search: searchQuery,
            limit: 10
          },
          timeout: 15000
        });

        if (response.data.results && response.data.results.length > 0) {
          return {
            status: 'success',
            source: 'OpenFDA Enforcement',
            searchStrategy: strategy,
            data: response.data.results,
            dataPoints: response.data.results.length,
            reliability: 8 // High reliability for enforcement actions
          };
        }

      } catch (error) {
        console.warn(`OpenFDA Enforcement search failed for ${strategy.type}:`, error.message);
        continue;
      }
    }

    return null;
  }

  /**
   * Collect comprehensive RxNorm data
   */
  async collectRxNormData(searchStrategies) {
    console.log('💊 Collecting RxNorm data...');

    for (const strategy of searchStrategies) {
      try {
        // First, get the RxCUI
        const drugsResponse = await axios.get(this.apis.rxnorm.drugs, {
          params: { name: strategy.value },
          timeout: 15000
        });

        const conceptGroup = drugsResponse.data.drugGroup?.conceptGroup;
        if (!conceptGroup || conceptGroup.length === 0) continue;

        // Get RxCUI from the first concept
        let rxcui = null;
        for (const group of conceptGroup) {
          if (group.conceptProperties && group.conceptProperties.length > 0) {
            rxcui = group.conceptProperties[0].rxcui;
            break;
          }
        }

        if (!rxcui) continue;

        // Collect comprehensive RxNorm data
        const rxNormData = {
          basicInfo: conceptGroup,
          rxcui: rxcui,
          properties: null,
          relatedDrugs: null,
          interactions: null,
          ndcs: null,
          allergy: null
        };

        // Parallel collection of detailed RxNorm data
        const detailTasks = [
          this.getRxNormProperties(rxcui),
          this.getRxNormRelated(rxcui),
          this.getRxNormInteractions(rxcui),
          this.getRxNormNDCs(rxcui),
          this.getRxNormAllergy(rxcui)
        ];

        const detailResults = await Promise.allSettled(detailTasks);

        rxNormData.properties = detailResults[0].status === 'fulfilled' ? detailResults[0].value : null;
        rxNormData.relatedDrugs = detailResults[1].status === 'fulfilled' ? detailResults[1].value : null;
        rxNormData.interactions = detailResults[2].status === 'fulfilled' ? detailResults[2].value : null;
        rxNormData.ndcs = detailResults[3].status === 'fulfilled' ? detailResults[3].value : null;
        rxNormData.allergy = detailResults[4].status === 'fulfilled' ? detailResults[4].value : null;

        return {
          status: 'success',
          source: 'RxNorm',
          searchStrategy: strategy,
          data: rxNormData,
          dataPoints: this.countRxNormDataPoints(rxNormData),
          reliability: this.sourceReliability['RxNorm']
        };

      } catch (error) {
        console.warn(`RxNorm search failed for ${strategy.type}:`, error.message);
        continue;
      }
    }

    return null;
  }

  /**
   * Get RxNorm properties for a given RxCUI
   */
  async getRxNormProperties(rxcui) {
    const response = await axios.get(`${this.apis.rxnorm.rxcui}/${rxcui}/properties.json`, {
      timeout: 10000
    });
    return response.data.properties;
  }

  /**
   * Get RxNorm related drugs
   */
  async getRxNormRelated(rxcui) {
    const response = await axios.get(`${this.apis.rxnorm.rxcui}/${rxcui}/related.json`, {
      timeout: 10000
    });
    return response.data.relatedGroup;
  }

  /**
   * Get RxNorm drug interactions
   */
  async getRxNormInteractions(rxcui) {
    const response = await axios.get(`${this.apis.rxnorm.interaction}/interaction.json`, {
      params: { rxcui: rxcui },
      timeout: 10000
    });
    return response.data.interactionTypeGroup;
  }

  /**
   * Get RxNorm NDCs
   */
  async getRxNormNDCs(rxcui) {
    const response = await axios.get(`${this.apis.rxnorm.rxcui}/${rxcui}/ndcs.json`, {
      timeout: 10000
    });
    return response.data.ndcGroup?.ndcList;
  }

  /**
   * Get RxNorm allergy information
   */
  async getRxNormAllergy(rxcui) {
    const response = await axios.get(`${this.apis.rxnorm.rxcui}/${rxcui}/allergy.json`, {
      timeout: 10000
    });
    return response.data.allergyGroup;
  }

  /**
   * Collect DailyMed data
   */
  async collectDailyMedData(searchStrategies) {
    console.log('📄 Collecting DailyMed data...');

    for (const strategy of searchStrategies) {
      try {
        const response = await axios.get(this.apis.dailymed.search, {
          params: {
            drug_name: strategy.value,
            pagesize: 5
          },
          timeout: 15000
        });

        if (response.data.data && response.data.data.length > 0) {
          return {
            status: 'success',
            source: 'DailyMed',
            searchStrategy: strategy,
            data: response.data.data,
            dataPoints: this.countDailyMedDataPoints(response.data.data),
            reliability: this.sourceReliability['DailyMed']
          };
        }

      } catch (error) {
        console.warn(`DailyMed search failed for ${strategy.type}:`, error.message);
        continue;
      }
    }

    return null;
  }

  /**
   * Collect NIH Clinical Trials data
   */
  async collectNIHClinicalTrials(searchStrategies) {
    console.log('🧪 Collecting NIH Clinical Trials data...');

    for (const strategy of searchStrategies) {
      try {
        const response = await axios.get(this.apis.nih.clinicalTrials, {
          params: {
            expr: strategy.value,
            fields: 'NCTId,BriefTitle,Condition,InterventionName,Phase,OverallStatus',
            min_rnk: 1,
            max_rnk: 10,
            fmt: 'json'
          },
          timeout: 15000
        });

        if (response.data.StudyFieldsResponse?.StudyFields) {
          return {
            status: 'success',
            source: 'NIH Clinical Trials',
            searchStrategy: strategy,
            data: response.data.StudyFieldsResponse.StudyFields,
            dataPoints: response.data.StudyFieldsResponse.StudyFields.length,
            reliability: this.sourceReliability['NIH Clinical Trials']
          };
        }

      } catch (error) {
        console.warn(`NIH Clinical Trials search failed for ${strategy.type}:`, error.message);
        continue;
      }
    }

    return null;
  }

  /**
   * Collect PubMed data
   */
  async collectPubMedData(searchStrategies) {
    console.log('📚 Collecting PubMed data...');

    for (const strategy of searchStrategies) {
      try {
        // Search PubMed for relevant articles
        const searchResponse = await axios.get(`${this.apis.nih.pubmed}/esearch.fcgi`, {
          params: {
            db: 'pubmed',
            term: `${strategy.value}[Title/Abstract]`,
            retmax: 10,
            retmode: 'json'
          },
          timeout: 15000
        });

        if (searchResponse.data.esearchresult?.idlist?.length > 0) {
          const ids = searchResponse.data.esearchresult.idlist.slice(0, 5);

          // Get article summaries
          const summaryResponse = await axios.get(`${this.apis.nih.pubmed}/esummary.fcgi`, {
            params: {
              db: 'pubmed',
              id: ids.join(','),
              retmode: 'json'
            },
            timeout: 15000
          });

          return {
            status: 'success',
            source: 'PubMed',
            searchStrategy: strategy,
            data: summaryResponse.data.result,
            dataPoints: ids.length,
            reliability: this.sourceReliability['PubMed']
          };
        }

      } catch (error) {
        console.warn(`PubMed search failed for ${strategy.type}:`, error.message);
        continue;
      }
    }

    return null;
  }

  /**
   * Collect local database data
   */
  async collectLocalDatabaseData(searchStrategies) {
    console.log('💾 Collecting Local Database data...');

    if (!this.localDB || this.localDB.length === 0) {
      return null;
    }

    for (const strategy of searchStrategies) {
      const term = strategy.value.toLowerCase();
      const matches = this.localDB.filter(medicine =>
        medicine.brandName?.toLowerCase().includes(term) ||
        medicine.genericName?.toLowerCase().includes(term) ||
        medicine.activeIngredient?.toLowerCase().includes(term)
      );

      if (matches.length > 0) {
        return {
          status: 'success',
          source: 'Local Database',
          searchStrategy: strategy,
          data: matches,
          dataPoints: this.countLocalDataPoints(matches),
          reliability: this.sourceReliability['Local Database']
        };
      }
    }

    return null;
  }

  /**
   * Collect web scraped data (placeholder for future implementation)
   */
  async collectWebScrapedData(searchStrategies) {
    console.log('🌐 Collecting Web Scraped data...');

    // Placeholder for web scraping implementation
    // This would scrape reliable medical databases like:
    // - Drugs.com
    // - WebMD
    // - MedlinePlus
    // - Pharmaceutical manufacturer websites

    return null;
  }

  /**
   * Count FDA data points
   */
  countFDADataPoints(results) {
    let count = 0;
    results.forEach(result => {
      if (result.openfda) {
        count += Object.keys(result.openfda).length;
      }
      count += Object.keys(result).length;
    });
    return count;
  }

  /**
   * Count labeling data points
   */
  countLabelingDataPoints(results) {
    let count = 0;
    results.forEach(result => {
      // Count major labeling sections
      const sections = [
        'indications_and_usage', 'dosage_and_administration', 'contraindications',
        'warnings', 'adverse_reactions', 'drug_interactions', 'clinical_pharmacology'
      ];
      sections.forEach(section => {
        if (result[section]) count += Array.isArray(result[section]) ? result[section].length : 1;
      });
    });
    return count;
  }

  /**
   * Count RxNorm data points
   */
  countRxNormDataPoints(data) {
    let count = 0;
    if (data.basicInfo) count += 5;
    if (data.properties) count += 10;
    if (data.relatedDrugs) count += 15;
    if (data.interactions) count += 20;
    if (data.ndcs) count += Array.isArray(data.ndcs) ? data.ndcs.length : 5;
    if (data.allergy) count += 5;
    return count;
  }

  /**
   * Count DailyMed data points
   */
  countDailyMedDataPoints(data) {
    return data.length * 10; // Estimate 10 data points per DailyMed entry
  }

  /**
   * Count local database data points
   */
  countLocalDataPoints(matches) {
    let count = 0;
    matches.forEach(match => {
      count += Object.keys(match).length;
    });
    return count;
  }

  /**
   * Phase 3: Cross-Verification and Data Quality Assurance
   * Cross-reference information between sources and validate data quality
   */
  async executePhase3(phase2Data) {
    const startTime = Date.now();
    console.log('🔍 Phase 3: Cross-Verification and Data Quality Assurance');

    try {
      const verification = {
        crossReferences: {},
        dataValidation: {},
        confidenceScores: {},
        conflictResolution: {},
        qualityMetrics: {}
      };

      // Cross-reference data between sources
      verification.crossReferences = this.performCrossReferencing(phase2Data.sources);

      // Validate data consistency
      verification.dataValidation = this.validateDataConsistency(phase2Data.sources);

      // Calculate confidence scores
      verification.confidenceScores = this.calculateConfidenceScores(phase2Data.sources, verification.crossReferences);

      // Resolve conflicts between sources
      verification.conflictResolution = this.resolveDataConflicts(phase2Data.sources, verification.crossReferences);

      // Calculate overall quality metrics
      verification.qualityMetrics = this.calculateQualityMetrics(phase2Data, verification);

      console.log(`✅ Phase 3 completed: ${verification.qualityMetrics.overallAccuracy}% accuracy, ${verification.qualityMetrics.dataCompleteness}% completeness`);

      return {
        status: 'completed',
        data: {
          originalData: phase2Data,
          verification: verification,
          verifiedData: this.createVerifiedDataset(phase2Data.sources, verification)
        },
        duration: Date.now() - startTime,
        qualityScore: verification.qualityMetrics.overallQuality
      };

    } catch (error) {
      console.error('Phase 3 error:', error);
      return {
        status: 'failed',
        error: error.message,
        duration: Date.now() - startTime,
        data: { originalData: phase2Data, verification: null }
      };
    }
  }

  /**
   * Perform cross-referencing between data sources
   */
  performCrossReferencing(sources) {
    console.log('🔗 Performing cross-referencing between sources...');

    const crossRefs = {
      brandName: this.crossReferenceField(sources, 'brandName'),
      genericName: this.crossReferenceField(sources, 'genericName'),
      ndc: this.crossReferenceField(sources, 'ndc'),
      manufacturer: this.crossReferenceField(sources, 'manufacturer'),
      activeIngredients: this.crossReferenceField(sources, 'activeIngredients'),
      strength: this.crossReferenceField(sources, 'strength'),
      dosageForm: this.crossReferenceField(sources, 'dosageForm'),
      indications: this.crossReferenceField(sources, 'indications'),
      contraindications: this.crossReferenceField(sources, 'contraindications'),
      warnings: this.crossReferenceField(sources, 'warnings'),
      adverseReactions: this.crossReferenceField(sources, 'adverseReactions'),
      drugInteractions: this.crossReferenceField(sources, 'drugInteractions')
    };

    return crossRefs;
  }

  /**
   * Cross-reference a specific field across all sources
   */
  crossReferenceField(sources, fieldName) {
    const fieldData = {
      values: [],
      sources: [],
      agreements: 0,
      conflicts: [],
      consensus: null,
      confidence: 0
    };

    // Extract field values from all sources
    Object.entries(sources).forEach(([sourceName, sourceData]) => {
      if (sourceData.status === 'success') {
        const value = this.extractFieldFromSource(sourceData, fieldName);
        if (value) {
          fieldData.values.push({
            value: value,
            source: sourceName,
            reliability: sourceData.reliability || 5
          });
          fieldData.sources.push(sourceName);
        }
      }
    });

    // Analyze agreements and conflicts
    if (fieldData.values.length > 1) {
      const { agreements, conflicts, consensus } = this.analyzeFieldConsensus(fieldData.values);
      fieldData.agreements = agreements;
      fieldData.conflicts = conflicts;
      fieldData.consensus = consensus;
      fieldData.confidence = this.calculateFieldConfidence(fieldData);
    } else if (fieldData.values.length === 1) {
      fieldData.consensus = fieldData.values[0].value;
      fieldData.confidence = Math.min(80, fieldData.values[0].reliability * 10);
    }

    return fieldData;
  }

  /**
   * Extract field value from source data
   */
  extractFieldFromSource(sourceData, fieldName) {
    const data = sourceData.data;

    switch (fieldName) {
      case 'brandName':
        return this.extractBrandNameFromSource(data, sourceData.source);
      case 'genericName':
        return this.extractGenericNameFromSource(data, sourceData.source);
      case 'ndc':
        return this.extractNDCFromSource(data, sourceData.source);
      case 'manufacturer':
        return this.extractManufacturerFromSource(data, sourceData.source);
      case 'activeIngredients':
        return this.extractActiveIngredientsFromSource(data, sourceData.source);
      case 'strength':
        return this.extractStrengthFromSource(data, sourceData.source);
      case 'dosageForm':
        return this.extractDosageFormFromSource(data, sourceData.source);
      case 'indications':
        return this.extractIndicationsFromSource(data, sourceData.source);
      case 'contraindications':
        return this.extractContraindicationsFromSource(data, sourceData.source);
      case 'warnings':
        return this.extractWarningsFromSource(data, sourceData.source);
      case 'adverseReactions':
        return this.extractAdverseReactionsFromSource(data, sourceData.source);
      case 'drugInteractions':
        return this.extractDrugInteractionsFromSource(data, sourceData.source);
      default:
        return null;
    }
  }

  /**
   * Extract brand name from different source formats
   */
  extractBrandNameFromSource(data, sourceName) {
    switch (sourceName) {
      case 'FDA Drugs@FDA':
        return data[0]?.openfda?.brand_name?.[0];
      case 'OpenFDA Labeling':
        return data[0]?.openfda?.brand_name?.[0];
      case 'RxNorm':
        return data.properties?.name;
      case 'Local Database':
        return data[0]?.brandName;
      default:
        return null;
    }
  }

  /**
   * Extract generic name from different source formats
   */
  extractGenericNameFromSource(data, sourceName) {
    switch (sourceName) {
      case 'FDA Drugs@FDA':
        return data[0]?.openfda?.generic_name?.[0];
      case 'OpenFDA Labeling':
        return data[0]?.openfda?.generic_name?.[0];
      case 'RxNorm':
        return data.properties?.synonym;
      case 'Local Database':
        return data[0]?.genericName;
      default:
        return null;
    }
  }

  /**
   * Extract NDC from different source formats
   */
  extractNDCFromSource(data, sourceName) {
    switch (sourceName) {
      case 'FDA Drugs@FDA':
        return data[0]?.openfda?.product_ndc?.[0];
      case 'OpenFDA Labeling':
        return data[0]?.openfda?.product_ndc?.[0];
      case 'RxNorm':
        return data.ndcs?.[0];
      case 'Local Database':
        return data[0]?.ndc;
      default:
        return null;
    }
  }

  /**
   * Extract manufacturer from different source formats
   */
  extractManufacturerFromSource(data, sourceName) {
    switch (sourceName) {
      case 'FDA Drugs@FDA':
        return data[0]?.openfda?.manufacturer_name?.[0];
      case 'OpenFDA Labeling':
        return data[0]?.openfda?.manufacturer_name?.[0];
      case 'Local Database':
        return data[0]?.manufacturer;
      default:
        return null;
    }
  }

  /**
   * Extract active ingredients from different source formats
   */
  extractActiveIngredientsFromSource(data, sourceName) {
    switch (sourceName) {
      case 'FDA Drugs@FDA':
        return data[0]?.openfda?.substance_name;
      case 'OpenFDA Labeling':
        return data[0]?.openfda?.substance_name;
      case 'Local Database':
        return data[0]?.activeIngredient ? [data[0].activeIngredient] : null;
      default:
        return null;
    }
  }

  /**
   * Extract strength from different source formats
   */
  extractStrengthFromSource(data, sourceName) {
    switch (sourceName) {
      case 'FDA Drugs@FDA':
        return data[0]?.openfda?.strength?.[0];
      case 'OpenFDA Labeling':
        return data[0]?.openfda?.strength?.[0];
      case 'Local Database':
        return data[0]?.strength;
      default:
        return null;
    }
  }

  /**
   * Extract dosage form from different source formats
   */
  extractDosageFormFromSource(data, sourceName) {
    switch (sourceName) {
      case 'FDA Drugs@FDA':
        return data[0]?.openfda?.dosage_form?.[0];
      case 'OpenFDA Labeling':
        return data[0]?.openfda?.dosage_form?.[0];
      case 'Local Database':
        return data[0]?.dosageForm;
      default:
        return null;
    }
  }

  /**
   * Extract indications from different source formats
   */
  extractIndicationsFromSource(data, sourceName) {
    switch (sourceName) {
      case 'OpenFDA Labeling':
        return data[0]?.indications_and_usage;
      case 'Local Database':
        return data[0]?.uses ? [data[0].uses] : null;
      default:
        return null;
    }
  }

  /**
   * Extract contraindications from different source formats
   */
  extractContraindicationsFromSource(data, sourceName) {
    switch (sourceName) {
      case 'OpenFDA Labeling':
        return data[0]?.contraindications;
      case 'Local Database':
        return data[0]?.contraindications ? [data[0].contraindications] : null;
      default:
        return null;
    }
  }

  /**
   * Extract warnings from different source formats
   */
  extractWarningsFromSource(data, sourceName) {
    switch (sourceName) {
      case 'OpenFDA Labeling':
        return data[0]?.warnings;
      case 'Local Database':
        return data[0]?.warnings;
      default:
        return null;
    }
  }

  /**
   * Extract adverse reactions from different source formats
   */
  extractAdverseReactionsFromSource(data, sourceName) {
    switch (sourceName) {
      case 'OpenFDA Labeling':
        return data[0]?.adverse_reactions;
      case 'OpenFDA Adverse Events':
        return data.map(event => event.term);
      case 'Local Database':
        return data[0]?.sideEffects ? [data[0].sideEffects] : null;
      default:
        return null;
    }
  }

  /**
   * Extract drug interactions from different source formats
   */
  extractDrugInteractionsFromSource(data, sourceName) {
    switch (sourceName) {
      case 'OpenFDA Labeling':
        return data[0]?.drug_interactions;
      case 'RxNorm':
        return data.interactions?.interactionType?.map(interaction => interaction.comment);
      case 'Local Database':
        return data[0]?.drugInteractions ? [data[0].drugInteractions] : null;
      default:
        return null;
    }
  }

  /**
   * Analyze field consensus across sources
   */
  analyzeFieldConsensus(values) {
    const valueGroups = {};
    let agreements = 0;
    const conflicts = [];

    // Group similar values
    values.forEach(item => {
      const normalizedValue = this.normalizeValue(item.value);
      if (!valueGroups[normalizedValue]) {
        valueGroups[normalizedValue] = [];
      }
      valueGroups[normalizedValue].push(item);
    });

    // Find consensus and conflicts
    const groupKeys = Object.keys(valueGroups);
    if (groupKeys.length === 1) {
      agreements = values.length;
    } else {
      // Identify conflicts
      groupKeys.forEach(key => {
        if (valueGroups[key].length > 1) {
          agreements += valueGroups[key].length;
        } else {
          conflicts.push({
            value: key,
            source: valueGroups[key][0].source,
            reliability: valueGroups[key][0].reliability
          });
        }
      });
    }

    // Determine consensus based on reliability and frequency
    const consensus = this.determineConsensus(valueGroups);

    return { agreements, conflicts, consensus };
  }

  /**
   * Normalize value for comparison
   */
  normalizeValue(value) {
    if (typeof value === 'string') {
      return value.toLowerCase().trim().replace(/\s+/g, ' ');
    }
    if (Array.isArray(value)) {
      return value.map(v => this.normalizeValue(v)).sort().join('|');
    }
    return String(value);
  }

  /**
   * Determine consensus value from grouped values
   */
  determineConsensus(valueGroups) {
    let bestGroup = null;
    let bestScore = 0;

    Object.entries(valueGroups).forEach(([normalizedValue, items]) => {
      // Calculate score based on frequency and reliability
      const frequencyScore = items.length * 10;
      const reliabilityScore = items.reduce((sum, item) => sum + item.reliability, 0);
      const totalScore = frequencyScore + reliabilityScore;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestGroup = items;
      }
    });

    return bestGroup ? bestGroup[0].value : null;
  }

  /**
   * Calculate confidence score for a field
   */
  calculateFieldConfidence(fieldData) {
    if (fieldData.values.length === 0) return 0;
    if (fieldData.values.length === 1) return Math.min(80, fieldData.values[0].reliability * 8);

    // Multi-source confidence calculation
    const agreementRatio = fieldData.agreements / fieldData.values.length;
    const avgReliability = fieldData.values.reduce((sum, v) => sum + v.reliability, 0) / fieldData.values.length;
    const sourceCount = fieldData.sources.length;

    let confidence = 0;
    confidence += agreementRatio * 40; // Agreement contributes 40%
    confidence += (avgReliability / 10) * 30; // Reliability contributes 30%
    confidence += Math.min(sourceCount / 5, 1) * 30; // Source diversity contributes 30%

    return Math.round(confidence);
  }

  /**
   * Validate data consistency across sources
   */
  validateDataConsistency(sources) {
    console.log('✅ Validating data consistency...');

    const validation = {
      consistencyScore: 0,
      inconsistencies: [],
      validationRules: [],
      overallValid: false
    };

    // Apply validation rules
    validation.validationRules = [
      this.validateNDCConsistency(sources),
      this.validateNameConsistency(sources),
      this.validateManufacturerConsistency(sources),
      this.validateStrengthConsistency(sources),
      this.validateDosageFormConsistency(sources)
    ];

    // Calculate overall consistency score
    const validRules = validation.validationRules.filter(rule => rule.valid);
    validation.consistencyScore = Math.round((validRules.length / validation.validationRules.length) * 100);
    validation.overallValid = validation.consistencyScore >= 70;

    // Collect inconsistencies
    validation.inconsistencies = validation.validationRules
      .filter(rule => !rule.valid)
      .map(rule => rule.inconsistency);

    return validation;
  }

  /**
   * Validate NDC consistency across sources
   */
  validateNDCConsistency(sources) {
    const ndcs = [];
    Object.entries(sources).forEach(([sourceName, sourceData]) => {
      if (sourceData.status === 'success') {
        const ndc = this.extractNDCFromSource(sourceData.data, sourceName);
        if (ndc) ndcs.push({ ndc, source: sourceName });
      }
    });

    if (ndcs.length <= 1) return { field: 'ndc', valid: true };

    const uniqueNDCs = [...new Set(ndcs.map(item => item.ndc))];
    const valid = uniqueNDCs.length === 1;

    return {
      field: 'ndc',
      valid: valid,
      inconsistency: valid ? null : {
        field: 'ndc',
        conflictingValues: ndcs,
        severity: 'high'
      }
    };
  }

  /**
   * Validate name consistency across sources
   */
  validateNameConsistency(sources) {
    const brandNames = [];
    const genericNames = [];

    Object.entries(sources).forEach(([sourceName, sourceData]) => {
      if (sourceData.status === 'success') {
        const brandName = this.extractBrandNameFromSource(sourceData.data, sourceName);
        const genericName = this.extractGenericNameFromSource(sourceData.data, sourceName);

        if (brandName) brandNames.push({ name: brandName, source: sourceName });
        if (genericName) genericNames.push({ name: genericName, source: sourceName });
      }
    });

    const brandValid = this.validateNameList(brandNames);
    const genericValid = this.validateNameList(genericNames);

    return {
      field: 'names',
      valid: brandValid.valid && genericValid.valid,
      inconsistency: (!brandValid.valid || !genericValid.valid) ? {
        field: 'names',
        brandConflicts: brandValid.conflicts,
        genericConflicts: genericValid.conflicts,
        severity: 'medium'
      } : null
    };
  }

  /**
   * Validate a list of names for consistency
   */
  validateNameList(nameList) {
    if (nameList.length <= 1) return { valid: true, conflicts: [] };

    const normalizedNames = nameList.map(item => ({
      ...item,
      normalized: this.normalizeValue(item.name)
    }));

    const uniqueNames = [...new Set(normalizedNames.map(item => item.normalized))];
    const valid = uniqueNames.length === 1;

    return {
      valid: valid,
      conflicts: valid ? [] : normalizedNames
    };
  }

  /**
   * Validate manufacturer consistency
   */
  validateManufacturerConsistency(sources) {
    const manufacturers = [];
    Object.entries(sources).forEach(([sourceName, sourceData]) => {
      if (sourceData.status === 'success') {
        const manufacturer = this.extractManufacturerFromSource(sourceData.data, sourceName);
        if (manufacturer) manufacturers.push({ manufacturer, source: sourceName });
      }
    });

    if (manufacturers.length <= 1) return { field: 'manufacturer', valid: true };

    // Allow for variations in manufacturer names (subsidiaries, etc.)
    const valid = this.validateManufacturerSimilarity(manufacturers);

    return {
      field: 'manufacturer',
      valid: valid,
      inconsistency: valid ? null : {
        field: 'manufacturer',
        conflictingValues: manufacturers,
        severity: 'low'
      }
    };
  }

  /**
   * Validate manufacturer similarity (allowing for subsidiaries)
   */
  validateManufacturerSimilarity(manufacturers) {
    // Simple similarity check - in real implementation, would use more sophisticated matching
    const normalizedManufacturers = manufacturers.map(m => this.normalizeValue(m.manufacturer));
    const uniqueManufacturers = [...new Set(normalizedManufacturers)];

    // Allow up to 2 different manufacturers (could be parent/subsidiary)
    return uniqueManufacturers.length <= 2;
  }

  /**
   * Validate strength consistency
   */
  validateStrengthConsistency(sources) {
    const strengths = [];
    Object.entries(sources).forEach(([sourceName, sourceData]) => {
      if (sourceData.status === 'success') {
        const strength = this.extractStrengthFromSource(sourceData.data, sourceName);
        if (strength) strengths.push({ strength, source: sourceName });
      }
    });

    if (strengths.length <= 1) return { field: 'strength', valid: true };

    const normalizedStrengths = [...new Set(strengths.map(s => this.normalizeValue(s.strength)))];
    const valid = normalizedStrengths.length === 1;

    return {
      field: 'strength',
      valid: valid,
      inconsistency: valid ? null : {
        field: 'strength',
        conflictingValues: strengths,
        severity: 'medium'
      }
    };
  }

  /**
   * Validate dosage form consistency
   */
  validateDosageFormConsistency(sources) {
    const dosageForms = [];
    Object.entries(sources).forEach(([sourceName, sourceData]) => {
      if (sourceData.status === 'success') {
        const dosageForm = this.extractDosageFormFromSource(sourceData.data, sourceName);
        if (dosageForm) dosageForms.push({ dosageForm, source: sourceName });
      }
    });

    if (dosageForms.length <= 1) return { field: 'dosageForm', valid: true };

    const normalizedForms = [...new Set(dosageForms.map(d => this.normalizeValue(d.dosageForm)))];
    const valid = normalizedForms.length === 1;

    return {
      field: 'dosageForm',
      valid: valid,
      inconsistency: valid ? null : {
        field: 'dosageForm',
        conflictingValues: dosageForms,
        severity: 'low'
      }
    };
  }

  /**
   * Calculate confidence scores for all data
   */
  calculateConfidenceScores(sources, crossReferences) {
    console.log('📊 Calculating confidence scores...');

    const scores = {};

    Object.entries(crossReferences).forEach(([field, fieldData]) => {
      scores[field] = {
        confidence: fieldData.confidence,
        sourceCount: fieldData.sources.length,
        agreements: fieldData.agreements,
        conflicts: fieldData.conflicts.length,
        reliability: this.calculateFieldReliability(fieldData)
      };
    });

    // Calculate overall confidence
    const fieldScores = Object.values(scores).map(s => s.confidence);
    scores.overall = fieldScores.length > 0
      ? Math.round(fieldScores.reduce((a, b) => a + b, 0) / fieldScores.length)
      : 0;

    return scores;
  }

  /**
   * Calculate field reliability based on source quality
   */
  calculateFieldReliability(fieldData) {
    if (fieldData.values.length === 0) return 0;

    const reliabilityScores = fieldData.values.map(v => v.reliability);
    const maxReliability = Math.max(...reliabilityScores);
    const avgReliability = reliabilityScores.reduce((a, b) => a + b, 0) / reliabilityScores.length;

    // Weight towards highest reliability source
    return Math.round((maxReliability * 0.7) + (avgReliability * 0.3));
  }

  /**
   * Resolve conflicts between data sources
   */
  resolveDataConflicts(sources, crossReferences) {
    console.log('⚖️ Resolving data conflicts...');

    const resolutions = {};

    Object.entries(crossReferences).forEach(([field, fieldData]) => {
      if (fieldData.conflicts.length > 0) {
        resolutions[field] = this.resolveFieldConflict(fieldData);
      } else {
        resolutions[field] = {
          resolved: true,
          finalValue: fieldData.consensus,
          method: 'consensus',
          confidence: fieldData.confidence
        };
      }
    });

    return resolutions;
  }

  /**
   * Resolve conflict for a specific field
   */
  resolveFieldConflict(fieldData) {
    // Priority order: FDA sources > RxNorm > DailyMed > Others
    const priorityOrder = [
      'FDA Drugs@FDA', 'OpenFDA Labeling', 'OpenFDA Adverse Events',
      'RxNorm', 'DailyMed', 'NIH Clinical Trials', 'PubMed',
      'Local Database', 'Web Scraped'
    ];

    // Find highest priority source with data
    for (const source of priorityOrder) {
      const sourceValue = fieldData.values.find(v => v.source === source);
      if (sourceValue) {
        return {
          resolved: true,
          finalValue: sourceValue.value,
          method: 'priority',
          chosenSource: source,
          confidence: Math.min(90, sourceValue.reliability * 9),
          alternativeValues: fieldData.values.filter(v => v.source !== source)
        };
      }
    }

    // Fallback to highest reliability
    const highestReliability = fieldData.values.reduce((prev, current) =>
      (prev.reliability > current.reliability) ? prev : current
    );

    return {
      resolved: true,
      finalValue: highestReliability.value,
      method: 'reliability',
      chosenSource: highestReliability.source,
      confidence: Math.min(80, highestReliability.reliability * 8),
      alternativeValues: fieldData.values.filter(v => v.source !== highestReliability.source)
    };
  }

  /**
   * Calculate overall quality metrics
   */
  calculateQualityMetrics(phase2Data, verification) {
    const metrics = {
      dataCompleteness: 0,
      overallAccuracy: 0,
      sourceReliability: 0,
      crossVerification: 0,
      overallQuality: 0
    };

    // Data completeness (percentage of expected fields with data)
    const expectedFields = 12; // Key fields we expect to find
    const fieldsWithData = Object.values(verification.crossReferences)
      .filter(field => field.consensus !== null).length;
    metrics.dataCompleteness = Math.round((fieldsWithData / expectedFields) * 100);

    // Overall accuracy (based on consistency validation)
    metrics.overallAccuracy = verification.dataValidation.consistencyScore;

    // Source reliability (weighted average of source reliabilities)
    const successfulSources = Object.values(phase2Data.sources)
      .filter(source => source.status === 'success');
    if (successfulSources.length > 0) {
      const totalReliability = successfulSources.reduce((sum, source) =>
        sum + (source.reliability || 5), 0);
      metrics.sourceReliability = Math.round(totalReliability / successfulSources.length * 10);
    }

    // Cross-verification score (based on agreements vs conflicts)
    const totalFields = Object.keys(verification.crossReferences).length;
    const fieldsWithAgreement = Object.values(verification.crossReferences)
      .filter(field => field.agreements > field.conflicts.length).length;
    metrics.crossVerification = totalFields > 0
      ? Math.round((fieldsWithAgreement / totalFields) * 100)
      : 0;

    // Overall quality (weighted combination)
    metrics.overallQuality = Math.round(
      (metrics.dataCompleteness * 0.3) +
      (metrics.overallAccuracy * 0.3) +
      (metrics.sourceReliability * 0.2) +
      (metrics.crossVerification * 0.2)
    );

    return metrics;
  }

  /**
   * Create verified dataset from all sources and verification results
   */
  createVerifiedDataset(sources, verification) {
    console.log('📋 Creating verified dataset...');

    const verifiedData = {
      identification: {},
      prescribingInformation: {},
      safetyInformation: {},
      manufacturingInformation: {},
      regulatoryInformation: {},
      clinicalInformation: {},
      qualityAssurance: {
        dataCompleteness: verification.qualityMetrics.dataCompleteness,
        overallAccuracy: verification.qualityMetrics.overallAccuracy,
        sourceCount: Object.keys(sources).filter(key => sources[key].status === 'success').length,
        verificationLevel: this.determineVerificationLevel(verification.qualityMetrics)
      }
    };

    // Populate verified data using conflict resolutions
    Object.entries(verification.conflictResolution).forEach(([field, resolution]) => {
      if (resolution.resolved && resolution.finalValue) {
        this.assignVerifiedField(verifiedData, field, resolution);
      }
    });

    return verifiedData;
  }

  /**
   * Assign verified field to appropriate section
   */
  assignVerifiedField(verifiedData, field, resolution) {
    const fieldMapping = {
      brandName: ['identification', 'brandName'],
      genericName: ['identification', 'genericName'],
      ndc: ['identification', 'ndc'],
      manufacturer: ['manufacturingInformation', 'manufacturer'],
      activeIngredients: ['identification', 'activeIngredients'],
      strength: ['identification', 'strength'],
      dosageForm: ['identification', 'dosageForm'],
      indications: ['prescribingInformation', 'indications'],
      contraindications: ['safetyInformation', 'contraindications'],
      warnings: ['safetyInformation', 'warnings'],
      adverseReactions: ['safetyInformation', 'adverseReactions'],
      drugInteractions: ['safetyInformation', 'drugInteractions']
    };

    const mapping = fieldMapping[field];
    if (mapping) {
      const [section, fieldName] = mapping;
      if (!verifiedData[section]) verifiedData[section] = {};

      verifiedData[section][fieldName] = {
        value: resolution.finalValue,
        confidence: resolution.confidence,
        source: resolution.chosenSource,
        method: resolution.method,
        alternatives: resolution.alternativeValues || []
      };
    }
  }

  /**
   * Determine verification level based on quality metrics
   */
  determineVerificationLevel(qualityMetrics) {
    if (qualityMetrics.overallQuality >= 90) return 'GOLD';
    if (qualityMetrics.overallQuality >= 80) return 'SILVER';
    if (qualityMetrics.overallQuality >= 70) return 'BRONZE';
    return 'BASIC';
  }

  /**
   * Phase 4: Comprehensive Results Compilation
   * Present unified, verified dataset with complete attribution
   */
  async executePhase4(phase3Data) {
    const startTime = Date.now();
    console.log('📊 Phase 4: Comprehensive Results Compilation');

    try {
      const comprehensiveResult = {
        medicineProfile: {
          identification: this.compileIdentificationProfile(phase3Data.verifiedData),
          prescribingInformation: this.compilePrescribingProfile(phase3Data.verifiedData),
          safetyProfile: this.compileSafetyProfile(phase3Data.verifiedData),
          pharmacologyProfile: this.compilePharmacologyProfile(phase3Data.originalData),
          manufacturingProfile: this.compileManufacturingProfile(phase3Data.verifiedData),
          regulatoryProfile: this.compileRegulatoryProfile(phase3Data.verifiedData),
          clinicalProfile: this.compileClinicalProfile(phase3Data.originalData)
        },
        dataQuality: {
          completeness: phase3Data.verification.qualityMetrics.dataCompleteness,
          accuracy: phase3Data.verification.qualityMetrics.overallAccuracy,
          reliability: phase3Data.verification.qualityMetrics.sourceReliability,
          verificationLevel: phase3Data.verifiedData.qualityAssurance.verificationLevel,
          sourceCount: phase3Data.verifiedData.qualityAssurance.sourceCount,
          lastUpdated: new Date().toISOString()
        },
        sourceAttribution: this.compileSourceAttribution(phase3Data.originalData.sources),
        discrepancies: this.compileDiscrepancies(phase3Data.verification),
        recommendations: this.generateRecommendations(phase3Data.verification.qualityMetrics),
        disclaimer: this.generateDisclaimer(phase3Data.verification.qualityMetrics)
      };

      console.log(`✅ Phase 4 completed: ${comprehensiveResult.dataQuality.completeness}% complete, ${comprehensiveResult.dataQuality.accuracy}% accurate`);

      return {
        status: 'completed',
        data: comprehensiveResult,
        duration: Date.now() - startTime,
        qualityLevel: comprehensiveResult.dataQuality.verificationLevel
      };

    } catch (error) {
      console.error('Phase 4 error:', error);
      return {
        status: 'failed',
        error: error.message,
        duration: Date.now() - startTime,
        data: this.createMinimalResult(phase3Data)
      };
    }
  }

  /**
   * Compile identification profile
   */
  compileIdentificationProfile(verifiedData) {
    return {
      brandName: verifiedData.identification?.brandName?.value || 'Unknown',
      genericName: verifiedData.identification?.genericName?.value || 'Unknown',
      activeIngredients: verifiedData.identification?.activeIngredients?.value || [],
      strength: verifiedData.identification?.strength?.value || 'Not specified',
      dosageForm: verifiedData.identification?.dosageForm?.value || 'Not specified',
      ndc: verifiedData.identification?.ndc?.value || 'Not available',
      confidence: this.calculateSectionConfidence(verifiedData.identification)
    };
  }

  /**
   * Compile prescribing profile
   */
  compilePrescribingProfile(verifiedData) {
    return {
      indications: verifiedData.prescribingInformation?.indications?.value || [],
      dosageAndAdministration: 'Consult prescribing information',
      contraindications: verifiedData.safetyInformation?.contraindications?.value || [],
      confidence: this.calculateSectionConfidence(verifiedData.prescribingInformation)
    };
  }

  /**
   * Compile safety profile
   */
  compileSafetyProfile(verifiedData) {
    return {
      warnings: verifiedData.safetyInformation?.warnings?.value || [],
      adverseReactions: verifiedData.safetyInformation?.adverseReactions?.value || [],
      drugInteractions: verifiedData.safetyInformation?.drugInteractions?.value || [],
      contraindications: verifiedData.safetyInformation?.contraindications?.value || [],
      confidence: this.calculateSectionConfidence(verifiedData.safetyInformation)
    };
  }

  /**
   * Compile pharmacology profile
   */
  compilePharmacologyProfile(originalData) {
    return {
      mechanismOfAction: 'Consult pharmacology references',
      pharmacokinetics: 'Consult pharmacology references',
      confidence: 30 // Low confidence as this requires specialized databases
    };
  }

  /**
   * Compile manufacturing profile
   */
  compileManufacturingProfile(verifiedData) {
    return {
      manufacturer: verifiedData.manufacturingInformation?.manufacturer?.value || 'Unknown',
      ndc: verifiedData.identification?.ndc?.value || 'Not available',
      confidence: this.calculateSectionConfidence(verifiedData.manufacturingInformation)
    };
  }

  /**
   * Compile regulatory profile
   */
  compileRegulatoryProfile(verifiedData) {
    return {
      fdaApproved: 'Consult FDA databases',
      controlledSubstance: 'Consult DEA schedules',
      confidence: 40 // Moderate confidence based on available data
    };
  }

  /**
   * Compile clinical profile
   */
  compileClinicalProfile(originalData) {
    const clinicalData = originalData.sources.nihClinicalTrials;
    return {
      clinicalTrials: clinicalData?.status === 'success' ? clinicalData.data : [],
      confidence: clinicalData?.status === 'success' ? 70 : 20
    };
  }

  /**
   * Calculate confidence for a data section
   */
  calculateSectionConfidence(sectionData) {
    if (!sectionData) return 0;

    const confidenceScores = Object.values(sectionData)
      .filter(field => field && typeof field.confidence === 'number')
      .map(field => field.confidence);

    return confidenceScores.length > 0
      ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length)
      : 0;
  }

  /**
   * Compile source attribution
   */
  compileSourceAttribution(sources) {
    const attribution = {};

    Object.entries(sources).forEach(([sourceName, sourceData]) => {
      attribution[sourceName] = {
        status: sourceData.status,
        reliability: sourceData.reliability || 5,
        dataPoints: sourceData.dataPoints || 0,
        searchStrategy: sourceData.searchStrategy?.type || 'unknown'
      };
    });

    return attribution;
  }

  /**
   * Compile discrepancies found during verification
   */
  compileDiscrepancies(verification) {
    const discrepancies = [];

    if (verification.dataValidation.inconsistencies) {
      verification.dataValidation.inconsistencies.forEach(inconsistency => {
        discrepancies.push({
          field: inconsistency.field,
          severity: inconsistency.severity,
          description: `Inconsistent ${inconsistency.field} values found across sources`,
          conflictingValues: inconsistency.conflictingValues
        });
      });
    }

    return discrepancies;
  }

  /**
   * Generate recommendations based on data quality
   */
  generateRecommendations(qualityMetrics) {
    const recommendations = [];

    if (qualityMetrics.dataCompleteness < 70) {
      recommendations.push({
        type: 'data_completeness',
        priority: 'high',
        message: 'Limited medicine information available. Consult additional sources.'
      });
    }

    if (qualityMetrics.overallAccuracy < 80) {
      recommendations.push({
        type: 'accuracy',
        priority: 'high',
        message: 'Data accuracy concerns detected. Verify information with healthcare professional.'
      });
    }

    if (qualityMetrics.sourceReliability < 70) {
      recommendations.push({
        type: 'reliability',
        priority: 'medium',
        message: 'Limited high-reliability sources available. Cross-check with official sources.'
      });
    }

    recommendations.push({
      type: 'general',
      priority: 'high',
      message: 'Always consult healthcare professionals before making medical decisions.'
    });

    return recommendations;
  }

  /**
   * Generate appropriate disclaimer based on data quality
   */
  generateDisclaimer(qualityMetrics) {
    let disclaimer = 'IMPORTANT MEDICAL DISCLAIMER: ';

    if (qualityMetrics.overallQuality >= 90) {
      disclaimer += 'This information has been cross-verified from multiple authoritative sources. ';
    } else if (qualityMetrics.overallQuality >= 70) {
      disclaimer += 'This information has been compiled from available sources with moderate verification. ';
    } else {
      disclaimer += 'This information has limited verification and may be incomplete. ';
    }

    disclaimer += 'This tool is for informational purposes only and should not replace professional medical advice. ';
    disclaimer += 'Always consult with qualified healthcare professionals before making any medical decisions. ';
    disclaimer += 'Do not rely solely on AI identification for medicine verification. ';
    disclaimer += 'In case of medical emergency, contact emergency services immediately.';

    return disclaimer;
  }

  /**
   * Create minimal result for fallback scenarios
   */
  createMinimalResult(phase3Data) {
    return {
      medicineProfile: {
        identification: {
          brandName: 'Unknown',
          genericName: 'Unknown',
          confidence: 10
        }
      },
      dataQuality: {
        completeness: 10,
        accuracy: 30,
        verificationLevel: 'BASIC'
      },
      disclaimer: 'Analysis incomplete due to system limitations. Consult healthcare professional for accurate medicine identification.'
    };
  }
}

module.exports = new ComprehensiveMedicineService();
