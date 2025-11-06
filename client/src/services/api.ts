import axios from 'axios';
import { AnalysisResponse, UploadResponse, SearchResult, NDCLookupResult } from '../types/medicine';

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 300 seconds (5 minutes) for comprehensive analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The analysis is taking longer than expected.');
    } else if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Upload an image file to the server
 */
export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Analyze medicine from uploaded image
 */
export const analyzeMedicineFromPath = async (imagePath: string): Promise<AnalysisResponse> => {
  try {
    const response = await api.post('/medicine/analyze', {
      imagePath: imagePath,
    });

    return response.data;
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
};

/**
 * Phase 1: Quick medicine name verification (single image - legacy)
 */
export const verifyMedicineName = async (file: File): Promise<any> => {
  try {
    // Step 1: Upload the image
    console.log('📤 Uploading image for verification...');
    const uploadResult = await uploadImage(file);

    if (!uploadResult.success || !uploadResult.data) {
      throw new Error(uploadResult.message || 'Failed to upload image');
    }

    console.log('✅ Image uploaded successfully');

    // Step 2: Quick name verification
    console.log('🔍 Verifying medicine name...');
    const response = await api.post('/medicine/verify-name', {
      imagePath: uploadResult.data.path,
    });

    // Include the image path in the response for the next phase
    const result = response.data;
    result.imagePath = uploadResult.data.path;

    return result;
  } catch (error) {
    console.error('Medicine name verification error:', error);
    throw error;
  }
};

/**
 * Phase 1: Quick medicine name verification (multiple images)
 */
export const verifyMultiMedicineName = async (files: File[]): Promise<any> => {
  try {
    // Step 1: Upload all images
    console.log(`📤 Uploading ${files.length} images for verification...`);
    const uploadPromises = files.map(file => uploadImage(file));
    const uploadResults = await Promise.all(uploadPromises);

    // Check if all uploads succeeded
    const failedUploads = uploadResults.filter(result => !result.success);
    if (failedUploads.length > 0) {
      throw new Error(`Failed to upload ${failedUploads.length} image(s)`);
    }

    const imagePaths = uploadResults.map(result => result.data!.path);
    console.log('✅ All images uploaded successfully');

    // Step 2: Multi-image verification
    console.log('🔍 Verifying medicine name from multiple images...');
    const response = await api.post('/medicine/verify-multi-name', {
      imagePaths: imagePaths,
    });

    // Include the image paths in the response for the next phase
    const result = response.data;
    result.imagePaths = imagePaths;

    return result;
  } catch (error) {
    console.error('Multi-image medicine name verification error:', error);
    throw error;
  }
};

/**
 * Phase 2: Get comprehensive medicine details after user confirmation
 */
export const getComprehensiveMedicineDetails = async (
  imagePaths: string | string[],
  verifiedMedicineName: string,
  includeReadMore: boolean = false
): Promise<any> => {
  try {
    console.log(`🔬 Getting comprehensive details for: ${verifiedMedicineName}`);

    // Handle both single and multiple image paths for backward compatibility
    const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
    console.log(`📁 Sending ${paths.length} image path(s):`, paths);

    const response = await api.post('/medicine/comprehensive-details', {
      imagePaths: paths,
      verifiedMedicineName: verifiedMedicineName,
      includeReadMore: includeReadMore
    });

    return response.data;
  } catch (error) {
    console.error('Comprehensive medicine details error:', error);
    throw error;
  }
};

/**
 * Complete two-phase medicine analysis workflow
 */
export const analyzeMedicineWithVerification = async (
  file: File,
  onNameVerification?: (verificationData: any) => Promise<boolean>,
  onEssentialInfo?: (essentialData: any) => void
): Promise<any> => {
  try {
    // Phase 1: Quick name verification
    console.log('🔍 Phase 1: Verifying medicine name...');
    const verificationResult = await verifyMedicineName(file);

    if (!verificationResult.success) {
      throw new Error('Failed to verify medicine name');
    }

    // Get user confirmation if callback provided
    let userConfirmed = true;
    if (onNameVerification) {
      userConfirmed = await onNameVerification(verificationResult.data);
    }

    if (!userConfirmed) {
      return {
        success: false,
        phase: 'verification_cancelled',
        message: 'User cancelled verification'
      };
    }

    // Phase 2: Get essential information
    console.log('📋 Phase 2: Getting essential information...');
    const verifiedName = verificationResult.data.verification.medicineName.primaryName ||
                         verificationResult.data.verification.medicineName.brandName ||
                         verificationResult.data.verification.medicineName.genericName;

    // Extract image path from verification result
    const imagePath = verificationResult.data.imagePath || file.name;

    const essentialResult = await getComprehensiveMedicineDetails(
      imagePath,
      verifiedName,
      false // Don't include read more initially
    );

    if (onEssentialInfo) {
      onEssentialInfo(essentialResult.data);
    }

    return essentialResult;
  } catch (error) {
    console.error('Two-phase analysis error:', error);
    throw error;
  }
};

/**
 * Get "Read More" comprehensive details
 */
export const getReadMoreDetails = async (
  imagePaths: string | string[],
  verifiedMedicineName: string
): Promise<any> => {
  try {
    console.log('📚 Getting "Read More" comprehensive details...');
    return await getComprehensiveMedicineDetails(imagePaths, verifiedMedicineName, true);
  } catch (error) {
    console.error('Read More details error:', error);
    throw error;
  }
};

/**
 * Complete medicine analysis workflow: upload + analyze (Legacy method)
 */
export const analyzeMedicine = async (file: File): Promise<AnalysisResponse> => {
  try {
    // Step 1: Upload the image
    console.log('📤 Uploading image...');
    const uploadResult = await uploadImage(file);

    if (!uploadResult.success || !uploadResult.data) {
      throw new Error(uploadResult.message || 'Failed to upload image');
    }

    console.log('✅ Image uploaded successfully');

    // Step 2: Analyze the uploaded image
    console.log('🔍 Analyzing medicine...');
    const analysisResult = await analyzeMedicineFromPath(uploadResult.data.path);

    return analysisResult;
  } catch (error) {
    console.error('Complete analysis error:', error);
    throw error;
  }
};

/**
 * Search for medicine by name
 */
export const searchMedicineByName = async (name: string): Promise<SearchResult> => {
  try {
    const response = await api.get(`/medicine/search/${encodeURIComponent(name)}`);
    return response.data.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

/**
 * Look up medicine by NDC (National Drug Code)
 */
export const lookupMedicineByNDC = async (ndc: string): Promise<NDCLookupResult> => {
  try {
    const response = await api.get(`/medicine/ndc/${encodeURIComponent(ndc)}`);
    return response.data;
  } catch (error) {
    console.error('NDC lookup error:', error);
    throw error;
  }
};

/**
 * Get server health status
 */
export const getHealthStatus = async (): Promise<any> => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

/**
 * Validate file before upload
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)'
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB'
    };
  }

  return { valid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Create a preview URL for uploaded image
 */
export const createImagePreviewURL = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Clean up preview URL to prevent memory leaks
 */
export const revokeImagePreviewURL = (url: string): void => {
  URL.revokeObjectURL(url);
};

export default api;
