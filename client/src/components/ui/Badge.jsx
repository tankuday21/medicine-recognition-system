// Badge Component
// Simple badge component for status indicators

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge Component
 */
const Badge = ({ 
  children, 
  variant = 'primary',
  size = 'sm',
  className = '',
  ...props 
}) => {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    secondary: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const classes = [
    'inline-flex items-center font-medium rounded-full border',
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.sm,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'secondary']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  className: PropTypes.string
};

export default Badge;