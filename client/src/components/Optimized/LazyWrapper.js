import React, { Suspense, lazy, useState, useEffect } from 'react';
import { createLazyComponent } from '../../utils/performance';

// Loading spinner component
const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

// Skeleton loading component
const SkeletonLoader = ({ 
  lines = 3, 
  height = 'h-4', 
  className = '',
  animated = true 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`
            ${height} bg-gray-200 rounded
            ${animated ? 'animate-pulse' : ''}
            ${index === lines - 1 ? 'w-3/4' : 'w-full'}
          `}
        />
      ))}
    </div>
  );
};

// Card skeleton
const CardSkeleton = ({ animated = true }) => (
  <div className={`border border-gray-200 rounded-lg p-4 ${animated ? 'animate-pulse' : ''}`}>
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

// List skeleton
const ListSkeleton = ({ items = 5, animated = true }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, index) => (
      <CardSkeleton key={index} animated={animated} />
    ))}
  </div>
);

// Error boundary for lazy components
class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Failed to load this component. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main lazy wrapper component
const LazyWrapper = ({
  children,
  fallback = <LoadingSpinner />,
  errorFallback = null,
  delay = 0,
  timeout = 10000,
  retryCount = 3,
  onError = () => {},
  onLoad = () => {},
  className = ''
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    // Set timeout for loading
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, retries]);

  const handleRetry = () => {
    if (retries < retryCount) {
      setRetries(prev => prev + 1);
      setIsTimedOut(false);
      window.location.reload();
    }
  };

  if (isTimedOut) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <div className="text-yellow-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Loading is taking longer than expected
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          This might be due to a slow connection or server issues.
        </p>
        <div className="space-x-3">
          <button
            onClick={handleRetry}
            disabled={retries >= retryCount}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {retries >= retryCount ? 'Max retries reached' : `Retry (${retries}/${retryCount})`}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <LazyErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <div className={className}>
          {children}
        </div>
      </Suspense>
    </LazyErrorBoundary>
  );
};

// HOC for creating lazy components with built-in loading states
export const withLazyLoading = (
  importFunc,
  options = {}
) => {
  const {
    fallback = <LoadingSpinner />,
    errorFallback = null,
    delay = 200,
    ...wrapperOptions
  } = options;

  const LazyComponent = createLazyComponent(importFunc);

  return React.forwardRef((props, ref) => (
    <LazyWrapper
      fallback={fallback}
      errorFallback={errorFallback}
      delay={delay}
      {...wrapperOptions}
    >
      <LazyComponent ref={ref} {...props} />
    </LazyWrapper>
  ));
};

// Lazy route component
export const LazyRoute = ({
  component: Component,
  fallback = <LoadingSpinner text="Loading page..." />,
  ...props
}) => (
  <LazyWrapper fallback={fallback}>
    <Component {...props} />
  </LazyWrapper>
);

// Intersection observer lazy wrapper
export const IntersectionLazyWrapper = ({
  children,
  fallback = <SkeletonLoader />,
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = React.useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasTriggered(true);
            observer.unobserve(element);
          }
        } else if (!triggerOnce && !entry.isIntersecting) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return (
    <div ref={elementRef} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
};

// Preload component for critical resources
export const PreloadWrapper = ({
  children,
  resources = [],
  fonts = [],
  images = []
}) => {
  useEffect(() => {
    // Preload resources
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      document.head.appendChild(link);
    });

    // Preload fonts
    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Preload images
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [resources, fonts, images]);

  return children;
};

// Export loading components
export {
  LoadingSpinner,
  SkeletonLoader,
  CardSkeleton,
  ListSkeleton,
  LazyErrorBoundary
};

export default LazyWrapper;