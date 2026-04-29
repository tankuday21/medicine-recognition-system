import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    ChatBubbleLeftRightIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import { BackButton } from '../components/ui/PremiumComponents';
import { useLanguage } from '../contexts/LanguageContext';

const Help = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = t('help.faqs', { returnObjects: true }) || [];

    const filteredFaqs = faqs.filter(faq =>
        faq.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-safe font-sans">
            <header className="bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
                <BackButton />
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('help.title')}</h1>
            </header>

            <main className="p-4 sm:p-6 max-w-2xl mx-auto">
                {/* Search */}
                <div className="relative mb-8">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('help.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                {/* Contact Support Cards */}
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{t('help.contactSupport')}</h2>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button className="p-4 bg-blue-500 rounded-2xl text-white text-left shadow-lg shadow-blue-500/25 active:scale-95 transition-transform">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 mb-3" />
                        <p className="font-bold text-lg">{t('help.liveChat')}</p>
                        <p className="text-blue-100 text-xs">{t('help.waitTime')}</p>
                    </button>
                    <button className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-left hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 transition-all">
                        <EnvelopeIcon className="w-6 h-6 mb-3 text-blue-500" />
                        <p className="font-bold text-lg text-gray-900 dark:text-white">{t('help.emailUs')}</p>
                        <p className="text-gray-500 text-xs">{t('help.responseTime')}</p>
                    </button>
                </div>

                {/* FAQ List */}
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{t('help.faqTitle')}</h2>
                <div className="space-y-3">
                    <AnimatePresence>
                        {filteredFaqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full p-4 flex items-center justify-between text-left"
                                >
                                    <span className="font-medium text-gray-900 dark:text-white pr-4">{faq.question}</span>
                                    <ChevronDownIcon
                                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                                    />
                                </button>
                                <motion.div
                                    initial={false}
                                    animate={{ height: openIndex === index ? 'auto' : 0 }}
                                    className="overflow-hidden"
                                >
                                    <p className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-slate-800/50 pt-3">
                                        {faq.answer}
                                    </p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filteredFaqs.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            {t('help.noResults', { query: searchQuery })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Help;
