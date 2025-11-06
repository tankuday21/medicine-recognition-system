import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { integrationManager } from './utils/integrationManager';
import performanceMonitor from './utils/performanceMonitor';
import NavigationSystem from './components/ui/NavigationSystem';
import BottomNavigation from './components/ui/BottomNavigation';

import OnboardingSystem from './components/onboarding/OnboardingSystem';
import { OfflineStatusBanner } from './components/offline/OfflineIndicator';

// PWA Components
import InstallPrompt from './components/PWA/InstallPrompt';
import UpdatePrompt from './components/PWA/UpdatePrompt';
import OfflineIndicator from './components/PWA/OfflineIndicator';

import './App.css';
import './styles/globals.css';

// Import components directly for now to avoid lazy loading issues
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import MedicineResult from './pages/MedicineResult';
import BarcodeResult from './pages/BarcodeResult';
import QRResult from './pages/QRResult';
import DocumentResult from './pages/DocumentResult';
import Chat from './pages/Chat';
import Reminders from './pages/Reminders';
import Reports from './pages/Reports';
import Symptoms from './pages/Symptoms';
import SOS from './pages/SOS';
import PriceLookup from './pages/PriceLookup';
import News from './pages/News';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import IntegrationTest from './components/test/IntegrationTest';

function App() {
  const [isIntegrationReady, setIsIntegrationReady] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState(null);

  useEffect(() => {
    initializePremiumUI();
  }, []);

  const initializePremiumUI = async () => {
    try {
      // Initialize integration manager
      await integrationManager.init();
      
      // Migrate user data
      const userMigration = await integrationManager.migrateUserData();
      console.log('User data migration:', userMigration);
      
      // Check if onboarding is needed
      const hasSeenOnboarding = localStorage.getItem('premium_ui_onboarding_completed');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
      
      // Get integration status
      const status = integrationManager.getIntegrationHealth();
      setIntegrationStatus(status);
      
      // Mark integration as ready
      setIsIntegrationReady(true);
      
      // Track initialization
      console.log('Premium UI initialization completed', {
        integrationReady: true,
        userDataMigrated: userMigration.success,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Premium UI initialization failed:', error);
      setIsIntegrationReady(true); // Continue with fallback
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('premium_ui_onboarding_completed', 'true');
  };



  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 medical-theme">

          {/* PWA Components */}
          <InstallPrompt />
          <UpdatePrompt />
          <OfflineIndicator />

          {/* Offline Status Banner */}
          <OfflineStatusBanner />
          
          {/* Navigation System */}
          <NavigationSystem 
            title="MedIoT"
            subtitle="Digital Health Companion"
            headerVariant="medical"
            drawerVariant="medical"
            showHeader={true}
            navigationItems={[
              {
                id: 'home',
                label: 'Home',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                )
              },
              {
                id: 'dashboard',
                label: 'Dashboard',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                )
              },
              {
                id: 'scanner',
                label: 'Scanner',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )
              },
              {
                id: 'chat',
                label: 'AI Assistant',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                )
              },
              {
                id: 'reminders',
                label: 'Reminders',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                id: 'symptoms',
                label: 'Symptoms',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )
              },
              {
                id: 'reports',
                label: 'Reports',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
              {
                id: 'sos',
                label: 'Emergency SOS',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )
              },
              {
                id: 'price-lookup',
                label: 'Price Lookup',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                id: 'news',
                label: 'Health News',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                )
              },
              {
                id: 'profile',
                label: 'Profile',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )
              }
            ]}
            onItemClick={(itemId) => {
              console.log('Navigation item clicked:', itemId);
              // Navigate to the route
              window.location.href = `/${itemId === 'home' ? '' : itemId}`;
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/medicine-result" element={<MedicineResult />} />
              <Route path="/pill-result" element={<MedicineResult />} /> {/* Legacy route */}
              <Route path="/barcode-result" element={<BarcodeResult />} />
              <Route path="/qr-result" element={<QRResult />} />
              <Route path="/document-result" element={<DocumentResult />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/reminders" element={
                <ProtectedRoute>
                  <Reminders />
                </ProtectedRoute>
              } />
              <Route path="/symptoms" element={<Symptoms />} />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/sos" element={<SOS />} />
              <Route path="/price-lookup" element={<PriceLookup />} />
              <Route path="/news" element={<News />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              {/* Integration Test Route (Development Only) */}
              {process.env.NODE_ENV === 'development' && (
                <Route path="/integration-test" element={
                  <div className="container mx-auto px-4 py-8">
                    <IntegrationTest />
                  </div>
                } />
              )}
            </Routes>
          </NavigationSystem>
          
          {/* Bottom Navigation for Mobile */}
          <BottomNavigation variant="medical" />
          
          {/* Onboarding System */}
          {showOnboarding && (
            <OnboardingSystem
              isOpen={showOnboarding}
              onComplete={handleOnboardingComplete}
              variant="premium"
            />
          )}
          

          
          {/* Integration Status Indicator */}
          {integrationStatus && integrationStatus.overall !== 'healthy' && (
            <div className="fixed top-4 right-4 z-40">
              <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                integrationStatus.overall === 'warning' 
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                Integration Status: {integrationStatus.overall}
              </div>
            </div>
          )}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;