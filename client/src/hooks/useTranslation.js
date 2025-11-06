import { useTranslation as useI18nTranslation } from 'react-i18next';

// Custom hook that extends react-i18next's useTranslation with additional utilities
export const useTranslation = (namespace) => {
  const { t, i18n, ready } = useI18nTranslation(namespace);

  // Get current language info
  const getCurrentLanguage = () => {
    const languages = {
      en: { name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false },
      hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', rtl: false },
      es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false }
    };
    return languages[i18n.language] || languages.en;
  };

  // Check if current language is RTL
  const isRTL = () => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(i18n.language);
  };

  // Format date according to current locale
  const formatDate = (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat(i18n.language, { ...defaultOptions, ...options }).format(new Date(date));
  };

  // Format time according to current locale
  const formatTime = (date, options = {}) => {
    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Intl.DateTimeFormat(i18n.language, { ...defaultOptions, ...options }).format(new Date(date));
  };

  // Format currency according to current locale
  const formatCurrency = (amount, currency) => {
    const currencyCode = currency || (i18n.language === 'hi' ? 'INR' : 'USD');
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };

  // Format number according to current locale
  const formatNumber = (number, options = {}) => {
    return new Intl.NumberFormat(i18n.language, options).format(number);
  };

  // Get relative time (e.g., "2 hours ago")
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) {
      return t('time.now');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return minutes === 1 ? t('time.minuteAgo') : t('time.minutesAgo', { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return hours === 1 ? t('time.hourAgo') : t('time.hoursAgo', { count: hours });
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return days === 1 ? t('time.dayAgo') : t('time.daysAgo', { count: days });
    } else if (diffInSeconds < 2629746) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return weeks === 1 ? t('time.weekAgo') : t('time.weeksAgo', { count: weeks });
    } else if (diffInSeconds < 31556952) {
      const months = Math.floor(diffInSeconds / 2629746);
      return months === 1 ? t('time.monthAgo') : t('time.monthsAgo', { count: months });
    } else {
      const years = Math.floor(diffInSeconds / 31556952);
      return years === 1 ? t('time.yearAgo') : t('time.yearsAgo', { count: years });
    }
  };

  // Get localized unit
  const getUnit = (unit) => {
    return t(`units.${unit}`, unit);
  };

  // Change language
  const changeLanguage = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      localStorage.setItem('mediot-language', languageCode);
      
      // Update document attributes
      document.documentElement.lang = languageCode;
      document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
      
      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      return false;
    }
  };

  return {
    t,
    i18n,
    ready,
    currentLanguage: i18n.language,
    getCurrentLanguage,
    isRTL,
    formatDate,
    formatTime,
    formatCurrency,
    formatNumber,
    getRelativeTime,
    getUnit,
    changeLanguage
  };
};

export default useTranslation;