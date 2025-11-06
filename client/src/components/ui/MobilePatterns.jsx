// Mobile-Specific UI Patterns
// Specialized components for mobile interactions and layouts

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { combineClasses } from '../../utils/design-system';
import { useAnimations, useInViewAnimation } from '../../hooks/useAnimations';
import { useResponsive } from '../../hooks/useDesignSystem';

/**
 * Pull to Refresh Component
 * Mobile pull-to-refresh functionality
 */
export const PullToRefresh = ({
  children,
  onRefresh,
  threshold = 80,
  disabled = false,
  refreshing = false,
  className = '',
  ...props
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(refreshing);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const { getAnimationConfig } = useAnimations();
  const animationConfig = getAnimationConfig('default');

  useEffect(() => {
    setIsRefreshing(refreshing);
  }, [refreshing]);

  const handleTouchStart = useCallback((event) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      startY.current = event.touches[0].clientY;
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((event) => {
    if (disabled || isRefreshing || startY.current === 0) return;

    const currentY = event.touches[0].clientY;
    const deltaY = currentY - startY.current;
    
    if (deltaY > 0) {
      event.preventDefault();
      const distance = Math.min(deltaY * 0.5, threshold * 1.5);
      setPullDistance(distance);
    }
  }, [disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh?.();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    startY.current = 0;
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  const refreshProgress = Math.min(pullDistance / threshold, 1);
  const showRefreshIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div
      ref={containerRef}
      className={combineClasses('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {/* Refresh Indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-primary-50 z-10"
        animate={{ 
          height: isRefreshing ? 60 : Math.max(pullDistance, 0),
          opacity: showRefreshIndicator ? 1 : 0
        }}
        transition={animationConfig}
      >
        <div className="flex items-center space-x-2 text-primary-600">
          {isRefreshing ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span className="text-sm font-medium">Refreshing...</span>
            </>
          ) : (
            <>
              <motion.div
                className="w-5 h-5"
                animate={{ rotate: refreshProgress * 180 }}
                transition={animationConfig}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
              <span className="text-sm font-medium">
                {refreshProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ 
          paddingTop: Math.max(pullDistance, isRefreshing ? 60 : 0)
        }}
        transition={animationConfig}
      >
        {children}
      </motion.div>
    </div>
  );
};

/**
 * Infinite Scroll Component
 * Virtual scrolling with performance optimization
 */
export const InfiniteScroll = ({
  children,
  hasMore = true,
  loadMore,
  loading = false,
  threshold = 200,
  loader,
  endMessage,
  className = '',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const { ref: triggerRef, isInView } = useInViewAnimation({
    threshold: 0.1,
    triggerOnce: false
  });

  useEffect(() => {
    if (isInView && hasMore && !loading && !isLoading) {
      setIsLoading(true);
      loadMore?.().finally(() => setIsLoading(false));
    }
  }, [isInView, hasMore, loading, isLoading, loadMore]);

  const defaultLoader = (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
        <span className="text-sm">Loading more...</span>
      </div>
    </div>
  );

  const defaultEndMessage = (
    <div className="text-center py-4 text-gray-500 text-sm">
      No more items to load
    </div>
  );

  return (
    <div ref={containerRef} className={combineClasses('overflow-auto', className)} {...props}>
      {children}
      
      {hasMore && (
        <div ref={triggerRef}>
          {(loading || isLoading) ? (loader || defaultLoader) : null}
        </div>
      )}
      
      {!hasMore && (endMessage || defaultEndMessage)}
    </div>
  );
};

/**
 * Virtual List Component
 * High-performance virtual scrolling for large lists
 */
export const VirtualList = ({
  items = [],
  itemHeight = 60,
  containerHeight = 400,
  renderItem,
  overscan = 5,
  className = '',
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

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
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Floating Action Button Component
 * Material Design FAB with extended functionality
 */
export const FloatingActionButton = ({
  icon,
  label,
  onClick,
  position = 'bottom-right',
  size = 'default',
  variant = 'primary',
  extended = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'bottom-center': 'fixed bottom-6 left-1/2 transform -translate-x-1/2',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };

  const sizeClasses = {
    small: extended ? 'h-10 px-4' : 'w-10 h-10',
    default: extended ? 'h-14 px-6' : 'w-14 h-14',
    large: extended ? 'h-16 px-8' : 'w-16 h-16'
  };

  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200',
    medical: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/30'
  };

  const fabClasses = combineClasses(
    'flex items-center justify-center',
    'rounded-full transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    'active:scale-95 hover:scale-105',
    'z-50 safe-area-inset',
    positionClasses[position],
    sizeClasses[size],
    variantClasses[variant],
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className
  );

  return (
    <motion.button
      className={fabClasses}
      onClick={disabled ? undefined : onClick}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      disabled={disabled}
      {...props}
    >
      {icon && (
        <div className={combineClasses(
          size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6',
          extended && label ? 'mr-2' : ''
        )}>
          {icon}
        </div>
      )}
      
      {extended && label && (
        <span className={combineClasses(
          'font-medium',
          size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'
        )}>
          {label}
        </span>
      )}
    </motion.button>
  );
};

/**
 * Speed Dial FAB Component
 * FAB with expandable action menu
 */
export const SpeedDialFAB = ({
  icon,
  actions = [],
  position = 'bottom-right',
  direction = 'up',
  disabled = false,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleActionClick = (action) => {
    action.onClick?.();
    setIsOpen(false);
  };

  const getActionPosition = (index) => {
    const spacing = 60;
    const offset = (index + 1) * spacing;
    
    switch (direction) {
      case 'up':
        return { bottom: offset };
      case 'down':
        return { top: offset };
      case 'left':
        return { right: offset };
      case 'right':
        return { left: offset };
      default:
        return { bottom: offset };
    }
  };

  return (
    <div className="relative">
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && actions.map((action, index) => (
          <motion.div
            key={index}
            className="absolute z-50"
            style={getActionPosition(index)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center space-x-3">
              {/* Label */}
              {action.label && (
                <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                  {action.label}
                </div>
              )}
              
              {/* Action Button */}
              <button
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                className={combineClasses(
                  'w-12 h-12 rounded-full shadow-lg',
                  'flex items-center justify-center',
                  'transition-all duration-200 ease-out',
                  'hover:scale-105 active:scale-95',
                  action.variant === 'danger' 
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200',
                  action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                )}
              >
                <div className="w-5 h-5">
                  {action.icon}
                </div>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main FAB */}
      <FloatingActionButton
        icon={
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {icon || (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
          </motion.div>
        }
        onClick={toggleOpen}
        position={position}
        disabled={disabled}
        className={className}
        {...props}
      />
    </div>
  );
};

/**
 * Mobile Data Table Component
 * Responsive table that converts to cards on mobile
 */
export const MobileDataTable = ({
  data = [],
  columns = [],
  keyField = 'id',
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  ...props
}) => {
  const { isMobile } = useResponsive();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  if (isMobile) {
    // Mobile card layout
    return (
      <div className={combineClasses('space-y-3', className)} {...props}>
        {data.map((row, index) => (
          <motion.div
            key={row[keyField] || index}
            className={combineClasses(
              'bg-white rounded-lg border border-gray-200 p-4 shadow-sm',
              onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''
            )}
            onClick={() => onRowClick?.(row, index)}
            whileHover={onRowClick ? { y: -2 } : {}}
            whileTap={onRowClick ? { scale: 0.98 } : {}}
          >
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-start mb-2 last:mb-0">
                <span className="text-sm font-medium text-gray-600 mr-3">
                  {column.title}:
                </span>
                <span className="text-sm text-gray-900 text-right flex-1">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    );
  }

  // Desktop table layout
  return (
    <div className={combineClasses('overflow-x-auto', className)} {...props}>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr
              key={row[keyField] || index}
              className={combineClasses(
                'hover:bg-gray-50 transition-colors duration-200',
                onRowClick ? 'cursor-pointer' : ''
              )}
              onClick={() => onRowClick?.(row, index)}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Sticky Header Component
 * Header that sticks to top with scroll effects
 */
export const StickyHeader = ({
  children,
  threshold = 50,
  className = '',
  ...props
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsSticky(currentScrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const headerClasses = combineClasses(
    'sticky top-0 z-30 transition-all duration-200 ease-out',
    isSticky 
      ? 'bg-white/95 backdrop-blur-md shadow-md' 
      : 'bg-white',
    className
  );

  return (
    <motion.header
      className={headerClasses}
      animate={{
        y: isSticky ? 0 : 0,
        boxShadow: isSticky 
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
          : '0 0 0 0 rgba(0, 0, 0, 0)'
      }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.header>
  );
};

// PropTypes
PullToRefresh.propTypes = {
  children: PropTypes.node.isRequired,
  onRefresh: PropTypes.func,
  threshold: PropTypes.number,
  disabled: PropTypes.bool,
  refreshing: PropTypes.bool,
  className: PropTypes.string
};

InfiniteScroll.propTypes = {
  children: PropTypes.node.isRequired,
  hasMore: PropTypes.bool,
  loadMore: PropTypes.func,
  loading: PropTypes.bool,
  threshold: PropTypes.number,
  loader: PropTypes.node,
  endMessage: PropTypes.node,
  className: PropTypes.string
};

VirtualList.propTypes = {
  items: PropTypes.array,
  itemHeight: PropTypes.number,
  containerHeight: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
  overscan: PropTypes.number,
  className: PropTypes.string
};

FloatingActionButton.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string,
  onClick: PropTypes.func,
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'bottom-center', 'top-right', 'top-left']),
  size: PropTypes.oneOf(['small', 'default', 'large']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'medical']),
  extended: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

SpeedDialFAB.propTypes = {
  icon: PropTypes.node,
  actions: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.node.isRequired,
    label: PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    variant: PropTypes.oneOf(['default', 'danger'])
  })),
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'bottom-center', 'top-right', 'top-left']),
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
  disabled: PropTypes.bool,
  className: PropTypes.string
};

MobileDataTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    render: PropTypes.func
  })),
  keyField: PropTypes.string,
  onRowClick: PropTypes.func,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  className: PropTypes.string
};

StickyHeader.propTypes = {
  children: PropTypes.node.isRequired,
  threshold: PropTypes.number,
  className: PropTypes.string
};

export default PullToRefresh;