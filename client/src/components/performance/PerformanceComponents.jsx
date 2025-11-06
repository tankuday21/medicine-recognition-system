// Performance-Optimized React Components
// High-performance components with optimization techniques

import React, { 
  memo, 
  useMemo, 
  useCallback, 
  useState, 
  useEffect, 
  useRef, 
  Suspense,
  lazy
} from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';
import { imageOptimizationManager } from '../../utils/performanceOptimization';

/**
 * Optimized Image Component
 * Lazy loading with intersection observer and format optimization
 */
export const OptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'blur',
  priority = false,
  sizes,
  quality = 75,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const [imageSrc] = useState(priority ? src : '');

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement || priority) return;

    // Set up lazy loading
    imgElement.dataset.src = src;
    imageOptimizationManager.lazyLoadImage(imgElement);

    // Listen for load events
    const handleLoad = () => {
      setIsLoaded(true);
      onLoad?.();
    };

    const handleError = () => {
      setHasError(true);
      onError?.();
    };

    imgElement.addEventListener('load', handleLoad);
    imgElement.addEventListener('error', handleError);

    return () => {
      imgElement.removeEventListener('load', handleLoad);
      imgElement.removeEventListener('error', handleError);
    };
  }, [src, priority, onLoad, onError]);

  const imageClasses = combineClasses(
    'transition-opacity duration-300',
    isLoaded ? 'opacity-100' : 'opacity-0',
    hasError ? 'bg-gray-200' : '',
    className
  );

  const placeholderClasses = combineClasses(
    'absolute inset-0 transition-opacity duration-300',
    isLoaded ? 'opacity-0' : 'opacity-100',
    placeholder === 'blur' ? 'bg-gray-200 animate-pulse' : 'bg-gray-100'
  );

  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div className={placeholderClasses}>
          {placeholder === 'blur' && (
            <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
          )}
        </div>
      )}

      {/* Main Image */}
      <img
        ref={imgRef}
        src={priority ? src : imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={imageClasses}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes}
        {...props}
      />

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
});

/**
 * Virtual Scrolling List Component
 * High-performance list rendering for large datasets
 */
export const VirtualScrollList = memo(({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  renderItem,
  overscan = 5,
  onScroll,
  className = '',
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(e);
  }, [onScroll]);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={combineClasses('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      {...props}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div
                key={item.id || actualIndex}
                style={{ height: itemHeight }}
                className="flex items-center"
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

/**
 * Memoized List Item Component
 * Prevents unnecessary re-renders in lists
 */
export const MemoizedListItem = memo(({
  item,
  index,
  isSelected = false,
  onClick,
  className = '',
  children,
  ...props
}) => {
  const handleClick = useCallback(() => {
    onClick?.(item, index);
  }, [onClick, item, index]);

  const itemClasses = combineClasses(
    'transition-colors duration-200',
    isSelected ? 'bg-primary-50 border-primary-200' : 'hover:bg-gray-50',
    'cursor-pointer',
    className
  );

  return (
    <div
      className={itemClasses}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
});

/**
 * Debounced Input Component
 * Reduces API calls and improves performance
 */
export const DebouncedInput = memo(({
  value: initialValue = '',
  onChange,
  debounceMs = 300,
  placeholder,
  className = '',
  ...props
}) => {
  const [value, setValue] = useState(initialValue);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const debouncedOnChange = useCallback((newValue) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange?.(newValue);
    }, debounceMs);
  }, [onChange, debounceMs]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedOnChange(newValue);
  }, [debouncedOnChange]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
});

/**
 * Lazy Loading Container Component
 * Loads content when it comes into view
 */
export const LazyLoadContainer = memo(({
  children,
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded" />,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, hasLoaded]);

  return (
    <div ref={containerRef} className={className} {...props}>
      {isVisible ? children : fallback}
    </div>
  );
});

/**
 * Optimized Data Table Component
 * Virtual scrolling with memoized cells
 */
export const OptimizedDataTable = memo(({
  data = [],
  columns = [],
  rowHeight = 50,
  maxHeight = 400,
  onRowClick,
  className = '',
  ...props
}) => {
  const MemoizedCell = memo(({ value, column, row }) => {
    if (column.render) {
      return column.render(value, row);
    }
    return <span>{value}</span>;
  });

  const MemoizedRow = memo(({ item, index, columns, onRowClick }) => {
    const handleRowClick = useCallback(() => {
      onRowClick?.(item, index);
    }, [item, index, onRowClick]);

    return (
      <tr
        className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
        onClick={handleRowClick}
      >
        {columns.map((column) => (
          <td key={column.key} className="px-4 py-2 border-b border-gray-200">
            <MemoizedCell
              value={item[column.key]}
              column={column}
              row={item}
            />
          </td>
        ))}
      </tr>
    );
  });

  const renderRow = useCallback((item, index) => (
    <MemoizedRow
      item={item}
      index={index}
      columns={columns}
      onRowClick={onRowClick}
    />
  ), [columns, onRowClick]);

  return (
    <div className={combineClasses('overflow-hidden border border-gray-200 rounded-lg', className)} {...props}>
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
      </table>
      
      <VirtualScrollList
        items={data}
        itemHeight={rowHeight}
        containerHeight={maxHeight}
        renderItem={renderRow}
        className="block"
      />
    </div>
  );
});

/**
 * Skeleton Loading Component
 * Optimized skeleton with minimal re-renders
 */
export const SkeletonLoading = memo(({
  lines = 3,
  avatar = false,
  width = '100%',
  height = 'auto',
  className = '',
  ...props
}) => {
  const skeletonLines = useMemo(() => 
    Array.from({ length: lines }, (_, i) => ({
      id: i,
      width: i === lines - 1 ? '75%' : '100%'
    }))
  , [lines]);

  return (
    <div className={combineClasses('animate-pulse', className)} style={{ width, height }} {...props}>
      <div className="flex space-x-4">
        {avatar && (
          <div className="rounded-full bg-gray-300 h-10 w-10 flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          {skeletonLines.map((line) => (
            <div
              key={line.id}
              className="h-4 bg-gray-300 rounded"
              style={{ width: line.width }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

/**
 * Optimized Modal Component
 * Portal-based modal with performance optimizations
 */
export const OptimizedModal = memo(({
  isOpen,
  onClose,
  children,
  className = '',
  ...props
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={combineClasses(
          'relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});

/**
 * Code Splitting Wrapper Component
 * Handles lazy loading with error boundaries
 */
export const CodeSplitWrapper = memo(({
  importFn,
  fallback = <SkeletonLoading />,
  errorFallback = <div>Failed to load component</div>,
  ...props
}) => {
  const LazyComponent = useMemo(() => lazy(importFn), [importFn]);

  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary fallback={errorFallback}>
        <LazyComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
});

/**
 * Error Boundary Component
 * Catches and handles component errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

/**
 * Performance Monitor Component
 * Displays performance metrics in development
 */
export const PerformanceMonitor = memo(() => {
  const [metrics, setMetrics] = useState({});
  const [isVisible, setIsVisible] = useState(process.env.NODE_ENV === 'development');

  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      setMetrics({
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
        memoryUsage: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        } : null
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Performance</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-300 hover:text-white"
        >
          ×
        </button>
      </div>
      <div className="space-y-1">
        <div>FCP: {metrics.firstContentfulPaint?.toFixed(0)}ms</div>
        <div>DCL: {metrics.domContentLoaded?.toFixed(0)}ms</div>
        {metrics.memoryUsage && (
          <div>Memory: {metrics.memoryUsage.used}MB / {metrics.memoryUsage.total}MB</div>
        )}
      </div>
    </div>
  );
});

// PropTypes
OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  placeholder: PropTypes.oneOf(['blur', 'empty']),
  priority: PropTypes.bool,
  sizes: PropTypes.string,
  quality: PropTypes.number,
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

VirtualScrollList.propTypes = {
  items: PropTypes.array,
  itemHeight: PropTypes.number,
  containerHeight: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
  overscan: PropTypes.number,
  onScroll: PropTypes.func,
  className: PropTypes.string
};

MemoizedListItem.propTypes = {
  item: PropTypes.any.isRequired,
  index: PropTypes.number.isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node
};

DebouncedInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  debounceMs: PropTypes.number,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

LazyLoadContainer.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  threshold: PropTypes.number,
  rootMargin: PropTypes.string,
  className: PropTypes.string
};

OptimizedDataTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    render: PropTypes.func
  })),
  rowHeight: PropTypes.number,
  maxHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  className: PropTypes.string
};

SkeletonLoading.propTypes = {
  lines: PropTypes.number,
  avatar: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string
};

OptimizedModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

CodeSplitWrapper.propTypes = {
  importFn: PropTypes.func.isRequired,
  fallback: PropTypes.node,
  errorFallback: PropTypes.node
};

export default OptimizedImage;