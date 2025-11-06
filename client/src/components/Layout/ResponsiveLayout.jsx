// Premium Responsive Layout System
// Mobile-first responsive components with adaptive behavior

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';
import { useResponsive } from '../../hooks/useDesignSystem';

/**
 * Responsive Grid System
 * Mobile-first grid with proper breakpoints
 */
export const ResponsiveGrid = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 6 },
  gap = 4,
  className = '',
  ...props
}) => {
  const getGridClasses = () => {
    const gapClass = `gap-${gap}`;
    
    // Convert cols object to responsive classes
    const colClasses = [];
    
    if (typeof cols === 'number') {
      colClasses.push(`grid-cols-${cols}`);
    } else {
      if (cols.xs) colClasses.push(`grid-cols-${cols.xs}`);
      if (cols.sm) colClasses.push(`sm:grid-cols-${cols.sm}`);
      if (cols.md) colClasses.push(`md:grid-cols-${cols.md}`);
      if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`);
      if (cols.xl) colClasses.push(`xl:grid-cols-${cols.xl}`);
      if (cols['2xl']) colClasses.push(`2xl:grid-cols-${cols['2xl']}`);
    }
    
    return combineClasses('grid', gapClass, ...colClasses, className);
  };

  return (
    <div className={getGridClasses()} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive Container
 * Adaptive container with proper padding and margins
 */
export const ResponsiveContainer = ({
  children,
  size = 'default',
  padding = 'default',
  centered = true,
  className = '',
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();

  const sizeClasses = {
    sm: 'max-w-2xl',
    default: 'max-w-6xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-2xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 sm:px-4',
    default: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12',
    xl: 'px-8 sm:px-12 lg:px-16'
  };

  const containerClasses = combineClasses(
    'w-full',
    sizeClasses[size],
    paddingClasses[padding],
    centered ? 'mx-auto' : '',
    className
  );

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Flexible Layout Component
 * Adapts layout based on screen size and content
 */
export const FlexibleLayout = ({
  children,
  direction = 'column',
  responsive = true,
  align = 'stretch',
  justify = 'start',
  wrap = true,
  gap = 4,
  className = '',
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getFlexDirection = () => {
    if (!responsive) return direction;
    
    // Auto-adjust direction based on screen size
    if (isMobile && direction === 'row') return 'column';
    return direction;
  };

  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse'
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

  const flexClasses = combineClasses(
    'flex',
    directionClasses[getFlexDirection()],
    alignClasses[align],
    justifyClasses[justify],
    wrap ? 'flex-wrap' : 'flex-nowrap',
    `gap-${gap}`,
    className
  );

  return (
    <div className={flexClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Adaptive Layout Component
 * Switches between different layouts based on screen size
 */
export const AdaptiveLayout = ({
  children,
  mobileLayout,
  tabletLayout,
  desktopLayout,
  className = '',
  ...props
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const renderLayout = () => {
    if (isMobile && mobileLayout) {
      return mobileLayout;
    } else if (isTablet && tabletLayout) {
      return tabletLayout;
    } else if (isDesktop && desktopLayout) {
      return desktopLayout;
    }
    return children;
  };

  return (
    <div className={className} {...props}>
      {renderLayout()}
    </div>
  );
};

/**
 * Masonry Layout Component
 * Pinterest-style masonry layout for cards
 */
export const MasonryLayout = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className = '',
  ...props
}) => {
  const { breakpoint } = useResponsive();
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const getColumnCount = () => {
      if (typeof columns === 'number') return columns;
      
      const width = window.innerWidth;
      if (width >= 1280) return columns['2xl'] || columns.xl || columns.lg || columns.md || columns.sm || columns.xs || 1;
      if (width >= 1024) return columns.xl || columns.lg || columns.md || columns.sm || columns.xs || 1;
      if (width >= 768) return columns.lg || columns.md || columns.sm || columns.xs || 1;
      if (width >= 640) return columns.md || columns.sm || columns.xs || 1;
      if (width >= 475) return columns.sm || columns.xs || 1;
      return columns.xs || 1;
    };

    setColumnCount(getColumnCount());

    const handleResize = () => {
      setColumnCount(getColumnCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [columns]);

  const distributeItems = () => {
    const columnArrays = Array.from({ length: columnCount }, () => []);
    
    React.Children.forEach(children, (child, index) => {
      const columnIndex = index % columnCount;
      columnArrays[columnIndex].push(child);
    });
    
    return columnArrays;
  };

  const masonryClasses = combineClasses(
    'flex',
    `gap-${gap}`,
    className
  );

  const columnClasses = combineClasses(
    'flex flex-col',
    `gap-${gap}`,
    'flex-1'
  );

  return (
    <div className={masonryClasses} {...props}>
      {distributeItems().map((columnItems, columnIndex) => (
        <div key={columnIndex} className={columnClasses}>
          {columnItems}
        </div>
      ))}
    </div>
  );
};

/**
 * Sidebar Layout Component
 * Responsive sidebar that collapses on mobile
 */
export const SidebarLayout = ({
  children,
  sidebar,
  sidebarWidth = 'w-64',
  sidebarPosition = 'left',
  collapsible = true,
  defaultCollapsed = false,
  className = '',
  ...props
}) => {
  const { isMobile } = useResponsive();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed || isMobile);

  useEffect(() => {
    if (isMobile && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const layoutClasses = combineClasses(
    'flex h-full',
    sidebarPosition === 'right' ? 'flex-row-reverse' : 'flex-row',
    className
  );

  const sidebarClasses = combineClasses(
    'flex-shrink-0 transition-all duration-300 ease-out',
    isCollapsed ? 'w-0 overflow-hidden' : sidebarWidth,
    'bg-white border-gray-200',
    sidebarPosition === 'right' ? 'border-l' : 'border-r'
  );

  const mainClasses = combineClasses(
    'flex-1 overflow-auto',
    'transition-all duration-300 ease-out'
  );

  return (
    <div className={layoutClasses} {...props}>
      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className="h-full overflow-y-auto">
          {sidebar}
        </div>
      </aside>

      {/* Main Content */}
      <main className={mainClasses}>
        {/* Collapse Toggle (Mobile) */}
        {collapsible && isMobile && (
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        {children}
      </main>

      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </div>
  );
};

/**
 * Stack Layout Component
 * Vertical stack with consistent spacing
 */
export const StackLayout = ({
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

  const stackClasses = combineClasses(
    'flex flex-col',
    `space-y-${spacing}`,
    alignClasses[align],
    className
  );

  return (
    <div className={stackClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Inline Layout Component
 * Horizontal inline layout with wrapping
 */
export const InlineLayout = ({
  children,
  spacing = 2,
  align = 'center',
  justify = 'start',
  wrap = true,
  className = '',
  ...props
}) => {
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

  const inlineClasses = combineClasses(
    'flex',
    wrap ? 'flex-wrap' : 'flex-nowrap',
    `gap-${spacing}`,
    alignClasses[align],
    justifyClasses[justify],
    className
  );

  return (
    <div className={inlineClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive Utility Classes Generator
 * Generates responsive utility classes
 */
export const useResponsiveClasses = (baseClasses, responsiveClasses = {}) => {
  const { breakpoint } = useResponsive();
  
  const getResponsiveClass = (property, values) => {
    if (typeof values === 'string' || typeof values === 'number') {
      return `${property}-${values}`;
    }
    
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpoints.indexOf(breakpoint);
    
    // Find the appropriate value for current breakpoint
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpoints[i];
      if (values[bp] !== undefined) {
        return bp === 'xs' ? `${property}-${values[bp]}` : `${bp}:${property}-${values[bp]}`;
      }
    }
    
    return '';
  };

  const classes = [baseClasses];
  
  Object.entries(responsiveClasses).forEach(([property, values]) => {
    const responsiveClass = getResponsiveClass(property, values);
    if (responsiveClass) {
      classes.push(responsiveClass);
    }
  });
  
  return combineClasses(...classes);
};

/**
 * Medical Layout Components
 * Specialized layouts for medical applications
 */
export const MedicalDashboardLayout = ({
  children,
  header,
  sidebar,
  quickActions,
  className = '',
  ...props
}) => {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div className={combineClasses('flex flex-col h-screen', className)} {...props}>
        {/* Mobile Header */}
        {header && (
          <header className="flex-shrink-0 bg-white border-b border-gray-200">
            {header}
          </header>
        )}
        
        {/* Quick Actions */}
        {quickActions && (
          <div className="flex-shrink-0 p-4 bg-primary-50 border-b border-primary-200">
            {quickActions}
          </div>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className={combineClasses('flex h-screen', className)} {...props}>
      {/* Desktop Sidebar */}
      {sidebar && (
        <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          {sidebar}
        </aside>
      )}
      
      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {header && (
          <header className="flex-shrink-0 bg-white border-b border-gray-200">
            {header}
          </header>
        )}
        
        {/* Content with Quick Actions */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
          
          {/* Quick Actions Sidebar */}
          {quickActions && (
            <aside className="w-80 flex-shrink-0 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
              {quickActions}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export const PatientRecordLayout = ({
  children,
  patientInfo,
  navigation,
  actions,
  className = '',
  ...props
}) => {
  const { isMobile } = useResponsive();

  return (
    <div className={combineClasses('flex flex-col h-full', className)} {...props}>
      {/* Patient Header */}
      {patientInfo && (
        <header className="flex-shrink-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4">
          {patientInfo}
        </header>
      )}
      
      {/* Navigation */}
      {navigation && (
        <nav className="flex-shrink-0 bg-white border-b border-gray-200">
          {navigation}
        </nav>
      )}
      
      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
        
        {/* Actions Panel (Desktop only) */}
        {actions && !isMobile && (
          <aside className="w-64 flex-shrink-0 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
            {actions}
          </aside>
        )}
      </div>
      
      {/* Mobile Actions */}
      {actions && isMobile && (
        <footer className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
          {actions}
        </footer>
      )}
    </div>
  );
};

// PropTypes
ResponsiveGrid.propTypes = {
  children: PropTypes.node.isRequired,
  cols: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  gap: PropTypes.number,
  className: PropTypes.string
};

ResponsiveContainer.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'default', 'lg', 'xl', 'full']),
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg', 'xl']),
  centered: PropTypes.bool,
  className: PropTypes.string
};

FlexibleLayout.propTypes = {
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOf(['row', 'column', 'row-reverse', 'column-reverse']),
  responsive: PropTypes.bool,
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch', 'baseline']),
  justify: PropTypes.oneOf(['start', 'center', 'end', 'between', 'around', 'evenly']),
  wrap: PropTypes.bool,
  gap: PropTypes.number,
  className: PropTypes.string
};

AdaptiveLayout.propTypes = {
  children: PropTypes.node,
  mobileLayout: PropTypes.node,
  tabletLayout: PropTypes.node,
  desktopLayout: PropTypes.node,
  className: PropTypes.string
};

MasonryLayout.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  gap: PropTypes.number,
  className: PropTypes.string
};

SidebarLayout.propTypes = {
  children: PropTypes.node.isRequired,
  sidebar: PropTypes.node.isRequired,
  sidebarWidth: PropTypes.string,
  sidebarPosition: PropTypes.oneOf(['left', 'right']),
  collapsible: PropTypes.bool,
  defaultCollapsed: PropTypes.bool,
  className: PropTypes.string
};

StackLayout.propTypes = {
  children: PropTypes.node.isRequired,
  spacing: PropTypes.number,
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch']),
  className: PropTypes.string
};

InlineLayout.propTypes = {
  children: PropTypes.node.isRequired,
  spacing: PropTypes.number,
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch', 'baseline']),
  justify: PropTypes.oneOf(['start', 'center', 'end', 'between', 'around', 'evenly']),
  wrap: PropTypes.bool,
  className: PropTypes.string
};

MedicalDashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  header: PropTypes.node,
  sidebar: PropTypes.node,
  quickActions: PropTypes.node,
  className: PropTypes.string
};

PatientRecordLayout.propTypes = {
  children: PropTypes.node.isRequired,
  patientInfo: PropTypes.node,
  navigation: PropTypes.node,
  actions: PropTypes.node,
  className: PropTypes.string
};

export default ResponsiveGrid;