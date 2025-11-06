// Premium Card Component
// Enhanced card system with animations, variants, and mobile-first design

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { combineClasses, conditionalClasses } from '../../utils/design-system';

/**
 * Enhanced Premium Card Component
 * @param {Object} props - Component props
 * @param {string} props.variant - Card variant ('elevated', 'interactive', 'medical', 'outline', 'glass', 'gradient', 'compact')
 * @param {string} props.size - Card size ('sm', 'md', 'lg')
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.hoverable - Enable hover effects
 * @param {boolean} props.pressable - Enable press effects
 * @param {string} props.borderAccent - Border accent color ('primary', 'success', 'warning', 'danger')
 * @param {React.ReactNode} props.icon - Optional icon in header
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Card content
 * @param {Function} props.onClick - Click handler (for interactive cards)
 */
const Card = forwardRef(({
  variant = 'elevated',
  size = 'md',
  loading = false,
  hoverable = false,
  pressable = false,
  borderAccent = null,
  icon = null,
  className = '',
  children,
  onClick,
  ...props
}, ref) => {
  // Base card classes with enhanced animations
  const baseClasses = 'card-base group';
  
  // Enhanced variant classes
  const variantClasses = {
    elevated: 'card-elevated',
    interactive: 'card-interactive',
    medical: 'card-medical',
    outline: 'bg-white border-2 border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200',
    glass: 'glass backdrop-blur-md border border-white/20 shadow-xl',
    gradient: 'bg-gradient-to-br from-primary-50 via-white to-secondary-50 border border-primary-100 shadow-lg',
    compact: 'bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200'
  };

  // Size classes for different card sizes
  const sizeClasses = {
    sm: 'p-4 sm:p-5',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  // Border accent classes
  const borderAccentClasses = {
    primary: 'border-l-4 border-l-primary-500',
    success: 'border-l-4 border-l-green-500',
    warning: 'border-l-4 border-l-yellow-500',
    danger: 'border-l-4 border-l-red-500'
  };
  
  // Conditional classes with enhanced interactions
  const conditionalClassNames = conditionalClasses({
    'cursor-pointer': onClick && !loading,
    'relative': loading || icon,
    'hover:scale-[1.02] transition-transform duration-200': hoverable && !loading,
    'active:scale-[0.98]': pressable && !loading,
    'transform-gpu': hoverable || pressable, // Use GPU acceleration
  });
  
  // Combine all classes
  const cardClasses = combineClasses(
    baseClasses,
    'w-full',
    variantClasses[variant] || variantClasses.elevated,
    borderAccent ? borderAccentClasses[borderAccent] : '',
    conditionalClassNames,
    className
  );
  
  const handleClick = (e) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };
  
  const CardElement = onClick ? 'button' : 'div';
  
  return (
    <CardElement
      ref={ref}
      className={cardClasses}
      onClick={handleClick}
      {...props}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
          <div className="loading-spinner" />
        </div>
      )}

      {/* Icon overlay for medical/status cards */}
      {icon && (
        <div className="absolute top-4 right-4 text-primary-500 opacity-20 group-hover:opacity-30 transition-opacity duration-200">
          <div className="w-8 h-8">
            {icon}
          </div>
        </div>
      )}

      {/* Card content */}
      <div className={`relative z-10 ${sizeClasses[size]}`}>
        {children}
      </div>
    </CardElement>
  );
});

/**
 * Enhanced Card Header Component
 */
export const CardHeader = ({ 
  className = '', 
  children, 
  icon = null,
  action = null,
  ...props 
}) => (
  <div className={combineClasses('flex items-start justify-between mb-4', className)} {...props}>
    <div className="flex items-start gap-3 flex-1">
      {icon && (
        <div className="flex-shrink-0 w-6 h-6 text-primary-500 mt-0.5">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
    {action && (
      <div className="flex-shrink-0 ml-4">
        {action}
      </div>
    )}
  </div>
);

/**
 * Enhanced Card Body Component
 */
export const CardBody = ({ 
  className = '', 
  children, 
  padding = 'normal',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    normal: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={combineClasses(paddingClasses[padding], className)} {...props}>
      {children}
    </div>
  );
};

/**
 * Enhanced Card Footer Component
 */
export const CardFooter = ({ 
  className = '', 
  children, 
  divided = true,
  ...props 
}) => (
  <div className={combineClasses(
    'mt-4 pt-4',
    divided ? 'border-t border-gray-100' : '',
    className
  )} {...props}>
    {children}
  </div>
);

/**
 * Enhanced Card Title Component
 */
export const CardTitle = ({ 
  className = '', 
  children, 
  size = 'md',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'text-base font-semibold',
    md: 'text-lg font-semibold',
    lg: 'text-xl font-bold'
  };

  return (
    <h3 className={combineClasses(
      sizeClasses[size],
      'text-secondary-900 leading-tight',
      className
    )} {...props}>
      {children}
    </h3>
  );
};

/**
 * Enhanced Card Description Component
 */
export const CardDescription = ({ 
  className = '', 
  children, 
  size = 'sm',
  ...props 
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base'
  };

  return (
    <p className={combineClasses(
      sizeClasses[size],
      'text-secondary-600 mt-1 leading-relaxed',
      className
    )} {...props}>
      {children}
    </p>
  );
};

/**
 * Card Image Component
 */
export const CardImage = ({ 
  src, 
  alt, 
  className = '', 
  aspectRatio = 'video',
  objectFit = 'cover',
  ...props 
}) => {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[21/9]'
  };

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill'
  };

  return (
    <div className={combineClasses(
      'overflow-hidden rounded-lg',
      aspectRatioClasses[aspectRatio],
      className
    )}>
      <img
        src={src}
        alt={alt}
        className={combineClasses(
          'w-full h-full transition-transform duration-300 group-hover:scale-105',
          objectFitClasses[objectFit]
        )}
        {...props}
      />
    </div>
  );
};

/**
 * Card Badge Component
 */
export const CardBadge = ({ 
  children, 
  variant = 'primary',
  size = 'sm',
  className = '',
  ...props 
}) => {
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    secondary: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={combineClasses(
      'inline-flex items-center font-medium rounded-full border',
      variantClasses[variant],
      sizeClasses[size],
      className
    )} {...props}>
      {children}
    </span>
  );
};

/**
 * Card Actions Component
 */
export const CardActions = ({ 
  children, 
  className = '',
  alignment = 'right',
  ...props 
}) => {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={combineClasses(
      'flex items-center gap-2',
      alignmentClasses[alignment],
      className
    )} {...props}>
      {children}
    </div>
  );
};

Card.displayName = 'Card';

Card.propTypes = {
  variant: PropTypes.oneOf(['elevated', 'interactive', 'medical', 'outline', 'glass', 'gradient', 'compact']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  hoverable: PropTypes.bool,
  pressable: PropTypes.bool,
  borderAccent: PropTypes.oneOf(['primary', 'success', 'warning', 'danger']),
  icon: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func
};

CardHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  icon: PropTypes.node,
  action: PropTypes.node
};

CardBody.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  padding: PropTypes.oneOf(['none', 'sm', 'normal', 'lg'])
};

CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  divided: PropTypes.bool
};

CardTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

CardDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md'])
};

CardImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  aspectRatio: PropTypes.oneOf(['square', 'video', 'portrait', 'wide']),
  objectFit: PropTypes.oneOf(['cover', 'contain', 'fill'])
};

CardBadge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'secondary']),
  size: PropTypes.oneOf(['xs', 'sm', 'md']),
  className: PropTypes.string
};

CardActions.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  alignment: PropTypes.oneOf(['left', 'center', 'right', 'between'])
};

export default Card;