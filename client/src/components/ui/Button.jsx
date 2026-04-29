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

    // Enhanced variant classes with medical themes and dark mode
    const variantClasses = {
        primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/35 active:shadow-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
        secondary: 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 border-2 border-primary-500 dark:border-primary-600 shadow-md hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:shadow-lg active:bg-primary-100 dark:active:bg-primary-900/50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
        ghost: 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
        outline: 'bg-transparent text-primary-600 dark:text-primary-400 border-2 border-primary-500 dark:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 active:bg-primary-100 dark:active:bg-primary-900/50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
        danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 active:shadow-md focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
        success: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 active:shadow-md focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
        medical: 'bg-gradient-to-r from-primary-600 via-primary-500 to-cyan-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 active:shadow-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
        floating: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-full shadow-2xl shadow-primary-500/40 hover:shadow-2xl hover:shadow-primary-500/50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900'
    };

    // Enhanced size classes with better touch targets - responsive
    const sizeClasses = {
        xs: 'text-xs px-2.5 py-1.5 min-h-[32px] sm:min-h-[36px] gap-1 rounded-lg',
        sm: 'text-sm px-3 py-2 min-h-[36px] sm:min-h-[40px] gap-1.5 rounded-lg',
        md: 'text-sm sm:text-base px-4 py-2.5 min-h-[44px] sm:min-h-[48px] gap-2 rounded-xl',
        lg: 'text-base sm:text-lg px-5 sm:px-6 py-3 min-h-[48px] sm:min-h-[52px] gap-2.5 rounded-xl',
        xl: 'text-lg sm:text-xl px-6 sm:px-8 py-3.5 sm:py-4 min-h-[52px] sm:min-h-[56px] gap-3 rounded-2xl'
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