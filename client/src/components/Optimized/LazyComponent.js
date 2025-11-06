import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import SkeletonLoader from './SkeletonLoader';

const LazyComponent = ({ 
  children, 
  fallback, 
  errorFallback,
  className = '' 
}) => {
  const defaultFallback = fallback || (
    <div className={`animate-pulse ${className}`}>
      <SkeletonLoader height="h-32" />
    </div>
  );

  return (
    <Suspense fallback={defaultFallback}>
      <ErrorBoundary fallback={errorFallback}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LazyComponent Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-red-600 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-800 font-medium">Something went wrong</p>
          <p className="text-red-600 text-sm mt-1">Please try refreshing the page</p>
        </div>
      );
    }

    return this.props.children;
  }
}

LazyComponent.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  errorFallback: PropTypes.node,
  className: PropTypes.string
};

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node
};

export default LazyComponent;