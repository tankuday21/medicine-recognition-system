import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import esTranslations from './locales/es.json';

const resources = {
  en: {
    translation: enTranslations
  },
  hi: {
    translation: hiTranslations
  },
  es: {
    translation: esTranslations
  }
};

i18n
  // Load translation using http backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'mediot-language',
      checkWhitelist: true
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
      format: function(value, format, lng) {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'currency') {
          return new Intl.NumberFormat(lng, {
            style: 'currency',
            currency: lng === 'hi' ? 'INR' : 'USD'
          }).format(value);
        }
        if (format === 'date') {
          return new Intl.DateTimeFormat(lng).format(new Date(value));
        }
        if (format === 'time') {
          return new Intl.DateTimeFormat(lng, {
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(value));
        }
        return value;
      }
    },

    // Namespace and key separator
    ns: ['translation'],
    defaultNS: 'translation',
    keySeparator: '.',
    nsSeparator: ':',

    // React options
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'span']
    },

    // Backend options (if using http backend)
    backend: {
      loadPath: '/locales/{{lng}}.json',
      addPath: '/locales/add/{{lng}}/{{ns}}'
    },

    // Whitelist languages
    whitelist: ['en', 'hi', 'es'],
    nonExplicitWhitelist: true,

    // Load languages
    load: 'languageOnly',
    preload: ['en'],

    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',

    // Missing key handling
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    }
  });

// Language change handler
i18n.on('languageChanged', (lng) => {
  // Update document direction for RTL languages
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(lng);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  
  // Store language preference
  localStorage.setItem('mediot-language', lng);
  
  // Dispatch custom event for other components to listen
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lng, isRTL } }));
});

export default i18n;