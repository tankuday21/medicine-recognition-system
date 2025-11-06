// Layout Components
// Responsive layout components for mobile-first design

import React from 'react';
import PropTypes from 'prop-types';
import { combineClasses, conditionalClasses } from '../../utils/design-system';

/**
 * Container Component
 * Responsive container with mobile-first padding and max-width
 */
export const Container = ({
  children,
  size = 'lg',
  padding = true,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = padding ? 'px-4 sm:px-6 lg:px-8' : '';

  return (
    <div
      className={combineClasses(
        'w-full mx-auto',
        sizeClasses[size],
        paddingClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Grid Component
 * Responsive CSS Grid with mobile-first breakpoints
 */
export const Grid = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className = '',
  ...props
}) => {
  // Convert cols object to responsive classes
  const colsClasses = Object.entries(cols)
    .map(([breakpoint, colCount]) => {
      if (breakpoint === 'xs') {
        return `grid-cols-${colCount}`;
      }
      return `${breakpoint}:grid-cols-${colCount}`;
    })
    .join(' ');

  const gapClass = `gap-${gap}`;

  return (
    <div
      className={combineClasses(
        'grid',
        colsClasses,
        gapClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Stack Component
 * Vertical stack layout with consistent spacing
 */
export const Stack = ({
  children,
  spacing = 4,
  align = 'stretch',
  className = '',
  ...props
}) => {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const spacingClass = `space-y-${spacing}`;

  return (
    <div
      className={combineClasses(
        'flex flex-col',
        alignClasses[align],
        spacingClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Flex Component
 * Flexible layout component with common flex patterns
 */
export const Flex = ({
  children,
  direction = 'row',
  align = 'center',
  justify = 'start',
  wrap = false,
  gap = 0,
  className = '',
  ...props
}) => {
  const directionClasses = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    col: 'flex-col',
    'col-reverse': 'flex-col-reverse'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const gapClass = gap > 0 ? `gap-${gap}` : '';
  const wrapClass = wrap ? 'flex-wrap' : '';

  return (
    <div
      className={combineClasses(
        'flex',
        directionClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        wrapClass,
        gapClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Section Component
 * Page section with consistent spacing and optional background
 */
export const Section = ({
  children,
  background = 'transparent',
  padding = 'normal',
  className = '',
  ...props
}) => {
  const backgroundClasses = {
    transparent: '',
    white: 'bg-white',
    gray: 'bg-gray-50',
    primary: 'bg-primary-50',
    medical: 'medical-gradient-light'
  };

  const paddingClasses = {
    none: '',
    sm: 'py-8',
    normal: 'py-12',
    lg: 'py-16',
    xl: 'py-20'
  };

  return (
    <section
      className={combineClasses(
        backgroundClasses[background],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
};

/**
 * Card Grid Component
 * Specialized grid for card layouts with responsive behavior
 */
export const CardGrid = ({
  children,
  minCardWidth = '280px',
  gap = 6,
  className = '',
  ...props
}) => {
  return (
    <div
      className={combineClasses(
        'grid gap-6',
        `grid-cols-[repeat(auto-fit,minmax(${minCardWidth},1fr))]`,
        className
      )}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}, 1fr))`,
        gap: `${gap * 0.25}rem`
      }}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Masonry Grid Component
 * Pinterest-style masonry layout for cards of varying heights
 */
export const MasonryGrid = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className = '',
  ...props
}) => {
  // Convert columns object to responsive classes
  const columnClasses = Object.entries(columns)
    .map(([breakpoint, colCount]) => {
      if (breakpoint === 'xs') {
        return `columns-${colCount}`;
      }
      return `${breakpoint}:columns-${colCount}`;
    })
    .join(' ');

  const gapClass = `gap-${gap}`;

  return (
    <div
      className={combineClasses(
        columnClasses,
        gapClass,
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} className="break-inside-avoid mb-4">
          {child}
        </div>
      ))}
    </div>
  );
};

/**
 * Sticky Container Component
 * Container that sticks to top with safe area support
 */
export const StickyContainer = ({
  children,
  top = 0,
  zIndex = 10,
  background = 'white',
  blur = false,
  className = '',
  ...props
}) => {
  const backgroundClasses = {
    white: 'bg-white',
    transparent: 'bg-transparent',
    glass: 'bg-white/80'
  };

  const blurClass = blur ? 'backdrop-blur-md' : '';

  return (
    <div
      className={combineClasses(
        'sticky safe-area-top',
        backgroundClasses[background],
        blurClass,
        className
      )}
      style={{
        top: `${top}px`,
        zIndex
      }}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Divider Component
 * Visual separator with optional text
 */
export const Divider = ({
  children,
  orientation = 'horizontal',
  variant = 'solid',
  className = '',
  ...props
}) => {
  const orientationClasses = {
    horizontal: 'w-full h-px',
    vertical: 'h-full w-px'
  };

  const variantClasses = {
    solid: 'bg-gray-200',
    dashed: 'border-dashed border-gray-200',
    dotted: 'border-dotted border-gray-200'
  };

  if (children) {
    return (
      <div className={combineClasses('relative flex items-center', className)} {...props}>
        <div className={combineClasses('flex-1', orientationClasses[orientation], variantClasses[variant])} />
        <span className="px-4 text-sm text-gray-500 bg-white">{children}</span>
        <div className={combineClasses('flex-1', orientationClasses[orientation], variantClasses[variant])} />
      </div>
    );
  }

  return (
    <div
      className={combineClasses(
        orientationClasses[orientation],
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
};

// PropTypes for all components
Container.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', 'full']),
  padding: PropTypes.bool,
  className: PropTypes.string
};

Grid.propTypes = {
  children: PropTypes.node.isRequired,
  cols: PropTypes.object,
  gap: PropTypes.number,
  className: PropTypes.string
};

Stack.propTypes = {
  children: PropTypes.node.isRequired,
  spacing: PropTypes.number,
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch']),
  className: PropTypes.string
};

Flex.propTypes = {
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOf(['row', 'row-reverse', 'col', 'col-reverse']),
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch', 'baseline']),
  justify: PropTypes.oneOf(['start', 'center', 'end', 'between', 'around', 'evenly']),
  wrap: PropTypes.bool,
  gap: PropTypes.number,
  className: PropTypes.string
};

Section.propTypes = {
  children: PropTypes.node.isRequired,
  background: PropTypes.oneOf(['transparent', 'white', 'gray', 'primary', 'medical']),
  padding: PropTypes.oneOf(['none', 'sm', 'normal', 'lg', 'xl']),
  className: PropTypes.string
};

CardGrid.propTypes = {
  children: PropTypes.node.isRequired,
  minCardWidth: PropTypes.string,
  gap: PropTypes.number,
  className: PropTypes.string
};

MasonryGrid.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.object,
  gap: PropTypes.number,
  className: PropTypes.string
};

StickyContainer.propTypes = {
  children: PropTypes.node.isRequired,
  top: PropTypes.number,
  zIndex: PropTypes.number,
  background: PropTypes.oneOf(['white', 'transparent', 'glass']),
  blur: PropTypes.bool,
  className: PropTypes.string
};

Divider.propTypes = {
  children: PropTypes.node,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  variant: PropTypes.oneOf(['solid', 'dashed', 'dotted']),
  className: PropTypes.string
};