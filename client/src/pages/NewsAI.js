import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import NewsFeedAI from '../components/News/NewsFeedAI';
import { BackButton } from '../components/ui/PremiumComponents';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  SparklesIcon,
  BeakerIcon,
  ExclamationCircleIcon,
  CubeIcon,
  HeartIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const categories = (t) => [
  { id: 'health', name: t('news.latestNews', 'Top News'), icon: SparklesIcon },
  { id: 'medical_research', name: t('news.medicalResearch', 'Research'), icon: BeakerIcon },
  { id: 'diseases', name: t('news.diseasesConditions', 'Diseases'), icon: ExclamationCircleIcon },
  { id: 'medications', name: t('news.medications', 'Medications'), icon: CubeIcon },
  { id: 'mental_health', name: t('news.mentalHealth', 'Mental Health'), icon: HeartIcon },
  { id: 'public_health', name: t('news.publicHealth', 'Public Health'), icon: GlobeAltIcon }
];

const countries = [
  { id: 'us', name: 'USA', flag: '🇺🇸' },
  { id: 'in', name: 'India', flag: '🇮🇳' },
  { id: 'gb', name: 'UK', flag: '🇬🇧' },
  { id: 'ca', name: 'Canada', flag: '🇨🇦' },
  { id: 'au', name: 'Australia', flag: '🇦🇺' }
];

const NewsAI = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('health');
  const [selectedCountry, setSelectedCountry] = useState('us');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="pb-24 min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="px-5 pt-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl pb-4 sticky top-0 z-40 border-b border-gray-100 dark:border-slate-800/50">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="flex flex-col">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                {t('news.title')}
              </h1>
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">{t('news.labMode', 'DeepSeek Lab Mode')}</span>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center relative"
            >
              <FunnelIcon className="w-5 h-5" />
              {(selectedCategory !== 'health' || selectedCountry !== 'us') && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border border-white dark:border-slate-800"></span>
              )}
            </button>
            
            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 flex flex-col"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('news.filterBy', 'Filter News By')}</span>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      {categories(t).map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setIsFilterOpen(false);
                            setSearchQuery(''); 
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-3 ${
                            selectedCategory === cat.id 
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <cat.icon className={`w-5 h-5 ${selectedCategory === cat.id ? 'text-primary-500' : 'text-gray-400'}`} />
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('news.region', 'Region')}</span>
                    </div>
                    <div className="p-2 flex overflow-x-auto no-scrollbar gap-2">
                      {countries.map(country => (
                        <button
                          key={country.id}
                          onClick={() => {
                            setSelectedCountry(country.id);
                          }}
                          className={`flex-none px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                            selectedCountry === country.id 
                              ? 'bg-primary-500 text-white border-primary-500' 
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-transparent hover:border-gray-300'
                          }`}
                        >
                          {country.flag} {country.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-2xl py-3.5 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 transition-all shadow-inner"
            style={{ paddingLeft: '3rem' }}
            placeholder={t('news.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div>
        <NewsFeedAI 
          searchQuery={searchQuery} 
          selectedCategory={selectedCategory} 
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
        />
      </div>
    </div>
  );
};

export default NewsAI;
