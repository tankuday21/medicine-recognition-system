import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ArrowLeftIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  BeakerIcon,
  CubeIcon,
  DocumentTextIcon,
  HeartIcon,
  ShareIcon,
  BookmarkIcon,
  PlusIcon,
  ChevronDownIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ArchiveBoxIcon,
  SparklesIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  GlobeAltIcon,
  CheckIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  NoSymbolIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { BackButton } from '../components/ui/PremiumComponents';

// Available languages for medicine info
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

const MedicineResult = () => {
  const { t: globalT } = useLanguage();
  // Helper to render bold text in AI responses
  const renderBoldText = (text) => {
    if (!text) return null;
    
    // Split by markdown bold syntax **
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-blue-600 dark:text-blue-400">{part.slice(2, -2)}</strong>;
      }
      
      // Highlight specific medical keywords
      const keywords = ['Warning:', 'Caution:', 'Note:', 'Tip:', 'Important:'];
      let content = part;
      keywords.forEach(kw => {
        if (content.includes(kw)) {
          content = content.replace(kw, `<span class="font-bold text-red-500">${kw}</span>`);
        }
      });

      if (content !== part) {
        return <span key={i} dangerouslySetInnerHTML={{ __html: content }} />;
      }

      return part;
    });
  };

  const location = useLocation();
  const navigate = useNavigate();
  const { scanResult } = location.state || {};
  const [expandedSections, setExpandedSections] = useState({
    uses: true,
    ingredients: false,
    dosage: true,
    warnings: true,
    storage: false,
    alternatives: false,
    sideEffects: false,
    drugInteractions: false,
    howToTake: true,
    pregnancySafety: false,
    ageRestrictions: false,
    priceInfo: false,
    foodAlcohol: false
  });
  const [saved, setSaved] = useState(false);

  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [translatedInfo, setTranslatedInfo] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Proactive initialization for medicine chat
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isInitializingChat, setIsInitializingChat] = useState(false);

  useEffect(() => {
    const initializeChatProactively = async () => {
      if (!scanResult?.medicineInfo && !scanResult?.pillInfo) return;
      if (activeConversationId || isInitializingChat) return;

      const token = localStorage.getItem('token');
      if (!token) return; // Only for logged-in users

      setIsInitializingChat(true);
      try {
        const medicineContext = getMedicineContext();
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const baseUrl = apiUrl.replace(/\/api\/?$/, '');

        const response = await fetch(`${baseUrl}/api/chat/initialize-medicine-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ medicineContext: scanResult.pillInfo || scanResult.medicineInfo })
        });

        const data = await response.json();
        if (data.success && data.conversationId) {
          setActiveConversationId(data.conversationId);
          
          // Only add initial message if user hasn't started chatting yet
          if (data.initialMessage) {
            setChatMessages(prev => {
              if (prev.length === 0) {
                return [{ role: 'assistant', content: data.initialMessage }];
              }
              return prev;
            });
          }
          console.log('✅ Proactive chat initialization successful');
        }
      } catch (err) {
        console.warn('Proactive chat initialization failed:', err);
      } finally {
        setIsInitializingChat(false);
      }
    };

    initializeChatProactively();
  }, [scanResult]);

  // Focus input when chat opens
  useEffect(() => {
    if (showChat) {
      if (inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 300);
      }
      // Lock background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      // Restore background scrolling
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showChat]);

  // UI Labels for translation

  // Translate medicine info when language changes
  const translateMedicineInfo = async (langCode) => {
    if (langCode === 'en' || !scanResult?.medicineInfo) {
      setTranslatedInfo(null);
      return;
    }

    setIsTranslating(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const baseUrl = apiUrl.replace(/\/api\/?$/, '');

      const langName = LANGUAGES.find(l => l.code === langCode)?.name || langCode;
      const info = scanResult.medicineInfo;

      const response = await fetch(`${baseUrl}/api/chat/medicine-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          message: `Translate ALL of the following to ${langName}. Return ONLY valid JSON, no other text:
{
  "labels": {
    "scanResult": "Scan Result",
    "medicineIdentified": "Medicine Identified",
    "identificationUncertain": "Identification Uncertain",
    "verifyPharmacist": "Please verify with a pharmacist before use",
    "commonUses": "Common Uses",
    "activeIngredients": "Active Ingredients",
    "dosageInfo": "Dosage Information",
    "strength": "Strength",
    "form": "Form",
    "quantity": "Quantity",
    "safetyWarnings": "Safety Warnings",
    "productDetails": "Product Details",
    "manufacturer": "Manufacturer",
    "expiry": "Expiry",
    "storage": "Storage",
    "possibleAlternatives": "Possible Alternatives",
    "importantNotice": "Important Notice",
    "disclaimer": "This is an AI-assisted identification tool. Always verify with a licensed pharmacist or healthcare provider before taking any medication.",
    "scanAgain": "Scan Again",
    "addReminder": "Add Reminder",
    "askAI": "Ask AI",
    "askAbout": "Ask about",
    "aiPowered": "AI-powered answers",
    "askAnything": "Ask me anything about this medicine",
    "askQuestion": "Ask a question...",
    "sideEffects": "What are the side effects?",
    "withFood": "Can I take this with food?",
    "missedDose": "What if I miss a dose?",
    "pregnancy": "Is it safe during pregnancy?",
    "translating": "Translating",
    "sideEffectsTitle": "Side Effects",
    "commonSideEffects": "Common",
    "seriousSideEffects": "Serious - Seek Help",
    "drugInteractions": "Drug Interactions",
    "howToTake": "How to Take",
    "withFoodLabel": "With Food",
    "timeOfDay": "Best Time",
    "instructions": "Instructions",
    "pregnancySafety": "Pregnancy & Breastfeeding",
    "pregnancyCategory": "Pregnancy",
    "breastfeeding": "Breastfeeding",
    "ageRestrictions": "Age Restrictions",
    "pediatric": "Children",
    "elderly": "Elderly",
    "priceInfo": "Price Information",
    "mrp": "MRP",
    "priceRange": "Price Range",
    "prescriptionRequired": "Prescription Required",
    "otc": "Over the Counter (OTC)",
    "foodAlcoholInteractions": "Food & Alcohol",
    "foodsToAvoid": "Foods to Avoid",
    "alcohol": "Alcohol"
  },
  "uses": ${JSON.stringify(info.commonUses || info.uses || [])},
  "warnings": "${(info.safetyWarning || '').replace(/"/g, '\\"')}",
  "storageText": "${(info.storageInstructions || '').replace(/"/g, '\\"')}"
}`,
          medicineContext: `Translate everything to ${langName}. Return only JSON.`
        })
      });

      const data = await response.json();
      if (data.success && data.response) {
        try {
          const jsonMatch = data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const translated = JSON.parse(jsonMatch[0]);
            setTranslatedInfo(translated);
          }
        } catch (e) {
          console.error('JSON parse error:', e);
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Get translated label or fallback to global translation
  const t = (key) => {
    if (translatedInfo?.labels?.[key]) return translatedInfo.labels[key];
    return globalT(`medicineResult.${key}`) || key;
  };

  // Handle language change
  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    setShowLanguageMenu(false);
    translateMedicineInfo(langCode);
  };

  // Get current language
  const getCurrentLanguage = () => LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

  // Get medicine context for AI
  const getMedicineContext = () => {
    if (!scanResult?.medicineInfo) return '';
    const info = scanResult.medicineInfo;
    const name = info.medicineName?.primaryName || info.medicineName?.brandName || info.name || 'Unknown';
    const generic = info.medicineName?.genericName || '';
    const type = info.medicineType || 'medicine';
    const uses = info.commonUses || info.uses || [];
    const ingredients = info.activeIngredients || [];
    const dosage = info.dosageInformation || {};
    const warnings = info.safetyWarning || '';
    const storage = info.storageInstructions || '';
    const manufacturer = info.manufacturerInfo || '';
    const route = info.administrationRoute || '';

    return `Medicine: ${name}${generic ? ` (${generic})` : ''}
Type: ${type}
${dosage.strength ? `Strength: ${dosage.strength}` : ''}
${route ? `Administration: ${route}` : ''}
${uses.length ? `Uses: ${uses.join(', ')}` : ''}
${ingredients.length ? `Ingredients: ${ingredients.join(', ')}` : ''}
${warnings ? `Warnings: ${warnings}` : ''}
${storage ? `Storage: ${storage}` : ''}
${manufacturer ? `Manufacturer: ${manufacturer}` : ''}`;
  };

  // Send message to AI
  const sendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const medicineContext = getMedicineContext();

      // Check if we have medicine context
      if (!medicineContext || medicineContext.trim() === '') {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I don\'t have enough information about this medicine to answer your question.'
        }]);
        setIsTyping(false);
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      // Remove trailing /api if present to avoid duplication
      const baseUrl = apiUrl.replace(/\/api\/?$/, '');

      // Get language name for AI response
      const langName = getCurrentLanguage().name;
      const langInstruction = selectedLanguage !== 'en' ? ` Please respond in ${langName}.` : '';

      const response = await fetch(`${baseUrl}/api/chat/medicine-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          message: userMessage + langInstruction,
          medicineContext: medicineContext,
          language: selectedLanguage,
          conversationId: activeConversationId // Use the pre-initialized ID
        })
      });

      const data = await response.json();
      console.log('Medicine query response:', data);

      if (data.success && data.response) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        // Update conversation ID if it was newly created by the server
        if (data.data?.conversationId && !activeConversationId) {
          setActiveConversationId(data.data.conversationId);
        }
      } else {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || 'Sorry, I couldn\'t process your question. Please try again.'
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please check your connection and try again.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!scanResult) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-gray-200 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
          <CubeIcon className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('medicineResult.noScanResult', 'No Scan Result')}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">{t('medicineResult.scanToSeeInfo', 'Scan a medicine to see detailed information')}</p>
        <button onClick={() => navigate('/scanner')} className="px-6 py-3 bg-blue-500 text-white rounded-2xl font-medium">
          {t('medicineResult.goToScanner', 'Go to Scanner')}
        </button>
      </div>
    );
  }

  if (!scanResult.pillInfo && !scanResult.medicineInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">{t('medicineResult.analyzingMedicine', 'Analyzing medicine...')}</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{t('medicineResult.mayTakeSeconds', 'This may take a few seconds')}</p>
      </div>
    );
  }

  const { pillInfo, medicineInfo, confidence, imageData } = scanResult;
  // Use pillInfo if medicineInfo is not available (backend sends pillInfo)
  const info = medicineInfo || pillInfo || {};
  const isIdentified = info?.identified;
  const rawConfidence = confidence || info?.confidence || 0;
  const confidenceScore = rawConfidence > 10 ? rawConfidence : rawConfidence * 10;

  const medicineName = info?.medicineName || info?.name || {};
  const primaryName = medicineName?.primaryName || medicineName?.brandName || info?.name || 'Unknown Medicine';
  const genericName = medicineName?.genericName;
  const medicineType = info?.medicineType || 'medicine';
  const physical = info?.physicalCharacteristics || {};
  const dosage = info?.dosageInformation || {};
  const uses = info?.commonUses || info?.uses || [];
  const ingredients = info?.activeIngredients || [];
  const warnings = info?.safetyWarning;
  const storage = info?.storageInstructions;
  const manufacturer = info?.manufacturerInfo;
  const expiry = info?.expiryInfo;
  const route = info?.administrationRoute;
  const possibleMatches = info?.possibleMatches || [];
  const verificationNeeded = info?.verificationNeeded;

  // New fields
  const sideEffects = info?.sideEffects || {};
  const drugInteractions = info?.drugInteractions || [];
  const howToTake = info?.howToTake || {};
  const pregnancySafety = info?.pregnancySafety || {};
  const ageRestrictions = info?.ageRestrictions || {};
  const prescriptionRequired = info?.prescriptionRequired;
  const priceInfo = info?.priceInfo || {};
  const foodAlcoholInteractions = info?.foodAlcoholInteractions || {};

  // Helper function to safely get color class based on safety text
  const getSafetyColor = (text) => {
    if (!text || typeof text !== 'string') return 'text-amber-600 dark:text-amber-400';
    const lower = text.toLowerCase();
    if (lower.includes('safe')) return 'text-emerald-600 dark:text-emerald-400';
    if (lower.includes('avoid')) return 'text-red-600 dark:text-red-400';
    return 'text-amber-600 dark:text-amber-400';
  };

  // Helper to safely display text
  const safeText = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getConfidenceBg = (score) => {
    if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-950/30';
    if (score >= 50) return 'bg-amber-50 dark:bg-amber-950/30';
    return 'bg-red-50 dark:bg-red-950/30';
  };

  const Section = ({ title, icon: Icon, iconColor, expanded, onToggle, children, badge }) => {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
        <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 active:bg-gray-50 dark:active:bg-slate-800 transition-colors">
          <div className={`w-10 h-10 ${iconColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="flex-1 text-left font-semibold text-gray-900 dark:text-white">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">{badge}</span>
          )}
          <div className="transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          </div>
        </button>
        <div style={{ display: 'grid', gridTemplateRows: expanded ? '1fr' : '0fr', transition: 'grid-template-rows 250ms ease-in-out' }}>
          <div style={{ overflow: 'hidden' }}>
            <div className="px-4 pb-4">{children}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 pb-24">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 sticky top-0 z-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <BackButton onClick={() => navigate('/scanner')} />
          <h1 className="font-semibold text-gray-900 dark:text-white">{t('scanResult')}</h1>
          <div className="flex items-center gap-1">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <GlobeAltIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              {showLanguageMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowLanguageMenu(false)} />
                  <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-40 py-2 max-h-80 overflow-y-auto border border-gray-100 dark:border-slate-700">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 ${selectedLanguage === lang.code ? 'bg-blue-50 dark:bg-blue-950/50' : ''
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span className="text-sm text-gray-900 dark:text-white">{lang.nativeName}</span>
                        </div>
                        {selectedLanguage === lang.code && <CheckIcon className="w-4 h-4 text-blue-500" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setSaved(!saved)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800">
              {saved ? <BookmarkSolid className="w-5 h-5 text-blue-500" /> : <BookmarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
            </button>
          </div>
        </div>
        {/* Translation indicator */}
        {isTranslating && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 text-sm text-blue-500">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>{t('translating')} {getCurrentLanguage().nativeName}...</span>
            </div>
          </div>
        )}
      </div>

      {/* Medicine Hero Card */}
      <div className="px-4 -mt-1">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm">
          <div className="flex gap-4 mb-4">
            {imageData && (
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 flex-shrink-0">
                <img src={imageData} alt="Scanned medicine" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{medicineType}</p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{primaryName}</h2>
              {genericName && genericName !== primaryName && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{genericName}</p>
              )}
              {dosage?.strength && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <BeakerIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{dosage.strength}</span>
                </div>
              )}
            </div>
          </div>

          {/* Confidence Score */}
          <div className={`${getConfidenceBg(confidenceScore)} rounded-2xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isIdentified ? <CheckCircleSolid className={`w-5 h-5 ${getConfidenceColor(confidenceScore)}`} /> : <ExclamationCircleIcon className="w-5 h-5 text-amber-500" />}
                <span className="font-medium text-gray-900 dark:text-white">{isIdentified ? t('medicineIdentified') : t('identificationUncertain')}</span>
              </div>
              <span className={`text-2xl font-bold ${getConfidenceColor(confidenceScore)}`}>{Math.round(confidenceScore)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${confidenceScore}%` }} transition={{ duration: 0.5, delay: 0.2 }}
                className={`h-full rounded-full ${confidenceScore >= 80 ? 'bg-emerald-500' : confidenceScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
            </div>
            {verificationNeeded && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-3.5 h-3.5" />{t('verifyPharmacist')}
              </p>
            )}
          </div>

          {/* Quick Info Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {physical?.form && <span className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">{physical.form}</span>}
            {physical?.color && <span className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">{physical.color}</span>}
            {physical?.shape && <span className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">{physical.shape}</span>}
            {route && <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-full text-xs font-medium text-blue-600 dark:text-blue-400 capitalize">{route}</span>}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-4 mt-4 space-y-3">
        {/* Display translated uses or original */}
        {(translatedInfo?.uses || uses).length > 0 && (
          <Section title={t('commonUses')} icon={HeartIcon} iconColor="bg-rose-50 dark:bg-rose-950/30 text-rose-500" expanded={expandedSections.uses} onToggle={() => toggleSection('uses')} badge={`${(translatedInfo?.uses || uses).length}`}>
            <div className="space-y-2">
              {(translatedInfo?.uses || uses).map((use, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <CheckCircleSolid className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{use}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {ingredients.length > 0 && (
          <Section title={t('activeIngredients')} icon={BeakerIcon} iconColor="bg-violet-50 dark:bg-violet-950/30 text-violet-500" expanded={expandedSections.ingredients} onToggle={() => toggleSection('ingredients')} badge={`${ingredients.length}`}>
            <div className="space-y-2">
              {ingredients.map((ingredient, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-2 h-2 bg-violet-500 rounded-full" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{ingredient}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {(dosage?.strength || dosage?.form || dosage?.quantity) && (
          <Section title={t('dosageInfo')} icon={DocumentTextIcon} iconColor="bg-blue-50 dark:bg-blue-950/30 text-blue-500" expanded={expandedSections.dosage} onToggle={() => toggleSection('dosage')}>
            <div className="grid grid-cols-2 gap-3">
              {dosage.strength && <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('strength')}</p><p className="font-semibold text-gray-900 dark:text-white">{dosage.strength}</p></div>}
              {dosage.form && <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('form')}</p><p className="font-semibold text-gray-900 dark:text-white">{dosage.form}</p></div>}
              {dosage.quantity && <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl col-span-2"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('quantity')}</p><p className="font-semibold text-gray-900 dark:text-white">{dosage.quantity}</p></div>}
            </div>
          </Section>
        )}

        {(warnings || translatedInfo?.warnings) && (
          <Section title={t('safetyWarnings')} icon={ShieldExclamationIcon} iconColor="bg-red-50 dark:bg-red-950/30 text-red-500" expanded={expandedSections.warnings} onToggle={() => toggleSection('warnings')}>
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
              <p className="text-sm text-red-700 dark:text-red-300">{translatedInfo?.warnings || warnings}</p>
            </div>
          </Section>
        )}

        {/* Side Effects Section */}
        {(sideEffects?.common?.length > 0 || sideEffects?.serious?.length > 0) && (
          <Section title={t('sideEffectsTitle')} icon={ExclamationCircleIcon} iconColor="bg-orange-50 dark:bg-orange-950/30 text-orange-500" expanded={expandedSections.sideEffects} onToggle={() => toggleSection('sideEffects')}>
            <div className="space-y-3">
              {sideEffects?.common?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{t('commonSideEffects')}</p>
                  <div className="flex flex-wrap gap-2">
                    {sideEffects.common.map((effect, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">{effect}</span>
                    ))}
                  </div>
                </div>
              )}
              {sideEffects?.serious?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-500 dark:text-red-400 mb-2">{t('seriousSideEffects')}</p>
                  <div className="flex flex-wrap gap-2">
                    {sideEffects.serious.map((effect, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs rounded-full">{effect}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* How to Take Section */}
        {(howToTake?.withFood || howToTake?.timeOfDay || howToTake?.instructions) && (
          <Section title={t('howToTake')} icon={ClockIcon} iconColor="bg-teal-50 dark:bg-teal-950/30 text-teal-500" expanded={expandedSections.howToTake} onToggle={() => toggleSection('howToTake')}>
            <div className="grid grid-cols-2 gap-3">
              {howToTake.withFood && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('withFoodLabel')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{howToTake.withFood}</p>
                </div>
              )}
              {howToTake.timeOfDay && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('timeOfDay')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{howToTake.timeOfDay}</p>
                </div>
              )}
              {howToTake.instructions && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('instructions')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{howToTake.instructions}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Drug Interactions Section */}
        {drugInteractions?.length > 0 && (
          <Section title={t('drugInteractions')} icon={BoltIcon} iconColor="bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600" expanded={expandedSections.drugInteractions} onToggle={() => toggleSection('drugInteractions')} badge={`${drugInteractions.length}`}>
            <div className="space-y-2">
              {drugInteractions.map((interaction, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                  <NoSymbolIcon className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">{interaction}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Pregnancy & Breastfeeding Section */}
        {(pregnancySafety?.category || pregnancySafety?.breastfeeding) && (
          <Section title={t('pregnancySafety')} icon={HeartIcon} iconColor="bg-pink-50 dark:bg-pink-950/30 text-pink-500" expanded={expandedSections.pregnancySafety} onToggle={() => toggleSection('pregnancySafety')}>
            <div className="grid grid-cols-2 gap-3">
              {pregnancySafety.category && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('pregnancyCategory')}</p>
                  <p className={`text-sm font-medium ${getSafetyColor(pregnancySafety.category)}`}>{safeText(pregnancySafety.category)}</p>
                </div>
              )}
              {pregnancySafety.breastfeeding && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('breastfeeding')}</p>
                  <p className={`text-sm font-medium ${getSafetyColor(pregnancySafety.breastfeeding)}`}>{safeText(pregnancySafety.breastfeeding)}</p>
                </div>
              )}
              {pregnancySafety.details && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl col-span-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{pregnancySafety.details}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Age Restrictions Section */}
        {(ageRestrictions?.pediatric || ageRestrictions?.elderly) && (
          <Section title={t('ageRestrictions')} icon={UserGroupIcon} iconColor="bg-cyan-50 dark:bg-cyan-950/30 text-cyan-500" expanded={expandedSections.ageRestrictions} onToggle={() => toggleSection('ageRestrictions')}>
            <div className="grid grid-cols-2 gap-3">
              {ageRestrictions.pediatric && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('pediatric')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{ageRestrictions.pediatric}</p>
                </div>
              )}
              {ageRestrictions.elderly && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('elderly')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{ageRestrictions.elderly}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Food & Alcohol Interactions Section */}
        {(foodAlcoholInteractions?.food?.length > 0 || foodAlcoholInteractions?.alcohol) && (
          <Section title={t('foodAlcoholInteractions')} icon={NoSymbolIcon} iconColor="bg-purple-50 dark:bg-purple-950/30 text-purple-500" expanded={expandedSections.foodAlcohol} onToggle={() => toggleSection('foodAlcohol')}>
            <div className="space-y-3">
              {foodAlcoholInteractions?.food?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{t('foodsToAvoid')}</p>
                  <div className="flex flex-wrap gap-2">
                    {foodAlcoholInteractions.food.map((food, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">{safeText(food)}</span>
                    ))}
                  </div>
                </div>
              )}
              {foodAlcoholInteractions.alcohol && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('alcohol')}</p>
                  <p className={`text-sm font-medium ${getSafetyColor(foodAlcoholInteractions.alcohol)}`}>{safeText(foodAlcoholInteractions.alcohol)}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Price Information Section */}
        {(priceInfo?.mrp || priceInfo?.priceRange) && (
          <Section title={t('priceInfo')} icon={CurrencyRupeeIcon} iconColor="bg-green-50 dark:bg-green-950/30 text-green-500" expanded={expandedSections.priceInfo} onToggle={() => toggleSection('priceInfo')}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900/30">
                <div>
                  {priceInfo.mrp && (
                    <div className="mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t('mrp')}: </span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">{priceInfo.mrp}</span>
                    </div>
                  )}
                  {priceInfo.priceRange && (
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t('priceRange')}: </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{priceInfo.priceRange}</span>
                    </div>
                  )}
                </div>
                <CurrencyRupeeIcon className="w-8 h-8 text-green-500 opacity-50" />
              </div>
              {priceInfo.note && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">{priceInfo.note}</p>
              )}
              {/* Prescription Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${prescriptionRequired ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'}`}>
                <DocumentTextIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{prescriptionRequired ? t('prescriptionRequired') : t('otc')}</span>
              </div>
            </div>
          </Section>
        )}

        {(storage || manufacturer || expiry) && (
          <Section title={t('productDetails')} icon={ArchiveBoxIcon} iconColor="bg-amber-50 dark:bg-amber-950/30 text-amber-500" expanded={expandedSections.storage} onToggle={() => toggleSection('storage')}>
            <div className="space-y-3">
              {manufacturer && <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl"><BuildingOffice2Icon className="w-5 h-5 text-gray-400 flex-shrink-0" /><div><p className="text-xs text-gray-500 dark:text-gray-400">{t('manufacturer')}</p><p className="text-sm font-medium text-gray-900 dark:text-white">{manufacturer}</p></div></div>}
              {expiry && <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl"><CalendarDaysIcon className="w-5 h-5 text-gray-400 flex-shrink-0" /><div><p className="text-xs text-gray-500 dark:text-gray-400">{t('expiry')}</p><p className="text-sm font-medium text-gray-900 dark:text-white">{expiry}</p></div></div>}
              {(storage || translatedInfo?.storageText) && <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl"><ArchiveBoxIcon className="w-5 h-5 text-gray-400 flex-shrink-0" /><div><p className="text-xs text-gray-500 dark:text-gray-400">{t('storage')}</p><p className="text-sm font-medium text-gray-900 dark:text-white">{translatedInfo?.storageText || storage}</p></div></div>}
            </div>
          </Section>
        )}

        {possibleMatches.length > 0 && (
          <Section title={t('possibleAlternatives')} icon={SparklesIcon} iconColor="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500" expanded={expandedSections.alternatives} onToggle={() => toggleSection('alternatives')} badge={`${possibleMatches.length}`}>
            <div className="space-y-3">
              {possibleMatches.map((match, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{match.name}</p>
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-full">{match.matchConfidence}/10</span>
                  </div>
                  {match.strength && <p className="text-sm text-gray-600 dark:text-gray-400"><span className="text-gray-500">Strength:</span> {match.strength}</p>}
                  {match.manufacturer && <p className="text-sm text-gray-600 dark:text-gray-400"><span className="text-gray-500">By:</span> {match.manufacturer}</p>}
                  {match.reason && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{match.reason}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Disclaimer */}
        <div className="bg-gray-200 dark:bg-slate-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('importantNotice')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t('disclaimer')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-4 pb-8">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/scanner')}
            className="py-4 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-2xl font-bold border-2 border-gray-100 dark:border-slate-700 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors"
          >
            <CameraIcon className="w-5 h-5" />
            {t('scanAgain')}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/reminders')}
            className="py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            {t('addReminder')}
          </motion.button>
        </div>
      </div>

      {/* Floating Ask AI Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-4 flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 z-30"
        style={{ bottom: 'calc(24px + env(safe-area-inset-bottom))' }}
      >
        <SparklesIcon className="w-5 h-5" />
        <span className="font-medium">{t('askAI')}</span>
      </motion.button>

      {/* Chat Modal - Full Screen */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 pt-[calc(1rem+env(safe-area-inset-top))]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{t('askAbout')} {primaryName}</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('aiPowered')}</p>
              </div>
            </div>
            <button onClick={() => setShowChat(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800">
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{t('askAnything')}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[t('sideEffects'), t('withFood'), t('missedDose'), t('pregnancy')].map((q, i) => (
                      <button key={i} onClick={() => setChatInput(q)} className="px-3 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] p-4 rounded-2xl shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-tl-none border border-gray-100 dark:border-slate-750'
                      }`}>
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center">
                              <SparklesIcon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400">Mediot AI</span>
                          </div>
                        )}
                        <div className="text-sm leading-relaxed space-y-2">
                          {msg.content.split('\n').map((line, lineIdx) => {
                            const trimmedLine = line.trim();
                            if (!trimmedLine) return <div key={lineIdx} className="h-2" />;
                            
                            // Handle bullet points
                            if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                              return (
                                <div key={lineIdx} className="flex gap-2 pl-1">
                                  <span className="text-blue-400 mt-1.5">•</span>
                                  <span>{renderBoldText(trimmedLine.substring(2))}</span>
                                </div>
                              );
                            }
                            
                            // Handle numbered lists
                            const numberedMatch = trimmedLine.match(/^(\d+\.)\s+(.*)/);
                            if (numberedMatch) {
                              return (
                                <div key={lineIdx} className="flex gap-2 pl-1">
                                  <span className="text-blue-400 font-bold">{numberedMatch[1]}</span>
                                  <span>{renderBoldText(numberedMatch[2])}</span>
                                </div>
                              );
                            }

                            return <p key={lineIdx}>{renderBoldText(line)}</p>;
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-750 shadow-sm">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {/* Quick Questions */}
            {chatMessages.length > 0 && (
              <div className="px-4 pb-2">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[t('sideEffects'), t('withFood'), t('missedDose'), t('pregnancy')].map((q, i) => (
                    <button key={i} onClick={() => setChatInput(q)} className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-full text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={t('askQuestion')}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={sendMessage} disabled={!chatInput.trim() || isTyping} className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center disabled:opacity-50">
                  <PaperAirplaneIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MedicineResult;
