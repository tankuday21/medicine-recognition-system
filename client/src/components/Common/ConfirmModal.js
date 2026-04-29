import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, isDangerous = false }) => {
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden z-10"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>

                            <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
                                {title || t('common.confirmAction') || 'Confirm Action'}
                            </h3>

                            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                                {message || t('common.confirmMessage') || 'Are you sure you want to proceed?'}
                            </p>

                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {cancelText || t('common.cancel') || 'Cancel'}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors ${isDangerous
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {confirmText || t('common.confirm') || 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
