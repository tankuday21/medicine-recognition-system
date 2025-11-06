// Premium Button Component
// Enhanced button system with icons, animations, and medical-specific variants

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { combineClasses, conditionalClasses } from '../../utils/design-system';

/**
 * Premium Button Component with Enhanced Features
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant ('primary', 'secondary', 'ghost', 'outline', 'danger', 'success', 'medical', 'floating')
 * @param {string} props.size - Button size ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.fullWidth - Full width button
 * @param {React.ReactNode} props.leftIcon - Icon on the left side
 * @param {React.ReactNode} props.rightIcon - Icon on the right side
 * @param {string} props.loadingText - Text to show when loading
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 */
const Button = forwardRef(({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon = null,
    rightIcon = null,
    loadingText = null,
    className = '',
    children,
    onClick,
    type = 'button',
    ...props
}, ref) => {
    // Base button classes with enhanced animations
    const baseClasses = 'btn-base group';

    // Enhanced variant classes with medical themes
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        outline: 'bg-transparent text-primary-600 border-2 border-primary-500 hover:bg-primary-50 active:bg-primary-100 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        danger: 'bg-red-500 text-white shadow-lg shadow-red-500/25 hover:bg-red-600 hover:shadow-xl hover:shadow-red-500/30 active:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        success: 'bg-green-500 text-white shadow-lg shadow-green-500/25 hover:bg-green-600 hover:shadow-xl hover:shadow-green-500/30 active:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
        medical: 'medical-gradient shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 active:shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        floating: 'btn-floating'
    };

    // Enhanced size classes with better touch targets
    const sizeClasses = {
        xs: 'text-xs px-2.5 py-1.5 min-h-[36px] gap-1',
        sm: 'text-sm px-3 py-2 min-h-[40px] gap-1.5',
        md: 'text-base px-4 py-2.5 min-h-[44px] gap-2',
        lg: 'text-lg px-6 py-3 min-h-[48px] gap-2.5',
        xl: 'text-xl px-8 py-4 min-h-[56px] gap-3'
    };

    // Icon size mapping
    const iconSizes = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-7 h-7'
    };

    // Conditional classes with enhanced states
    const conditionalClassNames = conditionalClasses({
        'w-full': fullWidth,
        'opacity-50 cursor-not-allowed': disabled || loading,
        'pointer-events-none': loading,
        'transform transition-all duration-200 ease-out': true,
        'hover:scale-[1.02] active:scale-[0.98]': !disabled && !loading && variant !== 'floating',
        'hover:scale-110 active:scale-95': !disabled && !loading && variant === 'floating',
    });

    // Combine all classes
    const buttonClasses = combineClasses(
        baseClasses,
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        conditionalClassNames,
        className
    );

    const handleClick = (e) => {
        if (disabled || loading) {
            e.preventDefault();
            return;
        }
        onClick?.(e);
    };

    // Loading spinner component
    const LoadingSpinner = () => (
        <div 
            className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSizes[size]}`}
            aria-hidden="true"
        />
    );

    // Content to display
    const buttonContent = loading && loadingText ? loadingText : children;

    return (
        <button
            ref={ref}
            type={type}
            className={buttonClasses}
            onClick={handleClick}
            disabled={disabled || loading}
            aria-disabled={disabled || loading}
            aria-busy={loading}
            {...props}
        >
            {/* Left Icon or Loading Spinner */}
            {loading ? (
                <LoadingSpinner />
            ) : leftIcon ? (
                <span className={`${iconSizes[size]} flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                    {leftIcon}
                </span>
            ) : null}

            {/* Button Text */}
            {buttonContent && (
                <span className="flex-1 text-center font-medium">
                    {buttonContent}
                </span>
            )}

            {/* Right Icon */}
            {!loading && rightIcon && (
                <span className={`${iconSizes[size]} flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                    {rightIcon}
                </span>
            )}
        </button>
    );
});

Button.displayName = 'Button';

Button.propTypes = {
    variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'outline', 'danger', 'success', 'medical', 'floating']),
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    fullWidth: PropTypes.bool,
    leftIcon: PropTypes.node,
    rightIcon: PropTypes.node,
    loadingText: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
    onClick: PropTypes.func,
    type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export default Button;