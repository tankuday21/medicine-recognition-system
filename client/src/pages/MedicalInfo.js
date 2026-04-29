import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HeartIcon,
    PencilSquareIcon,
    BeakerIcon,
    ScaleIcon,
    NoSymbolIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { BackButton, GlassCard } from '../components/ui/PremiumComponents';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import EditProfileModal from '../components/EditProfileModal';

const MedicalInfo = () => {
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth();
    const { t } = useLanguage();
    const [showEditModal, setShowEditModal] = useState(false);

    // Helper to safely get array data
    const allergies = user?.allergies || [];
    const conditions = user?.chronicConditions || [];

    const InfoCard = ({ icon: Icon, title, value, color = "text-gray-900 dark:text-white", bgColor = "bg-gray-50 dark:bg-slate-800" }) => (
        <div className={`p-4 rounded-2xl ${bgColor} flex flex-col items-center justify-center text-center gap-2`}>
            <Icon className={`w-6 h-6 ${color}`} />
            <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
            <p className="font-bold text-gray-900 dark:text-white text-lg">{value || '-'}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-safe font-sans">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BackButton />
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('profile.medicalInfo', 'Medical Info')}</h1>
                </div>
                <button
                    onClick={() => setShowEditModal(true)}
                    className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                    <PencilSquareIcon className="w-5 h-5" />
                </button>
            </header>

            <main className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
                {/* Basic Stats Grid */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <InfoCard
                        icon={BeakerIcon}
                        title={t('profile.bloodGroup', 'Blood Type')}
                        value={user?.bloodGroup}
                        color="text-red-500"
                        bgColor="bg-red-50 dark:bg-red-900/20"
                    />
                    <InfoCard
                        icon={ScaleIcon}
                        title={t('profile.height', 'Height')}
                        value={user?.height ? `${user.height} cm` : null}
                        color="text-blue-500"
                        bgColor="bg-blue-50 dark:bg-blue-900/20"
                    />
                    <InfoCard
                        icon={ScaleIcon}
                        title={t('profile.weight', 'Weight')}
                        value={user?.weight ? `${user.weight} kg` : null}
                        color="text-emerald-500"
                        bgColor="bg-emerald-50 dark:bg-emerald-900/20"
                    />
                </div>

                {/* Allergies Section */}
                <GlassCard className="!p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                            <NoSymbolIcon className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{t('profile.allergies', 'Allergies')}</h3>
                            <p className="text-xs text-gray-500">{t('profile.allergiesDesc', "Substances you're allergic to")}</p>
                        </div>
                    </div>

                    {allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {allergies.map((allergy, index) => (
                                <span key={index} className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm font-medium border border-orange-100 dark:border-orange-900/30">
                                    {allergy}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">{t('profile.noAllergies', 'No allergies recorded')}</p>
                    )}
                </GlassCard>

                {/* Chronic Conditions Section */}
                <GlassCard className="!p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{t('profile.chronicConditions', 'Chronic Conditions')}</h3>
                            <p className="text-xs text-gray-500">{t('profile.conditionsDesc', 'Ongoing health conditions')}</p>
                        </div>
                    </div>

                    {conditions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {conditions.map((condition, index) => (
                                <span key={index} className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm font-medium border border-purple-100 dark:border-purple-900/30">
                                    {condition}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">{t('profile.noConditions', 'No chronic conditions recorded')}</p>
                    )}
                </GlassCard>

                {/* Disclaimer */}
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                    <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed text-center">
                        {t('profile.medicalDisclaimerText', 'This information allows our AI to provide safer medication recommendations and alert you about potential contraindications.')}
                    </p>
                </div>

            </main>

            <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={user}
                onUpdate={updateProfile}
                initialTab="medical"
            />
        </div>
    );
};

export default MedicalInfo;
