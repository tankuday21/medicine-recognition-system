import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext';
import { GlobeAltIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const LanguageSelector = ({ variant = 'dropdown', showLabel = true }) => {
  const { language, changeLanguage, getCurrentLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentLang = getCurrentLanguage();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Compact dropdown for header/navbar
  if (variant === 'compact') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-300 min-w-[120px] justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{currentLang.flag}</span>
            <span className="text-sm font-medium">{currentLang.nativeName}</span>
          </div>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl py-2 max-h-80 overflow-y-auto border border-gray-200 dark:border-slate-700 z-[100]">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { 
                  changeLanguage(lang.code); 
                  setIsOpen(false); 
                }}
                className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                  language === lang.code ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{lang.flag}</span>
                  <div>
                    <span className="text-sm font-medium block">{lang.nativeName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</span>
                  </div>
                </div>
                {language === lang.code && <CheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full grid for settings page
  return (
    <div className="space-y-4">
      {showLabel && (
        <div className="flex items-center gap-2 mb-4">
          <GlobeAltIcon className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t('settings.selectLanguage')}</h3>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              language === lang.code
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
            }`}
          >
            {language === lang.code && (
              <div className="absolute top-2 right-2">
                <CheckIcon className="w-5 h-5 text-indigo-600" />
              </div>
            )}
            <div className="text-center">
              <span className="text-2xl mb-2 block">{lang.flag}</span>
              <p className="font-medium text-gray-900">{lang.nativeName}</p>
              <p className="text-xs text-gray-500">{lang.name}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
