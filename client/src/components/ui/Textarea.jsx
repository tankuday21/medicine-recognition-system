// Premium Textarea Component
// Enhanced textarea with auto-resize, character count, and validation

import React, { forwardRef, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';

/**
 * Premium Textarea Component
 * @param {Object} props - Component props
 * @param {string} props.variant - Textarea variant ('default', 'filled', 'medical')
 * @param {string} props.size - Textarea size ('sm', 'md', 'lg')
 * @param {string} props.label - Textarea label
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.helperText - Helper text below textarea
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.autoResize - Auto-resize height
 * @param {number} props.minRows - Minimum rows
 * @param {number} props.maxRows - Maximum rows
 * @param {number} props.maxLength - Maximum character length
 * @param {boolean} props.showCharCount - Show character count
 * @param {string} props.className - Additional CSS classes
 */
const Textarea = forwardRef(({
  variant = 'default',
  size = 'md',
  label,
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  autoResize = false,
  minRows = 3,
  maxRows = 8,
  maxLength,
  showCharCount = false,
  className = '',
  value = '',
  onChange,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const combinedRef = ref || textareaRef;

  // Auto-resize functionality
  useEffect(() => {
    if (autoResize && combinedRef.current) {
      const textarea = combinedRef.current;
      textarea.style.height = 'auto';
      
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;
      
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      
      textarea.style.height = `${newHeight}px`;
    }
  }, [value, autoResize, minRows, maxRows, combinedRef]);

  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-3',
    lg: 'text-lg px-5 py-4'
  };

  // Base textarea classes
  const baseClasses = combineClasses(
    'w-full rounded-lg border transition-all duration-200 ease-out resize-none',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[size]
  );

  // Variant classes
  const variantClasses = {
    default: combineClasses(
      'bg-white border-gray-300',
      'focus:border-primary-500 focus:ring-primary-500/20',
      error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
    ),
    filled: combineClasses(
      'bg-gray-50 border-gray-200',
      'focus:bg-white focus:border-primary-500 focus:ring-primary-500/20',
      error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
    ),
    medical: combineClasses(
      'bg-gradient-to-r from-primary-50/30 to-white border-primary-200',
      'focus:border-primary-500 focus:ring-primary-500/20 focus:bg-white',
      error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
    )
  };

  // Handle focus
  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  // Handle blur
  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Handle change
  const handleChange = (e) => {
    if (maxLength && e.target.value.length > maxLength) {
      return;
    }
    onChange?.(e);
  };

  // Textarea classes
  const textareaClasses = combineClasses(
    baseClasses,
    variantClasses[variant],
    className
  );

  // Character count
  const charCount = value.length;
  const isNearLimit = maxLength && charCount > maxLength * 0.8;
  const isOverLimit = maxLength && charCount > maxLength;

  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Textarea */}
      <textarea
        ref={combinedRef}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={autoResize ? minRows : undefined}
        maxLength={maxLength}
        className={textareaClasses}
        style={{ 
          fontSize: '16px', // Prevent zoom on iOS
          overflow: autoResize ? 'hidden' : 'auto'
        }}
        {...props}
      />

      {/* Footer with helper text and character count */}
      <div className="flex justify-between items-start mt-2">
        <div className="flex-1">
          {(helperText || error) && (
            <p className={combineClasses(
              'text-sm',
              error ? 'text-red-600' : 'text-gray-500'
            )}>
              {error || helperText}
            </p>
          )}
        </div>
        
        {(showCharCount || maxLength) && (
          <div className={combineClasses(
            'text-sm ml-4 flex-shrink-0',
            isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-500'
          )}>
            {maxLength ? `${charCount}/${maxLength}` : charCount}
          </div>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  variant: PropTypes.oneOf(['default', 'filled', 'medical']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  autoResize: PropTypes.bool,
  minRows: PropTypes.number,
  maxRows: PropTypes.number,
  maxLength: PropTypes.number,
  showCharCount: PropTypes.bool,
  className: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func
};

export default Textarea;