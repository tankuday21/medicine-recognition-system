import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { integrationManager } from './utils/integrationManager';

// Layout
import MobileAppLayout from './components/Layout/MobileAppLayout';

// PWA Components
import InstallPrompt from './components/PWA/InstallPrompt';
import UpdatePrompt from './components/PWA/UpdatePrompt';

// Onboarding
import OnboardingSystem from './components/onboarding/OnboardingSystem';

import './App.css';
import './styles/globals.css';

// Pages
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
import ReportDetail from './pages/ReportDetail';
import Symptoms from './pages/Symptoms';
import SOS from './pages/SOS';
import PriceLookup from './pages/PriceLookup';
import News from './pages/News';
import NewsAI from './pages/NewsAI';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import MedicalInfo from './pages/MedicalInfo';
import EmergencyContacts from './pages/EmergencyContacts';
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/Common/ScrollToTop';

import SplashScreen from './components/Common/SplashScreen';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if we've shown splash in this session
    const hasSeenSplash = sessionStorage.getItem('mediot_splash_seen');
    if (hasSeenSplash) {
      setShowSplash(false);
    } else {
      sessionStorage.setItem('mediot_splash_seen', 'true');
    }
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await integrationManager.init();
      await integrationManager.migrateUserData();

      // Check if onboarding is needed
      const hasSeenOnboarding = localStorage.getItem('mediot_onboarding_completed');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('App initialization failed:', error);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('mediot_onboarding_completed', 'true');
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (

    <LanguageProvider>
      <AuthProvider>
        <LayoutProvider>
          <Router>
            <ScrollToTop />
            {/* PWA Install & Update Prompts */}
            <InstallPrompt />
            <UpdatePrompt />

            {/* Main App OR Onboarding */}
            {showOnboarding ? (
              <OnboardingSystem
                isOpen={showOnboarding}
                onComplete={handleOnboardingComplete}
                variant="premium"
              />
            ) : (
              <MobileAppLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                  } />
                  <Route path="/scanner" element={<Scanner />} />
                  <Route path="/medicine-result" element={<MedicineResult />} />
                  <Route path="/pill-result" element={<MedicineResult />} />
                  <Route path="/barcode-result" element={<BarcodeResult />} />
                  <Route path="/qr-result" element={<QRResult />} />
                  <Route path="/document-result" element={<DocumentResult />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/reminders" element={
                    <ProtectedRoute><Reminders /></ProtectedRoute>
                  } />
                  <Route path="/symptoms" element={<Symptoms />} />
                  <Route path="/reports" element={
                    <ProtectedRoute><Reports /></ProtectedRoute>
                  } />
                  <Route path="/reports/:id" element={
                    <ProtectedRoute><ReportDetail /></ProtectedRoute>
                  } />
                  <Route path="/sos" element={<SOS />} />
                  <Route path="/price-lookup" element={<PriceLookup />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news-ai" element={<NewsAI />} />
                  <Route path="/profile" element={
                    <ProtectedRoute allowGuest={true}><Profile /></ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute allowGuest={true}><Settings /></ProtectedRoute>
                  } />
                  <Route path="/medical-info" element={
                    <ProtectedRoute allowGuest={true}><MedicalInfo /></ProtectedRoute>
                  } />
                  <Route path="/emergency-contacts" element={
                    <ProtectedRoute allowGuest={true}><EmergencyContacts /></ProtectedRoute>
                  } />
                  <Route path="/help" element={<Help />} />
                  <Route path="/privacy" element={<Privacy />} />
                </Routes>
              </MobileAppLayout>
            )}
          </Router>
        </LayoutProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;