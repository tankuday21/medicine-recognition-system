import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const RatingModal = ({ isOpen, onClose, onRate }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const handleRate = () => {
        onRate(rating);
        setSubmitted(true);
        setTimeout(() => {
            onClose();
            setSubmitted(false);
            setRating(0);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>

                    {!submitted ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <StarSolid className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Rate Mediot</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                How is your experience so far? Your feedback helps us improve.
                            </p>

                            <div className="flex justify-center gap-2 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        onClick={() => setRating(star)}
                                        className="p-1 transition-transform hover:scale-110 active:scale-95 duration-200"
                                    >
                                        {star <= (hoveredRating || rating) ? (
                                            <StarSolid className="w-8 h-8 text-amber-400 drop-shadow-sm" />
                                        ) : (
                                            <StarIcon className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleRate}
                                disabled={rating === 0}
                                className={`w-full py-3.5 rounded-xl font-bold text-white transition-all
                  ${rating > 0
                                        ? 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25'
                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'}
                `}
                            >
                                Submit Review
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <StarSolid className="w-10 h-10 text-emerald-500" />
                            </motion.div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                We appreciate your feedback.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RatingModal;
