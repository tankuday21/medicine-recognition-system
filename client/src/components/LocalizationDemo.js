import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatDate,
  formatTime,
  formatCurrency,
  formatWeight,
  formatHeight,
  formatTemperature,
  formatDosage,
  getLocalizedMedicineName,
  formatMedicalTerm,
  getRelativeTime
} from '../utils/localization';

const LocalizationDemo = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const demoData = {
    date: new Date(),
    pastDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    price: 25.99,
    weight: 70, // kg
    height: 175, // cm
    temperature: 37.5, // celsius
    dosage: { amount: 500, unit: 'mg' },
    medicines: ['Paracetamol', 'Ibuprofen', 'Aspirin'],
    medicalTerms: ['blood pressure', 'diabetes', 'heart rate']
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t('settings.languageRegion')} - Demo
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date and Time Formatting */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Date & Time</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Current Date: </span>
              <span>{formatDate(demoData.date, currentLanguage)}</span>
            </div>
            <div>
              <span className="font-medium">Current Time: </span>
              <span>{formatTime(demoData.date, currentLanguage)}</span>
            </div>
            <div>
              <span className="font-medium">Relative Time: </span>
              <span>{getRelativeTime(demoData.pastDate, currentLanguage)}</span>
            </div>
          </div>
        </div>

        {/* Currency Formatting */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Currency</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Medicine Price: </span>
              <span>{formatCurrency(demoData.price, currentLanguage)}</span>
            </div>
            <div>
              <span className="font-medium">In USD: </span>
              <span>{formatCurrency(demoData.price, currentLanguage, 'USD')}</span>
            </div>
            <div>
              <span className="font-medium">In INR: </span>
              <span>{formatCurrency(demoData.price * 83, currentLanguage, 'INR')}</span>
            </div>
          </div>
        </div>

        {/* Unit Conversions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Units</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Weight: </span>
              <span>{formatWeight(demoData.weight, currentLanguage, 'kg')}</span>
            </div>
            <div>
              <span className="font-medium">Height: </span>
              <span>{formatHeight(demoData.height, currentLanguage, 'cm')}</span>
            </div>
            <div>
              <span className="font-medium">Temperature: </span>
              <span>{formatTemperature(demoData.temperature, currentLanguage, 'celsius')}</span>
            </div>
          </div>
        </div>

        {/* Medicine Dosage */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Medicine Dosage</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Dosage: </span>
              <span>{formatDosage(demoData.dosage.amount, demoData.dosage.unit, currentLanguage)}</span>
            </div>
            <div>
              <span className="font-medium">Frequency: </span>
              <span>{t('reminders.taken')} 3 {t('time.hoursAgo', { count: 3 })}</span>
            </div>
          </div>
        </div>

        {/* Localized Medicine Names */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Medicine Names</h3>
          <div className="space-y-2 text-sm">
            {demoData.medicines.map((medicine, index) => (
              <div key={index}>
                <span className="font-medium">{medicine}: </span>
                <span>{getLocalizedMedicineName(medicine, currentLanguage)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Terminology */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Medical Terms</h3>
          <div className="space-y-2 text-sm">
            {demoData.medicalTerms.map((term, index) => (
              <div key={index}>
                <span className="font-medium">{term}: </span>
                <span>{formatMedicalTerm(term, currentLanguage)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Common Translations */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Translations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">{t('common.loading')}</span>
          </div>
          <div>
            <span className="font-medium">{t('common.save')}</span>
          </div>
          <div>
            <span className="font-medium">{t('common.cancel')}</span>
          </div>
          <div>
            <span className="font-medium">{t('common.search')}</span>
          </div>
          <div>
            <span className="font-medium">{t('navigation.dashboard')}</span>
          </div>
          <div>
            <span className="font-medium">{t('navigation.reminders')}</span>
          </div>
          <div>
            <span className="font-medium">{t('navigation.reports')}</span>
          </div>
          <div>
            <span className="font-medium">{t('navigation.news')}</span>
          </div>
        </div>
      </div>

      {/* Language Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Current Language Settings</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div>Language: {currentLanguage.toUpperCase()}</div>
          <div>Direction: {document.documentElement.dir || 'ltr'}</div>
          <div>Locale: {navigator.language}</div>
        </div>
      </div>
    </div>
  );
};

export default LocalizationDemo;