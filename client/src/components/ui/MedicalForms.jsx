// Medical-Specific Form Components
// Specialized form components for medical applications

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';
import { combineClasses } from '../../utils/design-system';

/**
 * Blood Pressure Input Component
 * Specialized input for blood pressure readings
 */
export const BloodPressureInput = ({
  label = 'Blood Pressure',
  systolic = '',
  diastolic = '',
  onSystolicChange,
  onDiastolicChange,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={combineClasses('space-y-2', className)} {...props}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="flex items-center gap-3">
        <Input
          type="number"
          placeholder="120"
          value={systolic}
          onChange={(e) => onSystolicChange?.(e.target.value)}
          disabled={disabled}
          className="flex-1"
          min="50"
          max="300"
        />
        
        <span className="text-gray-500 font-medium">/</span>
        
        <Input
          type="number"
          placeholder="80"
          value={diastolic}
          onChange={(e) => onDiastolicChange?.(e.target.value)}
          disabled={disabled}
          className="flex-1"
          min="30"
          max="200"
        />
        
        <span className="text-sm text-gray-500 ml-2">mmHg</span>
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};/
**
 * Medication Dosage Input Component
 * Input for medication dosage with unit selection
 */
export const MedicationDosageInput = ({
  label = 'Dosage',
  amount = '',
  unit = 'mg',
  onAmountChange,
  onUnitChange,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const unitOptions = [
    { value: 'mg', label: 'mg' },
    { value: 'g', label: 'g' },
    { value: 'ml', label: 'ml' },
    { value: 'l', label: 'l' },
    { value: 'mcg', label: 'mcg' },
    { value: 'iu', label: 'IU' },
    { value: 'drops', label: 'drops' },
    { value: 'tablets', label: 'tablets' },
    { value: 'capsules', label: 'capsules' }
  ];

  return (
    <div className={combineClasses('space-y-2', className)} {...props}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="10"
          value={amount}
          onChange={(e) => onAmountChange?.(e.target.value)}
          disabled={disabled}
          className="flex-1"
          min="0"
          step="0.1"
        />
        
        <Select
          options={unitOptions}
          value={unit}
          onChange={onUnitChange}
          disabled={disabled}
          className="w-24"
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

/**
 * Symptom Severity Scale Component
 * 1-10 scale for symptom severity rating
 */
export const SymptomSeverityScale = ({
  label = 'Symptom Severity',
  value = 0,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [hoveredValue, setHoveredValue] = useState(0);

  const getSeverityColor = (level) => {
    if (level <= 3) return 'text-green-500';
    if (level <= 6) return 'text-yellow-500';
    if (level <= 8) return 'text-orange-500';
    return 'text-red-500';
  };

  const getSeverityLabel = (level) => {
    if (level === 0) return 'No symptoms';
    if (level <= 3) return 'Mild';
    if (level <= 6) return 'Moderate';
    if (level <= 8) return 'Severe';
    return 'Very Severe';
  };

  return (
    <div className={combineClasses('space-y-3', className)} {...props}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          {[...Array(11)].map((_, index) => (
            <button
              key={index}
              type="button"
              disabled={disabled}
              className={combineClasses(
                'w-8 h-8 rounded-full border-2 transition-all duration-200',
                'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                value === index || hoveredValue === index
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
              )}
              onClick={() => !disabled && onChange?.(index)}
              onMouseEnter={() => setHoveredValue(index)}
              onMouseLeave={() => setHoveredValue(0)}
            >
              {index}
            </button>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>No Pain</span>
          <span>Worst Pain</span>
        </div>
        
        {value > 0 && (
          <div className="text-center">
            <span className={combineClasses('text-sm font-medium', getSeverityColor(value))}>
              {getSeverityLabel(value)} ({value}/10)
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};/*
*
 * Medical History Form Component
 * Structured form for collecting medical history
 */
export const MedicalHistoryForm = ({
  conditions = [],
  allergies = [],
  medications = [],
  onConditionsChange,
  onAllergiesChange,
  onMedicationsChange,
  className = '',
  ...props
}) => {
  const commonConditions = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Arthritis',
    'Depression', 'Anxiety', 'High Cholesterol', 'Thyroid Disease', 'Cancer'
  ];

  const commonAllergies = [
    'Penicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen', 'Codeine',
    'Peanuts', 'Shellfish', 'Latex', 'Pollen', 'Pet dander'
  ];

  return (
    <div className={combineClasses('space-y-6', className)} {...props}>
      {/* Medical Conditions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Medical Conditions
        </label>
        <div className="grid grid-cols-2 gap-2">
          {commonConditions.map((condition) => (
            <label key={condition} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={conditions.includes(condition)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onConditionsChange?.([...conditions, condition]);
                  } else {
                    onConditionsChange?.(conditions.filter(c => c !== condition));
                  }
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">{condition}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Known Allergies
        </label>
        <div className="grid grid-cols-2 gap-2">
          {commonAllergies.map((allergy) => (
            <label key={allergy} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={allergies.includes(allergy)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onAllergiesChange?.([...allergies, allergy]);
                  } else {
                    onAllergiesChange?.(allergies.filter(a => a !== allergy));
                  }
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">{allergy}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Current Medications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Current Medications
        </label>
        <Textarea
          placeholder="List your current medications, including dosage and frequency..."
          value={medications}
          onChange={(e) => onMedicationsChange?.(e.target.value)}
          rows={4}
          maxLength={1000}
          showCharCount
        />
      </div>
    </div>
  );
};

// PropTypes for all components
BloodPressureInput.propTypes = {
  label: PropTypes.string,
  systolic: PropTypes.string,
  diastolic: PropTypes.string,
  onSystolicChange: PropTypes.func,
  onDiastolicChange: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

MedicationDosageInput.propTypes = {
  label: PropTypes.string,
  amount: PropTypes.string,
  unit: PropTypes.string,
  onAmountChange: PropTypes.func,
  onUnitChange: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

SymptomSeverityScale.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  onChange: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

MedicalHistoryForm.propTypes = {
  conditions: PropTypes.array,
  allergies: PropTypes.array,
  medications: PropTypes.string,
  onConditionsChange: PropTypes.func,
  onAllergiesChange: PropTypes.func,
  onMedicationsChange: PropTypes.func,
  className: PropTypes.string
};