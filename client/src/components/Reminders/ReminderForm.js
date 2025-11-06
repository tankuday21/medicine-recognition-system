import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ClockIcon,
  PlusIcon,
  XMarkIcon,
  CalendarIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import MedicineSearch from '../Medicine/MedicineSearch';

const ReminderForm = ({ medicine: initialMedicine, editingReminder, onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'twice',
    startDate: '',
    endDate: '',
    times: [],
    notes: '',
    medicineId: null
  });
  const [selectedMedicine, setSelectedMedicine] = useState(initialMedicine || null);
  const [errors, setErrors] = useState({});

  const frequencyOptions = [
    { value: 'once', label: 'Once daily', times: 1 },
    { value: 'twice', label: 'Twice daily', times: 2 },
    { value: 'thrice', label: 'Three times daily', times: 3 },
    { value: 'four_times', label: 'Four times daily', times: 4 },
    { value: 'custom', label: 'Custom schedule', times: null }
  ];

  // Initialize form with medicine data
  useEffect(() => {
    if (selectedMedicine) {
      setFormData(prev => ({
        ...prev,
        medicineName: selectedMedicine.name,
        dosage: selectedMedicine.dosage || '',
        medicineId: selectedMedicine._id || selectedMedicine.id
      }));
    }
  }, [selectedMedicine]);

  // Set default times when frequency changes
  useEffect(() => {
    const getDefaultTimes = async (frequency) => {
      try {
        const response = await fetch(`/api/reminders/frequency/${frequency}/times`);
        const data = await response.json();
        
        if (data.success) {
          setFormData(prev => ({
            ...prev,
            times: data.data.defaultTimes
          }));
        }
      } catch (error) {
        console.error('Failed to get default times:', error);
        // Fallback to hardcoded defaults
        const defaultTimes = {
          once: ['08:00'],
          twice: ['08:00', '20:00'],
          thrice: ['08:00', '14:00', '20:00'],
          four_times: ['08:00', '12:00', '16:00', '20:00']
        };
        
        setFormData(prev => ({
          ...prev,
          times: defaultTimes[frequency] || []
        }));
      }
    };

    if (formData.frequency !== 'custom') {
      getDefaultTimes(formData.frequency);
    }
  }, [formData.frequency]);

  // Set default start date to today or initialize with editing data
  useEffect(() => {
    if (editingReminder) {
      setFormData({
        medicineName: editingReminder.medicineName,
        dosage: editingReminder.dosage,
        frequency: editingReminder.frequency,
        startDate: new Date(editingReminder.startDate).toISOString().split('T')[0],
        endDate: editingReminder.endDate ? new Date(editingReminder.endDate).toISOString().split('T')[0] : '',
        times: [...editingReminder.times],
        notes: editingReminder.notes || '',
        medicineId: editingReminder.medicineId?._id || null
      });
      if (editingReminder.medicineId) {
        setSelectedMedicine(editingReminder.medicineId);
      }
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        startDate: today
      }));
    }
  }, [editingReminder]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine);
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData(prev => ({
      ...prev,
      times: newTimes
    }));
  };

  const addTime = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, '08:00']
    }));
  };

  const removeTime = (index) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.medicineName.trim()) {
      newErrors.medicineName = 'Medicine name is required';
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.times.length === 0) {
      newErrors.times = 'At least one time is required';
    }

    // Validate times format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const invalidTimes = formData.times.filter(time => !timeRegex.test(time));
    if (invalidTimes.length > 0) {
      newErrors.times = 'All times must be in HH:MM format';
    }

    // Check for duplicate times
    const uniqueTimes = new Set(formData.times);
    if (uniqueTimes.size !== formData.times.length) {
      newErrors.times = 'Duplicate times are not allowed';
    }

    // Validate end date is after start date
    if (formData.endDate && formData.startDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const reminderData = {
      ...formData,
      times: formData.times.sort() // Sort times
    };

    onSave(reminderData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {editingReminder ? 'Edit Reminder' : (initialMedicine ? 'Create Reminder' : 'New Medication Reminder')}
            </h2>
            <p className="text-sm text-gray-600">Set up a schedule for your medication</p>
          </div>
        </div>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors touch-target flex-shrink-0"
            aria-label="Cancel"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Medicine Selection */}
        {!initialMedicine && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Medicine
            </label>
            <MedicineSearch
              onSelectMedicine={handleMedicineSelect}
              placeholder="Search for a medicine..."
            />
            {selectedMedicine && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BeakerIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedMedicine.name}</p>
                    {selectedMedicine.genericName && (
                      <p className="text-sm text-gray-600">{selectedMedicine.genericName}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Medicine Name and Dosage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicine Name *
            </label>
            <input
              type="text"
              name="medicineName"
              value={formData.medicineName}
              onChange={handleInputChange}
              className={`w-full px-3 py-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-base min-h-[44px] ${
                errors.medicineName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter medicine name"
            />
            {errors.medicineName && (
              <p className="mt-1 text-sm text-red-600">{errors.medicineName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosage *
            </label>
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleInputChange}
              className={`w-full px-3 py-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-base min-h-[44px] ${
                errors.dosage ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 500mg, 1 tablet"
            />
            {errors.dosage && (
              <p className="mt-1 text-sm text-red-600">{errors.dosage}</p>
            )}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {frequencyOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 touch-target ${
                  formData.frequency === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="frequency"
                  value={option.value}
                  checked={formData.frequency === option.value}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  {option.times && (
                    <div className="text-gray-500">{option.times} times</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Times */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Times *
            </label>
            {formData.frequency === 'custom' && (
              <button
                type="button"
                onClick={addTime}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Time</span>
              </button>
            )}
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {formData.times.map((time, index) => (
              <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="px-3 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base min-h-[44px] flex-1"
                />
                {formData.frequency === 'custom' && formData.times.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTime(index)}
                    className="p-2 text-red-500 hover:text-red-700 touch-target flex-shrink-0"
                    aria-label="Remove time"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {errors.times && (
            <p className="mt-1 text-sm text-red-600">{errors.times}</p>
          )}
        </div>

        {/* Start and End Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <div className="relative">
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-base min-h-[44px] ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <CalendarIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date (Optional)
            </label>
            <div className="relative">
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-base min-h-[44px] ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <CalendarIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="Add any additional notes about this medication..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors text-base font-medium min-h-[44px] touch-target"
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-base font-medium min-h-[44px] touch-target"
          >
            {isLoading ? (editingReminder ? 'Updating...' : 'Creating...') : (editingReminder ? 'Update Reminder' : 'Create Reminder')}
          </button>
        </div>
      </form>
    </div>
  );
};

ReminderForm.propTypes = {
  medicine: PropTypes.object,
  editingReminder: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  isLoading: PropTypes.bool
};

export default ReminderForm;