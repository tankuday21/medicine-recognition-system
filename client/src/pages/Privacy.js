import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { BackButton } from '../components/ui/PremiumComponents';

const Privacy = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const Section = ({ title, children }) => (
        <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
            <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed space-y-4">
                {children}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-safe font-sans">
            <header className="bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
                <BackButton />
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('privacy.title')}</h1>
            </header>

            <main className="p-4 sm:p-6 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldCheckIcon className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-sm text-gray-500">{t('privacy.lastUpdated')}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <Section title={t('privacy.introTitle')}>
                        <p>
                            {t('privacy.introContent')}
                        </p>
                    </Section>

                    <Section title={t('privacy.collectTitle')}>
                        <p>
                            <strong>{t('privacy.personalInfoTitle')}:</strong> {t('privacy.personalInfoContent')}
                        </p>
                        <p>
                            <strong>{t('privacy.healthDataTitle')}:</strong> {t('privacy.healthDataContent')}
                        </p>
                    </Section>

                    <Section title={t('privacy.useTitle')}>
                        <p>
                            {t('privacy.useContent')}
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>{t('privacy.useItem1')}</li>
                            <li>{t('privacy.useItem2')}</li>
                            <li>{t('privacy.useItem3')}</li>
                            <li>{t('privacy.useItem4')}</li>
                            <li>{t('privacy.useItem5')}</li>
                        </ul>
                    </Section>

                    <Section title={t('privacy.securityTitle')}>
                        <p>
                            {t('privacy.securityContent')}
                        </p>
                    </Section>

                    <Section title={t('privacy.contactTitle')}>
                        <p>
                            {t('privacy.contactContent')}
                        </p>
                    </Section>
                </div>
            </main>
        </div>
    );
};

export default Privacy;
