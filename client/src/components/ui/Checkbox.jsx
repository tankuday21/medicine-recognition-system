// Premium Checkbox Component
// Enhanced checkbox with animations and medical theming

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';

/**
 * Premium Checkbox Component
 * @param {Object} props - Component props
 * @param {string} props.size - Checkbox size ('sm', 'md', 'lg')
 * @param {string} props.variant - Checkbox variant ('default', 'medical')
 * @param {string} props.label - Checkbox label
 * @param {string} props.description - Optional description text
 * @param {boolean} props.checked - Checked state
 * @param {boolean} props.indeterminate - Indeterminate state
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.error - Error message
 * @param {Function} props.onChange - Change handler
 * @param {string} props.className - Additional CSS classes
 */
const Checkbox = forwardRef(({
  size = 'md',
  variant = 'default',
  label,
  description,
  checked = false,
  indeterminate = false,
  disabled = false,
  error,
  onChange,
  className = '',
  ...props
}, ref) => {
  // Size classes
  const sizeClasses = {
    sm: {
      checkbox: 'w-4 h-4',
      text: 'text-sm',
      icon: 'w-3 h-3'
    },
    md: {
      checkbox: 'w-5 h-5',
      text: 'text-base',
      icon: 'w-4 h-4'
    },
    lg: {
      checkbox: 'w-6 h-6',
      text: 'text-lg',
      icon: 'w-5 h-5'
    }
  };

  // Variant classes
  const variantClasses = {
    default: {
      checkbox: combineClasses(
        'border-gray-300 text-primary-600',
        'focus:ring-primary-500 focus:ring-offset-0',
        checked || indeterminate ? 'bg-primary-600 border-primary-600' : 'bg-white',
        error ? 'border-red-500 focus:ring-red-500' : ''
      ),
      label: 'text-gray-900'
    },
    medical: {
      checkbox: combineClasses(
        'border-primary-300 text-white',
        'focus:ring-primary-500 focus:ring-offset-0',
        checked || indeterminate ? 'bg-gradient-to-r from-primary-500 to-primary-600 border-primary-600' : 'bg-white',
        error ? 'border-red-500 focus:ring-red-500' : ''
      ),
      label: 'text-gray-900'
    }
  };

  // Base checkbox classes
  const checkboxClasses = combineClasses(
    'rounded border-2 transition-all duration-200 ease-out cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[size].checkbox,
    variantClasses[variant].checkbox
  );

  // Handle change
  const handleChange = (e) => {
    if (!disabled) {
      onChange?.(e.target.checked, e);
    }
  };

  return (
    <div className={combineClasses('flex items-start gap-3', className)}>
      {/* Checkbox input */}
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={combineClasses(checkboxClasses, 'peer')}
          {...props}
        />
        
        {/* Custom checkbox indicator */}
        <div className={combineClasses(
          'absolute inset-0 flex items-center justify-center pointer-events-none',
          'text-white transition-all duration-200 ease-out',
          checked || indeterminate ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        )}>
          {indeterminate ? (
            <svg className={sizeClasses[size].icon} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className={sizeClasses[size].icon} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Label and description */}
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label className={combineClasses(
              'block font-medium cursor-pointer',
              sizeClasses[size].text,
              variantClasses[variant].label,
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            )}>
              {label}
            </label>
          )}
          
          {description && (
            <p className={combineClasses(
              'mt-1 text-gray-500',
              size === 'sm' ? 'text-xs' : 'text-sm',
              disabled ? 'opacity-50' : ''
            )}>
              {description}
            </p>
          )}
          
          {error && (
            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'medical']),
  label: PropTypes.string,
  description: PropTypes.string,
  checked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string
};

export default Checkbox;