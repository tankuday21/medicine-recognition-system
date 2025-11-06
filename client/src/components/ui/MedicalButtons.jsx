// Medical-Specific Button Components
// Specialized buttons for medical application use cases

import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import IconButton from './IconButton';

/**
 * Emergency Button Component
 * Red emergency button with special styling and haptic feedback
 */
export const EmergencyButton = ({ children, className = '', ...props }) => {
  const handleEmergencyClick = (e) => {
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    
    props.onClick?.(e);
  };

  return (
    <Button
      variant="danger"
      size="lg"
      className={`
        bg-red-600 hover:bg-red-700 active:bg-red-800
        shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40
        border-2 border-red-500 hover:border-red-600
        font-bold text-white
        animate-pulse hover:animate-none
        ${className}
      `}
      onClick={handleEmergencyClick}
      {...props}
    >
      {children}
    </Button>
  );
};

/**
 * Scan Button Component
 * Primary action button for scanning functionality
 */
export const ScanButton = ({ 
  children = 'Scan', 
  leftIcon,
  className = '',
  ...props 
}) => {
  return (
    <Button
      variant="medical"
      size="lg"
      leftIcon={leftIcon || (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12v4m6-4h2M6 12H4m6 8h.01M12 20h4.01M12 20H7.99" />
        </svg>
      )}
      className={`
        relative overflow-hidden
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
        before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
        ${className}
      `}
      {...props}
    >
      {children}
    </Button>
  );
};

/**
 * Health Status Button Component
 * Button with health status indicator colors
 */
export const HealthStatusButton = ({ 
  status = 'normal', 
  children, 
  className = '',
  ...props 
}) => {
  const statusVariants = {
    critical: 'danger',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/25',
    normal: 'success',
    good: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'
  };

  const statusIcons = {
    critical: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    normal: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    good: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <Button
      variant={typeof statusVariants[status] === 'string' ? statusVariants[status] : 'primary'}
      leftIcon={statusIcons[status]}
      className={`
        ${typeof statusVariants[status] === 'object' ? statusVariants[status] : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </Button>
  );
};

/**
 * Medication Reminder Button Component
 * Button for medication-related actions with pill icon
 */
export const MedicationButton = ({ 
  children, 
  taken = false,
  className = '',
  ...props 
}) => {
  const pillIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );

  return (
    <Button
      variant={taken ? 'success' : 'outline'}
      leftIcon={pillIcon}
      className={`
        ${taken ? 'bg-green-500 text-white' : 'text-primary-600 border-primary-500'}
        transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {children}
    </Button>
  );
};

/**
 * Report Upload Button Component
 * Button for uploading medical reports with upload icon
 */
export const ReportUploadButton = ({ 
  children = 'Upload Report', 
  className = '',
  ...props 
}) => {
  const uploadIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );

  return (
    <Button
      variant="outline"
      leftIcon={uploadIcon}
      className={`
        border-dashed border-2 hover:border-solid
        hover:bg-primary-50 hover:border-primary-500
        transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {children}
    </Button>
  );
};

/**
 * AI Chat Button Component
 * Button for AI assistant interactions
 */
export const AIChatButton = ({ 
  children = 'Ask AI', 
  className = '',
  ...props 
}) => {
  const aiIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );

  return (
    <Button
      variant="medical"
      leftIcon={aiIcon}
      className={`
        bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600
        shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30
        ${className}
      `}
      {...props}
    >
      {children}
    </Button>
  );
};

// PropTypes for all components
EmergencyButton.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func
};

ScanButton.propTypes = {
  children: PropTypes.node,
  leftIcon: PropTypes.node,
  className: PropTypes.string
};

HealthStatusButton.propTypes = {
  status: PropTypes.oneOf(['critical', 'warning', 'normal', 'good']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

MedicationButton.propTypes = {
  children: PropTypes.node.isRequired,
  taken: PropTypes.bool,
  className: PropTypes.string
};

ReportUploadButton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

AIChatButton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};