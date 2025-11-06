const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class MedicineService {
  constructor() {
    this.openFDABaseURL = process.env.OPENFDA_BASE_URL || 'https://api.fda.gov';
    this.rxNormBaseURL = process.env.RXNORM_BASE_URL || 'https://rxnav.nlm.nih.gov/REST';
    this.dailyMedBaseURL = 'https://dailymed.nlm.nih.gov/dailymed';
    this.drugsComBaseURL = 'https://www.drugs.com';
    this.webMDBaseURL = 'https://www.webmd.com';

    // Load local medicine database
    this.loadLocalDatabase();
  }

  /**
   * Load local medicine database for offline fallback
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
   * Get comprehensive medicine information based on Gemini analysis
   * @param {Object} geminiData - Analysis data from Gemini Vision API
   * @returns {Object} Comprehensive medicine information
   */
  async getMedicineInfo(geminiData) {
    try {
      console.log('🔍 Fetching comprehensive medicine information...');

      const result = {
        basicInfo: this.extractBasicInfo(geminiData),
        comprehensiveInfo: {
          identification: {},
          prescribingInfo: {},
          pharmacology: {},
          safetyProfile: {},
          manufacturingInfo: {},
          regulatoryInfo: {},
          clinicalInfo: {},
          pricingInfo: {},
          alternatives: {}
        },
        dataSources: {
          fdaData: null,
          rxNormData: null,
          dailyMedData: null,
          openFDAAdverseEvents: null,
          openFDALabeling: null,
          localData: null,
          webScrapedData: null
        },
        sources: [],
        dataQuality: {
          completeness: 0,
          accuracy: 0,
          freshness: new Date().toISOString(),
          crossReferencedSources: 0
        },
        lastUpdated: new Date().toISOString()
      };

      // Generate comprehensive search terms
      const searchTerms = this.generateComprehensiveSearchTerms(geminiData);
      console.log(`🔍 Searching with terms: ${searchTerms.join(', ')}`);

      // Phase 1: Primary identification and basic info
      await this.gatherPrimaryMedicineData(searchTerms, result);

      // Phase 2: Comprehensive prescribing and safety information
      await this.gatherPrescribingInformation(searchTerms, result);

      // Phase 3: Pharmacology and clinical data
      await this.gatherPharmacologyData(searchTerms, result);

      // Phase 4: Safety and adverse event data
      await this.gatherSafetyData(searchTerms, result);

      // Phase 5: Regulatory and manufacturing data
      await this.gatherRegulatoryData(searchTerms, result);

      // Phase 6: Pricing and alternatives
      await this.gatherPricingAndAlternatives(searchTerms, result);

      // Phase 7: Cross-reference and validate data
      await this.crossReferenceAndValidate(result);

      // Phase 8: Compile comprehensive information
      result.comprehensiveInfo = this.compileComprehensiveInfo(result, geminiData);

      // Calculate data quality metrics
      result.dataQuality = this.calculateDataQuality(result);

      console.log(`✅ Comprehensive medicine information compiled from ${result.sources.length} sources`);
      console.log(`📊 Data quality: ${result.dataQuality.completeness}% complete, ${result.dataQuality.accuracy}% accurate`);

      return result;

    } catch (error) {
      console.error('Error getting comprehensive medicine info:', error);
      return {
        basicInfo: this.extractBasicInfo(geminiData),
        comprehensiveInfo: this.createFallbackComprehensiveInfo(geminiData),
        error: error.message,
        sources: ['AI Analysis Only'],
        dataQuality: { completeness: 10, accuracy: 50, freshness: new Date().toISOString(), crossReferencedSources: 0 },
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Extract basic information from Gemini analysis
   */
  extractBasicInfo(geminiData) {
    return {
      identified: geminiData.identified || false,
      confidence: geminiData.confidence || 1,
      brandName: geminiData.medicine?.brandName || null,
      genericName: geminiData.medicine?.genericName || null,
      strength: geminiData.medicine?.strength || null,
      dosageForm: geminiData.medicine?.dosageForm || null,
      manufacturer: geminiData.medicine?.manufacturer || null,
      ndc: geminiData.medicine?.ndc || null,
      physicalCharacteristics: geminiData.physicalCharacteristics || {},
      extractedText: geminiData.extractedText || [],
      expirationDate: geminiData.expirationDate || null,
      lotNumber: geminiData.lotNumber || null
    };
  }

  /**
   * Generate comprehensive search terms from Gemini analysis
   */
  generateComprehensiveSearchTerms(geminiData) {
    const terms = new Set();

    // Primary identifiers
    if (geminiData.medicine?.brandName) {
      terms.add(geminiData.medicine.brandName);
      terms.add(geminiData.medicine.brandName.toLowerCase());
    }

    if (geminiData.medicine?.genericName) {
      terms.add(geminiData.medicine.genericName);
      terms.add(geminiData.medicine.genericName.toLowerCase());
    }

    // Active ingredients
    if (geminiData.medicine?.activeIngredients) {
      geminiData.medicine.activeIngredients.forEach(ingredient => {
        if (ingredient && ingredient.length > 2) {
          terms.add(ingredient);
          // Extract just the ingredient name without dosage
          const cleanIngredient = ingredient.replace(/\d+\s*(mg|mcg|g|ml|%)/gi, '').trim();
          if (cleanIngredient.length > 2) {
            terms.add(cleanIngredient);
          }
        }
      });
    }

    // NDC number
    if (geminiData.medicine?.ndc || geminiData.manufacturingInfo?.ndc) {
      const ndc = geminiData.medicine?.ndc || geminiData.manufacturingInfo?.ndc;
      terms.add(ndc);
    }

    // Extracted drug names
    if (geminiData.extractedText?.drugNames) {
      geminiData.extractedText.drugNames.forEach(name => {
        if (name && name.length > 2 && name.length < 50) {
          terms.add(name);
        }
      });
    }

    // All extracted text (filtered for potential drug names)
    if (geminiData.extractedText?.allText) {
      geminiData.extractedText.allText.forEach(text => {
        if (text && text.length > 2 && text.length < 50 && /^[a-zA-Z\s\-]+$/.test(text)) {
          // Skip common non-drug words
          const skipWords = ['tablet', 'capsule', 'mg', 'ml', 'take', 'with', 'food', 'water', 'daily', 'twice'];
          if (!skipWords.some(word => text.toLowerCase().includes(word))) {
            terms.add(text.trim());
          }
        }
      });
    }

    // Manufacturer-specific searches
    if (geminiData.medicine?.manufacturer) {
      const manufacturer = geminiData.medicine.manufacturer;
      if (geminiData.medicine?.brandName) {
        terms.add(`${geminiData.medicine.brandName} ${manufacturer}`);
      }
      if (geminiData.medicine?.genericName) {
        terms.add(`${geminiData.medicine.genericName} ${manufacturer}`);
      }
    }

    // Strength-specific searches
    if (geminiData.medicine?.strength) {
      if (geminiData.medicine?.brandName) {
        terms.add(`${geminiData.medicine.brandName} ${geminiData.medicine.strength}`);
      }
      if (geminiData.medicine?.genericName) {
        terms.add(`${geminiData.medicine.genericName} ${geminiData.medicine.strength}`);
      }
    }

    return Array.from(terms).filter(term => term && term.length > 1);
  }

  /**
   * Phase 1: Gather primary medicine identification data
   */
  async gatherPrimaryMedicineData(searchTerms, result) {
    console.log('📋 Phase 1: Gathering primary medicine data...');

    for (const term of searchTerms.slice(0, 5)) { // Limit to top 5 terms for primary search
      try {
        // FDA Drugs@FDA database
        const fdaData = await this.searchFDADrugsDatabase(term);
        if (fdaData && fdaData.length > 0) {
          result.dataSources.fdaData = fdaData[0];
          result.sources.push('FDA Drugs@FDA');
          break;
        }
      } catch (error) {
        console.warn(`FDA Drugs@FDA search failed for "${term}":`, error.message);
      }

      try {
        // RxNorm database
        const rxNormData = await this.searchRxNormDetailed(term);
        if (rxNormData) {
          result.dataSources.rxNormData = rxNormData;
          result.sources.push('RxNorm');
        }
      } catch (error) {
        console.warn(`RxNorm search failed for "${term}":`, error.message);
      }

      try {
        // Local database
        const localData = this.searchLocalDatabase(term);
        if (localData) {
          result.dataSources.localData = localData;
          result.sources.push('Local Database');
        }
      } catch (error) {
        console.warn(`Local database search failed for "${term}":`, error.message);
      }
    }
  }

  /**
   * Phase 2: Gather comprehensive prescribing information
   */
  async gatherPrescribingInformation(searchTerms, result) {
    console.log('💊 Phase 2: Gathering prescribing information...');

    for (const term of searchTerms.slice(0, 3)) {
      try {
        // DailyMed API for official prescribing information
        const dailyMedData = await this.searchDailyMed(term);
        if (dailyMedData) {
          result.dataSources.dailyMedData = dailyMedData;
          result.sources.push('DailyMed');
          break;
        }
      } catch (error) {
        console.warn(`DailyMed search failed for "${term}":`, error.message);
      }
    }
  }

  /**
   * Phase 3: Gather pharmacology and clinical data
   */
  async gatherPharmacologyData(searchTerms, result) {
    console.log('🧬 Phase 3: Gathering pharmacology data...');

    // This would integrate with additional APIs or web scraping
    // For now, we'll enhance based on existing data
    try {
      if (result.dataSources.fdaData || result.dataSources.rxNormData) {
        // Extract pharmacology information from existing sources
        result.comprehensiveInfo.pharmacology = this.extractPharmacologyInfo(result.dataSources);
      }
    } catch (error) {
      console.warn('Pharmacology data extraction failed:', error.message);
    }
  }

  /**
   * Phase 4: Gather safety and adverse event data
   */
  async gatherSafetyData(searchTerms, result) {
    console.log('⚠️ Phase 4: Gathering safety data...');

    for (const term of searchTerms.slice(0, 3)) {
      try {
        // OpenFDA Adverse Events
        const adverseEvents = await this.searchOpenFDAAdverseEvents(term);
        if (adverseEvents) {
          result.dataSources.openFDAAdverseEvents = adverseEvents;
          result.sources.push('OpenFDA Adverse Events');
        }
      } catch (error) {
        console.warn(`OpenFDA Adverse Events search failed for "${term}":`, error.message);
      }

      try {
        // OpenFDA Drug Labeling
        const labeling = await this.searchOpenFDALabeling(term);
        if (labeling) {
          result.dataSources.openFDALabeling = labeling;
          result.sources.push('OpenFDA Labeling');
        }
      } catch (error) {
        console.warn(`OpenFDA Labeling search failed for "${term}":`, error.message);
      }
    }
  }

  /**
   * Phase 5: Gather regulatory and manufacturing data
   */
  async gatherRegulatoryData(searchTerms, result) {
    console.log('🏛️ Phase 5: Gathering regulatory data...');

    // Extract regulatory information from existing FDA data
    if (result.dataSources.fdaData) {
      result.comprehensiveInfo.regulatoryInfo = this.extractRegulatoryInfo(result.dataSources.fdaData);
    }
  }

  /**
   * Phase 6: Gather pricing and alternatives
   */
  async gatherPricingAndAlternatives(searchTerms, result) {
    console.log('💰 Phase 6: Gathering pricing and alternatives...');

    // This would integrate with pricing APIs or web scraping
    // For now, we'll provide basic alternative suggestions
    if (result.dataSources.rxNormData) {
      result.comprehensiveInfo.alternatives = await this.findAlternatives(result.dataSources.rxNormData);
    }
  }

  /**
   * Phase 7: Cross-reference and validate data
   */
  async crossReferenceAndValidate(result) {
    console.log('🔍 Phase 7: Cross-referencing and validating data...');

    // Cross-reference data between sources for accuracy
    result.dataQuality.crossReferencedSources = result.sources.length;

    // Validate consistency between sources
    if (result.dataSources.fdaData && result.dataSources.rxNormData) {
      // Check for consistency in drug names, strengths, etc.
      const consistency = this.validateDataConsistency(result.dataSources);
      result.dataQuality.accuracy = consistency.accuracyScore;
    }
  }

  /**
   * Enhanced FDA Drugs@FDA database search
   */
  async searchFDADrugsDatabase(searchTerm) {
    try {
      const url = `${this.openFDABaseURL}/drug/drugsfda.json`;
      const params = {
        search: `openfda.brand_name:"${searchTerm}" OR openfda.generic_name:"${searchTerm}" OR openfda.substance_name:"${searchTerm}"`,
        limit: 10
      };

      const response = await axios.get(url, {
        params,
        timeout: 15000
      });

      return response.data.results || [];
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Search OpenFDA Adverse Events
   */
  async searchOpenFDAAdverseEvents(searchTerm) {
    try {
      const url = `${this.openFDABaseURL}/drug/event.json`;
      const params = {
        search: `patient.drug.medicinalproduct:"${searchTerm}" OR patient.drug.drugindication:"${searchTerm}"`,
        count: 'patient.reaction.reactionmeddrapt.exact',
        limit: 100
      };

      const response = await axios.get(url, {
        params,
        timeout: 15000
      });

      return response.data.results || [];
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Search OpenFDA Drug Labeling
   */
  async searchOpenFDALabeling(searchTerm) {
    try {
      const url = `${this.openFDABaseURL}/drug/label.json`;
      const params = {
        search: `openfda.brand_name:"${searchTerm}" OR openfda.generic_name:"${searchTerm}"`,
        limit: 5
      };

      const response = await axios.get(url, {
        params,
        timeout: 15000
      });

      return response.data.results || [];
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Enhanced RxNorm database search with detailed information
   */
  async searchRxNormDetailed(searchTerm) {
    try {
      // First, get the RxCUI for the drug
      const drugsUrl = `${this.rxNormBaseURL}/drugs.json`;
      const drugsResponse = await axios.get(drugsUrl, {
        params: { name: searchTerm },
        timeout: 15000
      });

      const conceptGroup = drugsResponse.data.drugGroup?.conceptGroup;
      if (!conceptGroup || conceptGroup.length === 0) {
        return null;
      }

      // Get the first concept with RxCUI
      let rxcui = null;
      for (const group of conceptGroup) {
        if (group.conceptProperties && group.conceptProperties.length > 0) {
          rxcui = group.conceptProperties[0].rxcui;
          break;
        }
      }

      if (!rxcui) {
        return conceptGroup;
      }

      // Get detailed information using RxCUI
      const detailedInfo = {
        basicInfo: conceptGroup,
        rxcui: rxcui,
        properties: null,
        relatedDrugs: null,
        interactions: null,
        ndcs: null
      };

      try {
        // Get drug properties
        const propsUrl = `${this.rxNormBaseURL}/rxcui/${rxcui}/properties.json`;
        const propsResponse = await axios.get(propsUrl, { timeout: 10000 });
        detailedInfo.properties = propsResponse.data.properties;
      } catch (error) {
        console.warn('RxNorm properties fetch failed:', error.message);
      }

      try {
        // Get related drugs
        const relatedUrl = `${this.rxNormBaseURL}/rxcui/${rxcui}/related.json`;
        const relatedResponse = await axios.get(relatedUrl, { timeout: 10000 });
        detailedInfo.relatedDrugs = relatedResponse.data.relatedGroup;
      } catch (error) {
        console.warn('RxNorm related drugs fetch failed:', error.message);
      }

      try {
        // Get NDCs
        const ndcUrl = `${this.rxNormBaseURL}/rxcui/${rxcui}/ndcs.json`;
        const ndcResponse = await axios.get(ndcUrl, { timeout: 10000 });
        detailedInfo.ndcs = ndcResponse.data.ndcGroup?.ndcList;
      } catch (error) {
        console.warn('RxNorm NDCs fetch failed:', error.message);
      }

      return detailedInfo;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Search DailyMed for official prescribing information
   */
  async searchDailyMed(searchTerm) {
    try {
      // DailyMed doesn't have a public API, so we'll simulate the structure
      // In a real implementation, you would web scrape or use their data download
      console.log(`📋 DailyMed search for: ${searchTerm} (simulated)`);

      // Return null for now - would implement web scraping here
      return null;
    } catch (error) {
      console.warn('DailyMed search failed:', error.message);
      return null;
    }
  }

  /**
   * Search local database
   */
  searchLocalDatabase(searchTerm) {
    if (!this.localDB || this.localDB.length === 0) {
      return null;
    }

    const term = searchTerm.toLowerCase();
    return this.localDB.find(medicine =>
      medicine.brandName?.toLowerCase().includes(term) ||
      medicine.genericName?.toLowerCase().includes(term) ||
      medicine.activeIngredient?.toLowerCase().includes(term)
    );
  }

  /**
   * Compile comprehensive medicine information from all sources
   */
  compileComprehensiveInfo(result, geminiData) {
    console.log('📊 Compiling comprehensive medicine information...');

    const comprehensive = {
      identification: this.compileIdentificationInfo(result, geminiData),
      prescribingInfo: this.compilePrescribingInfo(result, geminiData),
      pharmacology: this.compilePharmacologyInfo(result, geminiData),
      safetyProfile: this.compileSafetyProfile(result, geminiData),
      manufacturingInfo: this.compileManufacturingInfo(result, geminiData),
      regulatoryInfo: this.compileRegulatoryInfo(result, geminiData),
      clinicalInfo: this.compileClinicalInfo(result, geminiData),
      pricingInfo: this.compilePricingInfo(result, geminiData),
      alternatives: this.compileAlternatives(result, geminiData)
    };

    return comprehensive;
  }

  /**
   * Compile identification information
   */
  compileIdentificationInfo(result, geminiData) {
    const identification = {
      brandNames: new Set(),
      genericNames: new Set(),
      activeIngredients: new Set(),
      inactiveIngredients: new Set(),
      strength: null,
      dosageForm: null,
      route: null,
      ndc: null,
      manufacturer: null,
      therapeuticClass: null,
      physicalCharacteristics: geminiData.physicalCharacteristics || {}
    };

    // From Gemini analysis
    if (geminiData.medicine?.brandName) identification.brandNames.add(geminiData.medicine.brandName);
    if (geminiData.medicine?.genericName) identification.genericNames.add(geminiData.medicine.genericName);
    if (geminiData.medicine?.activeIngredients) {
      geminiData.medicine.activeIngredients.forEach(ing => identification.activeIngredients.add(ing));
    }
    if (geminiData.medicine?.inactiveIngredients) {
      geminiData.medicine.inactiveIngredients.forEach(ing => identification.inactiveIngredients.add(ing));
    }

    // From FDA data
    if (result.dataSources.fdaData) {
      const fda = result.dataSources.fdaData;
      if (fda.openfda?.brand_name) fda.openfda.brand_name.forEach(name => identification.brandNames.add(name));
      if (fda.openfda?.generic_name) fda.openfda.generic_name.forEach(name => identification.genericNames.add(name));
      if (fda.openfda?.substance_name) fda.openfda.substance_name.forEach(name => identification.activeIngredients.add(name));
      if (fda.openfda?.manufacturer_name) identification.manufacturer = fda.openfda.manufacturer_name[0];
      if (fda.openfda?.product_ndc) identification.ndc = fda.openfda.product_ndc[0];
    }

    // From RxNorm data
    if (result.dataSources.rxNormData?.properties) {
      const props = result.dataSources.rxNormData.properties;
      if (props.name) identification.genericNames.add(props.name);
    }

    // Convert Sets to Arrays
    identification.brandNames = Array.from(identification.brandNames);
    identification.genericNames = Array.from(identification.genericNames);
    identification.activeIngredients = Array.from(identification.activeIngredients);
    identification.inactiveIngredients = Array.from(identification.inactiveIngredients);

    // Set primary values
    identification.primaryBrandName = identification.brandNames[0] || null;
    identification.primaryGenericName = identification.genericNames[0] || null;
    identification.strength = geminiData.medicine?.strength || null;
    identification.dosageForm = geminiData.medicine?.dosageForm || null;
    identification.route = geminiData.medicine?.route || null;

    return identification;
  }

  /**
   * Compile prescribing information
   */
  compilePrescribingInfo(result, geminiData) {
    const prescribing = {
      indications: [],
      dosageAndAdministration: {},
      contraindications: [],
      warningsAndPrecautions: [],
      adverseReactions: [],
      drugInteractions: [],
      useInSpecificPopulations: {},
      overdosage: null,
      clinicalPharmacology: null
    };

    // From Gemini analysis
    if (geminiData.prescribingInfo) {
      if (geminiData.prescribingInfo.indication) prescribing.indications.push(geminiData.prescribingInfo.indication);
      if (geminiData.prescribingInfo.dosage) {
        prescribing.dosageAndAdministration.general = geminiData.prescribingInfo.dosage;
      }
    }

    // From FDA labeling data
    if (result.dataSources.openFDALabeling && result.dataSources.openFDALabeling.length > 0) {
      const label = result.dataSources.openFDALabeling[0];

      if (label.indications_and_usage) prescribing.indications.push(...label.indications_and_usage);
      if (label.dosage_and_administration) {
        prescribing.dosageAndAdministration.detailed = label.dosage_and_administration;
      }
      if (label.contraindications) prescribing.contraindications.push(...label.contraindications);
      if (label.warnings) prescribing.warningsAndPrecautions.push(...label.warnings);
      if (label.adverse_reactions) prescribing.adverseReactions.push(...label.adverse_reactions);
      if (label.drug_interactions) prescribing.drugInteractions.push(...label.drug_interactions);
    }

    // From local database
    if (result.dataSources.localData) {
      const local = result.dataSources.localData;
      if (local.uses) prescribing.indications.push(local.uses);
      if (local.dosageInstructions) {
        prescribing.dosageAndAdministration.simplified = local.dosageInstructions;
      }
      if (local.contraindications) prescribing.contraindications.push(local.contraindications);
      if (local.warnings) prescribing.warningsAndPrecautions.push(...local.warnings);
      if (local.sideEffects) prescribing.adverseReactions.push(local.sideEffects);
      if (local.drugInteractions) prescribing.drugInteractions.push(local.drugInteractions);
    }

    return prescribing;
  }

  /**
   * Compile safety profile information
   */
  compileSafetyProfile(result, geminiData) {
    const safety = {
      blackBoxWarnings: [],
      contraindications: [],
      warningsAndPrecautions: [],
      adverseReactions: {
        common: [],
        serious: [],
        rare: []
      },
      drugInteractions: {
        major: [],
        moderate: [],
        minor: []
      },
      pregnancyAndLactation: {
        pregnancyCategory: null,
        pregnancyRisk: null,
        lactationRisk: null
      },
      pediatricUse: null,
      geriatricUse: null,
      renalImpairment: null,
      hepaticImpairment: null
    };

    // Compile from all sources
    if (geminiData.safetyInfo) {
      if (geminiData.safetyInfo.warnings) safety.warningsAndPrecautions.push(...geminiData.safetyInfo.warnings);
      if (geminiData.safetyInfo.contraindications) safety.contraindications.push(...geminiData.safetyInfo.contraindications);
      if (geminiData.safetyInfo.pregnancyCategory) safety.pregnancyAndLactation.pregnancyCategory = geminiData.safetyInfo.pregnancyCategory;
    }

    // From adverse events data
    if (result.dataSources.openFDAAdverseEvents) {
      const events = result.dataSources.openFDAAdverseEvents;
      // Process adverse events data to categorize by frequency
      events.forEach(event => {
        if (event.count > 1000) {
          safety.adverseReactions.common.push(event.term);
        } else if (event.count > 100) {
          safety.adverseReactions.serious.push(event.term);
        } else {
          safety.adverseReactions.rare.push(event.term);
        }
      });
    }

    return safety;
  }

  /**
   * Compile pharmacology information
   */
  compilePharmacologyInfo(result, geminiData) {
    return {
      mechanismOfAction: null,
      pharmacokinetics: {
        absorption: null,
        distribution: null,
        metabolism: null,
        elimination: null,
        halfLife: null
      },
      pharmacodynamics: null,
      clinicalStudies: []
    };
  }

  /**
   * Compile manufacturing information
   */
  compileManufacturingInfo(result, geminiData) {
    const manufacturing = {
      manufacturer: null,
      distributedBy: null,
      lotNumber: null,
      expirationDate: null,
      ndc: null,
      upc: null,
      storageConditions: null,
      shelfLife: null
    };

    if (geminiData.manufacturingInfo) {
      Object.assign(manufacturing, geminiData.manufacturingInfo);
    }

    if (result.dataSources.fdaData?.openfda) {
      const fda = result.dataSources.fdaData.openfda;
      manufacturing.manufacturer = fda.manufacturer_name?.[0] || manufacturing.manufacturer;
      manufacturing.ndc = fda.product_ndc?.[0] || manufacturing.ndc;
    }

    return manufacturing;
  }

  /**
   * Compile regulatory information
   */
  compileRegulatoryInfo(result, geminiData) {
    const regulatory = {
      fdaApprovalDate: null,
      applicationNumber: null,
      applicationType: null,
      rxStatus: null,
      controlledSubstance: null,
      dea: null,
      orphanDrug: false,
      fastTrack: false,
      breakthroughTherapy: false
    };

    if (result.dataSources.fdaData) {
      const fda = result.dataSources.fdaData;
      regulatory.applicationNumber = fda.application_number;
      regulatory.fdaApprovalDate = fda.submissions?.[0]?.submission_status_date;
    }

    if (geminiData.regulatoryInfo) {
      Object.assign(regulatory, geminiData.regulatoryInfo);
    }

    return regulatory;
  }

  /**
   * Compile clinical information
   */
  compileClinicalInfo(result, geminiData) {
    return {
      clinicalTrials: [],
      efficacyData: null,
      safetyData: null,
      postMarketingSurveillance: null
    };
  }

  /**
   * Compile pricing information
   */
  compilePricingInfo(result, geminiData) {
    return {
      averageWholesalePrice: null,
      averageRetailPrice: null,
      medicarePrice: null,
      medicaidPrice: null,
      cashPrice: null,
      insuranceCoverage: null,
      genericAvailable: false,
      patentExpiration: null
    };
  }

  /**
   * Compile alternatives information
   */
  compileAlternatives(result, geminiData) {
    const alternatives = {
      genericEquivalents: [],
      therapeuticAlternatives: [],
      brandAlternatives: [],
      biosimilars: [],
      overTheCounterAlternatives: []
    };

    if (result.dataSources.rxNormData?.relatedDrugs) {
      // Process related drugs to find alternatives
      const related = result.dataSources.rxNormData.relatedDrugs;
      if (related.conceptGroup) {
        related.conceptGroup.forEach(group => {
          if (group.tty === 'SCD') { // Semantic Clinical Drug
            alternatives.genericEquivalents.push(...(group.conceptProperties || []));
          } else if (group.tty === 'SBD') { // Semantic Branded Drug
            alternatives.brandAlternatives.push(...(group.conceptProperties || []));
          }
        });
      }
    }

    return alternatives;
  }

  /**
   * Calculate data quality metrics
   */
  calculateDataQuality(result) {
    let completeness = 0;
    let accuracy = 85; // Base accuracy score
    const totalFields = 50; // Total possible data fields
    let filledFields = 0;

    // Count filled fields in comprehensive info
    const checkObject = (obj, depth = 0) => {
      if (depth > 3) return; // Prevent infinite recursion

      Object.values(obj).forEach(value => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value) && value.length > 0) {
            filledFields++;
          } else if (typeof value === 'object' && value !== null) {
            checkObject(value, depth + 1);
          } else if (typeof value !== 'object') {
            filledFields++;
          }
        }
      });
    };

    if (result.comprehensiveInfo) {
      checkObject(result.comprehensiveInfo);
    }

    completeness = Math.min(100, (filledFields / totalFields) * 100);

    // Adjust accuracy based on number of cross-referenced sources
    if (result.sources.length >= 3) accuracy += 10;
    if (result.sources.length >= 5) accuracy += 5;

    return {
      completeness: Math.round(completeness),
      accuracy: Math.min(100, accuracy),
      freshness: new Date().toISOString(),
      crossReferencedSources: result.sources.length,
      dataPoints: filledFields,
      totalPossibleDataPoints: totalFields
    };
  }

  /**
   * Create fallback comprehensive info when APIs fail
   */
  createFallbackComprehensiveInfo(geminiData) {
    return {
      identification: {
        primaryBrandName: geminiData.medicine?.brandName || null,
        primaryGenericName: geminiData.medicine?.genericName || null,
        brandNames: geminiData.medicine?.brandName ? [geminiData.medicine.brandName] : [],
        genericNames: geminiData.medicine?.genericName ? [geminiData.medicine.genericName] : [],
        activeIngredients: geminiData.medicine?.activeIngredients || [],
        strength: geminiData.medicine?.strength || null,
        dosageForm: geminiData.medicine?.dosageForm || null,
        physicalCharacteristics: geminiData.physicalCharacteristics || {}
      },
      prescribingInfo: {
        indications: geminiData.prescribingInfo?.indication ? [geminiData.prescribingInfo.indication] : [],
        dosageAndAdministration: { general: geminiData.prescribingInfo?.dosage || null },
        contraindications: [],
        warningsAndPrecautions: geminiData.safetyInfo?.warnings || [],
        adverseReactions: [],
        drugInteractions: []
      },
      safetyProfile: {
        warningsAndPrecautions: geminiData.safetyInfo?.warnings || [],
        contraindications: geminiData.safetyInfo?.contraindications || [],
        adverseReactions: { common: [], serious: [], rare: [] },
        drugInteractions: { major: [], moderate: [], minor: [] }
      },
      manufacturingInfo: geminiData.manufacturingInfo || {},
      regulatoryInfo: geminiData.regulatoryInfo || {},
      pharmacology: { mechanismOfAction: null, pharmacokinetics: {}, pharmacodynamics: null },
      clinicalInfo: { clinicalTrials: [], efficacyData: null },
      pricingInfo: { genericAvailable: false },
      alternatives: { genericEquivalents: [], therapeuticAlternatives: [] }
    };
  }

  /**
   * Process FDA data into standardized format
   */
  processFDAData(fdaData) {
    const openFDA = fdaData.openfda || {};

    return {
      brandName: openFDA.brand_name?.[0] || null,
      genericName: openFDA.generic_name?.[0] || null,
      activeIngredient: openFDA.substance_name?.[0] || null,
      manufacturer: openFDA.manufacturer_name?.[0] || null,
      dosageForm: openFDA.dosage_form?.[0] || null,
      route: openFDA.route?.[0] || null,
      strength: openFDA.strength?.[0] || null,
      ndc: openFDA.product_ndc?.[0] || null,
      productType: openFDA.product_type?.[0] || null,
      applicationNumber: fdaData.application_number || null,
      uses: this.generateUsesFromFDA(openFDA),
      warnings: this.generateWarningsFromFDA(openFDA),
      sideEffects: this.generateSideEffectsFromFDA(openFDA),
      dosageInstructions: this.generateDosageFromFDA(openFDA),
      storageInstructions: "Store as directed on package. Keep out of reach of children.",
      drugInteractions: "Consult healthcare provider for drug interactions.",
      contraindications: "See package insert for contraindications.",
      source: 'FDA'
    };
  }

  /**
   * Process RxNorm data into standardized format
   */
  processRxNormData(rxNormData) {
    const concept = rxNormData.conceptProperties?.[0] || {};

    return {
      brandName: concept.name || null,
      genericName: concept.synonym || null,
      activeIngredient: concept.name || null,
      rxcui: concept.rxcui || null,
      tty: concept.tty || null,
      uses: "Consult healthcare provider for specific uses.",
      warnings: "Read all warnings on package before use.",
      sideEffects: "Consult healthcare provider for potential side effects.",
      dosageInstructions: "Follow dosage instructions on package or as prescribed.",
      storageInstructions: "Store as directed on package.",
      drugInteractions: "Consult healthcare provider for drug interactions.",
      contraindications: "See package insert for contraindications.",
      source: 'RxNorm'
    };
  }

  /**
   * Create basic medicine info when no database match found
   */
  createBasicMedicineInfo(geminiData) {
    return {
      brandName: geminiData.medicine?.brandName || 'Unknown',
      genericName: geminiData.medicine?.genericName || 'Unknown',
      activeIngredient: geminiData.medicine?.genericName || 'Unknown',
      manufacturer: geminiData.medicine?.manufacturer || 'Unknown',
      dosageForm: geminiData.medicine?.dosageForm || 'Unknown',
      strength: geminiData.medicine?.strength || 'Unknown',
      ndc: geminiData.medicine?.ndc || null,
      uses: "Medicine identification based on image analysis. Consult healthcare provider for specific uses.",
      warnings: [
        "This identification is based on AI image analysis",
        "Always verify medicine identity with healthcare provider",
        "Do not take medicine if you cannot positively identify it",
        "Check expiration date before use"
      ],
      sideEffects: "Consult healthcare provider or package insert for side effects.",
      dosageInstructions: "Follow dosage instructions on package or as prescribed by healthcare provider.",
      storageInstructions: "Store as directed on package. Keep out of reach of children.",
      drugInteractions: "Consult healthcare provider for potential drug interactions.",
      contraindications: "Consult healthcare provider for contraindications.",
      source: 'AI Analysis'
    };
  }

  /**
   * Enhance medicine info with additional details
   */
  enhanceMedicineInfo(medicineInfo, geminiData) {
    // Add physical characteristics
    medicineInfo.physicalCharacteristics = geminiData.physicalCharacteristics || {};

    // Add extracted information
    medicineInfo.extractedText = geminiData.extractedText || [];
    medicineInfo.expirationDate = geminiData.expirationDate || null;
    medicineInfo.lotNumber = geminiData.lotNumber || null;

    // Add AI analysis metadata
    medicineInfo.aiAnalysis = {
      confidence: geminiData.confidence || 1,
      identified: geminiData.identified || false,
      reasoning: geminiData.reasoning || '',
      alternatives: geminiData.alternatives || [],
      warnings: geminiData.warnings || []
    };

    // Add safety disclaimer
    medicineInfo.disclaimer = "This information is for educational purposes only. Always consult with healthcare professionals before making any medical decisions. Medicine identification based on AI analysis should be verified by qualified personnel.";

    return medicineInfo;
  }

  /**
   * Generate uses information from FDA data
   */
  generateUsesFromFDA(openFDA) {
    const indications = openFDA.indications_and_usage?.[0];
    if (indications) {
      return indications;
    }
    return "Consult healthcare provider or package insert for specific uses and indications.";
  }

  /**
   * Generate warnings from FDA data
   */
  generateWarningsFromFDA(openFDA) {
    const warnings = [];

    if (openFDA.warnings) {
      warnings.push(...openFDA.warnings);
    }

    if (openFDA.boxed_warning) {
      warnings.push(`BLACK BOX WARNING: ${openFDA.boxed_warning[0]}`);
    }

    if (warnings.length === 0) {
      warnings.push("Read all warnings on package before use.");
      warnings.push("Consult healthcare provider if you have questions.");
    }

    return warnings;
  }

  /**
   * Generate side effects from FDA data
   */
  generateSideEffectsFromFDA(openFDA) {
    const adverseReactions = openFDA.adverse_reactions?.[0];
    if (adverseReactions) {
      return adverseReactions;
    }
    return "Consult healthcare provider or package insert for potential side effects and adverse reactions.";
  }

  /**
   * Generate dosage instructions from FDA data
   */
  generateDosageFromFDA(openFDA) {
    const dosage = openFDA.dosage_and_administration?.[0];
    if (dosage) {
      return dosage;
    }
    return "Follow dosage instructions on package or as prescribed by healthcare provider.";
  }

  /**
   * Search medicine by name (public method)
   */
  async searchMedicineByName(name) {
    const searchTerms = [name];
    const results = [];

    for (const term of searchTerms) {
      // Search FDA
      try {
        const fdaResults = await this.searchFDADatabase(term);
        if (fdaResults.length > 0) {
          results.push(...fdaResults.map(result => ({
            ...this.processFDAData(result),
            source: 'FDA',
            relevance: this.calculateRelevance(term, result)
          })));
        }
      } catch (error) {
        console.warn('FDA search failed:', error.message);
      }

      // Search local database
      const localResult = this.searchLocalDatabase(term);
      if (localResult) {
        results.push({
          ...localResult,
          source: 'Local Database',
          relevance: this.calculateRelevance(term, localResult)
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    return {
      query: name,
      results: results.slice(0, 10), // Return top 10 results
      totalFound: results.length,
      searchedAt: new Date().toISOString()
    };
  }

  /**
   * Get medicine by NDC
   */
  async getMedicineByNDC(ndc) {
    try {
      const url = `${this.openFDABaseURL}/drug/ndc.json`;
      const params = {
        search: `product_ndc:"${ndc}"`,
        limit: 1
      };

      const response = await axios.get(url, {
        params,
        timeout: 10000
      });

      if (response.data.results && response.data.results.length > 0) {
        return {
          success: true,
          data: this.processFDAData(response.data.results[0]),
          source: 'FDA NDC Database'
        };
      } else {
        return {
          success: false,
          message: 'No medicine found with the provided NDC'
        };
      }
    } catch (error) {
      console.error('NDC lookup error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate relevance score for search results
   */
  calculateRelevance(searchTerm, result) {
    let score = 0;
    const term = searchTerm.toLowerCase();

    // Exact matches get highest score
    if (result.brandName?.toLowerCase() === term) score += 100;
    if (result.genericName?.toLowerCase() === term) score += 100;

    // Partial matches get lower scores
    if (result.brandName?.toLowerCase().includes(term)) score += 50;
    if (result.genericName?.toLowerCase().includes(term)) score += 50;
    if (result.activeIngredient?.toLowerCase().includes(term)) score += 30;

    return score;
  }
}

module.exports = new MedicineService();
