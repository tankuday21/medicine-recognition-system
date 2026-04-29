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
      '3xl': '1536px',  // Extra large desktop
    },
    extend: {
      colors: {
        // Premium Medical Brand Colors (Deep Blue & Teal)
        primary: {
          50: '#f0faff',
          100: '#e0f4fe',
          200: '#b9eafa',
          300: '#7cdcf9',
          400: '#36cbf7',
          500: '#0cabe4',
          600: '#028db7',
          700: '#037194',
          800: '#075e7a',
          900: '#0c4e66', 
          950: '#083344',
        },
        secondary: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#cfdceb',
          300: '#a6bfdc',
          400: '#759bc7',
          500: '#527db2',
          600: '#3e6292',
          700: '#334f77',
          800: '#2d4362',
          900: '#293a51',
          950: '#1b2636',
        },
        accent: {
          50: '#fffbea',
          100: '#fff2c6',
          200: '#ffe588',
          300: '#ffd04a',
          400: '#ffb91f',
          500: '#f99b07',
          600: '#db7800',
          700: '#ad5004',
          800: '#8c3e0b',
          900: '#74340e',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        // Dark mode specific colors
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Fluid typography for responsive scaling
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.25vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.75vw, 1.5rem)',
        'fluid-xl': 'clamp(1.25rem, 1rem + 1vw, 1.75rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 3rem)',
        'fluid-4xl': 'clamp(2.25rem, 1.75rem + 2.5vw, 3.75rem)',
        'fluid-5xl': 'clamp(3rem, 2rem + 4vw, 5rem)',
      },
      boxShadow: {
        'premium-xs': '0 1px 3px -1px rgba(12, 46, 102, 0.04), 0 1px 2px -1px rgba(12, 46, 102, 0.02)',
        'premium-sm': '0 2px 8px -2px rgba(12, 46, 102, 0.05), 0 1px 4px -2px rgba(12, 46, 102, 0.02)',
        'premium': '0 10px 30px -4px rgba(12, 46, 102, 0.1), 0 4px 12px -4px rgba(12, 46, 102, 0.05)',
        'premium-lg': '0 20px 40px -8px rgba(12, 46, 102, 0.12), 0 10px 20px -8px rgba(12, 46, 102, 0.06)',
        'premium-xl': '0 25px 50px -12px rgba(12, 46, 102, 0.15), 0 12px 24px -8px rgba(12, 46, 102, 0.08)',
        'premium-2xl': '0 35px 60px -15px rgba(12, 46, 102, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 16px 48px 0 rgba(31, 38, 135, 0.2)',
        'glow': '0 0 15px rgba(12, 171, 228, 0.5)',
        'glow-lg': '0 0 30px rgba(12, 171, 228, 0.6)',
        'glow-accent': '0 0 20px rgba(249, 155, 7, 0.4)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        // Dark mode shadows
        'dark-sm': '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
        'dark-md': '0 10px 30px -4px rgba(0, 0, 0, 0.4)',
        'dark-lg': '0 20px 40px -8px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #0cabe433 0deg, #36cbf700 360deg)',
        'mesh-gradient': 'linear-gradient(135deg, #f0faff 0%, #e0f4fe 50%, #b9eafa 100%)',
        'premium-gradient': 'linear-gradient(135deg, #028db7 0%, #0cabe4 50%, #36cbf7 100%)',
        'accent-gradient': 'linear-gradient(135deg, #f99b07 0%, #ffb91f 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        'card-shine': 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 55%, transparent 60%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'blob': 'blob 7s infinite',
        'grid-flow': 'gridFlow 20s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-in-center': 'scaleInCenter 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        gridFlow: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '40px 40px' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(12, 171, 228, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(12, 171, 228, 0.6)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleInCenter: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function({ addUtilities, addComponents, theme }) {
      addUtilities({
        // Glass morphism utilities
        '.glass-panel': {
          'background': 'rgba(255, 255, 255, 0.7)',
          'backdrop-filter': 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.5)',
        },
        '.glass-panel-strong': {
          'background': 'rgba(255, 255, 255, 0.85)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255, 255, 255, 0.6)',
        },
        '.glass-panel-dark': {
          'background': 'rgba(17, 24, 39, 0.7)',
          'backdrop-filter': 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.05)',
        },
        '.glass-panel-dark-strong': {
          'background': 'rgba(17, 24, 39, 0.85)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        // Text gradient utilities
        '.text-gradient': {
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          'color': 'transparent',
          'background-image': 'linear-gradient(135deg, #028db7 0%, #36cbf7 100%)',
        },
        '.text-gradient-accent': {
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          'color': 'transparent',
          'background-image': 'linear-gradient(135deg, #f99b07 0%, #ffb91f 100%)',
        },
        '.text-gradient-premium': {
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          'color': 'transparent',
          'background-image': 'linear-gradient(135deg, #0c4e66 0%, #0cabe4 50%, #36cbf7 100%)',
        },
        // Gradient border utility
        '.gradient-border': {
          'position': 'relative',
          'background': 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #028db7, #36cbf7) border-box',
          'border': '2px solid transparent',
        },
        // Premium hover effects
        '.hover-lift': {
          'transition': 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        },
        '.hover-lift:hover': {
          'transform': 'translateY(-4px)',
        },
        '.hover-scale': {
          'transition': 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
        },
        '.hover-scale:hover': {
          'transform': 'scale(1.02)',
        },
        '.hover-glow': {
          'transition': 'box-shadow 0.3s ease',
        },
        '.hover-glow:hover': {
          'box-shadow': '0 0 30px rgba(12, 171, 228, 0.4)',
        },
        // Scrollbar styling
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.scrollbar-hide::-webkit-scrollbar': {
          'display': 'none',
        },
        // Text balance for better typography
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.text-pretty': {
          'text-wrap': 'pretty',
        },
      });

      addComponents({
        // Premium container
        '.container-premium': {
          'width': '100%',
          'marginLeft': 'auto',
          'marginRight': 'auto',
          'paddingLeft': theme('spacing.4'),
          'paddingRight': theme('spacing.4'),
          'maxWidth': 'min(100% - 2rem, 1280px)',
          '@screen sm': {
            'paddingLeft': theme('spacing.6'),
            'paddingRight': theme('spacing.6'),
          },
          '@screen lg': {
            'paddingLeft': theme('spacing.8'),
            'paddingRight': theme('spacing.8'),
          },
        },
        // Auto-fit grid
        '.grid-auto-fit': {
          'display': 'grid',
          'gridTemplateColumns': 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          'gap': theme('spacing.6'),
        },
        '.grid-auto-fit-sm': {
          'display': 'grid',
          'gridTemplateColumns': 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          'gap': theme('spacing.4'),
        },
        '.grid-auto-fit-lg': {
          'display': 'grid',
          'gridTemplateColumns': 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          'gap': theme('spacing.8'),
        },
        // Premium card
        '.card-premium': {
          'backgroundColor': 'white',
          'borderRadius': theme('borderRadius.2xl'),
          'padding': theme('spacing.6'),
          'boxShadow': '0 10px 30px -4px rgba(12, 46, 102, 0.1), 0 4px 12px -4px rgba(12, 46, 102, 0.05)',
          'border': '1px solid rgba(12, 46, 102, 0.05)',
          'transition': 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
          '&:hover': {
            'boxShadow': '0 20px 40px -8px rgba(12, 46, 102, 0.12), 0 10px 20px -8px rgba(12, 46, 102, 0.06)',
            'transform': 'translateY(-2px)',
          },
        },
        // Section spacing
        '.section-spacing': {
          'paddingTop': theme('spacing.8'),
          'paddingBottom': theme('spacing.8'),
          '@screen sm': {
            'paddingTop': theme('spacing.12'),
            'paddingBottom': theme('spacing.12'),
          },
          '@screen lg': {
            'paddingTop': theme('spacing.16'),
            'paddingBottom': theme('spacing.16'),
          },
        },
        // Premium bottom navigation
        '.nav-bottom-premium': {
          'position': 'fixed',
          'bottom': '0',
          'left': '0',
          'right': '0',
          'backgroundColor': 'rgba(255, 255, 255, 0.8)',
          'backdropFilter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          'borderTop': '1px solid rgba(12, 46, 102, 0.1)',
          'boxShadow': '0 -4px 20px rgba(0, 0, 0, 0.08)',
          'paddingBottom': 'max(env(safe-area-inset-bottom), 0.5rem)',
          'zIndex': '50',
        },
        '.nav-item-premium': {
          'display': 'flex',
          'flexDirection': 'column',
          'alignItems': 'center',
          'justifyContent': 'center',
          'minHeight': '56px',
          'minWidth': '64px',
          'borderRadius': theme('borderRadius.xl'),
          'transition': 'all 0.2s ease',
          '&.active': {
            'backgroundColor': theme('colors.primary.50'),
            'color': theme('colors.primary.600'),
          },
        },
        // Skeleton loader
        '.skeleton': {
          'background': 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
          'backgroundSize': '200% 100%',
          'animation': 'shimmer 1.5s infinite',
          'borderRadius': theme('borderRadius.md'),
        },
        '.skeleton-text': {
          'height': '1em',
          'marginBottom': '0.5em',
          'borderRadius': theme('borderRadius.sm'),
        },
        '.skeleton-circle': {
          'borderRadius': '50%',
        },
      });
    }
  ],
}
