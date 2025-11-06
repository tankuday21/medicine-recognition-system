// Premium Radio Component
// Enhanced radio button with animations and medical theming

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';

/**
 * Premium Radio Component
 * @param {Object} props - Component props
 * @param {string} props.size - Radio size ('sm', 'md', 'lg')
 * @param {string} props.variant - Radio variant ('default', 'medical')
 * @param {string} props.label - Radio label
 * @param {string} props.description - Optional description text
 * @param {boolean} props.checked - Checked state
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.error - Error message
 * @param {Function} props.onChange - Change handler
 * @param {string} props.className - Additional CSS classes
 */
const Radio = forwardRef(({
  size = 'md',
  variant = 'default',
  label,
  description,
  checked = false,
  disabled = false,
  error,
  onChange,
  className = '',
  ...props
}, ref) => {
  // Size classes
  const sizeClasses = {
    sm: {
      radio: 'w-4 h-4',
      text: 'text-sm',
      dot: 'w-2 h-2'
    },
    md: {
      radio: 'w-5 h-5',
      text: 'text-base',
      dot: 'w-2.5 h-2.5'
    },
    lg: {
      radio: 'w-6 h-6',
      text: 'text-lg',
      dot: 'w-3 h-3'
    }
  };

  // Variant classes
  const variantClasses = {
    default: {
      radio: combineClasses(
        'border-gray-300 text-primary-600',
        'focus:ring-primary-500 focus:ring-offset-0',
        checked ? 'border-primary-600' : '',
        error ? 'border-red-500 focus:ring-red-500' : ''
      ),
      dot: checked ? 'bg-primary-600' : 'bg-transparent',
      label: 'text-gray-900'
    },
    medical: {
      radio: combineClasses(
        'border-primary-300 text-primary-600',
        'focus:ring-primary-500 focus:ring-offset-0',
        checked ? 'border-primary-600' : '',
        error ? 'border-red-500 focus:ring-red-500' : ''
      ),
      dot: checked ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-transparent',
      label: 'text-gray-900'
    }
  };

  // Base radio classes
  const radioClasses = combineClasses(
    'rounded-full border-2 transition-all duration-200 ease-out cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'bg-white',
    sizeClasses[size].radio,
    variantClasses[variant].radio
  );

  // Handle change
  const handleChange = (e) => {
    if (!disabled) {
      onChange?.(e.target.checked, e);
    }
  };

  return (
    <div className={combineClasses('flex items-start gap-3', className)}>
      {/* Radio input */}
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          ref={ref}
          type="radio"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        
        {/* Custom radio button */}
        <div className={radioClasses}>
          {/* Inner dot */}
          <div className={combineClasses(
            'absolute inset-0 flex items-center justify-center',
            'transition-all duration-200 ease-out'
          )}>
            <div className={combineClasses(
              'rounded-full transition-all duration-200 ease-out',
              sizeClasses[size].dot,
              variantClasses[variant].dot,
              checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            )} />
          </div>
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

Radio.displayName = 'Radio';

Radio.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'medical']),
  label: PropTypes.string,
  description: PropTypes.string,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string
};

/**
 * Radio Group Component
 * Groups radio buttons together
 */
export const RadioGroup = ({
  children,
  value,
  onChange,
  name,
  label,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <fieldset className={combineClasses('space-y-3', className)} {...props}>
      {label && (
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
      )}
      
      <div className="space-y-3">
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              name,
              checked: child.props.value === value,
              onChange: (checked, e) => {
                if (checked) {
                  onChange?.(child.props.value, e);
                }
              }
            });
          }
          return child;
        })}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
};

RadioGroup.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string
};

export default Radio;