// Visual Accessibility Components
// Components for managing visual accessibility features

import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';
import { 
  useHighContrastMode, 
  useFontScaling, 
  useColorBlindnessSupport,
  useVisualAccessibilitySettings 
} from '../../hooks/useVisualAccessibility';
import { AccessibleButton } from './AccessibleComponents';

/**
 * Accessibility Settings Panel
 * Centralized panel for all visual accessibility settings
 */
export const AccessibilitySettingsPanel = ({ 
  isOpen, 
  onClose, 
  className = '',
  ...props 
}) => {
  const {
    highContrast,
    fontScaling,
    colorBlindness,
    animationsEnabled,
    toggleAnimations,
    resetAllSettings,
    exportSettings,
    importSettings
  } = useVisualAccessibilitySettings();

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
          'bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Accessibility Settings
          </h2>
          <AccessibleButton
            onClick={onClose}
            variant="secondary"
            size="sm"
            ariaLabel="Close accessibility settings"
          >
            ×
          </AccessibleButton>
        </div>

        <div className="space-y-6">
          {/* High Contrast Mode */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">High Contrast Mode</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Increase contrast for better visibility
              </span>
              <button
                onClick={highContrast.toggleHighContrast}
                className={combineClasses(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  highContrast.isHighContrast ? 'bg-primary-600' : 'bg-gray-300'
                )}
                aria-label={`High contrast mode ${highContrast.isHighContrast ? 'enabled' : 'disabled'}`}
              >
                <span
                  className={combineClasses(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    highContrast.isHighContrast ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Font Size Scaling */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Font Size</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Current size: {fontScaling.fontSize}%
                </span>
                <div className="flex space-x-2">
                  <AccessibleButton
                    onClick={fontScaling.decreaseFontSize}
                    disabled={!fontScaling.canDecrease}
                    size="sm"
                    variant="secondary"
                    ariaLabel="Decrease font size"
                  >
                    A-
                  </AccessibleButton>
                  <AccessibleButton
                    onClick={fontScaling.resetFontSize}
                    size="sm"
                    variant="secondary"
                    ariaLabel="Reset font size to default"
                  >
                    Reset
                  </AccessibleButton>
                  <AccessibleButton
                    onClick={fontScaling.increaseFontSize}
                    disabled={!fontScaling.canIncrease}
                    size="sm"
                    variant="secondary"
                    ariaLabel="Increase font size"
                  >
                    A+
                  </AccessibleButton>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((fontScaling.fontSize - 75) / 125) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>75%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>
          </div>

          {/* Color Blindness Support */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Color Vision</h3>
            <div className="space-y-2">
              {colorBlindness.modes.map((mode) => (
                <label key={mode.value} className="flex items-center">
                  <input
                    type="radio"
                    name="colorBlindMode"
                    value={mode.value}
                    checked={colorBlindness.colorBlindMode === mode.value}
                    onChange={() => colorBlindness.setColorBlindnessMode(mode.value)}
                    className="mr-2 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{mode.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Animation Settings */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Animations</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Enable animations and transitions
              </span>
              <button
                onClick={toggleAnimations}
                className={combineClasses(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  animationsEnabled ? 'bg-primary-600' : 'bg-gray-300'
                )}
                aria-label={`Animations ${animationsEnabled ? 'enabled' : 'disabled'}`}
              >
                <span
                  className={combineClasses(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Settings Management */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900">Settings Management</h3>
            
            <div className="flex space-x-2">
              <AccessibleButton
                onClick={handleExport}
                size="sm"
                variant="secondary"
                ariaLabel="Export accessibility settings"
              >
                Export Settings
              </AccessibleButton>
              <AccessibleButton
                onClick={resetAllSettings}
                size="sm"
                variant="secondary"
                ariaLabel="Reset all accessibility settings to default"
              >
                Reset All
              </AccessibleButton>
            </div>

            <div className="space-y-2">
              <label htmlFor="import-settings" className="block text-sm font-medium text-gray-700">
                Import Settings
              </label>
              <textarea
                id="import-settings"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste exported settings JSON here..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <AccessibleButton
                onClick={handleImport}
                disabled={!importData.trim()}
                size="sm"
                ariaLabel="Import accessibility settings from JSON"
              >
                Import
              </AccessibleButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Accessibility Toolbar
 * Quick access toolbar for common accessibility features
 */
export const AccessibilityToolbar = ({ 
  className = '',
  position = 'bottom-right',
  ...props 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { fontScaling, highContrast } = useVisualAccessibilitySettings();

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <>
      <div 
        className={combineClasses(
          'fixed z-40 flex flex-col items-end space-y-2',
          positionClasses[position],
          className
        )}
        {...props}
      >
        {/* Expanded Controls */}
        {isExpanded && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-1">
            <AccessibleButton
              onClick={fontScaling.increaseFontSize}
              disabled={!fontScaling.canIncrease}
              size="sm"
              variant="secondary"
              ariaLabel="Increase font size"
              className="w-full justify-start"
            >
              <span className="mr-2">A+</span>
              Larger Text
            </AccessibleButton>
            
            <AccessibleButton
              onClick={fontScaling.decreaseFontSize}
              disabled={!fontScaling.canDecrease}
              size="sm"
              variant="secondary"
              ariaLabel="Decrease font size"
              className="w-full justify-start"
            >
              <span className="mr-2">A-</span>
              Smaller Text
            </AccessibleButton>
            
            <AccessibleButton
              onClick={highContrast.toggleHighContrast}
              size="sm"
              variant="secondary"
              ariaLabel={`${highContrast.isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
              className="w-full justify-start"
            >
              <span className="mr-2">◐</span>
              {highContrast.isHighContrast ? 'Normal' : 'High'} Contrast
            </AccessibleButton>
            
            <AccessibleButton
              onClick={() => setShowSettings(true)}
              size="sm"
              variant="secondary"
              ariaLabel="Open accessibility settings"
              className="w-full justify-start"
            >
              <span className="mr-2">⚙</span>
              More Settings
            </AccessibleButton>
          </div>
        )}

        {/* Toggle Button */}
        <AccessibleButton
          onClick={() => setIsExpanded(!isExpanded)}
          className={combineClasses(
            'rounded-full w-12 h-12 shadow-lg',
            isExpanded ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
          )}
          ariaLabel={`${isExpanded ? 'Close' : 'Open'} accessibility toolbar`}
        >
          <span className="text-xl" aria-hidden="true">
            {isExpanded ? '×' : '♿'}
          </span>
        </AccessibleButton>
      </div>

      {/* Settings Panel */}
      <AccessibilitySettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

/**
 * Status Indicator Component
 * Color-blind friendly status indicators with patterns and symbols
 */
export const StatusIndicator = ({ 
  status = 'info', 
  children, 
  showSymbol = true,
  showPattern = false,
  className = '',
  ...props 
}) => {
  const { getStatusIndicators, getSymbolForStatus } = useColorBlindnessSupport();
  const statusColors = getStatusIndicators();
  const statusConfig = statusColors[status] || statusColors.info;

  const patternId = `pattern-${status}`;

  return (
    <div
      className={combineClasses(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        className
      )}
      style={{
        color: statusConfig.color,
        backgroundColor: statusConfig.backgroundColor,
        backgroundImage: showPattern ? `url(#${patternId})` : undefined
      }}
      {...props}
    >
      {/* SVG Patterns for color-blind users */}
      {showPattern && (
        <svg width="0" height="0" className="absolute">
          <defs>
            <pattern id={patternId} patternUnits="userSpaceOnUse" width="4" height="4">
              {statusConfig.pattern === 'diagonal-stripes' && (
                <path d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2" stroke={statusConfig.color} strokeWidth="1" />
              )}
              {statusConfig.pattern === 'dots' && (
                <circle cx="2" cy="2" r="1" fill={statusConfig.color} />
              )}
              {statusConfig.pattern === 'horizontal-stripes' && (
                <path d="M 0,2 l 4,0" stroke={statusConfig.color} strokeWidth="1" />
              )}
            </pattern>
          </defs>
        </svg>
      )}
      
      {showSymbol && (
        <span className="mr-1" aria-hidden="true">
          {getSymbolForStatus(status)}
        </span>
      )}
      
      {children}
    </div>
  );
};

/**
 * Contrast Checker Component
 * Visual tool for checking color contrast ratios
 */
export const ContrastChecker = ({ 
  foreground = '#000000',
  background = '#ffffff',
  onForegroundChange,
  onBackgroundChange,
  className = '',
  ...props 
}) => {
  const [localForeground, setLocalForeground] = useState(foreground);
  const [localBackground, setLocalBackground] = useState(background);

  const handleForegroundChange = useCallback((color) => {
    setLocalForeground(color);
    onForegroundChange?.(color);
  }, [onForegroundChange]);

  const handleBackgroundChange = useCallback((color) => {
    setLocalBackground(color);
    onBackgroundChange?.(color);
  }, [onBackgroundChange]);

  // Calculate contrast ratio
  const contrastRatio = useMemo(() => {
    const { getContrastRatio } = require('../../utils/colorAccessibility');
    return getContrastRatio(localForeground, localBackground);
  }, [localForeground, localBackground]);

  const meetsAA = contrastRatio >= 4.5;
  const meetsAAA = contrastRatio >= 7.0;
  const meetsAALarge = contrastRatio >= 3.0;

  return (
    <div className={combineClasses('space-y-4', className)} {...props}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foreground Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={localForeground}
              onChange={(e) => handleForegroundChange(e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={localForeground}
              onChange={(e) => handleForegroundChange(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              placeholder="#000000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Background Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={localBackground}
              onChange={(e) => handleBackgroundChange(e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={localBackground}
              onChange={(e) => handleBackgroundChange(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div
        className="p-4 rounded-lg border-2 border-gray-300"
        style={{ 
          backgroundColor: localBackground,
          color: localForeground
        }}
      >
        <h3 className="text-lg font-semibold mb-2">Sample Text</h3>
        <p className="text-sm">
          This is how your text will look with the selected colors. 
          The contrast ratio should be at least 4.5:1 for normal text 
          and 3:1 for large text to meet WCAG AA standards.
        </p>
      </div>

      {/* Results */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Contrast Analysis</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Contrast Ratio:</span>
            <span className="font-mono font-medium">{contrastRatio.toFixed(2)}:1</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">WCAG AA (Normal):</span>
              <StatusIndicator status={meetsAA ? 'success' : 'error'}>
                {meetsAA ? 'Pass' : 'Fail'}
              </StatusIndicator>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">WCAG AA (Large):</span>
              <StatusIndicator status={meetsAALarge ? 'success' : 'error'}>
                {meetsAALarge ? 'Pass' : 'Fail'}
              </StatusIndicator>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">WCAG AAA:</span>
              <StatusIndicator status={meetsAAA ? 'success' : 'error'}>
                {meetsAAA ? 'Pass' : 'Fail'}
              </StatusIndicator>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes
AccessibilitySettingsPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string
};

AccessibilityToolbar.propTypes = {
  className: PropTypes.string,
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right'])
};

StatusIndicator.propTypes = {
  status: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
  children: PropTypes.node.isRequired,
  showSymbol: PropTypes.bool,
  showPattern: PropTypes.bool,
  className: PropTypes.string
};

ContrastChecker.propTypes = {
  foreground: PropTypes.string,
  background: PropTypes.string,
  onForegroundChange: PropTypes.func,
  onBackgroundChange: PropTypes.func,
  className: PropTypes.string
};

export default {
  AccessibilitySettingsPanel,
  AccessibilityToolbar,
  StatusIndicator,
  ContrastChecker
};