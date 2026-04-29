import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const CustomTimePicker = ({ label, value, onChange, error, required = false }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Initial state from value
    const [hours, setHours] = useState('08');
    const [minutes, setMinutes] = useState('00');

    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            setHours(h);
            setMinutes(m);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTimeSelect = (h, m) => {
        setHours(h);
        setMinutes(m);
        onChange(`${h}:${m}`);
    };

    const confirmSelection = () => {
        onChange(`${hours}:${minutes}`);
        setIsOpen(false);
    };

    const hoursList = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutesList = ['00', '15', '30', '45']; // Simplified steps, but input allows manual too

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label} {required && '*'}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3.5 border rounded-xl flex items-center justify-between bg-white dark:bg-slate-800 transition-all ${error ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                    }`}
            >
                <span className={`text-base font-mono ${value ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    {value || '--:--'}
                </span>
                <ClockIcon className="w-5 h-5 text-gray-400" />
            </button>

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-50 mt-2 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 w-full min-w-[200px]"
                    >
                        <div className="flex justify-center space-x-2 mb-4 h-64">
                            <div className="flex flex-col h-full overflow-y-auto no-scrollbar border-r border-gray-100 dark:border-slate-800 pr-2 py-2">
                                <span className="text-xs text-gray-400 text-center mb-2 sticky top-0 bg-white dark:bg-slate-900 z-10 py-1">Hrs</span>
                                {hoursList.map(h => (
                                    <button
                                        key={h}
                                        type="button"
                                        onClick={() => setHours(h)}
                                        className={`p-3 rounded-lg text-lg font-mono mb-1 shrink-0 ${hours === h
                                            ? 'bg-blue-600 text-white font-bold'
                                            : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        {h}
                                    </button>
                                ))}
                                <div className="h-20 shrink-0" /> {/* Spacer */}
                            </div>
                            <div className="flex flex-col h-full overflow-y-auto no-scrollbar pl-2 py-2">
                                <span className="text-xs text-gray-400 text-center mb-2 sticky top-0 bg-white dark:bg-slate-900 z-10 py-1">Min</span>
                                {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMinutes(m)}
                                        className={`p-3 rounded-lg text-lg font-mono mb-1 shrink-0 ${minutes === m
                                            ? 'bg-blue-600 text-white font-bold'
                                            : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                                <div className="h-20 shrink-0" /> {/* Spacer */}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={confirmSelection}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            {t('common.done') || 'Done'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomTimePicker;
