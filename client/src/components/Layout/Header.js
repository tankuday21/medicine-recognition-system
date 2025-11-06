import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../LanguageSwitcher';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Mediot';
      case '/scanner':
        return 'Scanner';
      case '/chat':
        return 'AI Assistant';
      case '/reminders':
        return 'Reminders';
      case '/symptoms':
        return 'Symptom Checker';
      case '/reports':
        return 'Reports';
      case '/sos':
        return 'Emergency SOS';
      case '/price-lookup':
        return 'Price Lookup';
      case '/news':
        return 'Health News';
      case '/profile':
        return 'Profile';
      case '/login':
        return 'Login';
      case '/register':
        return 'Register';
      default:
        return 'Mediot';
    }
  };

  const showBackButton = () => {
    return !['/'].includes(location.pathname);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Back button or Logo */}
          <div className="flex items-center">
            {showBackButton() ? (
              <button
                onClick={handleBack}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
            ) : (
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-blue-600">Mediot</h1>
                </div>
              </div>
            )}
          </div>

          {/* Center - Page Title */}
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {getPageTitle()}
            </h2>
          </div>

          {/* Right side - Language switcher and User menu */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher size="sm" showLabel={false} />
            
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/profile')}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {user?.name ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <UserCircleIcon className="h-8 w-8" />
                )}
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;