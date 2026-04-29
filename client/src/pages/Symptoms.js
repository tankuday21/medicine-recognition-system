import React, { useState } from 'react';
import {
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  UserIcon,
  XMarkIcon,
  HeartIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  PhoneIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/ui/PremiumComponents';
import { useLayout } from '../contexts/LayoutContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import BodyPartSelector from '../components/Symptoms/BodyPartSelector';
import SymptomInput from '../components/Symptoms/SymptomInput';

// ─── CONSTANTS ───
const getCommonSymptoms = (t) => [
  { id: 'headache', name: t('symptoms.headache') },
  { id: 'fever', name: t('symptoms.fever') },
  { id: 'cough', name: t('symptoms.cough') },
  { id: 'sore_throat', name: t('symptoms.soreThroat') },
  { id: 'fatigue', name: t('symptoms.fatigue') },
  { id: 'nausea', name: t('symptoms.nausea') },
  { id: 'dizziness', name: t('symptoms.dizziness') },
  { id: 'back_pain', name: t('symptoms.backPain') },
  { id: 'chest_pain', name: t('symptoms.chestPain') },
  { id: 'shortness_of_breath', name: t('symptoms.shortnessOfBreath') },
  { id: 'runny_nose', name: t('symptoms.runnyNose') },
  { id: 'joint_pain', name: t('symptoms.jointPain') },
];

const getAgeGroups = (t) => [
  { key: 'child', label: t('symptoms.child'), range: '0–12' },
  { key: 'teen', label: t('symptoms.teen'), range: '13–19' },
  { key: 'young_adult', label: t('symptoms.youngAdult'), range: '20–35' },
  { id: 'adult', label: t('symptoms.adult'), range: '36–55' },
  { key: 'senior', label: t('symptoms.senior'), range: '55+' },
];

const getPreConditions = (t) => [
  { key: 'diabetes', label: t('symptoms.diabetes') },
  { key: 'hypertension', label: t('symptoms.hypertension') },
  { key: 'heart_disease', label: t('symptoms.heartDisease') },
  { key: 'asthma', label: t('symptoms.asthma') },
  { key: 'pregnancy', label: t('symptoms.pregnancy') },
  { key: 'allergies', label: t('symptoms.allergies') },
];

// ─── COMPONENT ───
const Symptoms = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [patientProfile, setPatientProfile] = useState({
    ageGroup: '',
    gender: '',
    conditions: [],
    notes: ''
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [expandedCondition, setExpandedCondition] = useState(null);

  // Condition Search States
  const [conditionQuery, setConditionQuery] = useState('');
  const [conditionResults, setConditionResults] = useState([]);
  const [isSearchingConditions, setIsSearchingConditions] = useState(false);

  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { setHideBottomNav } = useLayout();
  const navigate = useNavigate();

  // Load persisted state on mount
  React.useEffect(() => {
    const savedSymptoms = localStorage.getItem('symptom_checker_symptoms');
    const savedProfile = localStorage.getItem('symptom_checker_profile');
    if (savedSymptoms) setSelectedSymptoms(JSON.parse(savedSymptoms));
    if (savedProfile) setPatientProfile(JSON.parse(savedProfile));
  }, []);

  // Persist state on change
  React.useEffect(() => {
    if (selectedSymptoms.length > 0) {
      localStorage.setItem('symptom_checker_symptoms', JSON.stringify(selectedSymptoms));
    }
    localStorage.setItem('symptom_checker_profile', JSON.stringify(patientProfile));
  }, [selectedSymptoms, patientProfile]);

  // Condition Search Effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (conditionQuery.trim().length >= 2) {
        searchConditions();
      } else {
        setConditionResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [conditionQuery]);

  const searchConditions = async () => {
    setIsSearchingConditions(true);
    try {
      const response = await fetch('/api/symptoms/search-conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: conditionQuery })
      });
      const data = await response.json();
      if (data.success) {
        setConditionResults(data.data);
      }
    } catch (err) {
      console.error('Condition search error:', err);
    } finally {
      setIsSearchingConditions(false);
    }
  };

  const steps = [
    { id: 1, label: t('symptoms.step1') },
    { id: 2, label: t('symptoms.step2') },
    { id: 3, label: t('symptoms.step3') },
    { id: 4, label: t('symptoms.step4') },
  ];

  React.useEffect(() => {
    setHideBottomNav(true);
    return () => setHideBottomNav(false);
  }, [setHideBottomNav]);

  // Auto scroll to top on step change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // ─── HANDLERS ───
  const handleSymptomAdd = (symptom) => {
    if (!selectedSymptoms.find(s => s.symptomId === symptom.id)) {
      setSelectedSymptoms(prev => [...prev, {
        symptomId: symptom.id,
        name: symptom.name,
        severity: 'moderate',
        duration: t('symptoms.days1to3'),
        bodyPart: symptom.bodyParts?.[0] || t('symptoms.general')
      }]);
    }
  };

  const handleQuickAdd = (symptom) => {
    if (!selectedSymptoms.find(s => s.symptomId === symptom.id)) {
      setSelectedSymptoms(prev => [...prev, {
        symptomId: symptom.id,
        name: symptom.name,
        severity: 'moderate',
        duration: t('symptoms.days1to3'),
        bodyPart: t('symptoms.general')
      }]);
    }
  };

  const handleSymptomUpdate = (symptomId, updates) => {
    setSelectedSymptoms(prev => prev.map(s => s.symptomId === symptomId ? { ...s, ...updates } : s));
  };

  const handleSymptomRemove = (symptomId) => {
    setSelectedSymptoms(prev => prev.filter(s => s.symptomId !== symptomId));
  };

  const toggleCondition = (key) => {
    setPatientProfile(prev => ({
      ...prev,
      conditions: prev.conditions.includes(key)
        ? prev.conditions.filter(c => c !== key)
        : [...prev.conditions, key]
    }));
  };

  const handleAnalyze = async () => {
    if (!isAuthenticated) { setError(t('symptoms.signInRequired')); return; }
    if (selectedSymptoms.length === 0) { setError(t('symptoms.selectAtLeastOne')); return; }

    setIsAnalyzing(true);
    setError('');
    setCurrentStep(4);

    try {
      const response = await fetch('/api/symptoms/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          age: patientProfile.ageGroup || t('symptoms.notSpecified'),
          gender: patientProfile.gender || t('symptoms.notSpecified'),
          medicalHistory: patientProfile.conditions,
          notes: patientProfile.notes
        })
      });
      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.data);
      } else {
        setError(data.message || t('symptoms.analysisFailed'));
        setCurrentStep(3);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(t('symptoms.failedToAnalyze'));
      setCurrentStep(3);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setSelectedSymptoms([]);
    setPatientProfile({ ageGroup: '', gender: '', conditions: [], notes: '' });
    setAnalysisResult(null);
    setExpandedCondition(null);
    setError('');
    // Clear persistence
    localStorage.removeItem('symptom_checker_symptoms');
    localStorage.removeItem('symptom_checker_profile');
  };

  const handleLoginRedirect = () => {
    // Current state is already saved via useEffect persistence
    navigate('/login', { state: { from: '/symptoms' } });
  };

  const getSeverityStyle = (sev) => {
    if (sev === 'critical' || sev === 'severe') return 'bg-red-50 text-red-600 border border-red-200';
    if (sev === 'moderate') return 'bg-amber-50 text-amber-600 border border-amber-200';
    return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
  };

  // ─── RENDER ───
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* ─── Header ─── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-5 pt-6 pb-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">{t('symptoms.title')}</h1>
              <p className="text-[11px] text-gray-500 font-medium">{t('symptoms.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Step Indicator ─── */}
      <div className="max-w-2xl mx-auto px-5 mt-5">
        <div className="flex items-center gap-1 mb-6 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex-1 text-center py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                currentStep === step.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : currentStep > step.id
                    ? 'text-blue-600'
                    : 'text-gray-400'
              }`}
            >
              {step.label}
            </div>
          ))}
        </div>

        {/* ─── Error Banner ─── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6">
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">{error}</p>
                <button onClick={() => setError('')} className="ml-auto"><XMarkIcon className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════ STEPS ═══════════ */}
        <AnimatePresence mode="wait">

          {/* ─── STEP 1: SELECT SYMPTOMS ─── */}
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">

              {/* Quick Picks */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">{t('symptoms.commonSymptoms')}</h3>
                <div className="flex flex-wrap gap-2">
                  {getCommonSymptoms(t).map(s => {
                    const isSelected = selectedSymptoms.some(sel => sel.symptomId === s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => isSelected ? handleSymptomRemove(s.id) : handleQuickAdd(s)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-600 border-transparent hover:border-gray-200'
                        }`}
                      >
                        {isSelected && <span className="mr-1">✓</span>}
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  {t('symptoms.searchSymptoms')}
                </h3>
                <SymptomInput onSymptomSelect={handleSymptomAdd} />
              </div>

              {/* Body Part Browser */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  {t('symptoms.chooseBodyPart')}
                </h3>
                <BodyPartSelector onSymptomSelect={handleSymptomAdd} />
              </div>

              {/* Selected Symptoms Summary */}
              {selectedSymptoms.length > 0 && (
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('symptoms.selectedSymptoms')} ({selectedSymptoms.length})</h3>
                    <button onClick={() => setSelectedSymptoms([])} className="text-[10px] font-bold text-red-500 uppercase">{t('common.clear')}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map(s => (
                      <div key={s.symptomId} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100">
                        {s.name}
                        <button onClick={() => handleSymptomRemove(s.symptomId)} className="hover:text-red-500">
                          <XMarkIcon className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Continue CTA */}
              <AnimatePresence>
                {selectedSymptoms.length > 0 && (
                  <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="fixed bottom-6 left-4 right-4 z-50 max-w-2xl mx-auto">
                    <div className="bg-gray-900 rounded-2xl p-4 flex items-center justify-between shadow-2xl border border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">{selectedSymptoms.length}</div>
                        <p className="text-xs font-bold text-white">{t('symptoms.selectedSymptoms')}</p>
                      </div>
                      <button onClick={() => setCurrentStep(2)} className="px-6 py-2.5 bg-white text-gray-900 rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-transform">
                        {t('common.next')} →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ─── STEP 2: PATIENT PROFILE ─── */}
          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">

              {/* Age Group */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                  {t('symptoms.ageGroup')}
                  <span className="text-[9px] text-blue-500 font-bold lowercase italic">{t('common.required')}</span>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {getAgeGroups(t).map(ag => (
                    <button
                      key={ag.key || ag.id}
                      onClick={() => setPatientProfile(prev => ({ ...prev, ageGroup: ag.key || ag.id }))}
                      className={`p-3 rounded-2xl text-center transition-all border-2 ${
                        (patientProfile.ageGroup === ag.key || patientProfile.ageGroup === ag.id)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-transparent bg-gray-50 text-gray-600'
                      }`}
                    >
                      <div className="text-sm font-black">{ag.label}</div>
                      <div className="text-[10px] font-bold text-gray-400 mt-0.5">{ag.range}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                  {t('symptoms.gender')}
                  <span className="text-[9px] text-blue-500 font-bold lowercase italic">{t('common.required')}</span>
                </h3>
                <div className="flex gap-2">
                  {['male', 'female', 'other'].map(g => (
                    <button
                      key={g}
                      onClick={() => setPatientProfile(prev => ({ ...prev, gender: g }))}
                      className={`flex-1 py-3 rounded-2xl text-sm font-black capitalize transition-all border-2 ${
                        patientProfile.gender === g
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-transparent bg-gray-50 text-gray-600'
                      }`}
                    >
                      {t(`symptoms.${g}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pre-existing Conditions */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('symptoms.preConditions')}</h3>
                <p className="text-[10px] text-gray-400 font-medium mb-4">{t('symptoms.preConditionsDesc')}</p>
                
                {/* Condition Search Bar */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`w-4 h-4 ${conditionQuery ? 'text-blue-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    value={conditionQuery}
                    onChange={(e) => setConditionQuery(e.target.value)}
                    placeholder={t('symptoms.searchPlaceholder')}
                    className="w-full !pl-10 pr-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all text-xs font-bold text-gray-900"
                  />
                  {isSearchingConditions && (
                    <div className="absolute inset-y-0 right-3.5 flex items-center">
                      <div className="w-3.5 h-3.5 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Search Results */}
                <AnimatePresence>
                  {conditionResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 space-y-2 overflow-hidden">
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest px-1">{t('symptoms.aiSuggestions')}</p>
                      <div className="flex flex-wrap gap-2">
                        {conditionResults.map((c) => {
                          const isActive = patientProfile.conditions.includes(c.key);
                          return (
                            <button
                              key={c.key}
                              onClick={() => toggleCondition(c.key)}
                              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border-2 ${
                                isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-600 border-transparent hover:border-blue-100'
                              }`}
                            >
                              {isActive && '✓ '} {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Pick Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {getPreConditions(t).map(c => {
                    const isActive = patientProfile.conditions.includes(c.key);
                    return (
                      <button
                        key={c.key}
                        onClick={() => toggleCondition(c.key)}
                        className={`p-3 rounded-2xl text-left text-xs font-bold transition-all border-2 flex items-center gap-2 ${
                          isActive
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-transparent bg-gray-50 text-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-white text-[10px] ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`}>
                          {isActive && '✓'}
                        </div>
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('symptoms.additionalNotes')}</h3>
                <textarea
                  value={patientProfile.notes}
                  onChange={(e) => setPatientProfile(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-300 resize-none"
                  style={{ paddingLeft: '1rem' }}
                  rows={3}
                  placeholder={t('symptoms.notesPlaceholder')}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => setCurrentStep(1)} className="px-5 py-3.5 bg-gray-100 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-transform">
                  <ChevronLeftIcon className="w-3.5 h-3.5 stroke-[3]" />{t('common.back')}
                </button>
                <button 
                  onClick={() => setCurrentStep(3)} 
                  disabled={!patientProfile.ageGroup || !patientProfile.gender}
                  className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                  {t('common.next')} <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 3: REFINE ─── */}
          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black text-gray-900">{t('symptoms.reviewSymptoms')}</h2>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-lg">{selectedSymptoms.length} {t('common.items')}</span>
                </div>

                <div className="space-y-4">
                  {selectedSymptoms.map((symptom) => (
                    <div key={symptom.symptomId} className="p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-900">{symptom.name}</h4>
                        <button onClick={() => handleSymptomRemove(symptom.symptomId)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                          <XMarkIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">{t('symptoms.severity')}</label>
                          <div className="flex bg-white rounded-2xl p-1 border border-gray-100 shadow-sm">
                            {['mild', 'moderate', 'severe'].map((level) => (
                              <button key={level} onClick={() => handleSymptomUpdate(symptom.symptomId, { severity: level })}
                                className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${symptom.severity === level ? 'bg-blue-600 text-white shadow-md scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}>
                                {t(`symptoms.${level}`)}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">{t('symptoms.duration')}</label>
                          <div className="flex bg-white rounded-2xl p-1 border border-gray-100 shadow-sm">
                            {['lessThan1Day', 'days1to3', 'moreThan2Weeks'].map((durKey) => {
                              const values = ['less than 1 day', '1-3 days', 'more than 2 weeks'];
                              const durLabels = {
                                lessThan1Day: '< 1 Day',
                                days1to3: '1-3 Days',
                                moreThan2Weeks: '> 2 Weeks'
                              };
                              return (
                                <button key={durKey} onClick={() => handleSymptomUpdate(symptom.symptomId, { duration: values[['lessThan1Day', 'days1to3', 'moreThan2Weeks'].indexOf(durKey)] })}
                                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${symptom.duration === values[['lessThan1Day', 'days1to3', 'moreThan2Weeks'].indexOf(durKey)] ? 'bg-gray-900 text-white shadow-md scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}>
                                  {durLabels[durKey]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auth Warning */}
              {!isAuthenticated && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <UserIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-800">{t('auth.signInRequired')}</p>
                      <p className="text-xs text-amber-700 mt-0.5">{t('symptoms.signInRequired')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLoginRedirect}
                    className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-transform shadow-sm"
                  >
                    {t('auth.signIn')}
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => setCurrentStep(2)} className="px-5 py-3.5 bg-gray-100 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-transform">
                  <ChevronLeftIcon className="w-3.5 h-3.5 stroke-[3]" />{t('common.back')}
                </button>
                <button onClick={handleAnalyze} disabled={isAnalyzing || !isAuthenticated}
                  className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4" />{t('symptoms.getAnalysis')}
                </button>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-gray-400 text-center font-medium px-4 leading-relaxed">
                ⚕️ {t('symptoms.disclaimerText')}
              </p>
            </motion.div>
          )}

          {/* ─── STEP 4: RESULTS ─── */}
          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">

              {/* Loading */}
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-t-4 border-blue-600 rounded-full" />
                    <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                      <ShieldCheckIcon className="w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">{t('symptoms.analyzing')}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">{t('common.processing')}</p>
                </div>
              )}

              {/* ─── FULL RESULTS ─── */}
              {analysisResult && !isAnalyzing && (
                <div className="space-y-5">

                  {/* Emergency Alert */}
                  {analysisResult.hasEmergencySymptoms && (
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-5 bg-red-50 border-2 border-red-300 rounded-3xl text-center">
                      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-black text-red-700">{t('symptoms.emergencyTitle')}</h3>
                      <p className="text-sm text-red-600 mt-1 font-medium">{t('symptoms.emergencyText')}</p>
                      <a href="tel:112" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider active:scale-95 transition-transform">
                        <PhoneIcon className="w-4 h-4" />{t('common.call', 'Call')} 112
                      </a>
                    </motion.div>
                  )}

                  {/* Clinical Summary */}
                  {analysisResult.clinicalSummary && (
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <HeartIcon className="w-4 h-4 text-blue-500" />{t('reports.analysis')}
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">{analysisResult.clinicalSummary}</p>
                    </div>
                  )}

                  {/* Conditions */}
                  {analysisResult.conditions?.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">{t('symptoms.step3Desc')}</h3>
                      <div className="space-y-3">
                        {analysisResult.conditions.map((c, i) => {
                          const isExpanded = expandedCondition === i;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.08 }}
                              className={`bg-white rounded-3xl shadow-sm border-2 transition-all ${isExpanded ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-100'}`}
                            >
                              {/* Condition Header — always visible */}
                              <button onClick={() => setExpandedCondition(isExpanded ? null : i)} className="w-full p-5 text-left">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-black text-gray-900 text-base">{c.condition}</h4>
                                    <div className="flex items-center gap-2 mt-1.5">
                                      <span className="text-xs font-black text-blue-600">{c.probability}% {t('symptoms.conditionMatch')}</span>
                                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${getSeverityStyle(c.severity)}`}>{t(`symptoms.${c.severity}`)}</span>
                                    </div>
                                  </div>
                                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg font-black text-blue-600">
                                    #{i + 1}
                                  </div>
                                </div>
                                {/* Probability Bar */}
                                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${c.probability}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                    className="h-full bg-blue-600 rounded-full"
                                  />
                                </div>
                              </button>

                              {/* Expanded Details */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-5 pb-5 space-y-4">
                                      <div className="h-px bg-gray-100" />

                                      {/* Reasoning */}
                                      {c.reasoning && (
                                        <div>
                                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('symptoms.whyThisCondition')}</p>
                                          <p className="text-xs text-gray-600 leading-relaxed">{c.reasoning}</p>
                                        </div>
                                      )}

                                      {/* Distinguishing Factors */}
                                      {c.distinguishing_factors && (
                                        <div className="p-3 bg-gray-50 rounded-xl">
                                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                            <MagnifyingGlassIcon className="w-3 h-3" />{t('symptoms.keyIndicators')}
                                          </p>
                                          <p className="text-xs text-gray-600 leading-relaxed">{c.distinguishing_factors}</p>
                                        </div>
                                      )}

                                      {/* Self-Care Tips */}
                                      {c.selfCare?.length > 0 && (
                                        <div>
                                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">{t('symptoms.selfCareTips')}</p>
                                          <ul className="space-y-1.5">
                                            {c.selfCare.map((tip, j) => (
                                              <li key={j} className="text-xs text-gray-600 flex items-start gap-2">
                                                <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{tip}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {/* See Doctor */}
                                      {c.seeDoctor && (
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <ClockIcon className="w-3 h-3" />{t('symptoms.whenToSeeDoctor')}
                                          </p>
                                          <p className="text-xs text-amber-700 font-medium">{c.seeDoctor}</p>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Follow-Up Questions */}
                  {analysisResult.followUpQuestions?.length > 0 && (
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <ChatBubbleLeftRightIcon className="w-4 h-4 text-indigo-500" />{t('symptoms.followUpQuestions')}
                      </h3>
                      <ul className="space-y-2.5">
                        {analysisResult.followUpQuestions.map((q, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-3 font-medium">
                            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">{i + 1}</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* General Advice */}
                  {analysisResult.generalAdvice?.length > 0 && (
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <LightBulbIcon className="w-4 h-4 text-emerald-500" />{t('dashboard.generalAdvice', 'General Advice')}
                      </h3>
                      <ul className="space-y-2">
                        {analysisResult.generalAdvice.map((a, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2 font-medium">
                            <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Restart + Disclaimer */}
                  <div className="pt-2 space-y-3">
                    <button onClick={handleRestart} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-wider shadow-lg active:scale-[0.98] transition-all">
                      {t('symptoms.checkNew')}
                    </button>
                    <div className="p-4 bg-gray-100 rounded-2xl">
                      <p className="text-[10px] text-gray-500 text-center font-bold leading-relaxed flex items-start justify-center gap-1.5">
                        <InformationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {t('symptoms.disclaimerText')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Symptoms;