import React, { createContext, useContext, useState, useEffect } from 'react';

// All Indian languages
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
];

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTranslations(language);
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language;
  }, [language]);

  // Deep merge utility
  const deepMerge = (target, source) => {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) Object.assign(output, { [key]: source[key] });
          else output[key] = deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  };

  const isObject = (item) => {
    return (item && typeof item === 'object' && !Array.isArray(item));
  };

  const loadTranslations = async (lang) => {
    setIsLoading(true);
    try {
      // Always load English as base
      const enModule = await import('../translations/en.json');
      let finalTranslations = enModule.default;

      if (lang !== 'en') {
        try {
          const translationModule = await import(`../translations/${lang}.json`);
          // Deep merge: English base + Target Lang override
          finalTranslations = deepMerge(finalTranslations, translationModule.default);
        } catch (error) {
          console.warn(`Translation file for ${lang} not found, falling back to English`);
        }
      }

      setTranslations(finalTranslations);
    } catch (error) {
      console.error('Failed to load translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const t = (key, options = {}) => {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    if (value === undefined) {
      return key; // Return key if translation not found
    }

    if (options.returnObjects) {
      return value;
    }

    if (typeof value !== 'string') {
      return key; 
    }

    // Replace parameters like {{name}}
    return value.replace(/\{\{(\w+)\}\}/g, (_, param) => options[param] || '');
  };

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
  };

  const getCurrentLanguage = () => {
    return LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  };

  return (
    <LanguageContext.Provider value={{
      language,
      translations,
      t,
      changeLanguage,
      getCurrentLanguage,
      languages: LANGUAGES,
      isLoading
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
