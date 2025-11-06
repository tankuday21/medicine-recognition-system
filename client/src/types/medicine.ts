export interface PhysicalCharacteristics {
  shape?: string;
  color?: string;
  size?: string;
  markings?: string;
  packaging?: string;
}

export interface MedicineInfo {
  brandName?: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  ndc?: string;
  manufacturer?: string;
}

export interface AIAnalysis {
  confidence: number;
  identified: boolean;
  reasoning: string;
  alternatives: string[];
  warnings: string[];
}

export interface DetailedMedicineInfo {
  brandName?: string;
  genericName?: string;
  activeIngredient?: string;
  manufacturer?: string;
  dosageForm?: string;
  route?: string;
  strength?: string;
  ndc?: string;
  productType?: string;
  applicationNumber?: string;
  uses?: string;
  warnings?: string[] | string;
  sideEffects?: string;
  dosageInstructions?: string;
  storageInstructions?: string;
  drugInteractions?: string;
  contraindications?: string;
  source?: string;
  physicalCharacteristics?: PhysicalCharacteristics;
  extractedText?: string[];
  expirationDate?: string;
  lotNumber?: string;
  aiAnalysis?: AIAnalysis;
  disclaimer?: string;
}

export interface BasicInfo {
  identified: boolean;
  confidence: number;
  brandName?: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  manufacturer?: string;
  ndc?: string;
  physicalCharacteristics: PhysicalCharacteristics;
  extractedText: string[];
  expirationDate?: string;
  lotNumber?: string;
}

export interface ComprehensiveIdentification {
  primaryBrandName?: string;
  primaryGenericName?: string;
  brandNames: string[];
  genericNames: string[];
  activeIngredients: string[];
  inactiveIngredients: string[];
  strength?: string;
  dosageForm?: string;
  route?: string;
  ndc?: string;
  manufacturer?: string;
  therapeuticClass?: string;
  physicalCharacteristics: PhysicalCharacteristics;
}

export interface PrescribingInfo {
  indications: string[];
  dosageAndAdministration: {
    general?: string;
    detailed?: string[];
    simplified?: string;
  };
  contraindications: string[];
  warningsAndPrecautions: string[];
  adverseReactions: string[];
  drugInteractions: string[];
  useInSpecificPopulations: any;
  overdosage?: string;
  clinicalPharmacology?: string;
}

export interface SafetyProfile {
  blackBoxWarnings: string[];
  contraindications: string[];
  warningsAndPrecautions: string[];
  adverseReactions: {
    common: string[];
    serious: string[];
    rare: string[];
  };
  drugInteractions: {
    major: string[];
    moderate: string[];
    minor: string[];
  };
  pregnancyAndLactation: {
    pregnancyCategory?: string;
    pregnancyRisk?: string;
    lactationRisk?: string;
  };
  pediatricUse?: string;
  geriatricUse?: string;
  renalImpairment?: string;
  hepaticImpairment?: string;
}

export interface PharmacologyInfo {
  mechanismOfAction?: string;
  pharmacokinetics: {
    absorption?: string;
    distribution?: string;
    metabolism?: string;
    elimination?: string;
    halfLife?: string;
  };
  pharmacodynamics?: string;
  clinicalStudies: any[];
}

export interface ManufacturingInfo {
  manufacturer?: string;
  distributedBy?: string;
  lotNumber?: string;
  expirationDate?: string;
  ndc?: string;
  upc?: string;
  storageConditions?: string;
  shelfLife?: string;
}

export interface RegulatoryInfo {
  fdaApprovalDate?: string;
  applicationNumber?: string;
  applicationType?: string;
  rxStatus?: string;
  controlledSubstance?: string;
  dea?: string;
  orphanDrug: boolean;
  fastTrack: boolean;
  breakthroughTherapy: boolean;
}

export interface ClinicalInfo {
  clinicalTrials: any[];
  efficacyData?: string;
  safetyData?: string;
  postMarketingSurveillance?: string;
}

export interface PricingInfo {
  averageWholesalePrice?: number;
  averageRetailPrice?: number;
  medicarePrice?: number;
  medicaidPrice?: number;
  cashPrice?: number;
  insuranceCoverage?: string;
  genericAvailable: boolean;
  patentExpiration?: string;
}

export interface AlternativesInfo {
  genericEquivalents: any[];
  therapeuticAlternatives: any[];
  brandAlternatives: any[];
  biosimilars: any[];
  overTheCounterAlternatives: any[];
}

export interface ComprehensiveInfo {
  identification: ComprehensiveIdentification;
  prescribingInfo: PrescribingInfo;
  pharmacology: PharmacologyInfo;
  safetyProfile: SafetyProfile;
  manufacturingInfo: ManufacturingInfo;
  regulatoryInfo: RegulatoryInfo;
  clinicalInfo: ClinicalInfo;
  pricingInfo: PricingInfo;
  alternatives: AlternativesInfo;
}

export interface DataQuality {
  completeness: number;
  accuracy: number;
  freshness: string;
  crossReferencedSources: number;
  dataPoints: number;
  totalPossibleDataPoints: number;
}

export interface MedicineAnalysisResult {
  analysis: {
    identified: boolean;
    confidence: number;
    medicine: {
      brandName?: string;
      genericName?: string;
      activeIngredients: string[];
      inactiveIngredients: string[];
      strength?: string;
      dosageForm?: string;
      route?: string;
      ndc?: string;
      manufacturer?: string;
      therapeuticClass?: string;
    };
    manufacturingInfo: {
      lotNumber?: string;
      expirationDate?: string;
      manufacturingDate?: string;
      facilityCode?: string;
      upc?: string;
      serialNumber?: string;
    };
    physicalCharacteristics: PhysicalCharacteristics;
    extractedText: {
      allText: string[];
      drugNames: string[];
      warnings: string[];
      directions: string[];
      ingredients: string[];
      codes: string[];
    };
    prescribingInfo: {
      indication?: string;
      dosage?: string;
      frequency?: string;
      duration?: string;
      specialInstructions?: string;
    };
    safetyInfo: {
      warnings: string[];
      contraindications: string[];
      sideEffects: string[];
      drugInteractions: string[];
      pregnancyCategory?: string;
      storageInstructions?: string;
    };
    regulatoryInfo: {
      fdaApprovalDate?: string;
      rxOnly: boolean;
      controlledSubstance?: string;
      blackBoxWarning?: string;
    };
    reasoning: string;
    alternatives: string[];
    analysisWarnings: string[];
    recommendedVerification: string[];
  };
  medicineInfo: {
    basicInfo: BasicInfo;
    comprehensiveInfo: ComprehensiveInfo;
    dataSources: {
      fdaData?: any;
      rxNormData?: any;
      dailyMedData?: any;
      openFDAAdverseEvents?: any;
      openFDALabeling?: any;
      localData?: any;
      webScrapedData?: any;
    };
    sources: string[];
    dataQuality: DataQuality;
    lastUpdated: string;
    error?: string;
  };
  timestamp: string;
  disclaimer: string;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    filename: string;
    path: string;
    size: number;
    mimetype: string;
    uploadedAt: string;
  };
  message?: string;
  error?: string;
}

export interface AnalysisResponse {
  success: boolean;
  data?: MedicineAnalysisResult;
  error?: string;
  message?: string;
}

export interface SearchResult {
  query: string;
  results: DetailedMedicineInfo[];
  totalFound: number;
  searchedAt: string;
}

export interface NDCLookupResult {
  success: boolean;
  data?: DetailedMedicineInfo;
  source?: string;
  message?: string;
  error?: string;
}
