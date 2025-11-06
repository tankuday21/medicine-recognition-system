/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '320px',    // Small phones
      'sm': '375px',    // Standard phones  
      'md': '414px',    // Large phones
      'lg': '768px',    // Tablets
      'xl': '1024px',   // Desktop
      '2xl': '1280px',  // Large desktop
    },
    extend: {
      colors: {
        // Premium medical-focused color system
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
        // Semantic colors for medical context
        semantic: {
          success: '#10b981',  // Green for positive states
          warning: '#f59e0b',  // Amber for warnings
          error: '#ef4444',    // Red for errors
          info: '#3b82f6'      // Blue for information
        },
        // Medical-specific colors
        medical: {
          heart: '#dc2626',    // Medical red
          pulse: '#059669',    // Medical green
          scan: '#7c3aed',     // Medical purple
          emergency: '#dc2626' // Emergency red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],  // Minimum for mobile
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '1' }],
      },
      spacing: {
        // 8px base unit system
        0.5: '2px',
        1.5: '6px',
        2.5: '10px',
        3.5: '14px',
        4.5: '18px',
        5.5: '22px',
        6.5: '26px',
        7.5: '30px',
        8.5: '34px',
        9.5: '38px',
        // Touch target sizes
        'touch-sm': '44px',   // iOS/Android minimum
        'touch-md': '48px',   // Comfortable
        'touch-lg': '56px',   // Large
        // Safe area insets
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        DEFAULT: '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
      },
      boxShadow: {
        // Premium shadow system
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '3xl': '0 35px 60px -12px rgb(0 0 0 / 0.3)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        // Medical-themed shadows
        'primary': '0 10px 15px -3px rgb(14 165 233 / 0.1), 0 4px 6px -4px rgb(14 165 233 / 0.1)',
        'accent': '0 10px 15px -3px rgb(249 115 22 / 0.1), 0 4px 6px -4px rgb(249 115 22 / 0.1)',
      },
      animation: {
        // Enhanced animation system
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-slow': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-up-slow': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        skeleton: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'in-expo': 'cubic-bezier(0.55, 0.06, 0.68, 0.19)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // Custom plugin for premium utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Touch-friendly utilities
        '.touch-target': {
          minHeight: theme('spacing.touch-sm'),
          minWidth: theme('spacing.touch-sm'),
        },
        '.touch-target-md': {
          minHeight: theme('spacing.touch-md'),
          minWidth: theme('spacing.touch-md'),
        },
        '.touch-target-lg': {
          minHeight: theme('spacing.touch-lg'),
          minWidth: theme('spacing.touch-lg'),
        },
        // Premium glass effect
        '.glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        // Skeleton loading
        '.skeleton': {
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton 1.5s infinite',
        },
        // Safe area utilities
        '.safe-area-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-area-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-area-left': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-area-right': {
          paddingRight: 'env(safe-area-inset-right)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
