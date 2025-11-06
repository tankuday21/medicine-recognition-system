// Icon Button Component
// Specialized button for icon-only interactions with accessibility

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

/**
 * Icon Button Component
 * Specialized button for icon-only interactions
 */
const IconButton = forwardRef(({
  icon,
  'aria-label': ariaLabel,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}, ref) => {
  // Size-specific padding for square icon buttons
  const iconButtonClasses = {
    xs: 'p-1.5',
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
    xl: 'p-4'
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={`${iconButtonClasses[size]} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

IconButton.propTypes = {
  icon: PropTypes.node.isRequired,
  'aria-label': PropTypes.string.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'outline', 'danger', 'success', 'medical']),
  className: PropTypes.string
};

export default IconButton;