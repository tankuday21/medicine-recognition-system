import React from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Header from './Header';

const AppLayout = ({ children, showNavigation = true }) => {
  const location = useLocation();
  
  // Hide navigation on auth pages
  const hideNavigation = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className={`
        ${!hideNavigation && showNavigation ? 'pb-16 sm:pb-20' : ''}
        px-4 sm:px-6 lg:px-8
        pt-4 sm:pt-6
        max-w-full
        overflow-x-hidden
      `}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation */}
      {!hideNavigation && showNavigation && <Navigation />}
    </div>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
  showNavigation: PropTypes.bool
};

export default AppLayout;