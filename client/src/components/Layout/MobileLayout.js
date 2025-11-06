import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getViewportSize, isMobileDevice } from '../../utils/touchHandlers';

const MobileLayout = ({ children }) => {
  const [viewport, setViewport] = useState(getViewportSize());
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const newViewport = getViewportSize();
      setViewport(newViewport);
      
      // Detect virtual keyboard on mobile
      if (isMobileDevice()) {
        const heightDiff = window.screen.height - window.innerHeight;
        setIsKeyboardOpen(heightDiff > 150); // Threshold for keyboard detection
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const getLayoutClasses = () => {
    const baseClasses = 'min-h-screen bg-gray-50';
    
    if (viewport.isMobile) {
      return `${baseClasses} pb-16 ${isKeyboardOpen ? 'pb-0' : ''}`;
    }
    
    return `${baseClasses} pb-20`;
  };

  const getContentClasses = () => {
    if (viewport.isMobile) {
      return 'px-4 py-4 max-w-full overflow-x-hidden';
    }
    
    return 'px-4 sm:px-6 lg:px-8 py-6';
  };

  return (
    <div className={getLayoutClasses()}>
      {/* Mobile-specific meta viewport adjustments */}
      {viewport.isMobile && (
        <style jsx>{`
          @media screen and (max-width: 768px) {
            body {
              -webkit-text-size-adjust: 100%;
              -webkit-tap-highlight-color: transparent;
              touch-action: manipulation;
            }
            
            * {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            
            input, textarea, [contenteditable] {
              -webkit-user-select: text;
              -khtml-user-select: text;
              -moz-user-select: text;
              -ms-user-select: text;
              user-select: text;
            }
          }
        `}</style>
      )}

      {/* Main Content */}
      <main className={getContentClasses()}>
        {children}
      </main>

      {/* Mobile-specific overlays */}
      {viewport.isMobile && (
        <>
          {/* Keyboard spacer */}
          {isKeyboardOpen && (
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-transparent pointer-events-none z-50" />
          )}
          
          {/* Pull-to-refresh indicator */}
          <div id="pull-to-refresh" className="hidden">
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Refreshing...</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileLayout;