// Simple Performance Dashboard Component
// Basic performance monitoring dashboard

import React, { useState, useEffect } from 'react';

/**
 * Performance Dashboard Component
 */
export const PerformanceDashboard = ({
    isOpen = false,
    onClose
}) => {
    const [performanceData, setPerformanceData] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadPerformanceData();
        }
    }, [isOpen]);

    const loadPerformanceData = () => {
        // Simple performance data collection
        const data = {
            timestamp: Date.now(),
            url: window.location.href,
            metrics: {
                loadTime: performance.now(),
                memory: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize
                } : null
            }
        };
        setPerformanceData(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-5/6 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {performanceData ? (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Basic Metrics</h3>
                                <p className="text-sm text-gray-600">Load Time: {Math.round(performanceData.metrics.loadTime)}ms</p>
                                {performanceData.metrics.memory && (
                                    <p className="text-sm text-gray-600">
                                        Memory Used: {Math.round(performanceData.metrics.memory.used / 1024 / 1024)}MB
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-600">Loading performance data...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;