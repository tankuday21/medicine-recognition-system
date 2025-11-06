// Theme Provider Component
// Provides design system context to the entire application

import React, { createContext, useContext, useEffect } from 'react';
import { useTheme, useResponsive, useAccessibility } from '../../hooks/useDesignSystem';
import { designTokens } from '../../styles/design-tokens';

// Create contexts
const ThemeContext = createContext();
const ResponsiveContext = createContext();
const AccessibilityContext = createContext();

/**
 * Theme Provider Component
 * Wraps the app and provides design system context
 */
export const ThemeProvider = ({ children }) => {
  const theme = useTheme();
  const responsive = useResponsive();
  const accessibility = useAccessibility();

  // Apply CSS custom properties based on theme
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme-specific CSS custom properties
    Object.entries(designTokens.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
    
    Object.entries(designTokens.colors.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--color-secondary-${key}`, value);
    });
    
    // Apply spacing variables
    Object.entries(designTokens.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Apply border radius variables
    Object.entries(designTokens.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    
  }, [theme.effectiveTheme]);

  // Set viewport meta tag for mobile optimization
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }
  }, []);

  // Apply accessibility classes to body
  useEffect(() => {
    const body = document.body;
    
    // High contrast mode
    if (accessibility.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (accessibility.reducedMotion) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }
    
    // Touch device
    if (!accessibility.supportsHover) {
      body.classList.add('touch-device');
    } else {
      body.classList.remove('touch-device');
    }
    
  }, [accessibility]);

  return (
    <ThemeContext.Provider value={theme}>
      <ResponsiveContext.Provider value={responsive}>
        <AccessibilityContext.Provider value={accessibility}>
          <div className={`min-h-screen transition-colors duration-300 ${
            theme.isDark ? 'dark' : ''
          }`}>
            {children}
          </div>
        </AccessibilityContext.Provider>
      </ResponsiveContext.Provider>
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Hook to use responsive context
 */
export const useResponsiveContext = () => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsiveContext must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Hook to use accessibility context
 */
export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Higher-order component for theme-aware components
 */
export const withTheme = (Component) => {
  return React.forwardRef((props, ref) => {
    const theme = useThemeContext();
    const responsive = useResponsiveContext();
    const accessibility = useAccessibilityContext();
    
    return (
      <Component
        {...props}
        ref={ref}
        theme={theme}
        responsive={responsive}
        accessibility={accessibility}
      />
    );
  });
};

/**
 * Theme Toggle Button Component
 */
export const ThemeToggle = ({ className = '', size = 'md', ...props }) => {
  const { theme, toggleTheme, isDark } = useThemeContext();
  const { isMobile } = useResponsiveContext();
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        rounded-full bg-secondary-100 dark:bg-secondary-800
        text-secondary-600 dark:text-secondary-300
        hover:bg-secondary-200 dark:hover:bg-secondary-700
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        transition-all duration-200 ease-out
        flex items-center justify-center
        ${isMobile ? 'touch-target' : ''}
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      {...props}
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

/**
 * Responsive Container Component
 */
export const ResponsiveContainer = ({ 
  children, 
  className = '', 
  maxWidth = 'lg',
  padding = true,
  ...props 
}) => {
  const { isMobile, isTablet } = useResponsiveContext();
  
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full'
  };
  
  const paddingClasses = padding ? (
    isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-8'
  ) : '';
  
  return (
    <div
      className={`
        w-full mx-auto
        ${maxWidthClasses[maxWidth]}
        ${paddingClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Safe Area Component for mobile devices
 */
export const SafeArea = ({ 
  children, 
  sides = ['top', 'bottom'], 
  className = '',
  ...props 
}) => {
  const sideClasses = sides.map(side => `safe-area-${side}`).join(' ');
  
  return (
    <div
      className={`${sideClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ThemeProvider;