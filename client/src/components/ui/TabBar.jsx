// Premium Tab Bar Component
// Horizontal tab navigation for content sections

import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';

/**
 * Tab Item Component
 * Individual tab within the tab bar
 */
export const Tab = ({
  children,
  isActive = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const tabClasses = combineClasses(
    'relative px-4 py-3 text-sm font-medium transition-all duration-200 ease-out',
    'border-b-2 whitespace-nowrap cursor-pointer',
    'hover:text-primary-600 focus:outline-none focus:text-primary-600',
    isActive 
      ? 'text-primary-600 border-primary-500' 
      : 'text-gray-500 border-transparent hover:border-gray-300',
    disabled ? 'opacity-50 cursor-not-allowed hover:text-gray-500 hover:border-transparent' : '',
    className
  );

  const handleClick = (e) => {
    if (!disabled) {
      onClick?.(e);
    }
  };

  return (
    <button
      className={tabClasses}
      onClick={handleClick}
      disabled={disabled}
      role="tab"
      aria-selected={isActive}
      {...props}
    >
      {children}
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t-full" />
      )}
    </button>
  );
};

/**
 * Premium Tab Bar Component
 * Horizontal scrollable tab navigation
 */
const TabBar = ({
  children,
  variant = 'default',
  scrollable = true,
  centered = false,
  className = '',
  ...props
}) => {
  const scrollRef = useRef(null);

  // Auto-scroll to active tab
  useEffect(() => {
    if (scrollable && scrollRef.current) {
      const activeTab = scrollRef.current.querySelector('[aria-selected="true"]');
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [children, scrollable]);

  // Variant classes
  const variantClasses = {
    default: 'bg-white border-b border-gray-200',
    filled: 'bg-gray-50 border-b border-gray-200',
    medical: 'bg-gradient-to-r from-primary-50/30 to-white border-b border-primary-200'
  };

  // Container classes
  const containerClasses = combineClasses(
    'relative',
    variantClasses[variant],
    className
  );

  // Tab list classes
  const tabListClasses = combineClasses(
    'flex',
    scrollable ? 'overflow-x-auto scrollbar-hide' : 'overflow-hidden',
    centered && !scrollable ? 'justify-center' : '',
    scrollable ? 'px-4' : ''
  );

  return (
    <div className={containerClasses} {...props}>
      <div
        ref={scrollRef}
        className={tabListClasses}
        role="tablist"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {children}
      </div>
      
      {/* Scroll indicators */}
      {scrollable && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </>
      )}
    </div>
  );
};

/**
 * Medical Tab Bar Component
 * Pre-configured tab bar for medical sections
 */
export const MedicalTabBar = ({
  activeTab,
  onTabChange,
  sections = ['overview', 'vitals', 'medications', 'reports'],
  className = '',
  ...props
}) => {
  const sectionLabels = {
    overview: 'Overview',
    vitals: 'Vitals',
    medications: 'Medications',
    reports: 'Reports',
    history: 'History',
    appointments: 'Appointments',
    allergies: 'Allergies',
    conditions: 'Conditions'
  };

  return (
    <TabBar variant="medical" className={className} {...props}>
      {sections.map((section) => (
        <Tab
          key={section}
          isActive={activeTab === section}
          onClick={() => onTabChange?.(section)}
        >
          {sectionLabels[section] || section}
        </Tab>
      ))}
    </TabBar>
  );
};

/**
 * Segmented Control Component
 * Alternative tab-like control with filled background
 */
export const SegmentedControl = ({
  options = [],
  value,
  onChange,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5'
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-gray-100',
    medical: 'bg-primary-50 border border-primary-200'
  };

  const containerClasses = combineClasses(
    'inline-flex rounded-lg p-1',
    variantClasses[variant],
    className
  );

  return (
    <div className={containerClasses} role="tablist" {...props}>
      {options.map((option) => {
        const isActive = value === option.value;
        
        return (
          <button
            key={option.value}
            className={combineClasses(
              'relative rounded-md font-medium transition-all duration-200 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
              sizeClasses[size],
              isActive
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            )}
            onClick={() => onChange?.(option.value)}
            role="tab"
            aria-selected={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

// PropTypes
Tab.propTypes = {
  children: PropTypes.node.isRequired,
  isActive: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
};

TabBar.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'filled', 'medical']),
  scrollable: PropTypes.bool,
  centered: PropTypes.bool,
  className: PropTypes.string
};

MedicalTabBar.propTypes = {
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func,
  sections: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string
};

SegmentedControl.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired
  })).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'medical']),
  className: PropTypes.string
};

export default TabBar;