// Premium Breadcrumb Navigation Component
// Hierarchical navigation with medical theming and responsive design

import React from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';

/**
 * Breadcrumb Item Component
 * Individual breadcrumb item with link functionality
 */
export const BreadcrumbItem = ({
  label,
  href,
  isActive = false,
  isLast = false,
  onClick,
  icon,
  className = '',
  ...props
}) => {
  const itemClasses = combineClasses(
    'breadcrumb-item',
    'flex items-center transition-all duration-200 ease-out',
    className
  );

  const linkClasses = combineClasses(
    'breadcrumb-link',
    'flex items-center space-x-1 px-2 py-1 rounded-md transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
    isActive || isLast
      ? 'text-gray-900 font-medium cursor-default'
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer'
  );

  const handleClick = (e) => {
    if (isActive || isLast) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const content = (
    <>
      {icon && (
        <span className="flex-shrink-0 w-4 h-4">
          {icon}
        </span>
      )}
      <span className="truncate">{label}</span>
    </>
  );

  return (
    <li className={itemClasses} {...props}>
      {href && !isActive && !isLast ? (
        <a
          href={href}
          className={linkClasses}
          onClick={handleClick}
          aria-current={isActive ? 'page' : undefined}
        >
          {content}
        </a>
      ) : (
        <button
          className={linkClasses}
          onClick={handleClick}
          disabled={isActive || isLast}
          aria-current={isActive ? 'page' : undefined}
        >
          {content}
        </button>
      )}
    </li>
  );
};

/**
 * Breadcrumb Separator Component
 * Customizable separator between breadcrumb items
 */
export const BreadcrumbSeparator = ({
  variant = 'chevron',
  className = '',
  ...props
}) => {
  const separatorClasses = combineClasses(
    'breadcrumb-separator',
    'flex items-center justify-center mx-1 text-gray-400',
    'flex-shrink-0',
    className
  );

  const renderSeparator = () => {
    switch (variant) {
      case 'chevron':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        );
      case 'slash':
        return <span className="text-sm font-medium">/</span>;
      case 'arrow':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        );
      case 'dot':
        return <span className="w-1 h-1 bg-current rounded-full" />;
      default:
        return variant;
    }
  };

  return (
    <span className={separatorClasses} aria-hidden="true" {...props}>
      {renderSeparator()}
    </span>
  );
};

/**
 * Premium Breadcrumb Navigation Component
 * Main breadcrumb container with responsive behavior
 */
const Breadcrumb = ({
  items = [],
  separator = 'chevron',
  variant = 'default',
  size = 'md',
  maxItems = 0,
  showHome = true,
  homeIcon,
  onItemClick,
  className = '',
  ...props
}) => {
  // Variant styles
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    minimal: 'bg-transparent',
    medical: 'bg-gradient-to-r from-primary-50 to-white border border-primary-200 shadow-sm',
    dark: 'bg-gray-800 border border-gray-700 text-white'
  };

  // Size styles
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const breadcrumbClasses = combineClasses(
    'breadcrumb-navigation',
    'rounded-lg transition-all duration-200',
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  // Process items with truncation if needed
  const processedItems = React.useMemo(() => {
    let processedItems = [...items];

    // Add home item if requested
    if (showHome && (!items.length || items[0].id !== 'home')) {
      const homeItem = {
        id: 'home',
        label: 'Home',
        href: '/',
        icon: homeIcon || (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      };
      processedItems = [homeItem, ...processedItems];
    }

    // Truncate items if maxItems is set
    if (maxItems > 0 && processedItems.length > maxItems) {
      const firstItem = processedItems[0];
      const lastItems = processedItems.slice(-(maxItems - 2));
      const ellipsisItem = {
        id: 'ellipsis',
        label: '...',
        isEllipsis: true
      };
      processedItems = [firstItem, ellipsisItem, ...lastItems];
    }

    return processedItems;
  }, [items, showHome, homeIcon, maxItems]);

  const handleItemClick = (item, index) => {
    if (item.isEllipsis) return;
    onItemClick?.(item, index);
  };

  if (!processedItems.length) {
    return null;
  }

  return (
    <nav className={breadcrumbClasses} aria-label="Breadcrumb" {...props}>
      <ol className="flex items-center space-x-1 min-w-0">
        {processedItems.map((item, index) => {
          const isLast = index === processedItems.length - 1;
          const isActive = item.isActive || isLast;

          return (
            <React.Fragment key={item.id || index}>
              <BreadcrumbItem
                label={item.label}
                href={item.href}
                isActive={isActive}
                isLast={isLast}
                icon={item.icon}
                onClick={() => handleItemClick(item, index)}
                className={item.isEllipsis ? 'cursor-default' : ''}
              />
              
              {!isLast && (
                <BreadcrumbSeparator variant={separator} />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

/**
 * Medical Breadcrumb Component
 * Pre-configured breadcrumb for medical applications
 */
export const MedicalBreadcrumb = ({
  items = [],
  onItemClick,
  className = '',
  ...props
}) => {
  const medicalHomeIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 7-7-7-7 7 7-7z" />
    </svg>
  );

  return (
    <Breadcrumb
      items={items}
      variant="medical"
      separator="chevron"
      size="md"
      showHome={true}
      homeIcon={medicalHomeIcon}
      onItemClick={onItemClick}
      className={className}
      {...props}
    />
  );
};

/**
 * Responsive Breadcrumb Component
 * Automatically adapts to screen size
 */
export const ResponsiveBreadcrumb = ({
  items = [],
  mobileMaxItems = 2,
  tabletMaxItems = 4,
  desktopMaxItems = 0,
  className = '',
  ...props
}) => {
  const [maxItems, setMaxItems] = React.useState(desktopMaxItems);

  React.useEffect(() => {
    const updateMaxItems = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setMaxItems(mobileMaxItems);
      } else if (width < 1024) {
        setMaxItems(tabletMaxItems);
      } else {
        setMaxItems(desktopMaxItems);
      }
    };

    updateMaxItems();
    window.addEventListener('resize', updateMaxItems);
    return () => window.removeEventListener('resize', updateMaxItems);
  }, [mobileMaxItems, tabletMaxItems, desktopMaxItems]);

  return (
    <Breadcrumb
      items={items}
      maxItems={maxItems}
      className={className}
      {...props}
    />
  );
};

/**
 * Breadcrumb with Dropdown Component
 * Shows overflow items in a dropdown menu
 */
export const BreadcrumbWithDropdown = ({
  items = [],
  maxVisibleItems = 3,
  onItemClick,
  className = '',
  ...props
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (items.length <= maxVisibleItems) {
    return (
      <Breadcrumb
        items={items}
        onItemClick={onItemClick}
        className={className}
        {...props}
      />
    );
  }

  const visibleItems = [
    items[0], // First item
    ...items.slice(-(maxVisibleItems - 1)) // Last items
  ];

  const hiddenItems = items.slice(1, -(maxVisibleItems - 1));

  return (
    <nav className={combineClasses('breadcrumb-with-dropdown', className)} {...props}>
      <ol className="flex items-center space-x-1">
        {/* First item */}
        <BreadcrumbItem
          label={visibleItems[0].label}
          href={visibleItems[0].href}
          icon={visibleItems[0].icon}
          onClick={() => onItemClick?.(visibleItems[0], 0)}
        />

        {hiddenItems.length > 0 && (
          <>
            <BreadcrumbSeparator />
            
            {/* Dropdown for hidden items */}
            <li className="relative" ref={dropdownRef}>
              <button
                className="px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
              >
                ...
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                  {hiddenItems.map((item, index) => (
                    <button
                      key={item.id || index}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors duration-200"
                      onClick={() => {
                        onItemClick?.(item, index + 1);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                        <span className="truncate">{item.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </li>
          </>
        )}

        {/* Remaining visible items */}
        {visibleItems.slice(1).map((item, index) => {
          const actualIndex = items.length - (visibleItems.length - 1) + index;
          const isLast = actualIndex === items.length - 1;

          return (
            <React.Fragment key={item.id || actualIndex}>
              <BreadcrumbSeparator />
              <BreadcrumbItem
                label={item.label}
                href={item.href}
                icon={item.icon}
                isLast={isLast}
                onClick={() => onItemClick?.(item, actualIndex)}
              />
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

// PropTypes
BreadcrumbItem.propTypes = {
  label: PropTypes.string.isRequired,
  href: PropTypes.string,
  isActive: PropTypes.bool,
  isLast: PropTypes.bool,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  className: PropTypes.string
};

BreadcrumbSeparator.propTypes = {
  variant: PropTypes.oneOfType([
    PropTypes.oneOf(['chevron', 'slash', 'arrow', 'dot']),
    PropTypes.node
  ]),
  className: PropTypes.string
};

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string.isRequired,
    href: PropTypes.string,
    icon: PropTypes.node,
    isActive: PropTypes.bool
  })).isRequired,
  separator: PropTypes.oneOfType([
    PropTypes.oneOf(['chevron', 'slash', 'arrow', 'dot']),
    PropTypes.node
  ]),
  variant: PropTypes.oneOf(['default', 'minimal', 'medical', 'dark']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  maxItems: PropTypes.number,
  showHome: PropTypes.bool,
  homeIcon: PropTypes.node,
  onItemClick: PropTypes.func,
  className: PropTypes.string
};

MedicalBreadcrumb.propTypes = {
  items: PropTypes.array,
  onItemClick: PropTypes.func,
  className: PropTypes.string
};

ResponsiveBreadcrumb.propTypes = {
  items: PropTypes.array,
  mobileMaxItems: PropTypes.number,
  tabletMaxItems: PropTypes.number,
  desktopMaxItems: PropTypes.number,
  className: PropTypes.string
};

BreadcrumbWithDropdown.propTypes = {
  items: PropTypes.array,
  maxVisibleItems: PropTypes.number,
  onItemClick: PropTypes.func,
  className: PropTypes.string
};

export default Breadcrumb;