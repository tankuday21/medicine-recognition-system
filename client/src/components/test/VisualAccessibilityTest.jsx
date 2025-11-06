// Visual Accessibility Test Component
// Comprehensive testing of visual accessibility features

import React, { useState, useCallback } from 'react';
import {
  AccessibilitySettingsPanel,
  AccessibilityToolbar,
  StatusIndicator,
  ContrastChecker
} from '../accessibility/VisualAccessibility';
import { AccessibleButton, AccessibleTabs } from '../accessibility/AccessibleComponents';
import { 
  useHighContrastMode, 
  useFontScaling, 
  useColorBlindnessSupport,
  useColorContrast,
  useVisualAccessibilitySettings 
} from '../../hooks/useVisualAccessibility';
import { combineClasses } from '../../utils/design-system';

const VisualAccessibilityTest = () => {
  const [activeTab, setActiveTab] = useState('contrast');
  const [showSettings, setShowSettings] = useState(false);
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  // Accessibility hooks
  const highContrast = useHighContrastMode();
  const fontScaling = useFontScaling();
  const colorBlindness = useColorBlindnessSupport();
  const { validateContrast, getAccessibleTextColor } = useColorContrast();
  const settings = useVisualAccessibilitySettings();

  // Test data
  const colorCombinations = [
    { name: 'Primary on White', fg: '#0ea5e9', bg: '#ffffff' },
    { name: 'White on Primary', fg: '#ffffff', bg: '#0ea5e9' },
    { name: 'Success on Light', fg: '#047857', bg: '#d1fae5' },
    { name: 'Error on Light', fg: '#dc2626', bg: '#fee2e2' },
    { name: 'Warning on Light', fg: '#d97706', bg: '#fef3c7' },
    { name: 'Gray on White', fg: '#6b7280', bg: '#ffffff' },
    { name: 'Dark Gray on Light', fg: '#374151', bg: '#f9fafb' }
  ];

  const sampleTexts = [
    { size: 'text-sm', label: 'Small Text (14px)', content: 'This is small text for detailed information.' },
    { size: 'text-base', label: 'Normal Text (16px)', content: 'This is normal body text for general content.' },
    { size: 'text-lg', label: 'Large Text (18px)', content: 'This is large text for emphasis.' },
    { size: 'text-xl', label: 'Extra Large Text (20px)', content: 'This is extra large text for headings.' },
    { size: 'text-2xl', label: 'Heading Text (24px)', content: 'This is heading text for titles.' }
  ];

  const statusExamples = [
    { status: 'success', message: 'Operation completed successfully' },
    { status: 'warning', message: 'Please review your input' },
    { status: 'error', message: 'An error occurred during processing' },
    { status: 'info', message: 'Additional information available' }
  ];

  // Test functions
  const testColorCombination = useCallback((fg, bg) => {
    return validateContrast(fg, bg, { level: 'AA', size: 'normal' });
  }, [validateContrast]);

  const generateAccessibleColor = useCallback((bg) => {
    return getAccessibleTextColor(bg, { level: 'AA' });
  }, [getAccessibleTextColor]);

  // Tab content
  const tabs = [
    {
      id: 'contrast',
      label: 'Color Contrast',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Interactive Contrast Checker</h3>
            <ContrastChecker
              foreground={foregroundColor}
              background={backgroundColor}
              onForegroundChange={setForegroundColor}
              onBackgroundChange={setBackgroundColor}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Predefined Color Combinations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {colorCombinations.map((combo, index) => {
                const result = testColorCombination(combo.fg, combo.bg);
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{combo.name}</h4>
                    <div
                      className="p-3 rounded mb-2"
                      style={{ backgroundColor: combo.bg, color: combo.fg }}
                    >
                      Sample text with this color combination
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Contrast Ratio:</span>
                        <span className="font-mono">{result.contrastRatio}:1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>WCAG AA:</span>
                        <StatusIndicator status={result.meetsStandard ? 'success' : 'error'}>
                          {result.meetsStandard ? 'Pass' : 'Fail'}
                        </StatusIndicator>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Automatic Color Generation</h3>
            <p className="text-gray-600 text-sm">
              Test automatic generation of accessible text colors for different backgrounds.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'].map((bgColor, index) => {
                const textColor = generateAccessibleColor(bgColor);
                return (
                  <div key={index} className="text-center">
                    <div
                      className="p-4 rounded-lg mb-2"
                      style={{ backgroundColor: bgColor, color: textColor }}
                    >
                      <div className="font-medium">Sample</div>
                      <div className="text-sm">Text</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <div>BG: {bgColor}</div>
                      <div>Text: {textColor}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'scaling',
      label: 'Font Scaling',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Font Size Controls</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Current Font Size: {fontScaling.fontSize}%</span>
                <div className="flex space-x-2">
                  <AccessibleButton
                    onClick={fontScaling.decreaseFontSize}
                    disabled={!fontScaling.canDecrease}
                    size="sm"
                    variant="secondary"
                  >
                    A-
                  </AccessibleButton>
                  <AccessibleButton
                    onClick={fontScaling.resetFontSize}
                    size="sm"
                    variant="secondary"
                  >
                    Reset
                  </AccessibleButton>
                  <AccessibleButton
                    onClick={fontScaling.increaseFontSize}
                    disabled={!fontScaling.canIncrease}
                    size="sm"
                    variant="secondary"
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
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>75%</span>
                <span>100%</span>
                <span>125%</span>
                <span>150%</span>
                <span>200%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Text Size Examples</h3>
            <div className="space-y-4">
              {sampleTexts.map((text, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{text.label}</h4>
                    <span className="text-xs text-gray-500">{text.size}</span>
                  </div>
                  <p className={combineClasses(text.size, 'text-gray-700')}>
                    {text.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Responsive Text Behavior</h3>
            <p className="text-gray-600 text-sm">
              Text should remain readable and properly sized across different zoom levels and device sizes.
              Try zooming your browser to 200% to test scalability.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Zoom Test Area</h4>
              <p className="text-blue-800 text-sm mb-2">
                This area should remain usable when zoomed to 200%. All interactive elements 
                should maintain their functionality and readability.
              </p>
              <div className="flex space-x-2">
                <AccessibleButton size="sm">Button 1</AccessibleButton>
                <AccessibleButton size="sm" variant="secondary">Button 2</AccessibleButton>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'colorblind',
      label: 'Color Blindness',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Color Vision Simulation</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Current Mode: {colorBlindness.modes.find(m => m.value === colorBlindness.colorBlindMode)?.label}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {colorBlindness.modes.map((mode) => (
                  <label key={mode.value} className="flex items-center">
                    <input
                      type="radio"
                      name="colorBlindMode"
                      value={mode.value}
                      checked={colorBlindness.colorBlindMode === mode.value}
                      onChange={() => colorBlindness.setColorBlindnessMode(mode.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{mode.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Status Indicators</h3>
            <p className="text-gray-600 text-sm">
              Status indicators should be distinguishable by more than just color. 
              They use symbols and patterns to ensure accessibility.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Color Only (Not Accessible)</h4>
                <div className="space-y-2">
                  {statusExamples.map((example, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={combineClasses(
                        'w-4 h-4 rounded',
                        example.status === 'success' ? 'bg-green-500' :
                        example.status === 'warning' ? 'bg-yellow-500' :
                        example.status === 'error' ? 'bg-red-500' :
                        'bg-blue-500'
                      )} />
                      <span className="text-sm">{example.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Color + Symbols (Accessible)</h4>
                <div className="space-y-2">
                  {statusExamples.map((example, index) => (
                    <StatusIndicator key={index} status={example.status} showSymbol={true}>
                      {example.message}
                    </StatusIndicator>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Color Palette Test</h3>
            <p className="text-gray-600 text-sm">
              This color palette should remain distinguishable across different types of color blindness.
            </p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {[
                '#e53e3e', '#dd6b20', '#d69e2e', '#38a169',
                '#00b5d8', '#3182ce', '#805ad5', '#d53f8c'
              ].map((color, index) => (
                <div key={index} className="text-center">
                  <div
                    className="w-16 h-16 rounded-lg mb-1 border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                  <div className="text-xs text-gray-500">{color}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Pattern Examples</h3>
            <p className="text-gray-600 text-sm">
              Patterns can be used alongside colors to ensure information is accessible to color-blind users.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statusExamples.map((example, index) => (
                <StatusIndicator 
                  key={index} 
                  status={example.status} 
                  showSymbol={true} 
                  showPattern={true}
                  className="p-3 text-center"
                >
                  <div className="font-medium">{example.status}</div>
                  <div className="text-xs mt-1">With Pattern</div>
                </StatusIndicator>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      label: 'Settings Overview',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Settings</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">High Contrast Mode:</span>
                <StatusIndicator status={highContrast.isHighContrast ? 'success' : 'info'}>
                  {highContrast.isHighContrast ? 'Enabled' : 'Disabled'}
                </StatusIndicator>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Font Size:</span>
                <span className="text-sm text-gray-600">{fontScaling.fontSize}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Color Vision Mode:</span>
                <span className="text-sm text-gray-600">
                  {colorBlindness.modes.find(m => m.value === colorBlindness.colorBlindMode)?.label}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Animations:</span>
                <StatusIndicator status={settings.animationsEnabled ? 'success' : 'warning'}>
                  {settings.animationsEnabled ? 'Enabled' : 'Disabled'}
                </StatusIndicator>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <AccessibleButton
                onClick={highContrast.toggleHighContrast}
                variant="secondary"
                className="h-16 flex-col"
              >
                <span className="text-lg mb-1">◐</span>
                Toggle High Contrast
              </AccessibleButton>
              
              <AccessibleButton
                onClick={() => setShowSettings(true)}
                variant="secondary"
                className="h-16 flex-col"
              >
                <span className="text-lg mb-1">⚙</span>
                Open Settings Panel
              </AccessibleButton>
              
              <AccessibleButton
                onClick={settings.resetAllSettings}
                variant="secondary"
                className="h-16 flex-col"
              >
                <span className="text-lg mb-1">↺</span>
                Reset All Settings
              </AccessibleButton>
              
              <AccessibleButton
                onClick={settings.toggleAnimations}
                variant="secondary"
                className="h-16 flex-col"
              >
                <span className="text-lg mb-1">🎬</span>
                Toggle Animations
              </AccessibleButton>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Accessibility Guidelines</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">WCAG 2.1 AA Compliance</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Minimum 4.5:1 contrast ratio for normal text</li>
                <li>• Minimum 3:1 contrast ratio for large text</li>
                <li>• Text can be resized up to 200% without loss of functionality</li>
                <li>• Information is not conveyed by color alone</li>
                <li>• All functionality is available via keyboard</li>
                <li>• Focus indicators are clearly visible</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Visual Accessibility Testing
          </h1>
          <p className="text-gray-600 mb-6">
            Comprehensive testing of visual accessibility features including color contrast, 
            font scaling, high contrast mode, and color blindness support.
          </p>

          {/* Current Settings Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-medium text-blue-900 mb-2">Current Accessibility Settings</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700">High Contrast:</span>
                <span className="ml-1 font-medium">{highContrast.isHighContrast ? 'On' : 'Off'}</span>
              </div>
              <div>
                <span className="text-blue-700">Font Size:</span>
                <span className="ml-1 font-medium">{fontScaling.fontSize}%</span>
              </div>
              <div>
                <span className="text-blue-700">Color Mode:</span>
                <span className="ml-1 font-medium">
                  {colorBlindness.modes.find(m => m.value === colorBlindness.colorBlindMode)?.label.split(' ')[0]}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Animations:</span>
                <span className="ml-1 font-medium">{settings.animationsEnabled ? 'On' : 'Off'}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <AccessibleTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Accessibility Toolbar */}
      <AccessibilityToolbar position="bottom-right" />

      {/* Settings Panel */}
      <AccessibilitySettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default VisualAccessibilityTest;