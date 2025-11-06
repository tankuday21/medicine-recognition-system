import React, { useState } from 'react';
import Header from './components/Header';
import MultiImageUpload from './components/MultiImageUpload';
import ComprehensiveResults from './components/ComprehensiveResults';

import MedicineVerification from './components/MedicineVerification';
import EssentialMedicineInfo from './components/EssentialMedicineInfo';
import LoadingAnimation from './components/LoadingAnimation';
import ErrorMessage from './components/ErrorMessage';
import {
  verifyMultiMedicineName,
  getComprehensiveMedicineDetails,
  getReadMoreDetails
} from './services/api';

type AppPhase = 'upload' | 'verification' | 'essential' | 'comprehensive';

function App() {
  // Phase management
  const [currentPhase, setCurrentPhase] = useState<AppPhase>('upload');

  // Loading states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingEssential, setIsLoadingEssential] = useState(false);
  const [isLoadingReadMore, setIsLoadingReadMore] = useState(false);

  // Data states
  const [verificationData, setVerificationData] = useState<any>(null);
  const [essentialData, setEssentialData] = useState<any>(null);
  const [comprehensiveData, setComprehensiveData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Image tracking
  const [currentImages, setCurrentImages] = useState<File[]>([]);
  const [currentImagePaths, setCurrentImagePaths] = useState<string[]>([]);

  // Smart verification handler for multiple images
  const handleImagesUpload = async (files: File[]) => {
    setIsVerifying(true);
    setError(null);
    setCurrentPhase('verification');
    setCurrentImages(files);

    try {
      console.log(`🔍 Phase 1: Starting medicine name verification with ${files.length} images...`);
      const result = await verifyMultiMedicineName(files);

      if (result.success && result.data) {
        setVerificationData(result.data);
        setCurrentImagePaths(result.imagePaths || files.map(f => f.name));
        console.log('✅ Multi-image verification completed successfully');
      } else {
        setError(result.message || 'Failed to verify medicine name');
        console.error('❌ Verification failed:', result.message);
        setCurrentPhase('upload');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('❌ Verification error:', err);
      setCurrentPhase('upload');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerificationConfirm = async (confirmedName: string) => {
    setIsLoadingEssential(true);
    setError(null);
    setCurrentPhase('essential');

    try {
      console.log(`📋 Phase 2: Getting essential info for: ${confirmedName}`);
      const result = await getComprehensiveMedicineDetails(currentImagePaths, confirmedName, false);

      if (result.success && result.data) {
        setEssentialData(result.data);
        console.log('✅ Essential information loaded successfully');
      } else {
        setError(result.message || 'Failed to get essential medicine information');
        console.error('❌ Essential info failed:', result.message);
        setCurrentPhase('verification');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('❌ Essential info error:', err);
      setCurrentPhase('verification');
    } finally {
      setIsLoadingEssential(false);
    }
  };

  const handleVerificationReject = () => {
    setCurrentPhase('upload');
    setVerificationData(null);
    setError(null);
  };

  const handleReadMore = async () => {
    if (!essentialData || !currentImagePaths.length) return;

    setIsLoadingReadMore(true);
    setError(null);

    try {
      console.log('📚 Getting comprehensive "Read More" details...');
      const verifiedName = essentialData.essentialInfo.identification.verifiedName;
      const result = await getReadMoreDetails(currentImagePaths, verifiedName);

      if (result.success && result.data) {
        setComprehensiveData(result.data);
        setCurrentPhase('comprehensive');
        console.log('✅ Comprehensive details loaded successfully');
      } else {
        setError(result.message || 'Failed to get comprehensive details');
        console.error('❌ Read More failed:', result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('❌ Read More error:', err);
    } finally {
      setIsLoadingReadMore(false);
    }
  };

  const handleReset = () => {
    setCurrentPhase('upload');
    setVerificationData(null);
    setEssentialData(null);
    setComprehensiveData(null);
    setError(null);
    setCurrentImages([]);
    setCurrentImagePaths([]);
    setIsVerifying(false);
    setIsLoadingEssential(false);
    setIsLoadingReadMore(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-blue-50 mobile-safe-area">
      <Header />

      <main className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8 mobile-safe-area">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10 md:space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4 sm:space-y-6">
            <h1 className="text-mobile-h1 px-2">
              Medicine Recognition System
            </h1>
            <p className="text-mobile-body text-gray-600 max-w-2xl mx-auto px-2">
              Upload a photo of any medicine and get comprehensive information including
              ingredients, dosage, side effects, and safety warnings.
            </p>

            {/* Important Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-mobile mx-2 sm:mx-0 mb-4 sm:mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-medium text-yellow-800 text-left">
                    Important Medical Disclaimer
                  </h3>
                  <div className="mt-2 text-xs sm:text-sm text-yellow-700 text-left">
                    <p>
                      This tool is for informational purposes only. Always consult with healthcare
                      professionals before making any medical decisions. Do not rely solely on AI
                      identification for medicine verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Main Content */}
          <div className="space-y-8">
            {/* Upload Phase */}
            {currentPhase === 'upload' && (
              <MultiImageUpload onImagesUpload={handleImagesUpload} />
            )}

            {/* Verification Phase */}
            {currentPhase === 'verification' && isVerifying && (
              <LoadingAnimation
                message="Verifying medicine name..."
                type="verification"
              />
            )}

            {currentPhase === 'verification' && verificationData && !isVerifying && (
              <MedicineVerification
                verificationData={verificationData.verification}
                onConfirm={handleVerificationConfirm}
                onReject={handleVerificationReject}
                isLoading={isLoadingEssential}
              />
            )}

            {/* Essential Info Phase */}
            {currentPhase === 'essential' && isLoadingEssential && (
              <LoadingAnimation
                message="Loading essential medicine information..."
                type="general"
              />
            )}

            {currentPhase === 'essential' && essentialData && !isLoadingEssential && (
              <EssentialMedicineInfo
                essentialData={essentialData.essentialInfo}
                onReadMore={handleReadMore}
                isLoadingReadMore={isLoadingReadMore}
                onReset={handleReset}
              />
            )}

            {/* Comprehensive Phase */}
            {currentPhase === 'comprehensive' && isLoadingReadMore && (
              <LoadingAnimation
                message="Loading comprehensive medicine details..."
                type="comprehensive"
              />
            )}

            {currentPhase === 'comprehensive' && comprehensiveData && !isLoadingReadMore && (
              <ComprehensiveResults
                results={comprehensiveData}
                onReset={handleReset}
              />
            )}



            {/* Error Display */}
            {error && (
              <ErrorMessage
                message={error}
                onRetry={handleReset}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-16 mobile-safe-area-bottom">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
          <div className="text-center text-gray-600 space-y-1 sm:space-y-2">
            <p className="text-sm sm:text-base font-medium">
              Medicine Recognition System - Powered by AI
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Always verify medicine information with healthcare professionals
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
