import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    PlusIcon,
    XMarkIcon,
    BeakerIcon
} from '@heroicons/react/24/outline';
import MedicineSearch from '../Medicine/MedicineSearch';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomDatePicker from '../Common/CustomDatePicker';
import CustomTimePicker from '../Common/CustomTimePicker';

const ReminderForm = ({ medicine: initialMedicine, editingReminder, onSave, onDelete, onCancel, isLoading = false }) => {
    const { t } = useLanguage();
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
        { value: 'once', label: t('reminders.onceDaily'), times: 1 },
        { value: 'twice', label: t('reminders.twiceDaily'), times: 2 },
        { value: 'thrice', label: t('reminders.thriceDaily'), times: 3 },
        { value: 'four_times', label: t('reminders.fourTimesDaily'), times: 4 },
        { value: 'custom', label: t('reminders.customSchedule'), times: null }
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
        } else if (formData.frequency === 'custom' && formData.times.length === 0) {
            setFormData(prev => ({ ...prev, times: ['08:00'] }));
        }
    }, [formData.frequency]);

    // Initialize form when editing
    useEffect(() => {
        if (editingReminder) {
            setFormData({
                medicineName: editingReminder.medicineName,
                dosage: editingReminder.dosage,
                frequency: editingReminder.frequency,
                startDate: editingReminder.startDate ? new Date(editingReminder.startDate).toISOString().split('T')[0] : '',
                endDate: editingReminder.endDate ? new Date(editingReminder.endDate).toISOString().split('T')[0] : '',
                times: editingReminder.times || [],
                notes: editingReminder.notes || '',
                medicineId: editingReminder.medicineId
            });
            if (editingReminder.medicineId) {
                setSelectedMedicine({
                    _id: editingReminder.medicineId,
                    name: editingReminder.medicineName,
                    dosage: editingReminder.dosage
                });
            }
        }
    }, [editingReminder]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleCustomChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
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
            times: [...prev.times, '12:00']
        }));
    };

    const removeTime = (index) => {
        setFormData(prev => ({
            ...prev,
            times: prev.times.filter((_, i) => i !== index)
        }));
    };

    const handleMedicineSelect = (medicine) => {
        setSelectedMedicine(medicine);
        setFormData(prev => ({
            ...prev,
            medicineName: medicine.name,
            dosage: medicine.dosage || prev.dosage
        }));
        setErrors(prev => ({ ...prev, medicineName: null }));
    };

    const handleMedicineQueryChange = (query) => {
        setFormData(prev => ({
            ...prev,
            medicineName: query
        }));
        if (query) {
            setErrors(prev => ({ ...prev, medicineName: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.medicineName) newErrors.medicineName = t('reminders.medicineNameRequired');
        if (!formData.startDate) newErrors.startDate = t('reminders.startDateRequired');
        if (formData.frequency === 'custom' && formData.times.length === 0) {
            newErrors.times = t('reminders.atLeastOneTime');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const reminderData = {
            ...formData,
            medicineId: selectedMedicine?._id || selectedMedicine?.id
        };

        onSave(reminderData);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Medicine Search */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('reminders.medicineName')} *
                    </label>
                    <MedicineSearch
                        onSelectMedicine={handleMedicineSelect}
                        onQueryChange={handleMedicineQueryChange}
                        initialValue={formData.medicineName}
                        placeholder={t('reminders.searchMedicine')}
                    />
                    {errors.medicineName && (
                        <p className="mt-1 text-sm text-red-600">{errors.medicineName}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dosage */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('reminders.dosage')}
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <BeakerIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                name="dosage"
                                value={formData.dosage}
                                onChange={handleInputChange}
                                className="w-full !pl-14 pr-4 py-3.5 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-all"
                                placeholder={t('reminders.dosagePlaceholder') || "e.g., 500mg, 1 tablet"}
                            />
                        </div>
                    </div>

                    {/* Frequency */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('reminders.frequency')}
                        </label>
                        <select
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleInputChange}
                            className="w-full px-3 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white appearance-none"
                        >
                            {frequencyOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Time Selection Display */}
                    <div className="md:col-span-2">
                        {formData.frequency !== 'custom' ? (
                            <div className="bg-blue-50 dark:bg-slate-800/50 rounded-xl p-4 border border-blue-100 dark:border-slate-700">
                                <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                                    {t('reminders.scheduledTimes')}
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {formData.times.map((time, index) => (
                                        <div key={index} className="flex-1 min-w-[120px]">
                                            <CustomTimePicker
                                                value={time}
                                                onChange={(val) => handleTimeChange(index, val)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-slate-800/30 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('reminders.customTimes')}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addTime}
                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        {t('common.add') || 'Add Time'}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.times.map((time, index) => (
                                        <div key={index} className="flex gap-3">
                                            <div className="flex-1">
                                                <CustomTimePicker
                                                    value={time}
                                                    onChange={(val) => handleTimeChange(index, val)}
                                                    required
                                                />
                                            </div>
                                            {formData.times.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTime(index)}
                                                    className="p-3.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-transparent hover:border-red-100"
                                                >
                                                    <XMarkIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {errors.times && (
                            <p className="mt-1 text-sm text-red-600">{errors.times}</p>
                        )}
                    </div>

                    {/* Start and End Dates */}
                    <CustomDatePicker
                        label={t('reminders.startDate')}
                        value={formData.startDate}
                        onChange={(val) => handleCustomChange('startDate', val)}
                        required
                        error={errors.startDate}
                    />

                    <CustomDatePicker
                        label={t('reminders.endDate')}
                        value={formData.endDate}
                        onChange={(val) => handleCustomChange('endDate', val)}
                        error={errors.endDate}
                        minDate={formData.startDate}
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('reminders.notes')}
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        placeholder={t('reminders.notesPlaceholder')}
                    />
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-100 dark:border-slate-800">
                    {onDelete && editingReminder && (
                        <button
                            type="button"
                            onClick={() => onDelete(editingReminder._id)}
                            disabled={isLoading}
                            className="flex-1 py-3 px-4 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors text-base font-medium touch-target"
                        >
                            {t('common.delete') || 'Delete'}
                        </button>
                    )}

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 py-3 px-4 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors text-base font-medium touch-target"
                        >
                            {t('common.cancel')}
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors text-base font-medium touch-target shadow-lg shadow-blue-600/20"
                    >
                        {isLoading ? (editingReminder ? t('reminders.updating') : t('reminders.creating')) : (editingReminder ? t('reminders.updateReminder') : t('reminders.createReminder'))}
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
    onDelete: PropTypes.func,
    onCancel: PropTypes.func,
    isLoading: PropTypes.bool
};

export default ReminderForm;