import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const CustomDatePicker = ({ label, value, onChange, minDate, error, required = false }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef(null);

    // Parse value to date object
    const selectedDate = value ? new Date(value) : null;

    useEffect(() => {
        if (selectedDate) {
            setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
        }
    }, [isOpen]); // Reset to selected date when opening

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handleDateClick = (day) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        // Adjust for timezone offset to ensure YYYY-MM-DD string is correct
        const offset = newDate.getTimezoneOffset();
        const adjustedDate = new Date(newDate.getTime() - (offset * 60 * 1000));
        onChange(adjustedDate.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const renderCalendar = () => {
        const totalDays = daysInMonth(currentMonth);
        const startDay = firstDayOfMonth(currentMonth);
        const days = [];

        // Empty cells for days before start of month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        // Days of the month
        for (let i = 1; i <= totalDays; i++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
            const dateString = date.toISOString().split('T')[0];
            const isSelected = value === dateString;
            const isToday = new Date().toISOString().split('T')[0] === dateString;

            // Check if disabled (before minDate)
            let isDisabled = false;
            if (minDate) {
                const min = new Date(minDate);
                min.setHours(0, 0, 0, 0);
                date.setHours(0, 0, 0, 0);
                if (date < min) isDisabled = true;
            }

            days.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => !isDisabled && handleDateClick(i)}
                    disabled={isDisabled}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors
                        ${isSelected ? 'bg-blue-600 text-white font-bold' : ''}
                        ${!isSelected && isToday ? 'border border-blue-600 text-blue-600 font-bold' : ''}
                        ${!isSelected && !isToday && !isDisabled ? 'hover:bg-gray-100 text-gray-700 dark:text-gray-300' : ''}
                        ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    {i}
                </button>
            );
        }

        return days;
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label} {required && '*'}
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3.5 border rounded-xl flex items-center justify-between bg-white dark:bg-slate-800 transition-all ${error ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                    }`}
            >
                <span className={`text-base ${value ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    {value ? formatDate(value) : (t('common.selectDate') || 'Select Date')}
                </span>
                <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
            </button>

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-[60] sm:hidden bg-black/20 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="
                                fixed sm:absolute z-[70] 
                                bottom-0 sm:bottom-auto sm:top-full 
                                left-0 sm:left-auto sm:mt-2 
                                w-full sm:w-[320px] 
                                p-4 
                                bg-white dark:bg-slate-900 
                                rounded-t-2xl sm:rounded-2xl 
                                shadow-2xl sm:shadow-xl 
                                border-t sm:border border-gray-100 dark:border-slate-800
                            "
                        >
                            <div className="flex sm:hidden justify-center mb-2">
                                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <button type="button" onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                                    <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </span>
                                <button type="button" onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                                    <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                    <div key={i} className="h-8 flex items-center justify-center text-xs font-medium text-gray-400">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {renderCalendar()}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomDatePicker;
