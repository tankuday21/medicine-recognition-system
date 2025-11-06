// Skip Navigation Components
// Skip links and landmark navigation for screen readers

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';
import { useSkipLinks, useLandmarkNavigation } from '../../hooks/useAccessibility';

/**
 * Skip Links Component
 * Provides skip navigation links for keyboard users
 */
export const SkipLinks = ({ 
  links,
  className = '',
  ...props 
}) => {
  const { skipTo } = useSkipLinks();
  
  const defaultLinks = [
    { id: 'main-content', label: 'Skip to main content' },
    { id: 'primary-navigation', label: 'Skip to navigation' },
    { id: 'search', label: 'Skip to search' },
    { id: 'footer', label: 'Skip to footer' }
  ];

  const skipLinks = links || defaultLinks;

  const handleSkipClick = useCallback((e, targetId) => {
    e.preventDefault();
    skipTo(targetId);
  }, [skipTo]);

  return (
    <nav 
      className={combineClasses('skip-links', className)}
      aria-label="Skip navigation"
      {...props}
    >
      <ul className="sr-only-focusable">
        {skipLinks.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              onClick={(e) => handleSkipClick(e, link.id)}
              className={combineClasses(
                'absolute top-0 left-0 z-50 px-4 py-2 bg-primary-600 text-white',
                'transform -translate-y-full focus:translate-y-0',
                'transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-white'
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

/**
 * Landmark Navigation Component
 * Provides landmark region navigation for screen readers
 */
export const LandmarkNavigation = ({ 
  className = '',
  ...props 
}) => {
  const { landmarks, navigateToLandmark } = useLandmarkNavigation();

  const handleLandmarkClick = useCallback((e, landmarkId) => {
    e.preventDefault();
    navigateToLandmark(landmarkId);
  }, [navigateToLandmark]);

  return (
    <nav 
      className={combineClasses('landmark-navigation sr-only-focusable', className)}
      aria-label="Landmark navigation"
      {...props}
    >
      <h2 className="sr-only">Page landmarks</h2>
      <ul>
        {landmarks.map((landmark) => (
          <li key={landmark.id}>
            <a
              href={`#${landmark.id}`}
              onClick={(e) => handleLandmarkClick(e, landmark.id)}
              className={combineClasses(
                'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            >
              {landmark.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

/**
 * Main Content Wrapper
 * Provides proper main landmark with skip target
 */
export const MainContent = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <main
      id="main-content"
      role="main"
      tabIndex={-1}
      className={combineClasses('focus:outline-none', className)}
      {...props}
    >
      <h1 className="sr-only">Main content</h1>
      {children}
    </main>
  );
};

/**
 * Navigation Wrapper
 * Provides proper navigation landmark
 */
export const NavigationWrapper = ({ 
  children, 
  ariaLabel = 'Main navigation',
  className = '',
  ...props 
}) => {
  return (
    <nav
      id="primary-navigation"
      role="navigation"
      aria-label={ariaLabel}
      tabIndex={-1}
      className={combineClasses('focus:outline-none', className)}
      {...props}
    >
      {children}
    </nav>
  );
};

/**
 * Header Wrapper
 * Provides proper banner landmark
 */
export const HeaderWrapper = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <header
      id="site-header"
      role="banner"
      tabIndex={-1}
      className={combineClasses('focus:outline-none', className)}
      {...props}
    >
      {children}
    </header>
  );
};

/**
 * Footer Wrapper
 * Provides proper contentinfo landmark
 */
export const FooterWrapper = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <footer
      id="footer"
      role="contentinfo"
      tabIndex={-1}
      className={combineClasses('focus:outline-none', className)}
      {...props}
    >
      {children}
    </footer>
  );
};

/**
 * Sidebar Wrapper
 * Provides proper complementary landmark
 */
export const SidebarWrapper = ({ 
  children, 
  ariaLabel = 'Sidebar',
  className = '',
  ...props 
}) => {
  return (
    <aside
      id="sidebar"
      role="complementary"
      aria-label={ariaLabel}
      tabIndex={-1}
      className={combineClasses('focus:outline-none', className)}
      {...props}
    >
      {children}
    </aside>
  );
};

/**
 * Search Wrapper
 * Provides proper search landmark
 */
export const SearchWrapper = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div
      id="search"
      role="search"
      tabIndex={-1}
      className={combineClasses('focus:outline-none', className)}
      {...props}
    >
      <h2 className="sr-only">Search</h2>
      {children}
    </div>
  );
};

/**
 * Breadcrumb Navigation
 * Accessible breadcrumb navigation with proper ARIA
 */
export const BreadcrumbNavigation = ({ 
  items, 
  className = '',
  ...props 
}) => {
  return (
    <nav 
      aria-label="Breadcrumb"
      className={combineClasses('breadcrumb-navigation', className)}
      {...props}
    >
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={item.id || index} className="flex items-center">
            {index > 0 && (
              <svg 
                className="w-4 h-4 mx-2 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            
            {index === items.length - 1 ? (
              <span 
                className="text-gray-500"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className={combineClasses(
                  'text-primary-600 hover:text-primary-800',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 rounded'
                )}
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

/**
 * Page Title Component
 * Provides proper page title announcement
 */
export const PageTitle = ({ 
  title, 
  subtitle,
  level = 1,
  className = '',
  ...props 
}) => {
  const HeadingTag = `h${level}`;
  
  return (
    <div className={combineClasses('page-title', className)} {...props}>
      <HeadingTag className="text-2xl font-bold text-gray-900 mb-2">
        {title}
      </HeadingTag>
      {subtitle && (
        <p className="text-gray-600">{subtitle}</p>
      )}
    </div>
  );
};

/**
 * Focus Indicator Component
 * Provides visible focus indicators for custom components
 */
export const FocusIndicator = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div
      className={combineClasses(
        'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 rounded',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// PropTypes
SkipLinks.propTypes = {
  links: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  className: PropTypes.string
};

LandmarkNavigation.propTypes = {
  className: PropTypes.string
};

MainContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

NavigationWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  ariaLabel: PropTypes.string,
  className: PropTypes.string
};

HeaderWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

FooterWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

SidebarWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  ariaLabel: PropTypes.string,
  className: PropTypes.string
};

SearchWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

BreadcrumbNavigation.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string.isRequired,
    href: PropTypes.string
  })).isRequired,
  className: PropTypes.string
};

PageTitle.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  level: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  className: PropTypes.string
};

FocusIndicator.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default {
  SkipLinks,
  LandmarkNavigation,
  MainContent,
  NavigationWrapper,
  HeaderWrapper,
  FooterWrapper,
  SidebarWrapper,
  SearchWrapper,
  BreadcrumbNavigation,
  PageTitle,
  FocusIndicator
};