// Offline Status Indicator Components
// Visual indicators and graceful degradation for offline functionality

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';
import { offlineManager } from '../../services/offlineManager';
import { useNetworkInfo } from '../../hooks/usePerformance';

/**
 * Offline Status Banner
 * Shows connection status and sync progress
 */
export const OfflineStatusBanner = ({
    className = '',
    showWhenOnline = false,
    autoHide = true,
    ...props
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [status, setStatus] = useState(offlineManager.getStatus());
    const [syncProgress, setSyncProgress] = useState(null);
    const networkInfo = useNetworkInfo();

    useEffect(() => {
        const handleStatusChange = (event) => {
            setStatus(offlineManager.getStatus());

            if (event.type === 'offline') {
                setIsVisible(true);
            } else if (event.type === 'online' && autoHide) {
                setTimeout(() => setIsVisible(false), 3000);
            }

            if (event.type === 'sync-start') {
                setSyncProgress({ active: true, completed: 0, total: 0 });
            } else if (event.type === 'sync-complete') {
                setSyncProgress({ active: false, completed: event.data.length, total: event.data.length });
                setTimeout(() => setSyncProgress(null), 2000);
            }
        };

        offlineManager.addEventListener(handleStatusChange);

        // Show initially if offline or if showWhenOnline is true
        setIsVisible(!status.isOnline || showWhenOnline);

        return () => {
            offlineManager.removeEventListener(handleStatusChange);
        };
    }, [autoHide, showWhenOnline, status.isOnline]);

    const handleDismiss = useCallback(() => {
        setIsVisible(false);
    }, []);

    const handleRetry = useCallback(async () => {
        if (status.isOnline && status.pendingActions > 0) {
            try {
                await offlineManager.forcSync();
            } catch (error) {
                console.error('Manual sync failed:', error);
            }
        }
    }, [status]);

    if (!isVisible) return null;

    const getBannerColor = () => {
        if (!status.isOnline) return 'bg-red-500';
        if (status.pendingActions > 0) return 'bg-yellow-500';
        if (networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g') return 'bg-orange-500';
        return 'bg-green-500';
    };

    const getBannerMessage = () => {
        if (!status.isOnline) {
            return `You're offline. ${status.pendingActions} actions queued for sync.`;
        }
        if (syncProgress?.active) {
            return 'Syncing offline changes...';
        }
        if (status.pendingActions > 0) {
            return `${status.pendingActions} actions pending sync.`;
        }
        if (networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g') {
            return 'Slow connection detected. Some features may be limited.';
        }
        return 'Back online. All changes synced.';
    };

    return (
        <div
            className={combineClasses(
                'fixed top-0 left-0 right-0 z-50 transition-transform duration-300',
                getBannerColor(),
                className
            )}
            {...props}
        >
            <div className="flex items-center justify-between px-4 py-3 text-white">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        {!status.isOnline ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                            </svg>
                        ) : syncProgress?.active ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{getBannerMessage()}</p>
                        {networkInfo.saveData && (
                            <p className="text-xs opacity-90">Data saver mode active</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {status.isOnline && status.pendingActions > 0 && (
                        <button
                            onClick={handleRetry}
                            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors duration-200"
                        >
                            Sync Now
                        </button>
                    )}
                    <button
                        onClick={handleDismiss}
                        className="text-white/80 hover:text-white transition-colors duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {syncProgress?.active && (
                <div className="h-1 bg-white/20">
                    <div
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: '100%' }}
                    />
                </div>
            )}
        </div>
    );
};

/**
 * Connection Quality Indicator
 * Shows network connection quality
 */
export const ConnectionQualityIndicator = ({
    className = '',
    showLabel = false,
    ...props
}) => {
    const networkInfo = useNetworkInfo();
    const [status] = useState(offlineManager.getStatus());

    const getQualityInfo = () => {
        if (!status.isOnline) {
            return { level: 0, label: 'Offline', color: 'text-red-500' };
        }

        switch (networkInfo.effectiveType) {
            case '4g':
                return { level: 4, label: 'Excellent', color: 'text-green-500' };
            case '3g':
                return { level: 3, label: 'Good', color: 'text-blue-500' };
            case '2g':
                return { level: 2, label: 'Fair', color: 'text-yellow-500' };
            case 'slow-2g':
                return { level: 1, label: 'Poor', color: 'text-orange-500' };
            default:
                return { level: 3, label: 'Unknown', color: 'text-gray-500' };
        }
    };

    const quality = getQualityInfo();

    return (
        <div className={combineClasses('flex items-center space-x-2', className)} {...props}>
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4].map((bar) => (
                    <div
                        key={bar}
                        className={combineClasses(
                            'w-1 bg-current transition-colors duration-200',
                            bar <= quality.level ? quality.color : 'text-gray-300',
                            bar === 1 ? 'h-2' : bar === 2 ? 'h-3' : bar === 3 ? 'h-4' : 'h-5'
                        )}
                    />
                ))}
            </div>
            {showLabel && (
                <span className={combineClasses('text-sm font-medium', quality.color)}>
                    {quality.label}
                </span>
            )}
        </div>
    );
};

/**
 * Offline Mode Toggle
 * Allows users to manually enable offline mode for testing
 */
export const OfflineModeToggle = ({
    className = '',
    onToggle,
    ...props
}) => {
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    const handleToggle = useCallback(() => {
        const newMode = !isOfflineMode;
        setIsOfflineMode(newMode);

        // Simulate offline mode by intercepting network requests
        if (newMode) {
            // Override fetch to simulate offline
            window.originalFetch = window.fetch;
            window.fetch = () => Promise.reject(new Error('Simulated offline mode'));
        } else {
            // Restore original fetch
            if (window.originalFetch) {
                window.fetch = window.originalFetch;
                delete window.originalFetch;
            }
        }

        onToggle?.(newMode);
    }, [isOfflineMode, onToggle]);

    if (process.env.NODE_ENV !== 'development') {
        return null; // Only show in development
    }

    return (
        <div className={combineClasses('flex items-center space-x-2', className)} {...props}>
            <span className="text-sm text-gray-600">Offline Mode:</span>
            <button
                onClick={handleToggle}
                className={combineClasses(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                    isOfflineMode ? 'bg-red-500' : 'bg-gray-300'
                )}
            >
                <span
                    className={combineClasses(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                        isOfflineMode ? 'translate-x-6' : 'translate-x-1'
                    )}
                />
            </button>
            <span className={combineClasses(
                'text-sm font-medium',
                isOfflineMode ? 'text-red-600' : 'text-gray-600'
            )}>
                {isOfflineMode ? 'ON' : 'OFF'}
            </span>
        </div>
    );
};

/**
 * Sync Status Indicator
 * Shows pending sync actions and progress
 */
export const SyncStatusIndicator = ({
    className = '',
    detailed = false,
    ...props
}) => {
    const [status, setStatus] = useState(offlineManager.getStatus());
    const [lastSync, setLastSync] = useState(null);

    useEffect(() => {
        const handleStatusChange = (event) => {
            setStatus(offlineManager.getStatus());

            if (event.type === 'sync-complete') {
                setLastSync(new Date());
            }
        };

        offlineManager.addEventListener(handleStatusChange);
        return () => offlineManager.removeEventListener(handleStatusChange);
    }, []);

    if (status.pendingActions === 0 && !detailed) {
        return null;
    }

    return (
        <div className={combineClasses('flex items-center space-x-2 text-sm', className)} {...props}>
            {status.syncInProgress ? (
                <>
                    <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-blue-600">Syncing...</span>
                </>
            ) : status.pendingActions > 0 ? (
                <>
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-yellow-600">
                        {status.pendingActions} pending
                    </span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-600">Synced</span>
                </>
            )}

            {detailed && lastSync && (
                <span className="text-gray-500">
                    Last sync: {lastSync.toLocaleTimeString()}
                </span>
            )}
        </div>
    );
};

/**
 * Graceful Degradation Wrapper
 * Wraps components to provide offline fallbacks
 */
export const GracefulDegradation = ({
    children,
    fallback,
    offlineMessage = 'This feature is not available offline',
    requiresNetwork = true,
    className = '',
    ...props
}) => {
    const [status] = useState(offlineManager.getStatus());
    const networkInfo = useNetworkInfo();

    const shouldShowFallback = () => {
        if (!requiresNetwork) return false;
        if (!status.isOnline) return true;

        // Show fallback for very slow connections if specified
        if (networkInfo.saveData && networkInfo.effectiveType === 'slow-2g') {
            return true;
        }

        return false;
    };

    if (shouldShowFallback()) {
        if (fallback) {
            return <div className={className} {...props}>{fallback}</div>;
        }

        return (
            <div className={combineClasses('p-4 text-center text-gray-500 bg-gray-50 rounded-lg', className)} {...props}>
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                </svg>
                <p className="text-sm">{offlineMessage}</p>
            </div>
        );
    }

    return <div className={className} {...props}>{children}</div>;
};

// PropTypes
OfflineStatusBanner.propTypes = {
    className: PropTypes.string,
    showWhenOnline: PropTypes.bool,
    autoHide: PropTypes.bool
};

ConnectionQualityIndicator.propTypes = {
    className: PropTypes.string,
    showLabel: PropTypes.bool
};

OfflineModeToggle.propTypes = {
    className: PropTypes.string,
    onToggle: PropTypes.func
};

SyncStatusIndicator.propTypes = {
    className: PropTypes.string,
    detailed: PropTypes.bool
};

GracefulDegradation.propTypes = {
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node,
    offlineMessage: PropTypes.string,
    requiresNetwork: PropTypes.bool,
    className: PropTypes.string
};

export default {
    OfflineStatusBanner,
    ConnectionQualityIndicator,
    OfflineModeToggle,
    SyncStatusIndicator,
    GracefulDegradation
};