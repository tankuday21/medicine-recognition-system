import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, allowGuest = false }) => {
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated, show content
  if (isAuthenticated) {
    return children;
  }

  // If guest mode is allowed and user is a guest, show content
  if (allowGuest && isGuest) {
    return children;
  }

  // If user is a guest but guest mode is not allowed for this route, show upgrade prompt
  if (isGuest && !allowGuest) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-950/30 rounded-3xl flex items-center justify-center mb-6">
          <LockClosedIcon className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Premium Feature</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-md">
          This feature requires a full account. Create an account to unlock all features and sync your data across devices.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <Navigate to="/login" state={{ from: location }} replace />
        </div>
      </div>
    );
  }

  // If not authenticated and not guest, redirect to login
  return <Navigate to="/login" state={{ from: location }} replace />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowGuest: PropTypes.bool
};

export default ProtectedRoute;