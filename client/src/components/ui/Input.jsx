// Premium Input Component
// Enhanced input fields with floating labels, validation, and medical theming

import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { combineClasses, conditionalClasses } from '../../utils/design-system';

/**
 * Premium Input Component
 * @param {Object} props - Component props
 * @param {string} props.variant - Input variant ('default', 'floating', 'filled', 'medical')
 * @param {string} props.size - Input size ('sm', 'md', 'lg')
 * @param {string} props.type - Input type
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.helperText - Helper text below input
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {React.ReactNode} props.leftIcon - Icon on the left
 * @param {React.ReactNode} props.rightIcon - Icon on the right
 * @param {Function} props.onRightIconClick - Right icon click handler
 * @param {string} props.className - Additional CSS classes
 */
const Input = forwardRef(({
  variant = 'default',
  size = 'md',
  type = 'text',
  label,
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  onRightIconClick = null,
  className = '',
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);

  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-2 min-h-[40px]',
    md: 'text-base px-4 py-3 min-h-[44px]',
    lg: 'text-lg px-5 py-4 min-h-[48px]'
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Base input classes
  const baseClasses = combineClasses(
    'w-full rounded-lg border transition-all duration-200 ease-out',
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
    floating: combineClasses(
      'bg-white border-gray-300 pt-6 pb-2',
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

  // Icon positioning
  const leftIconPadding = leftIcon ? (size === 'sm' ? 'pl-10' : size === 'md' ? 'pl-12' : 'pl-14') : '';
  const rightIconPadding = rightIcon ? (size === 'sm' ? 'pr-10' : size === 'md' ? 'pr-12' : 'pr-14') : '';

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
    setHasValue(!!e.target.value);
    onChange?.(e);
  };

  // Input classes
  const inputClasses = combineClasses(
    baseClasses,
    variantClasses[variant],
    leftIconPadding,
    rightIconPadding,
    className
  );

  // Label classes for floating variant
  const floatingLabelClasses = combineClasses(
    'absolute left-4 transition-all duration-200 ease-out pointer-events-none',
    'text-gray-500',
    (isFocused || hasValue) ? 'top-2 text-xs text-primary-600' : 'top-1/2 -translate-y-1/2 text-base',
    error ? 'text-red-500' : ''
  );

  return (
    <div className="relative">
      {/* Regular label for non-floating variants */}
      {label && variant !== 'floating' && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className={combineClasses(
            'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400',
            iconSizeClasses[size]
          )}>
            {leftIcon}
          </div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={variant === 'floating' ? ' ' : placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          style={{ fontSize: '16px' }} // Prevent zoom on iOS
          {...props}
        />

        {/* Floating label */}
        {label && variant === 'floating' && (
          <label className={floatingLabelClasses}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Right icon */}
        {rightIcon && (
          <div 
            className={combineClasses(
              'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400',
              iconSizeClasses[size],
              onRightIconClick ? 'cursor-pointer hover:text-gray-600' : ''
            )}
            onClick={onRightIconClick}
          >
            {rightIcon}
          </div>
        )}
      </div>

      {/* Helper text or error */}
      {(helperText || error) && (
        <p className={combineClasses(
          'mt-2 text-sm',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  variant: PropTypes.oneOf(['default', 'floating', 'filled', 'medical']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  onRightIconClick: PropTypes.func,
  className: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func
};

export default Input;