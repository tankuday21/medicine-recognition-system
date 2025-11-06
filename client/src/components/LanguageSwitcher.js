import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LanguageIcon,
  ChevronDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const LanguageSwitcher = ({ className = '', showLabel = true, size = 'md' }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      rtl: false
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      rtl: false
    },
    {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      flag: '🇪🇸',
      rtl: false
    }
  ];

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      setIsOpen(false);
      
      // Store preference
      localStorage.setItem('mediot-language', languageCode);
      
      // Update document attributes
      const selectedLanguage = languages.find(lang => lang.code === languageCode);
      if (selectedLanguage) {
        document.documentElement.lang = languageCode;
        document.documentElement.dir = selectedLanguage.rtl ? 'rtl' : 'ltr';
      }
      
      // Show success message (optional)
      console.log(`Language changed to ${languageCode}`);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'px-2 py-1 text-sm',
          icon: 'h-4 w-4',
          dropdown: 'text-sm'
        };
      case 'lg':
        return {
          button: 'px-4 py-3 text-lg',
          icon: 'h-6 w-6',
          dropdown: 'text-base'
        };
      default:
        return {
          button: 'px-3 py-2 text-base',
          icon: 'h-5 w-5',
          dropdown: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const currentLang = getCurrentLanguage();

  return (
    <div className={`relative ${className}`}>
      {/* Language Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 bg-white border border-gray-300 rounded-lg
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors duration-200 ${sizeClasses.button}
        `}
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <LanguageIcon className={`text-gray-500 ${sizeClasses.icon}`} />
        
        <span className="flex items-center space-x-2">
          <span className="text-lg">{currentLang.flag}</span>
          {showLabel && (
            <span className="text-gray-700 font-medium">
              {currentLang.nativeName}
            </span>
          )}
        </span>
        
        <ChevronDownIcon 
          className={`text-gray-400 transition-transform duration-200 ${sizeClasses.icon} ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-full min-w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-1" role="listbox">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`
                    w-full flex items-center justify-between px-4 py-2 text-left
                    hover:bg-gray-50 transition-colors duration-150 ${sizeClasses.dropdown}
                    ${currentLanguage === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                  `}
                  role="option"
                  aria-selected={currentLanguage === language.code}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{language.flag}</span>
                    <div>
                      <div className="font-medium">{language.nativeName}</div>
                      <div className="text-xs text-gray-500">{language.name}</div>
                    </div>
                  </div>
                  
                  {currentLanguage === language.code && (
                    <CheckIcon className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-2">
              <p className="text-xs text-gray-500">
                {t('settings.languageRegion')}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;