// Localization utilities for formatting dates, numbers, currencies, etc.

// Language-specific configurations
export const LANGUAGE_CONFIGS = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    numberFormat: {
      decimal: '.',
      thousands: ','
    },
    units: {
      weight: 'lbs',
      height: 'ft',
      temperature: 'fahrenheit'
    }
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    rtl: false,
    currency: 'INR',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    numberFormat: {
      decimal: '.',
      thousands: ','
    },
    units: {
      weight: 'kg',
      height: 'cm',
      temperature: 'celsius'
    }
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    numberFormat: {
      decimal: ',',
      thousands: '.'
    },
    units: {
      weight: 'kg',
      height: 'cm',
      temperature: 'celsius'
    }
  }
};

// Get language configuration
export const getLanguageConfig = (languageCode) => {
  return LANGUAGE_CONFIGS[languageCode] || LANGUAGE_CONFIGS.en;
};

// Format date according to locale
export const formatDate = (date, languageCode, options = {}) => {
  const config = getLanguageConfig(languageCode);
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat(languageCode, { ...defaultOptions, ...options })
    .format(new Date(date));
};

// Format time according to locale
export const formatTime = (date, languageCode, options = {}) => {
  const config = getLanguageConfig(languageCode);
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: config.timeFormat === '12h'
  };
  
  return new Intl.DateTimeFormat(languageCode, { ...defaultOptions, ...options })
    .format(new Date(date));
};

// Format currency according to locale
export const formatCurrency = (amount, languageCode, currency) => {
  const config = getLanguageConfig(languageCode);
  const currencyCode = currency || config.currency;
  
  return new Intl.NumberFormat(languageCode, {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
};

// Format number according to locale
export const formatNumber = (number, languageCode, options = {}) => {
  return new Intl.NumberFormat(languageCode, options).format(number);
};

// Convert weight units
export const convertWeight = (weight, fromUnit, toUnit) => {
  const conversions = {
    kg: {
      lbs: (kg) => kg * 2.20462,
      kg: (kg) => kg
    },
    lbs: {
      kg: (lbs) => lbs / 2.20462,
      lbs: (lbs) => lbs
    }
  };
  
  return conversions[fromUnit]?.[toUnit]?.(weight) || weight;
};

// Convert height units
export const convertHeight = (height, fromUnit, toUnit) => {
  const conversions = {
    cm: {
      ft: (cm) => cm / 30.48,
      in: (cm) => cm / 2.54,
      cm: (cm) => cm
    },
    ft: {
      cm: (ft) => ft * 30.48,
      in: (ft) => ft * 12,
      ft: (ft) => ft
    },
    in: {
      cm: (inches) => inches * 2.54,
      ft: (inches) => inches / 12,
      in: (inches) => inches
    }
  };
  
  return conversions[fromUnit]?.[toUnit]?.(height) || height;
};

// Convert temperature units
export const convertTemperature = (temp, fromUnit, toUnit) => {
  const conversions = {
    celsius: {
      fahrenheit: (c) => (c * 9/5) + 32,
      celsius: (c) => c
    },
    fahrenheit: {
      celsius: (f) => (f - 32) * 5/9,
      fahrenheit: (f) => f
    }
  };
  
  return conversions[fromUnit]?.[toUnit]?.(temp) || temp;
};

// Format weight with appropriate unit for locale
export const formatWeight = (weight, languageCode, unit) => {
  const config = getLanguageConfig(languageCode);
  const targetUnit = unit || config.units.weight;
  
  // Convert if needed
  let convertedWeight = weight;
  if (unit && unit !== targetUnit) {
    convertedWeight = convertWeight(weight, unit, targetUnit);
  }
  
  return `${formatNumber(convertedWeight, languageCode, { maximumFractionDigits: 1 })} ${targetUnit}`;
};

// Format height with appropriate unit for locale
export const formatHeight = (height, languageCode, unit) => {
  const config = getLanguageConfig(languageCode);
  const targetUnit = unit || config.units.height;
  
  // Convert if needed
  let convertedHeight = height;
  if (unit && unit !== targetUnit) {
    convertedHeight = convertHeight(height, unit, targetUnit);
  }
  
  if (targetUnit === 'ft') {
    const feet = Math.floor(convertedHeight);
    const inches = Math.round((convertedHeight - feet) * 12);
    return `${feet}'${inches}"`;
  }
  
  return `${formatNumber(convertedHeight, languageCode, { maximumFractionDigits: 1 })} ${targetUnit}`;
};

// Format temperature with appropriate unit for locale
export const formatTemperature = (temp, languageCode, unit) => {
  const config = getLanguageConfig(languageCode);
  const targetUnit = unit || config.units.temperature;
  
  // Convert if needed
  let convertedTemp = temp;
  if (unit && unit !== targetUnit) {
    convertedTemp = convertTemperature(temp, unit, targetUnit);
  }
  
  const symbol = targetUnit === 'celsius' ? '°C' : '°F';
  return `${formatNumber(convertedTemp, languageCode, { maximumFractionDigits: 1 })}${symbol}`;
};

// Get relative time string
export const getRelativeTime = (date, languageCode) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(languageCode, { numeric: 'auto' });
  
  if (diffInSeconds < 60) {
    return rtf.format(0, 'second');
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return rtf.format(-minutes, 'minute');
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return rtf.format(-hours, 'hour');
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return rtf.format(-days, 'day');
  } else if (diffInSeconds < 2629746) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return rtf.format(-weeks, 'week');
  } else if (diffInSeconds < 31556952) {
    const months = Math.floor(diffInSeconds / 2629746);
    return rtf.format(-months, 'month');
  } else {
    const years = Math.floor(diffInSeconds / 31556952);
    return rtf.format(-years, 'year');
  }
};

// Format medicine dosage with localized units
export const formatDosage = (amount, unit, languageCode) => {
  const formattedAmount = formatNumber(amount, languageCode);
  
  // Unit translations
  const unitTranslations = {
    en: {
      mg: 'mg',
      ml: 'ml',
      tablets: 'tablets',
      capsules: 'capsules',
      drops: 'drops',
      teaspoons: 'tsp',
      tablespoons: 'tbsp'
    },
    hi: {
      mg: 'मिग्रा',
      ml: 'मिली',
      tablets: 'गोलियां',
      capsules: 'कैप्सूल',
      drops: 'बूंदें',
      teaspoons: 'चम्मच',
      tablespoons: 'बड़ा चम्मच'
    },
    es: {
      mg: 'mg',
      ml: 'ml',
      tablets: 'tabletas',
      capsules: 'cápsulas',
      drops: 'gotas',
      teaspoons: 'cdta',
      tablespoons: 'cda'
    }
  };
  
  const config = getLanguageConfig(languageCode);
  const localizedUnit = unitTranslations[languageCode]?.[unit] || unit;
  
  return `${formattedAmount} ${localizedUnit}`;
};

// Get localized medicine names (basic mapping)
export const getLocalizedMedicineName = (medicineName, languageCode) => {
  // This would typically come from a comprehensive database
  // For now, we'll return the original name
  const medicineTranslations = {
    hi: {
      'Paracetamol': 'पैरासिटामोल',
      'Ibuprofen': 'इबुप्रोफेन',
      'Aspirin': 'एस्पिरिन',
      'Amoxicillin': 'एमोक्सिसिलिन'
    },
    es: {
      'Paracetamol': 'Paracetamol',
      'Ibuprofen': 'Ibuprofeno',
      'Aspirin': 'Aspirina',
      'Amoxicillin': 'Amoxicilina'
    }
  };
  
  return medicineTranslations[languageCode]?.[medicineName] || medicineName;
};

// Format medical terminology
export const formatMedicalTerm = (term, languageCode) => {
  const medicalTerms = {
    hi: {
      'blood pressure': 'रक्तचाप',
      'diabetes': 'मधुमेह',
      'heart rate': 'हृदय गति',
      'temperature': 'तापमान',
      'cholesterol': 'कोलेस्ट्रॉल',
      'glucose': 'ग्लूकोज'
    },
    es: {
      'blood pressure': 'presión arterial',
      'diabetes': 'diabetes',
      'heart rate': 'frecuencia cardíaca',
      'temperature': 'temperatura',
      'cholesterol': 'colesterol',
      'glucose': 'glucosa'
    }
  };
  
  return medicalTerms[languageCode]?.[term.toLowerCase()] || term;
};

// Get day names in local language
export const getDayNames = (languageCode, format = 'long') => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(2024, 0, i); // Start from a Sunday
    days.push(new Intl.DateTimeFormat(languageCode, { weekday: format }).format(date));
  }
  return days;
};

// Get month names in local language
export const getMonthNames = (languageCode, format = 'long') => {
  const months = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(2024, i, 1);
    months.push(new Intl.DateTimeFormat(languageCode, { month: format }).format(date));
  }
  return months;
};

export default {
  LANGUAGE_CONFIGS,
  getLanguageConfig,
  formatDate,
  formatTime,
  formatCurrency,
  formatNumber,
  convertWeight,
  convertHeight,
  convertTemperature,
  formatWeight,
  formatHeight,
  formatTemperature,
  getRelativeTime,
  formatDosage,
  getLocalizedMedicineName,
  formatMedicalTerm,
  getDayNames,
  getMonthNames
};