// Premium Select Component
// Enhanced select dropdown with search, multi-select, and custom styling

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { combineClasses, conditionalClasses } from '../../utils/design-system';

/**
 * Premium Select Component
 * @param {Object} props - Component props
 * @param {string} props.variant - Select variant ('default', 'filled', 'medical')
 * @param {string} props.size - Select size ('sm', 'md', 'lg')
 * @param {string} props.label - Select label
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.helperText - Helper text below select
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.searchable - Enable search functionality
 * @param {boolean} props.multiple - Enable multi-select
 * @param {Array} props.options - Select options
 * @param {string|Array} props.value - Selected value(s)
 * @param {Function} props.onChange - Change handler
 * @param {string} props.className - Additional CSS classes
 */
const Select = forwardRef(({
  variant = 'default',
  size = 'md',
  label,
  placeholder = 'Select an option...',
  helperText,
  error,
  required = false,
  disabled = false,
  searchable = false,
  multiple = false,
  options = [],
  value,
  onChange,
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-2 min-h-[40px]',
    md: 'text-base px-4 py-3 min-h-[44px]',
    lg: 'text-lg px-5 py-4 min-h-[48px]'
  };

  // Base select classes
  const baseClasses = combineClasses(
    'w-full rounded-lg border transition-all duration-200 ease-out cursor-pointer',
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

  // Get display value
  const getDisplayValue = () => {
    if (!value) return placeholder;
    
    if (multiple) {
      if (Array.isArray(value) && value.length > 0) {
        if (value.length === 1) {
          const option = options.find(opt => opt.value === value[0]);
          return option ? option.label : '';
        }
        return `${value.length} items selected`;
      }
      return placeholder;
    } else {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : placeholder;
    }
  };

  // Handle option selection
  const handleOptionSelect = (optionValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0) {
          handleOptionSelect(filteredOptions[focusedIndex].value);
        }
        e.preventDefault();
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        e.preventDefault();
        break;
      case 'ArrowUp':
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        e.preventDefault();
        break;
    }
  };

  // Select classes
  const selectClasses = combineClasses(
    baseClasses,
    variantClasses[variant],
    className
  );

  return (
    <div className="relative" ref={selectRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select trigger */}
      <div
        className={selectClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className={combineClasses(
            'truncate',
            !value ? 'text-gray-500' : 'text-gray-900'
          )}>
            {getDisplayValue()}
          </span>
          
          <svg
            className={combineClasses(
              'w-5 h-5 text-gray-400 transition-transform duration-200',
              isOpen ? 'rotate-180' : ''
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {/* Search input */}
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                style={{ fontSize: '16px' }} // Prevent zoom on iOS
              />
            </div>
          )}

          {/* Options */}
          <div role="listbox">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = multiple
                  ? Array.isArray(value) && value.includes(option.value)
                  : value === option.value;
                const isFocused = index === focusedIndex;

                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    className={combineClasses(
                      'px-4 py-3 cursor-pointer transition-colors duration-150',
                      'hover:bg-primary-50 focus:bg-primary-50',
                      isFocused ? 'bg-primary-50' : '',
                      isSelected ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                    )}
                    onClick={() => handleOptionSelect(option.value)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{option.label}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

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

Select.displayName = 'Select';

Select.propTypes = {
  variant: PropTypes.oneOf(['default', 'filled', 'medical']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  searchable: PropTypes.bool,
  multiple: PropTypes.bool,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired
  })).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array
  ]),
  onChange: PropTypes.func,
  className: PropTypes.string
};

export default Select;