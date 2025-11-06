// Motor and Cognitive Accessibility Components
// Components for users with motor impairments and cognitive disabilities

import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';
import {
    useTouchTargets,
    useAlternativeInputs,
    useTimeoutManagement,
    useCognitiveAccessibility,
    useMotorImpairmentSupport,
    useMotorCognitiveAccessibility
} from '../../hooks/useMotorAccessibility';
import { AccessibleButton } from './AccessibleComponents';

/**
 * Touch Target Button
 * Button with configurable touch target sizes
 */
export const TouchTargetButton = ({
    children,
    onClick,
    className = '',
    variant = 'primary',
    disabled = false,
    ...props
}) => {
    const { getTargetSizeClasses } = useTouchTargets();
    const { createDelayedClick } = useMotorImpairmentSupport();
    const elementId = useRef(`btn-${Math.random().toString(36).substr(2, 9)}`);

    const handleClick = useCallback((e) => {
        if (disabled) return;
        createDelayedClick(() => onClick?.(e), elementId.current);
    }, [onClick, disabled, createDelayedClick]);

    const buttonClasses = combineClasses(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
        getTargetSizeClasses('px-4 py-2'),
        variant === 'primary' ? 'bg-primary-600 text-white hover:bg-primary-700' :
            variant === 'secondary' ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' :
                'bg-primary-600 text-white hover:bg-primary-700',
        disabled && 'opacity-50 cursor-not-allowed',
        className
    );

    return (
        <button
            className={buttonClasses}
            onClick={handleClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

/**
 * Alternative Input Gesture
 * Provides alternatives to gesture-based interactions
 */
export const AlternativeInputGesture = ({
    gestureType,
    onGesture,
    children,
    className = '',
    ...props
}) => {
    const { shouldShowAlternatives, getGestureAlternative } = useAlternativeInputs();
    const [showAlternatives, setShowAlternatives] = useState(false);

    const handleGesture = useCallback((e) => {
        onGesture?.(e);
    }, [onGesture]);

    const handleKeyDown = useCallback((e) => {
        // Provide keyboard alternatives for common gestures
        switch (gestureType) {
            case 'swipe':
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    handleGesture({ type: 'swipe', direction: e.key === 'ArrowLeft' ? 'left' : 'right' });
                }
                break;
            case 'pinch':
                if (e.key === '+' || e.key === '=' || e.key === '-') {
                    e.preventDefault();
                    handleGesture({ type: 'pinch', direction: e.key === '-' ? 'out' : 'in' });
                }
                break;
            case 'longPress':
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    handleGesture({ type: 'longPress' });
                }
                break;
        }
    }, [gestureType, handleGesture]);

    return (
        <div
            className={combineClasses('relative', className)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            {...props}
        >
            {children}

            {shouldShowAlternatives(gestureType) && (
                <div className="absolute top-0 right-0 z-10">
                    <button
                        onClick={() => setShowAlternatives(!showAlternatives)}
                        className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                        aria-label="Show gesture alternatives"
                    >
                        ?
                    </button>

                    {showAlternatives && (
                        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm max-w-xs">
                            <p className="font-medium text-gray-900 mb-1">Alternative:</p>
                            <p className="text-gray-600">{getGestureAlternative(gestureType)}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Timeout Warning Component
 * Shows timeout warnings and allows extensions
 */
export const TimeoutWarning = ({
    timeoutId,
    remainingTime,
    onExtend,
    onDismiss,
    className = '',
    ...props
}) => {
    const [timeLeft, setTimeLeft] = useState(remainingTime);

    useEffect(() => {
        setTimeLeft(remainingTime);

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [remainingTime]);

    const handleExtend = useCallback(() => {
        onExtend?.(timeoutId);
    }, [onExtend, timeoutId]);

    const handleDismiss = useCallback(() => {
        onDismiss?.(timeoutId);
    }, [onDismiss, timeoutId]);

    return (
        <div
            className={combineClasses(
                'fixed top-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-sm',
                className
            )}
            role="alert"
            aria-live="assertive"
            {...props}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>

                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-yellow-800">
                        Session Timeout Warning
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                        Your session will expire in {timeLeft} seconds due to inactivity.
                    </p>

                    <div className="mt-3 flex space-x-2">
                        <TouchTargetButton
                            onClick={handleExtend}
                            variant="primary"
                            className="text-xs bg-yellow-600 hover:bg-yellow-700"
                        >
                            Extend Session
                        </TouchTargetButton>
                        <TouchTargetButton
                            onClick={handleDismiss}
                            variant="secondary"
                            className="text-xs"
                        >
                            Dismiss
                        </TouchTargetButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Step-by-Step Guide Component
 * Provides guided step-by-step interactions
 */
export const StepByStepGuide = ({
    steps,
    currentStep,
    onStepChange,
    onComplete,
    className = '',
    ...props
}) => {
    const { getStepByStepGuidance } = useCognitiveAccessibility();
    const guidance = getStepByStepGuidance(steps, currentStep);

    const handleNext = useCallback(() => {
        if (guidance && !guidance.isLast) {
            onStepChange?.(currentStep + 1);
        } else {
            onComplete?.();
        }
    }, [guidance, currentStep, onStepChange, onComplete]);

    const handlePrevious = useCallback(() => {
        if (guidance && !guidance.isFirst) {
            onStepChange?.(currentStep - 1);
        }
    }, [guidance, currentStep, onStepChange]);

    if (!guidance) return null;

    return (
        <div className={combineClasses('bg-blue-50 border border-blue-200 rounded-lg p-4', className)} {...props}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-blue-900">
                    Step {guidance.currentStep} of {guidance.totalSteps}
                </h3>
                <div className="text-sm text-blue-700">
                    {Math.round(guidance.progress)}% Complete
                </div>
            </div>

            <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${guidance.progress}%` }}
                />
            </div>

            <div className="mb-4">
                <h4 className="font-medium text-blue-900 mb-2">
                    {guidance.currentStepData.title}
                </h4>
                <p className="text-blue-800 text-sm">
                    {guidance.currentStepData.description}
                </p>
            </div>

            <div className="flex justify-between">
                <TouchTargetButton
                    onClick={handlePrevious}
                    disabled={guidance.isFirst}
                    variant="secondary"
                    className="text-sm"
                >
                    Previous
                </TouchTargetButton>

                <TouchTargetButton
                    onClick={handleNext}
                    variant="primary"
                    className="text-sm"
                >
                    {guidance.isLast ? 'Complete' : 'Next'}
                </TouchTargetButton>
            </div>
        </div>
    );
};

/**
 * Confirmation Dialog Component
 * Provides confirmation for destructive actions
 */
export const ConfirmationDialog = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    destructive = false,
    className = '',
    ...props
}) => {
    const [countdown, setCountdown] = useState(destructive ? 3 : 0);
    const { cognitiveSettings } = useCognitiveAccessibility();

    useEffect(() => {
        if (isOpen && destructive && cognitiveSettings.confirmActions) {
            setCountdown(3);
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isOpen, destructive, cognitiveSettings.confirmActions]);

    const handleConfirm = useCallback(() => {
        if (countdown > 0) return;
        onConfirm?.();
    }, [countdown, onConfirm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div
                className={combineClasses(
                    'bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6',
                    className
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-title"
                {...props}
            >
                <div className="flex items-center mb-4">
                    {destructive && (
                        <div className="flex-shrink-0 mr-3">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    )}
                    <h3 id="confirmation-title" className="text-lg font-semibold text-gray-900">
                        {title}
                    </h3>
                </div>

                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                {destructive && countdown > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-red-800 text-sm">
                            Please wait {countdown} seconds before confirming this destructive action.
                        </p>
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <TouchTargetButton
                        onClick={onCancel}
                        variant="secondary"
                    >
                        {cancelText}
                    </TouchTargetButton>
                    <TouchTargetButton
                        onClick={handleConfirm}
                        disabled={countdown > 0}
                        variant={destructive ? 'danger' : 'primary'}
                        className={destructive ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                        {countdown > 0 ? `${confirmText} (${countdown})` : confirmText}
                    </TouchTargetButton>
                </div>
            </div>
        </div>
    );
};

/**
 * Motor Accessibility Settings Panel
 * Comprehensive settings for motor and cognitive accessibility
 */
export const MotorAccessibilitySettings = ({
    isOpen,
    onClose,
    className = '',
    ...props
}) => {
    const {
        touchTargets,
        alternativeInputs,
        timeoutManagement,
        cognitiveAccessibility,
        motorImpairmentSupport,
        exportSettings,
        importSettings,
        resetAllSettings
    } = useMotorCognitiveAccessibility();

    const [importData, setImportData] = useState('');

    const handleExport = useCallback(() => {
        const settings = exportSettings();
        const dataStr = JSON.stringify(settings, null, 2);
        navigator.clipboard?.writeText(dataStr);
        alert('Settings copied to clipboard');
    }, [exportSettings]);

    const handleImport = useCallback(() => {
        try {
            const settings = JSON.parse(importData);
            importSettings(settings);
            setImportData('');
            alert('Settings imported successfully');
        } catch (error) {
            alert('Invalid settings format');
        }
    }, [importData, importSettings]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div
                className={combineClasses(
                    'bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto',
                    className
                )}
                {...props}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Motor & Cognitive Accessibility
                    </h2>
                    <TouchTargetButton
                        onClick={onClose}
                        variant="secondary"
                        className="text-sm"
                    >
                        Close
                    </TouchTargetButton>
                </div>

                <div className="space-y-6">
                    {/* Touch Target Settings */}
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">Touch Target Size</h3>
                        <div className="space-y-2">
                            {touchTargets.sizes.map((size) => (
                                <label key={size.value} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="touchTargetSize"
                                        value={size.value}
                                        checked={touchTargets.touchTargetSize === size.value}
                                        onChange={() => touchTargets.setTargetSize(size.value)}
                                        className="mr-3"
                                    />
                                    <div>
                                        <span className="font-medium">{size.label}</span>
                                        <p className="text-sm text-gray-600">{size.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Alternative Input Methods */}
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">Input Methods</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Enable alternative input methods
                            </span>
                            <button
                                onClick={() => alternativeInputs.enableAlternativeInputs(!alternativeInputs.alternativeInputsEnabled)}
                                className={combineClasses(
                                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                    alternativeInputs.alternativeInputsEnabled ? 'bg-primary-600' : 'bg-gray-300'
                                )}
                            >
                                <span
                                    className={combineClasses(
                                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                        alternativeInputs.alternativeInputsEnabled ? 'translate-x-6' : 'translate-x-1'
                                    )}
                                />
                            </button>
                        </div>

                        {alternativeInputs.alternativeInputsEnabled && (
                            <div className="space-y-2 ml-4">
                                {alternativeInputs.inputMethods.map((method) => (
                                    <label key={method.value} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="inputMethod"
                                            value={method.value}
                                            checked={alternativeInputs.inputMethod === method.value}
                                            onChange={() => alternativeInputs.setPreferredInputMethod(method.value)}
                                            className="mr-2"
                                        />
                                        <div>
                                            <span className="text-sm font-medium">{method.label}</span>
                                            <p className="text-xs text-gray-600">{method.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Timeout Settings */}
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">Session Timeouts</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Enable session timeouts
                            </span>
                            <button
                                onClick={() => timeoutManagement.updateTimeoutSettings({
                                    enabled: !timeoutManagement.timeoutSettings.enabled
                                })}
                                className={combineClasses(
                                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                    timeoutManagement.timeoutSettings.enabled ? 'bg-primary-600' : 'bg-gray-300'
                                )}
                            >
                                <span
                                    className={combineClasses(
                                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                        timeoutManagement.timeoutSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                                    )}
                                />
                            </button>
                        </div>

                        {timeoutManagement.timeoutSettings.enabled && (
                            <div className="space-y-3 ml-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Warning Time (seconds)
                                    </label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="300"
                                        value={timeoutManagement.timeoutSettings.warningTime}
                                        onChange={(e) => timeoutManagement.updateTimeoutSettings({
                                            warningTime: parseInt(e.target.value)
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Timeout (seconds)
                                    </label>
                                    <input
                                        type="number"
                                        min="60"
                                        max="3600"
                                        value={timeoutManagement.timeoutSettings.totalTime}
                                        onChange={(e) => timeoutManagement.updateTimeoutSettings({
                                            totalTime: parseInt(e.target.value)
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cognitive Settings */}
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">Cognitive Assistance</h3>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={cognitiveAccessibility.cognitiveSettings.simplifiedInterface}
                                    onChange={(e) => cognitiveAccessibility.updateCognitiveSettings({
                                        simplifiedInterface: e.target.checked
                                    })}
                                    className="mr-2"
                                />
                                <span className="text-sm">Simplified Interface</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={cognitiveAccessibility.cognitiveSettings.enhancedFocus}
                                    onChange={(e) => cognitiveAccessibility.updateCognitiveSettings({
                                        enhancedFocus: e.target.checked
                                    })}
                                    className="mr-2"
                                />
                                <span className="text-sm">Enhanced Focus Indicators</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={cognitiveAccessibility.cognitiveSettings.stepByStep}
                                    onChange={(e) => cognitiveAccessibility.updateCognitiveSettings({
                                        stepByStep: e.target.checked
                                    })}
                                    className="mr-2"
                                />
                                <span className="text-sm">Step-by-Step Guidance</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={cognitiveAccessibility.cognitiveSettings.confirmActions}
                                    onChange={(e) => cognitiveAccessibility.updateCognitiveSettings({
                                        confirmActions: e.target.checked
                                    })}
                                    className="mr-2"
                                />
                                <span className="text-sm">Confirm Destructive Actions</span>
                            </label>
                        </div>
                    </div>

                    {/* Motor Impairment Settings */}
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">Motor Assistance</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Click Delay (ms)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="2000"
                                    step="100"
                                    value={motorImpairmentSupport.motorSettings.clickDelay}
                                    onChange={(e) => motorImpairmentSupport.updateMotorSettings({
                                        clickDelay: parseInt(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hover Delay (ms)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="2000"
                                    step="100"
                                    value={motorImpairmentSupport.motorSettings.hoverDelay}
                                    onChange={(e) => motorImpairmentSupport.updateMotorSettings({
                                        hoverDelay: parseInt(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Settings Management */}
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                        <h3 className="font-medium text-gray-900">Settings Management</h3>

                        <div className="flex space-x-2">
                            <TouchTargetButton
                                onClick={handleExport}
                                variant="secondary"
                                className="text-sm"
                            >
                                Export Settings
                            </TouchTargetButton>
                            <TouchTargetButton
                                onClick={resetAllSettings}
                                variant="secondary"
                                className="text-sm"
                            >
                                Reset All
                            </TouchTargetButton>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="import-motor-settings" className="block text-sm font-medium text-gray-700">
                                Import Settings
                            </label>
                            <textarea
                                id="import-motor-settings"
                                value={importData}
                                onChange={(e) => setImportData(e.target.value)}
                                placeholder="Paste exported settings JSON here..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <TouchTargetButton
                                onClick={handleImport}
                                disabled={!importData.trim()}
                                className="text-sm"
                            >
                                Import
                            </TouchTargetButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// PropTypes
TouchTargetButton.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    className: PropTypes.string,
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
    disabled: PropTypes.bool
};

AlternativeInputGesture.propTypes = {
    gestureType: PropTypes.oneOf(['swipe', 'pinch', 'longPress', 'drag', 'rotate']).isRequired,
    onGesture: PropTypes.func,
    children: PropTypes.node.isRequired,
    className: PropTypes.string
};

TimeoutWarning.propTypes = {
    timeoutId: PropTypes.string.isRequired,
    remainingTime: PropTypes.number.isRequired,
    onExtend: PropTypes.func,
    onDismiss: PropTypes.func,
    className: PropTypes.string
};

StepByStepGuide.propTypes = {
    steps: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired
    })).isRequired,
    currentStep: PropTypes.number.isRequired,
    onStepChange: PropTypes.func,
    onComplete: PropTypes.func,
    className: PropTypes.string
};

ConfirmationDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    destructive: PropTypes.bool,
    className: PropTypes.string
};

MotorAccessibilitySettings.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    className: PropTypes.string
};

export default {
    TouchTargetButton,
    AlternativeInputGesture,
    TimeoutWarning,
    StepByStepGuide,
    ConfirmationDialog,
    MotorAccessibilitySettings
};