import React from 'react';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 mobile-safe-area">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Logo/Icon */}
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-medical-600 rounded-lg flex-shrink-0">
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
                />
              </svg>
            </div>
            
            {/* Title */}
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
                Mediot
              </h1>
              <p className="text-xs text-gray-600 truncate hidden sm:block">
                Digital Health Companion
              </p>
            </div>
          </div>

          {/* Navigation - Hidden on mobile, shown on desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            <a 
              href="#features" 
              className="text-gray-600 hover:text-medical-600 transition-colors duration-200 text-sm font-medium whitespace-nowrap"
            >
              Features
            </a>
            <a 
              href="#about" 
              className="text-gray-600 hover:text-medical-600 transition-colors duration-200 text-sm font-medium whitespace-nowrap"
            >
              About
            </a>
            <a 
              href="#safety" 
              className="text-gray-600 hover:text-medical-600 transition-colors duration-200 text-sm font-medium whitespace-nowrap"
            >
              Safety
            </a>
          </nav>

          {/* Mobile menu button - Only show on small screens */}
          <div className="lg:hidden">
            <button
              type="button"
              className="tap-target p-2 text-gray-600 hover:text-medical-600 focus:outline-none focus:text-medical-600 transition-colors duration-200"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-3 pt-3 border-t border-gray-200 space-y-2">
            <a 
              href="#features" 
              className="block px-3 py-2 text-gray-600 hover:text-medical-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Features
            </a>
            <a 
              href="#about" 
              className="block px-3 py-2 text-gray-600 hover:text-medical-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              About
            </a>
            <a 
              href="#safety" 
              className="block px-3 py-2 text-gray-600 hover:text-medical-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Safety
            </a>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
