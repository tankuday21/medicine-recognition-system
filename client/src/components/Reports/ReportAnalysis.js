import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  LightBulbIcon,
  InformationCircleIcon,
  HeartIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
  GlobeAltIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import {
  GlassCard,
  StatCard,
  SectionHeader,
  StatusBadge,
  ProgressBar,
  AnimatedList,
  AnimatedListItem,
  EmptyState,
  LoadingSkeleton
} from '../ui/PremiumComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import ReportChat, { ReportChatFAB } from './ReportChat';
import { useLayout } from '../../contexts/LayoutContext';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मરાઠી', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

const UI_LABELS = {
  dashboard: 'Dashboard',
  info: 'Info',
  advice: 'Advice',
  reportStatus: 'Report Status',
  aiSummary: 'Mediot AI Summary',
  attentionRequired: 'Attention Required',
  metricDetails: 'Metric Details',
  parameter: 'Parameter',
  result: 'Result',
  statusLabel: 'Status',
  vitals: 'Vital Signs',
  medications: 'Detected Medications',
  confused: 'Confused?',
  confusedDesc: 'Ask Mediot AI to explain these results in simple terms.',
  startChat: 'Start AI Chat',
  patientInfo: 'Patient Info',
  name: 'Name',
  genderAge: 'Gender / Age',
  providerInfo: 'Provider Info',
  laboratory: 'Laboratory',
  flags: 'Flags',
  refRange: 'Ref Range',
  goBack: 'Go Back',
  analysisFailed: 'Analysis Failed',
  analysisUnavailable: 'Analysis Unavailable',
  download: 'Download PDF',
  share: 'Share',
  clinicalContext: 'Clinical Context',
  healthScore: 'Health Status'
};

const ReportAnalysis = ({ report, onBack }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { setHideBottomNav } = useLayout();

  // Translation state
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [translatedInfo, setTranslatedInfo] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // ── Helper to get label ───────────────────────────────────────────────
  const t = (key) => {
    if (translatedInfo?.labels?.[key]) return translatedInfo.labels[key];
    return UI_LABELS[key] || key;
  };

  // ── Hide Bottom Nav on Mount (Top Level) ──────────────────────────────
  useEffect(() => {
    setHideBottomNav(true);
    return () => setHideBottomNav(false);
  }, [setHideBottomNav]);

  // ── AI Translation Logic ──────────────────────────────────────────────
  const translateReportInfo = async (langCode) => {
    if (langCode === 'en' || !report.healthMetrics) {
      setTranslatedInfo(null);
      return;
    }

    setIsTranslating(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const baseUrl = apiUrl.replace(/\/api\/?$/, '');
      const langName = LANGUAGES.find(l => l.code === langCode)?.name || langCode;

      const { healthMetrics } = report;
      
      const payload = {
        labels: UI_LABELS,
        summary: healthMetrics.detailedAnalysis?.summary || healthMetrics.clinicalNotes?.[0] || '',
        abnormalFlags: Array.isArray(healthMetrics.abnormalFlags) ? healthMetrics.abnormalFlags.map(f => ({
          name: f.displayName || f.name,
          interpretation: f.interpretation
        })) : [],
        recommendations: Array.isArray(healthMetrics.recommendations) ? healthMetrics.recommendations.map(r => ({
          title: r.title,
          description: r.description
        })) : (Array.isArray(healthMetrics.detailedAnalysis?.recommendations) ? healthMetrics.detailedAnalysis.recommendations.map(r => ({
          title: r.title,
          description: r.description
        })) : []),
        vitals: Array.isArray(healthMetrics.detailedAnalysis?.vitals) ? healthMetrics.detailedAnalysis.vitals.map(v => v.name || v.parameter) : [],
        metrics: Array.isArray(healthMetrics.metrics) ? healthMetrics.metrics.map(m => ({
          name: m.displayName || m.name,
          interpretation: m.interpretation || ''
        })) : []
      };

      const response = await fetch(`${baseUrl}/api/chat/medicine-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          message: `Translate EVERYTHING in this object to ${langName}, including every label and medical term. Return ONLY valid JSON: ${JSON.stringify(payload)}`,
          medicineContext: `Act as a professional medical translator. Output format must match input exactly. Translate all keys in the 'labels' object values.`,
          language: langCode
        })
      });

      const data = await response.json();
      if (data.success && data.response) {
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          setTranslatedInfo(JSON.parse(jsonMatch[0]));
        }
      }
    } catch (error) {
      console.error('Report translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    // Sync body class with selected language for conditional styling
    document.body.classList.remove('lang-en', 'lang-hi', 'lang-gu', 'lang-mr', 'lang-ta', 'lang-te', 'lang-bn', 'lang-kn', 'lang-pa');
    document.body.classList.add(`lang-${selectedLanguage}`);
  }, [selectedLanguage]);

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    setShowLanguageMenu(false);
    translateReportInfo(langCode);
  };

  const getCurrentLanguage = () => LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'moderate': return 'warning';
      default: return 'success';
    }
  };

  const getOverallStatusType = (status) => {
    switch (status) {
      case 'critical': return 'error';
      case 'attention_needed': return 'warning';
      case 'minor_concerns': return 'info';
      case 'normal': return 'success';
      default: return 'neutral';
    }
  };

  const getOverallStatusText = (status) => {
    switch (status) {
      case 'critical': return 'Critical Attention Needed';
      case 'attention_needed': return 'Attention Suggested';
      case 'minor_concerns': return 'Minor Concerns';
      case 'normal': return 'Normal Results';
      default: return 'Processing Clinical Insights...';
    }
  };

  const formatValue = (value, unit) => `${value} ${unit}`;
  const formatRange = (range) => `${range.min} - ${range.max}`;

  // ── Processing Step Labels ───────────────────────────────────────────
  const getStepLabel = (step) => {
    const steps = {
      'extracting_text': 'Reading report text...',
      'basic_analysis': 'Identifying patient & hospital...',
      'detailed_analysis': 'Analyzing clinical metrics...',
      'finalizing': 'Finalizing results...',
      'completed': 'Analysis complete'
    };
    return steps[step] || 'Analyzing...';
  };

  if (report.processingStatus === 'failed') {
    return (
      <GlassCard className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('analysisFailed')}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-2">We encountered an error analyzing this report.</p>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg inline-block mb-6 max-w-lg">
          <code className="text-xs text-red-700 dark:text-red-300 font-mono">{report.errorMessage || 'Unknown Error'}</code>
        </div>
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('goBack')}
          </button>
        </div>
      </GlassCard>
    );
  }

  // Only show full-page loader if we have NO data at all
  if (report.processingStatus === 'processing' && !report.healthMetrics) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping" />
          <div className="absolute inset-2 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <SparklesIcon className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">
          Initializing Analysis
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 text-sm leading-relaxed">
          Mediot AI is preparing your report for clinical extraction. This will only take a moment.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              {getStepLabel(report.processingStep)}
            </span>
          </div>
          
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
          >
            {t('goBack')}
          </button>
        </div>
      </GlassCard>
    );
  }

  const healthMetrics = report.healthMetrics || {};

  // ── Action Handlers ───────────────────────────────────────────────────
  const handleDownload = () => {
    // Simulated PDF download
    const win = window.open('', '_blank');
    win.document.write(`<h1>Medical Report: ${report.fileName}</h1><p>Processed by Mediot AI</p>`);
    win.document.close();
    win.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Medical Report: ${report.fileName}`,
        text: `Check out my medical report analysis on Mediot. Status: ${getOverallStatusText(healthMetrics?.summary?.overallStatus)}`,
        url: window.location.href
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 relative">
      {/* Portal is removed to place language selector next to filename */}

      {/* Header & Overall Status - Mobile Optimized */}
      <GlassCard className="!p-4 sm:!p-6 relative z-[100] border-none bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-950">
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
        
        <div className="flex flex-col gap-4 relative z-10">
          {report.processingStatus === 'processing' && (
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <SparklesIcon className="w-3 h-3 animate-pulse" />
                  {getStepLabel(report.processingStep)}
                </span>
                <span className="text-[10px] font-bold text-gray-400">{report.processingProgress || 0}%</span>
              </div>
              <ProgressBar progress={report.processingProgress || 0} color="blue" size="sm" animated />
            </div>
          )}

          <div className="flex items-center justify-between gap-3 sm:gap-4 relative z-20">
            {/* Left Section: Navigation & Identity */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={onBack}
                className="p-2 flex-shrink-0 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700 active:scale-95 transition-transform"
              >
                <ArrowLeftIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
              
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate leading-tight">
                  {report.fileName}
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <ClockIcon className="w-3 h-3" />
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Right Section: Tools & Status Indicator */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Integrated Language Selector */}
              <div className="relative z-50">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all shadow-sm ${
                    showLanguageMenu ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-100 dark:border-slate-700'
                  }`}
                >
                  <GlobeAltIcon className="w-4 h-4 sm:w-5 h-5" />
                </button>
                    <AnimatePresence>
                      {showLanguageMenu && (
                        <>
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[999] bg-transparent pointer-events-auto" 
                            onClick={() => setShowLanguageMenu(false)} 
                          />
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 5 }}
                            className="absolute right-0 top-11 sm:top-12 w-48 sm:w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl z-[1000] py-1.5 max-h-[70vh] overflow-y-auto border border-gray-100 dark:border-slate-700 pointer-events-auto"
                          >
                            <div className="px-4 py-1.5 border-b border-gray-50 dark:border-slate-700 mb-1">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Language</span>
                            </div>
                            <div className="space-y-0.5 px-1">
                              {LANGUAGES.map((lang) => (
                                <button
                                  key={lang.code}
                                  onClick={() => handleLanguageChange(lang.code)}
                                  className={`w-full px-3 py-2.5 text-left flex items-center justify-between rounded-xl transition-all ${
                                    selectedLanguage === lang.code ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-base">{lang.flag}</span>
                                    <span className="text-[13px] font-bold">{lang.nativeName}</span>
                                  </div>
                                  {selectedLanguage === lang.code && <CheckIcon className="w-4 h-4" />}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
              </div>

              {/* Status Badge */}
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                healthMetrics?.summary?.overallStatus === 'critical' ? 'bg-red-500 shadow-red-500/20' : 
                healthMetrics?.summary?.overallStatus === 'attention_needed' ? 'bg-orange-500 shadow-orange-500/20' : 
                healthMetrics?.summary?.overallStatus === 'normal' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-blue-500 shadow-blue-500/20 animate-pulse'
              }`}>
                {healthMetrics?.summary?.overallStatus === 'critical' ? (
                  <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : (healthMetrics?.summary?.overallStatus === 'unknown' || !healthMetrics?.summary) ? (
                  <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Translation Loading Indicator */}
          {isTranslating && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800"
            >
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">Translating to {getCurrentLanguage().name}...</span>
            </motion.div>
          )}

          <div className="flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50 p-2 px-3 rounded-xl border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                healthMetrics?.summary?.overallStatus === 'critical' ? 'bg-red-500' : 
                healthMetrics?.summary?.overallStatus === 'attention_needed' ? 'bg-orange-500' : 'bg-emerald-500'
              }`} />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{t('reportStatus')}</span>
            </div>
            <span className={`text-[10px] sm:text-xs font-black uppercase ${
              healthMetrics?.summary?.overallStatus === 'critical' ? 'text-red-500' : 
              healthMetrics?.summary?.overallStatus === 'attention_needed' ? 'text-orange-500' : 'text-emerald-500'
            }`}>
              {getOverallStatusText(healthMetrics?.summary?.overallStatus)}
            </span>
          </div>

        {/* Navigation Tabs - Modern Segmented Control */}
        <div className="flex p-1 bg-gray-100/50 dark:bg-slate-800/50 rounded-xl mt-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', name: t('dashboard'), icon: ChartBarIcon },
            { id: 'details', name: t('info'), icon: UserIcon },
            { id: 'recommendations', name: t('advice'), icon: LightBulbIcon }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                px-3 py-2.5 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all duration-200 text-xs sm:text-sm font-bold flex-1 justify-center
                ${activeSection === section.id
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              <section.icon className="h-4 w-4" />
              <span>{section.name}</span>
            </button>
          ))}
        </div>
      </div>
      </GlassCard>

      {/* Main Analysis View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          className="relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeSection === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Summary & Abnormalities (Primary Focus) */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Visual Health Gauge & AI Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <GlassCard className="md:col-span-1 !p-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-gray-50 to-white dark:from-slate-800/50 dark:to-slate-900">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4">{t('healthScore')}</h4>
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90 transform">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-slate-800" />
                        <motion.circle 
                          initial={{ strokeDasharray: "0 251" }}
                          animate={{ strokeDasharray: `${healthMetrics.summary?.overallStatus === 'normal' ? '200' : healthMetrics.summary?.overallStatus === 'minor_concerns' ? '150' : '80'} 251` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="transparent" 
                          className={
                            healthMetrics.summary?.overallStatus === 'normal' ? 'text-emerald-500' : 
                            healthMetrics.summary?.overallStatus === 'minor_concerns' ? 'text-blue-500' : 
                            healthMetrics.summary?.overallStatus === 'attention_needed' ? 'text-orange-500' : 'text-red-500'
                          } 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-gray-900 dark:text-white">
                          {healthMetrics.summary?.overallStatus === 'normal' ? '92%' : healthMetrics.summary?.overallStatus === 'minor_concerns' ? '78%' : '45%'}
                        </span>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="md:col-span-3 !p-4 sm:!p-6 border-l-4 border-l-blue-500 h-full">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 text-blue-600 dark:text-blue-400">
                      <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <h3 className="font-bold uppercase tracking-widest text-[10px]">{t('aiSummary')}</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm font-medium">
                      {translatedInfo?.summary || healthMetrics.detailedAnalysis?.summary || healthMetrics.clinicalNotes?.[0] || "Your report analysis is ready."}
                    </p>
                  </GlassCard>
                </div>

                {/* Abnormal Findings - Critical Feed */}
                {healthMetrics.abnormalFlags?.length > 0 && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                        <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        {t('attentionRequired')}
                      </h3>
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[9px] font-black uppercase">
                        {healthMetrics.abnormalFlags.length} {t('flags')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {healthMetrics.abnormalFlags.map((flag, index) => {
                        const tFlag = translatedInfo?.abnormalFlags?.[index];
                        return (
                          <motion.div 
                            key={index} 
                            whileHover={{ y: -2 }}
                            className="bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight truncate max-w-[120px]">
                                {tFlag?.name || flag.displayName || flag.name}
                              </span>
                              <StatusBadge status={getSeverityColor(flag.severity)} text={flag.severity} size="xs" />
                            </div>
                            <div className="text-lg sm:text-2xl font-black text-red-600 dark:text-red-400 mb-1">
                              {flag.value} <span className="text-xs font-normal text-gray-400">{flag.unit}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 italic line-clamp-1">
                              {tFlag?.interpretation || flag.interpretation || `${t('refRange')}: ${flag.normalRange?.min}-${flag.normalRange?.max}`}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All Metrics Grid */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white px-1 flex items-center gap-2 text-sm sm:text-base">
                    <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    {t('metricDetails')}
                  </h3>
                  <GlassCard className="!p-0 overflow-hidden border-none shadow-sm">
                    <div className="overflow-x-auto scrollbar-thin">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 sm:py-4">{t('parameter')}</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-center">{t('result')}</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4">{t('statusLabel')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                          {!healthMetrics.metrics || healthMetrics.metrics.length === 0 ? (
                            Array(5).fill(0).map((_, i) => (
                              <tr key={i}>
                                <td className="px-4 sm:px-6 py-4"><LoadingSkeleton className="h-4 w-32" /></td>
                                <td className="px-4 sm:px-6 py-4"><LoadingSkeleton className="h-4 w-12 mx-auto" /></td>
                                <td className="px-4 sm:px-6 py-4"><LoadingSkeleton className="h-4 w-16" /></td>
                              </tr>
                            ))
                          ) : (
                            healthMetrics.metrics.map((metric, idx) => (
                              <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
                                    {translatedInfo?.metrics?.[idx]?.name || metric.displayName || metric.name}
                                  </p>
                                  <p className="text-[9px] text-gray-400">{t('refRange')}: {metric.normalRange?.min}-{metric.normalRange?.max}</p>
                                </td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                                  <span className={`text-xs sm:text-sm font-black ${metric.isNormal ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {metric.value}
                                  </span>
                                </td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                  <StatusBadge status={metric.isNormal ? 'success' : 'error'} text={metric.isNormal ? 'OK' : 'Low/High'} size="xs" />
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                </div>
              </div>

              {/* Right Column: Vitals, Medications, Context */}
              <div className="space-y-6">
                {/* Vitals Quick-View */}
                {healthMetrics.detailedAnalysis?.vitals?.length > 0 && (
                  <GlassCard className="!p-4 sm:!p-5 bg-gradient-to-br from-red-50 to-white dark:from-red-950/10 dark:to-slate-900">
                    <div className="flex items-center gap-2 mb-4 text-red-500">
                      <HeartIcon className="w-5 h-5" />
                      <h3 className="font-bold uppercase tracking-widest text-[10px]">{t('vitals')}</h3>
                    </div>
                    <div className="space-y-3">
                      {healthMetrics.detailedAnalysis.vitals.map((vital, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-red-100/50 dark:border-red-900/30">
                          <span className="text-xs font-bold text-gray-500">{translatedInfo?.vitals?.[idx] || vital.name || vital.parameter}</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{vital.value} {vital.unit}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Medications List */}
                {healthMetrics.detailedAnalysis?.medications?.length > 0 && (
                  <GlassCard className="!p-4 sm:!p-5 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/10 dark:to-slate-900">
                    <div className="flex items-center gap-2 mb-4 text-emerald-500">
                      <CheckCircleIcon className="w-5 h-5" />
                      <h3 className="font-bold uppercase tracking-widest text-[10px]">{t('medications')}</h3>
                    </div>
                    <div className="space-y-2">
                      {healthMetrics.detailedAnalysis.medications.map((med, idx) => (
                        <div key={idx} className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{med.name || med}</p>
                          {med.dosage && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{med.dosage} • {med.frequency}</p>}
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Chat CTA - Integrated into feed */}
                <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                  <SparklesIcon className="w-12 h-12 text-white/20 absolute -right-2 -bottom-2 group-hover:scale-125 transition-transform" />
                  <h4 className="font-bold text-lg mb-1">{t('confused')}</h4>
                  <p className="text-blue-100 text-xs mb-4">{t('confusedDesc')}</p>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all"
                  >
                    {t('startChat')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="!p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-500" />
                  {t('patientInfo')}
                </h3>
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{t('name')}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{healthMetrics.patientInfo?.name || 'Not Specified'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{t('genderAge')}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{healthMetrics.patientInfo?.gender || 'Not Specified'} / {healthMetrics.patientInfo?.age || 'Not Specified'}</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="!p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BuildingOfficeIcon className="w-5 h-5 text-purple-500" />
                  {t('providerInfo')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{t('laboratory')}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{healthMetrics.providerInfo?.labName || 'Not Specified'}</p>
                  </div>
                  {healthMetrics.providerInfo?.address && (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Address</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{healthMetrics.providerInfo.address}</p>
                    </div>
                  )}
                </div>
              </GlassCard>
              
              <GlassCard className="md:col-span-2 !p-6 bg-blue-50/30 dark:bg-blue-900/10 border-blue-100/50 dark:border-blue-800/50">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                  {t('clinicalContext')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Technician</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Mediot Verified Lab Agent</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Methodology</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">AI-Enhanced Spectrum Analysis</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Verification</p>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-tight">System Certified</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {activeSection === 'recommendations' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(!healthMetrics.recommendations || healthMetrics.recommendations.length === 0) && report.processingStatus === 'processing' ? (
                Array(4).fill(0).map((_, i) => (
                  <GlassCard key={i} className="!p-6 h-full">
                    <LoadingSkeleton className="h-10 w-10 rounded-xl mb-4" />
                    <LoadingSkeleton className="h-6 w-3/4 mb-2" />
                    <LoadingSkeleton className="h-4 w-full" />
                  </GlassCard>
                ))
              ) : (
                (healthMetrics.recommendations || healthMetrics.detailedAnalysis?.recommendations || [])?.map((rec, i) => {
                  const tRec = translatedInfo?.recommendations?.[i];
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <GlassCard className="!p-6 h-full border-b-4 border-b-amber-500">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                          <LightBulbIcon className="w-7 h-7 text-amber-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">{tRec?.title || rec.title}</h4>
                        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{tRec?.description || rec.description}</p>
                      </GlassCard>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* AI Chat Components */}
      <ReportChatFAB
        onClick={() => setIsChatOpen(true)}
        hasReport={!!report.healthMetrics}
      />
      <ReportChat
        report={report}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

ReportAnalysis.propTypes = {
  report: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired
};

export default ReportAnalysis;