// Accessible Components
// Enhanced components with comprehensive accessibility features

import React, { forwardRef, useId, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';
import { 
  useScreenReader, 
  useKeyboardNavigation, 
  useFocusManagement,
  useAriaAttributes 
} from '../../hooks/useAccessibility';

/**
 * Accessible Button Component
 * Enhanced button with full keyboard and screen reader support
 */
export const AccessibleButton = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  onClick,
  className = '',
  ...props
}, ref) => {
  const { announceAction } = useScreenReader();
  const buttonId = useId();
  const loadingId = useId();

  const handleClick = useCallback((e) => {
    if (disabled || loading) return;
    
    onClick?.(e);
    
    // Announce action to screen readers
    if (ariaLabel) {
      announceAction(`${ariaLabel} activated`);
    }
  }, [disabled, loading, onClick, ariaLabel, announceAction]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  }, [handleClick]);

  const ariaAttributes = useAriaAttributes({
    label: ariaLabel,
    describedBy: loading ? `${loadingId} ${ariaDescribedBy || ''}`.trim() : ariaDescribedBy,
    disabled: disabled || loading
  });

  const buttonClasses = combineClasses(
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    // Size variants
    size === 'sm' ? 'px-3 py-1.5 text-sm min-h-[32px]' :
    size === 'lg' ? 'px-6 py-3 text-lg min-h-[48px]' :
    'px-4 py-2 text-base min-h-[44px]', // Default md size with minimum touch target
    // Variant styles
    variant === 'primary' ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500' :
    variant === 'secondary' ? 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500' :
    variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' :
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    // Disabled state
    (disabled || loading) && 'opacity-50 cursor-not-allowed',
    className
  );

  return (
    <button
      ref={ref}
      id={buttonId}
      type="button"
      className={buttonClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      {...ariaAttributes}
      {...props}
    >
      {loading && (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span id={loadingId} className="sr-only">Loading</span>
        </>
      )}
      {children}
    </button>
  );
});

/**
 * Accessible Input Component
 * Enhanced input with proper labeling and validation
 */
export const AccessibleInput = forwardRef(({
  label,
  type = 'text',
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  className = '',
  ...props
}, ref) => {
  const inputId = useId();
  const errorId = useId();
  const helperId = useId();
  const { announceError } = useScreenReader();

  useEffect(() => {
    if (error) {
      announceError(error);
    }
  }, [error, announceError]);

  const ariaAttributes = useAriaAttributes({
    describedBy: [
      error ? errorId : null,
      helperText ? helperId : null
    ].filter(Boolean).join(' ') || undefined,
    required,
    invalid: !!error,
    disabled
  });

  const inputClasses = combineClasses(
    'block w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    error 
      ? 'border-red-500 bg-red-50' 
      : 'border-gray-300 bg-white hover:border-gray-400',
    disabled && 'bg-gray-100 cursor-not-allowed',
    className
  );

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className={combineClasses(
            'block text-sm font-medium',
            error ? 'text-red-700' : 'text-gray-700'
          )}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          )}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        {...ariaAttributes}
        {...props}
      />
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={helperId} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

/**
 * Accessible Modal Component
 * Modal with focus trapping and keyboard navigation
 */
export const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  ...props
}) => {
  const { containerRef } = useKeyboardNavigation({ 
    trapFocus: isOpen, 
    restoreFocus: true,
    autoFocus: true 
  });
  const { announceNavigation } = useScreenReader();
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      announceNavigation('Modal dialog opened', title);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, title, announceNavigation]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      
      <div
        ref={containerRef}
        className={combineClasses(
          'relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Accessible Dropdown Component
 * Dropdown with keyboard navigation and ARIA support
 */
export const AccessibleDropdown = ({
  trigger,
  children,
  isOpen,
  onToggle,
  className = '',
  ...props
}) => {
  const { containerRef, focusFirst } = useKeyboardNavigation({ 
    trapFocus: isOpen,
    restoreFocus: true 
  });
  const { focusedIndex, registerItem, handleKeyDown } = useFocusManagement();
  const { announceAction } = useScreenReader();
  const triggerId = useId();
  const menuId = useId();

  useEffect(() => {
    if (isOpen) {
      focusFirst();
      announceAction('Menu opened');
    }
  }, [isOpen, focusFirst, announceAction]);

  const handleTriggerClick = useCallback(() => {
    onToggle(!isOpen);
  }, [isOpen, onToggle]);

  const handleTriggerKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(true);
    }
    if (e.key === 'Escape') {
      onToggle(false);
    }
  }, [onToggle]);

  const handleMenuKeyDown = useCallback((e) => {
    handleKeyDown(e);
    if (e.key === 'Escape') {
      onToggle(false);
    }
  }, [handleKeyDown, onToggle]);

  return (
    <div className={combineClasses('relative', className)} {...props}>
      <div
        id={triggerId}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
      >
        {trigger}
      </div>
      
      {isOpen && (
        <div
          ref={containerRef}
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          onKeyDown={handleMenuKeyDown}
          className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-full"
        >
          {React.Children.map(children, (child, index) => 
            React.cloneElement(child, {
              ref: (el) => registerItem(el, index),
              role: 'menuitem',
              tabIndex: focusedIndex === index ? 0 : -1
            })
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Accessible Tab Component
 * Tab navigation with keyboard support
 */
export const AccessibleTabs = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  ...props
}) => {
  const { focusedIndex, registerItem, handleKeyDown } = useFocusManagement();
  const { announceNavigation } = useScreenReader();
  const tabListId = useId();

  const handleTabClick = useCallback((tabId, index) => {
    onTabChange(tabId);
    announceNavigation(`${tabs.find(t => t.id === tabId)?.label} tab`);
  }, [onTabChange, tabs, announceNavigation]);

  const handleTabKeyDown = useCallback((e, tabId, index) => {
    handleKeyDown(e);
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(tabId, index);
    }
  }, [handleKeyDown, handleTabClick]);

  return (
    <div className={combineClasses('space-y-4', className)} {...props}>
      <div
        role="tablist"
        aria-label="Tab navigation"
        className="flex border-b border-gray-200"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => registerItem(el, index)}
            role="tab"
            tabIndex={activeTab === tab.id ? 0 : -1}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => handleTabClick(tab.id, index)}
            onKeyDown={(e) => handleTabKeyDown(e, tab.id, index)}
            className={combineClasses(
              'px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
        >
          {activeTab === tab.id && tab.content}
        </div>
      ))}
    </div>
  );
};

/**
 * Accessible Alert Component
 * Alert with proper ARIA live regions
 */
export const AccessibleAlert = ({
  type = 'info',
  title,
  children,
  onDismiss,
  className = '',
  ...props
}) => {
  const { announceAction } = useScreenReader();
  const alertId = useId();

  useEffect(() => {
    if (title) {
      announceAction(`${type} alert: ${title}`);
    }
  }, [type, title, announceAction]);

  const handleDismiss = useCallback(() => {
    announceAction('Alert dismissed');
    onDismiss?.();
  }, [onDismiss, announceAction]);

  const alertClasses = combineClasses(
    'p-4 rounded-lg border',
    type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
    type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
    type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
    'bg-blue-50 border-blue-200 text-blue-800',
    className
  );

  const iconMap = {
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <div
      id={alertId}
      role="alert"
      aria-live="polite"
      className={alertClasses}
      {...props}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0" aria-hidden="true">
          {iconMap[type]}
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={handleDismiss}
              className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              aria-label="Dismiss alert"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// PropTypes
AccessibleButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string
};

AccessibleInput.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

AccessibleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

AccessibleDropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  className: PropTypes.string
};

AccessibleTabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired
  })).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

AccessibleAlert.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  onDismiss: PropTypes.func,
  className: PropTypes.string
};

export default {
  AccessibleButton,
  AccessibleInput,
  AccessibleModal,
  AccessibleDropdown,
  AccessibleTabs,
  AccessibleAlert
};