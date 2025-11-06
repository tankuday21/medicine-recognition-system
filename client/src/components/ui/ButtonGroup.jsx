// Button Group Component
// Groups related buttons with proper spacing and visual connection

import React from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';

/**
 * Button Group Component
 * Groups related buttons with consistent spacing and styling
 */
const ButtonGroup = ({
  children,
  orientation = 'horizontal',
  size = 'md',
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  // Base classes for button group
  const baseClasses = 'inline-flex';
  
  // Orientation classes
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col'
  };
  
  // Spacing classes based on orientation
  const spacingClasses = {
    horizontal: 'space-x-0 divide-x divide-gray-200',
    vertical: 'space-y-0 divide-y divide-gray-200'
  };
  
  // Full width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const groupClasses = combineClasses(
    baseClasses,
    orientationClasses[orientation],
    spacingClasses[orientation],
    widthClasses,
    'rounded-lg overflow-hidden shadow-sm',
    className
  );
  
  // Clone children and modify their props for group styling
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;
    
    const isFirst = index === 0;
    const isLast = index === React.Children.count(children) - 1;
    const isMiddle = !isFirst && !isLast;
    
    // Remove border radius for middle buttons
    let childClassName = child.props.className || '';
    
    if (orientation === 'horizontal') {
      if (isFirst) {
        childClassName += ' rounded-r-none border-r-0';
      } else if (isLast) {
        childClassName += ' rounded-l-none border-l-0';
      } else if (isMiddle) {
        childClassName += ' rounded-none border-x-0';
      }
    } else {
      if (isFirst) {
        childClassName += ' rounded-b-none border-b-0';
      } else if (isLast) {
        childClassName += ' rounded-t-none border-t-0';
      } else if (isMiddle) {
        childClassName += ' rounded-none border-y-0';
      }
    }
    
    return React.cloneElement(child, {
      ...child.props,
      className: childClassName.trim(),
      size: child.props.size || size,
      variant: child.props.variant || variant,
      fullWidth: fullWidth && orientation === 'vertical'
    });
  });
  
  return (
    <div className={groupClasses} role="group" {...props}>
      {enhancedChildren}
    </div>
  );
};

ButtonGroup.propTypes = {
  children: PropTypes.node.isRequired,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'outline', 'danger', 'success', 'medical']),
  fullWidth: PropTypes.bool,
  className: PropTypes.string
};

export default ButtonGroup;