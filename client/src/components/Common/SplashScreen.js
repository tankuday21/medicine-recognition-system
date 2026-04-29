import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/solid';

const SplashScreen = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500); // Wait for exit animation
        }, 2000); // Show for 2 seconds

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white dark:bg-slate-950"
                >
                    <div className="relative">
                        {/* Pulsing Background */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
                        />

                        {/* Logo Animation Video (16:9 Ratio) */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative z-10 w-64 aspect-video bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 overflow-hidden border border-gray-100 dark:border-slate-800"
                        >
                            <video 
                                autoPlay 
                                muted 
                                playsInline 
                                loop
                                className="w-full h-full object-contain"
                            >
                                <source src="/videos/logo_animation.mp4" type="video/mp4" />
                            </video>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 text-center"
                    >
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Mediot
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                            Your AI Health Assistant
                        </p>
                    </motion.div>

                    {/* Loading Indicator */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 200 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        className="mt-8 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden"
                    >
                        <div className="h-full bg-blue-500" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
