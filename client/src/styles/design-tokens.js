// Design Tokens for Premium Medical UI
// This file centralizes all design system values for consistency

export const designTokens = {
  // Color System - Medical-focused palette
  colors: {
    primary: {
      50: '#f0f9ff',   // Light blue tints
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',  // Primary medical blue
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'   // Dark blue
    },
    secondary: {
      50: '#f8fafc',   // Neutral grays
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    accent: {
      50: '#fef7ee',   // Warm orange for CTAs
      100: '#fed7aa',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12'
    },
    semantic: {
      success: '#10b981',  // Green for positive states
      warning: '#f59e0b',  // Amber for warnings
      error: '#ef4444',    // Red for errors
      info: '#3b82f6'      // Blue for information
    },
    medical: {
      heart: '#dc2626',    // Medical red
      pulse: '#059669',    // Medical green
      scan: '#7c3aed',     // Medical purple
      emergency: '#dc2626' // Emergency red
    }
  },

  // Typography System - Mobile-optimized
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
    },
    fontSize: {
      xs: { size: '12px', lineHeight: '16px' },
      sm: { size: '14px', lineHeight: '20px' },
      base: { size: '16px', lineHeight: '24px' },  // Minimum for mobile
      lg: { size: '18px', lineHeight: '28px' },
      xl: { size: '20px', lineHeight: '28px' },
      '2xl': { size: '24px', lineHeight: '32px' },
      '3xl': { size: '30px', lineHeight: '36px' },
      '4xl': { size: '36px', lineHeight: '40px' },
      '5xl': { size: '48px', lineHeight: '1' }
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },

  // Spacing System - 8px base unit
  spacing: {
    0: '0px',
    0.5: '2px',
    1: '4px',    // 0.5 * base
    1.5: '6px',
    2: '8px',    // 1 * base
    2.5: '10px',
    3: '12px',   // 1.5 * base
    3.5: '14px',
    4: '16px',   // 2 * base
    4.5: '18px',
    5: '20px',   // 2.5 * base
    5.5: '22px',
    6: '24px',   // 3 * base
    6.5: '26px',
    7: '28px',
    7.5: '30px',
    8: '32px',   // 4 * base
    8.5: '34px',
    9: '36px',
    9.5: '38px',
    10: '40px',  // 5 * base
    11: '44px',
    12: '48px',  // 6 * base
    14: '56px',  // 7 * base
    16: '64px',  // 8 * base
    20: '80px',  // 10 * base
    24: '96px',  // 12 * base
    28: '112px', // 14 * base
    32: '128px', // 16 * base
    // Touch target sizes
    touchSm: '44px',   // iOS/Android minimum
    touchMd: '48px',   // Comfortable
    touchLg: '56px'    // Large
  },

  // Border Radius System
  borderRadius: {
    none: '0px',
    xs: '2px',
    sm: '4px',
    DEFAULT: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px'
  },

  // Shadow System - Premium elevation
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '3xl': '0 35px 60px -12px rgb(0 0 0 / 0.3)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    // Medical-themed shadows
    primary: '0 10px 15px -3px rgb(14 165 233 / 0.1), 0 4px 6px -4px rgb(14 165 233 / 0.1)',
    accent: '0 10px 15px -3px rgb(249 115 22 / 0.1), 0 4px 6px -4px rgb(249 115 22 / 0.1)'
  },

  // Animation System
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      linear: 'linear',
      out: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      in: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)',
      inOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },

  // Breakpoints - Mobile-first
  breakpoints: {
    xs: '320px',    // Small phones
    sm: '375px',    // Standard phones
    md: '414px',    // Large phones
    lg: '768px',    // Tablets
    xl: '1024px',   // Desktop
    '2xl': '1280px' // Large desktop
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1020,
    banner: 1030,
    overlay: 1040,
    modal: 1050,
    popover: 1060,
    skipLink: 1070,
    toast: 1080,
    tooltip: 1090
  }
};

// Component-specific design tokens
export const componentTokens = {
  // Button variants
  button: {
    primary: {
      base: 'bg-primary-500 text-white shadow-lg shadow-primary-500/25',
      hover: 'hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/30',
      active: 'active:bg-primary-700 active:scale-95',
      disabled: 'disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed'
    },
    secondary: {
      base: 'bg-white text-primary-600 border-2 border-primary-500 shadow-md',
      hover: 'hover:bg-primary-50 hover:shadow-lg',
      active: 'active:bg-primary-100 active:scale-95'
    },
    floating: {
      base: 'bg-primary-500 text-white rounded-full shadow-2xl shadow-primary-500/40',
      hover: 'hover:shadow-3xl hover:shadow-primary-500/50 hover:scale-105',
      active: 'active:scale-95'
    }
  },

  // Card variants
  card: {
    elevated: {
      base: 'bg-white rounded-xl shadow-lg shadow-gray-900/10 border border-gray-100',
      hover: 'hover:shadow-xl hover:shadow-gray-900/15 hover:-translate-y-1',
      transition: 'transition-all duration-200 ease-out'
    },
    interactive: {
      base: 'bg-white rounded-xl shadow-md border border-gray-100 cursor-pointer',
      hover: 'hover:shadow-lg hover:border-primary-200 hover:bg-primary-50/30',
      active: 'active:scale-98 active:shadow-sm'
    },
    medical: {
      base: 'bg-gradient-to-br from-white to-primary-50/30 rounded-xl shadow-lg border border-primary-100',
      accent: 'border-l-4 border-l-primary-500'
    }
  },

  // Navigation variants
  navigation: {
    bottom: {
      container: 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl',
      tabContainer: 'flex justify-around items-center px-2 py-1',
      tab: {
        base: 'flex flex-col items-center justify-center p-2 min-w-[60px] rounded-lg',
        active: 'text-primary-600 bg-primary-50',
        inactive: 'text-gray-500',
        transition: 'transition-all duration-150 ease-out'
      }
    },
    hamburger: {
      overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-40',
      drawer: 'fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300',
      header: 'p-6 border-b border-gray-100 bg-gradient-to-r from-primary-500 to-primary-600 text-white',
      menuItem: 'flex items-center p-4 hover:bg-gray-50 transition-colors duration-150'
    }
  }
};

// Utility functions for design tokens
export const getColor = (colorPath) => {
  const keys = colorPath.split('.');
  let value = designTokens.colors;
  for (const key of keys) {
    value = value[key];
    if (!value) return null;
  }
  return value;
};

export const getSpacing = (size) => {
  return designTokens.spacing[size] || size;
};

export const getShadow = (size) => {
  return designTokens.shadows[size] || designTokens.shadows.DEFAULT;
};

export const getBreakpoint = (size) => {
  return designTokens.breakpoints[size];
};

// CSS Custom Properties for dynamic theming
export const cssCustomProperties = {
  ':root': {
    // Primary colors
    '--color-primary-50': designTokens.colors.primary[50],
    '--color-primary-100': designTokens.colors.primary[100],
    '--color-primary-500': designTokens.colors.primary[500],
    '--color-primary-600': designTokens.colors.primary[600],
    '--color-primary-900': designTokens.colors.primary[900],
    
    // Secondary colors
    '--color-secondary-50': designTokens.colors.secondary[50],
    '--color-secondary-100': designTokens.colors.secondary[100],
    '--color-secondary-500': designTokens.colors.secondary[500],
    '--color-secondary-600': designTokens.colors.secondary[600],
    '--color-secondary-900': designTokens.colors.secondary[900],
    
    // Semantic colors
    '--color-success': designTokens.colors.semantic.success,
    '--color-warning': designTokens.colors.semantic.warning,
    '--color-error': designTokens.colors.semantic.error,
    '--color-info': designTokens.colors.semantic.info,
    
    // Spacing
    '--spacing-xs': designTokens.spacing[1],
    '--spacing-sm': designTokens.spacing[2],
    '--spacing-md': designTokens.spacing[4],
    '--spacing-lg': designTokens.spacing[6],
    '--spacing-xl': designTokens.spacing[8],
    
    // Border radius
    '--radius-sm': designTokens.borderRadius.sm,
    '--radius-md': designTokens.borderRadius.md,
    '--radius-lg': designTokens.borderRadius.lg,
    
    // Animation durations
    '--duration-fast': designTokens.animations.duration.fast,
    '--duration-normal': designTokens.animations.duration.normal,
    '--duration-slow': designTokens.animations.duration.slow,
  },
  
  // Dark mode overrides
  '.dark': {
    '--color-primary-50': designTokens.colors.primary[900],
    '--color-primary-100': designTokens.colors.primary[800],
    '--color-primary-500': designTokens.colors.primary[400],
    '--color-primary-600': designTokens.colors.primary[300],
    '--color-primary-900': designTokens.colors.primary[50],
    
    '--color-secondary-50': designTokens.colors.secondary[900],
    '--color-secondary-100': designTokens.colors.secondary[800],
    '--color-secondary-500': designTokens.colors.secondary[400],
    '--color-secondary-600': designTokens.colors.secondary[300],
    '--color-secondary-900': designTokens.colors.secondary[50],
  }
};

export default designTokens;