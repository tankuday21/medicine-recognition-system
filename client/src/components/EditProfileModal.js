import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
    XMarkIcon,
    UserIcon,
    HeartIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { GradientButton, PremiumInput, PremiumSelect, PremiumDatePicker, PremiumTextarea } from './ui/PremiumComponents';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate, initialTab = 'personal' }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user?.gender || '',
        bloodGroup: user?.bloodGroup || '',
        height: user?.height || '',
        weight: user?.weight || '',
        allergies: user?.allergies || [],
        chronicConditions: user?.chronicConditions || []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [allergyInput, setAllergyInput] = useState('');
    const [conditionInput, setConditionInput] = useState('');

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const genders = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddItem = (type, value, setter) => {
        if (!value.trim()) return;
        setFormData(prev => ({
            ...prev,
            [type]: [...prev[type], value.trim()]
        }));
        setter('');
    };

    const handleRemoveItem = (type, index) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onUpdate(formData);
            onClose();
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-xl font-bold leading-6 text-gray-900 dark:text-white"
                                    >
                                        Edit Profile
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <XMarkIcon className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex space-x-1 rounded-xl bg-blue-900/5 dark:bg-slate-800 p-1 mb-6">
                                    {['personal', 'medical'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`
                        w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                        ${activeTab === tab
                                                    ? 'bg-white dark:bg-slate-700 shadow text-blue-700 dark:text-blue-100'
                                                    : 'text-blue-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-blue-800'
                                                }
                      `}
                                        >
                                            {tab === 'personal' ? 'Personal Details' : 'Medical Info'}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {activeTab === 'personal' ? (
                                        <div className="space-y-4">
                                            <PremiumInput
                                                label="Full Name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                icon={UserIcon}
                                            />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <PremiumInput
                                                    label="Phone Number"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    type="tel"
                                                />
                                                <PremiumDatePicker
                                                    label="Date of Birth"
                                                    value={formData.dateOfBirth}
                                                    onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
                                                />
                                            </div>
                                            <PremiumSelect
                                                label="Gender"
                                                options={genders}
                                                value={formData.gender}
                                                onChange={(val) => setFormData({ ...formData, gender: val })}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <PremiumSelect
                                                    label="Blood Group"
                                                    options={bloodGroups.map(bg => ({ value: bg, label: bg }))}
                                                    value={formData.bloodGroup}
                                                    onChange={(val) => setFormData({ ...formData, bloodGroup: val })}
                                                />
                                                <PremiumInput
                                                    label="Height (cm)"
                                                    name="height"
                                                    type="number"
                                                    value={formData.height}
                                                    onChange={handleInputChange}
                                                />
                                                <PremiumInput
                                                    label="Weight (kg)"
                                                    name="weight"
                                                    type="number"
                                                    value={formData.weight}
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            {/* Allergies */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Allergies
                                                </label>
                                                <div className="flex gap-2 mb-3">
                                                    <PremiumInput
                                                        value={allergyInput}
                                                        onChange={(e) => setAllergyInput(e.target.value)}
                                                        placeholder="Add allergy (e.g. Penicillin)"
                                                        className="flex-1"
                                                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem('allergies', allergyInput, setAllergyInput)}
                                                    />
                                                    <button
                                                        onClick={() => handleAddItem('allergies', allergyInput, setAllergyInput)}
                                                        className="p-3 bg-blue-500 rounded-xl text-white hover:bg-blue-600 transition-colors"
                                                    >
                                                        <PlusIcon className="w-6 h-6" />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.allergies.map((item, index) => (
                                                        <span key={index} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium flex items-center gap-2">
                                                            {item}
                                                            <button onClick={() => handleRemoveItem('allergies', index)}>
                                                                <XMarkIcon className="w-4 h-4" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Chronic Conditions */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Chronic Conditions
                                                </label>
                                                <div className="flex gap-2 mb-3">
                                                    <PremiumInput
                                                        value={conditionInput}
                                                        onChange={(e) => setConditionInput(e.target.value)}
                                                        placeholder="Add condition (e.g. Diabetes)"
                                                        className="flex-1"
                                                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem('chronicConditions', conditionInput, setConditionInput)}
                                                    />
                                                    <button
                                                        onClick={() => handleAddItem('chronicConditions', conditionInput, setConditionInput)}
                                                        className="p-3 bg-blue-500 rounded-xl text-white hover:bg-blue-600 transition-colors"
                                                    >
                                                        <PlusIcon className="w-6 h-6" />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.chronicConditions.map((item, index) => (
                                                        <span key={index} className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-medium flex items-center gap-2">
                                                            {item}
                                                            <button onClick={() => handleRemoveItem('chronicConditions', index)}>
                                                                <XMarkIcon className="w-4 h-4" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 flex justify-end gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <GradientButton
                                        onClick={handleSubmit}
                                        isLoading={isLoading}
                                        className="px-6"
                                    >
                                        Save Changes
                                    </GradientButton>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default EditProfileModal;
