// Premium Touch Gesture Components
// Advanced gesture recognition with React Gesture and custom implementations

import React, { useState, useRef, useCallback } from 'react';
import { motion, useDragControls, PanInfo } from 'framer-motion';
import PropTypes from 'prop-types';
import { useAnimations } from '../../hooks/useAnimations';

/**
 * Swipe Gesture Component
 * Detects swipe gestures in all directions
 */
export const SwipeGesture = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocity = 0.3,
  disabled = false,
  className = '',
  ...props
}) => {
  const { getAnimationConfig } = useAnimations();
  const animationConfig = getAnimationConfig('fast');

  const handleDragEnd = useCallback((event, info) => {
    if (disabled) return;

    const { offset, velocity: dragVelocity } = info;
    const absOffsetX = Math.abs(offset.x);
    const absOffsetY = Math.abs(offset.y);
    const absVelocityX = Math.abs(dragVelocity.x);
    const absVelocityY = Math.abs(dragVelocity.y);

    // Determine if it's a horizontal or vertical swipe
    if (absOffsetX > absOffsetY) {
      // Horizontal swipe
      if (absOffsetX > threshold && absVelocityX > velocity) {
        if (offset.x > 0) {
          onSwipeRight?.(info);
        } else {
          onSwipeLeft?.(info);
        }
      }
    } else {
      // Vertical swipe
      if (absOffsetY > threshold && absVelocityY > velocity) {
        if (offset.y > 0) {
          onSwipeDown?.(info);
        } else {
          onSwipeUp?.(info);
        }
      }
    }
  }, [disabled, threshold, velocity, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return (
    <motion.div
      className={className}
      drag={!disabled}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 0.98 }}
      transition={animationConfig}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Pinch to Zoom Component
 * Handles pinch gestures for zooming content
 */
export const PinchToZoom = ({
  children,
  minScale = 0.5,
  maxScale = 3,
  initialScale = 1,
  onScaleChange,
  disabled = false,
  className = '',
  ...props
}) => {
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const lastTouchDistance = useRef(0);
  const lastTouchCenter = useRef({ x: 0, y: 0 });

  const getTouchDistance = useCallback((touches) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  const getTouchCenter = useCallback((touches) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }, []);

  const handleTouchStart = useCallback((event) => {
    if (disabled || event.touches.length !== 2) return;

    event.preventDefault();
    lastTouchDistance.current = getTouchDistance(event.touches);
    lastTouchCenter.current = getTouchCenter(event.touches);
  }, [disabled, getTouchDistance, getTouchCenter]);

  const handleTouchMove = useCallback((event) => {
    if (disabled || event.touches.length !== 2) return;

    event.preventDefault();
    
    const currentDistance = getTouchDistance(event.touches);
    const currentCenter = getTouchCenter(event.touches);
    
    if (lastTouchDistance.current > 0) {
      const scaleChange = currentDistance / lastTouchDistance.current;
      const newScale = Math.min(Math.max(scale * scaleChange, minScale), maxScale);
      
      // Calculate position adjustment to zoom towards touch center
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = currentCenter.x - centerX;
        const deltaY = currentCenter.y - centerY;
        
        setPosition(prev => ({
          x: prev.x + deltaX * (scaleChange - 1) * 0.1,
          y: prev.y + deltaY * (scaleChange - 1) * 0.1
        }));
      }
      
      setScale(newScale);
      onScaleChange?.(newScale);
    }
    
    lastTouchDistance.current = currentDistance;
    lastTouchCenter.current = currentCenter;
  }, [disabled, scale, minScale, maxScale, onScaleChange, getTouchDistance, getTouchCenter]);

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = 0;
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (disabled) return;
    
    const newScale = scale > 1 ? 1 : 2;
    setScale(newScale);
    setPosition({ x: 0, y: 0 });
    onScaleChange?.(newScale);
  }, [disabled, scale, onScaleChange]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
      {...props}
    >
      <motion.div
        style={{
          scale,
          x: position.x,
          y: position.y
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

/**
 * Long Press Gesture Component
 * Detects long press gestures with customizable duration
 */
export const LongPressGesture = ({
  children,
  onLongPress,
  onLongPressStart,
  onLongPressEnd,
  duration = 500,
  threshold = 10,
  disabled = false,
  showFeedback = true,
  className = '',
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });

  const startLongPress = useCallback((event) => {
    if (disabled) return;

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    startPos.current = { x: clientX, y: clientY };
    setIsPressed(true);
    setProgress(0);
    onLongPressStart?.();

    // Progress animation
    if (showFeedback) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => Math.min(prev + (100 / (duration / 50)), 100));
      }, 50);
    }

    // Long press timeout
    timeoutRef.current = setTimeout(() => {
      setIsPressed(false);
      setProgress(0);
      onLongPress?.();
      onLongPressEnd?.();
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, duration);
  }, [disabled, duration, showFeedback, onLongPress, onLongPressStart, onLongPressEnd]);

  const cancelLongPress = useCallback((event) => {
    if (!isPressed) return;

    // Check if finger moved too much
    if (event && (event.touches || event.clientX !== undefined)) {
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      
      const deltaX = Math.abs(clientX - startPos.current.x);
      const deltaY = Math.abs(clientY - startPos.current.y);
      
      if (deltaX > threshold || deltaY > threshold) {
        // Movement exceeded threshold, cancel long press
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        setIsPressed(false);
        setProgress(0);
        onLongPressEnd?.();
      }
    } else {
      // Touch ended, cancel long press
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      setIsPressed(false);
      setProgress(0);
      onLongPressEnd?.();
    }
  }, [isPressed, threshold, onLongPressEnd]);

  return (
    <motion.div
      className={`relative ${className}`}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      onMouseMove={cancelLongPress}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
      
      {/* Progress indicator */}
      {showFeedback && isPressed && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-primary-500/20 rounded-inherit" />
          <div 
            className="absolute inset-0 bg-primary-500/40 rounded-inherit transition-all duration-75"
            style={{
              clipPath: `circle(${progress}% at center)`
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Pull to Refresh Component
 * Implements pull-to-refresh functionality
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
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {/* Refresh Indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-primary-50 z-10"
        style={{ height: Math.max(pullDistance, isRefreshing ? 60 : 0) }}
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
          paddingTop: Math.max(pullDistance, isRefreshing ? 60 : 0),
          transform: `translateY(${isRefreshing ? 0 : pullDistance}px)`
        }}
        transition={animationConfig}
      >
        {children}
      </motion.div>
    </div>
  );
};

/**
 * Draggable Component
 * Makes elements draggable with constraints and snap-back
 */
export const Draggable = ({
  children,
  onDragStart,
  onDrag,
  onDragEnd,
  constraints,
  snapBack = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const dragControls = useDragControls();
  const { getAnimationConfig } = useAnimations();
  const animationConfig = getAnimationConfig('default');

  const handleDragEnd = useCallback((event, info) => {
    onDragEnd?.(event, info);
    
    if (snapBack) {
      // Animate back to original position
      return { x: 0, y: 0 };
    }
  }, [onDragEnd, snapBack]);

  return (
    <motion.div
      className={className}
      drag={!disabled}
      dragControls={dragControls}
      dragConstraints={constraints}
      dragElastic={0.1}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, zIndex: 1000 }}
      animate={snapBack ? { x: 0, y: 0 } : undefined}
      transition={animationConfig}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Swipe to Delete Component
 * Implements swipe-to-delete functionality for list items
 */
export const SwipeToDelete = ({
  children,
  onDelete,
  deleteThreshold = 100,
  disabled = false,
  className = '',
  ...props
}) => {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const { getAnimationConfig } = useAnimations();
  const animationConfig = getAnimationConfig('default');

  const handleDrag = useCallback((event, info) => {
    if (disabled || isDeleting) return;
    
    // Only allow left swipe (negative x)
    const distance = Math.min(info.offset.x, 0);
    setSwipeDistance(distance);
  }, [disabled, isDeleting]);

  const handleDragEnd = useCallback(async (event, info) => {
    if (disabled || isDeleting) return;

    if (Math.abs(info.offset.x) >= deleteThreshold) {
      setIsDeleting(true);
      try {
        await onDelete?.();
      } catch (error) {
        console.error('Delete failed:', error);
        setSwipeDistance(0);
        setIsDeleting(false);
      }
    } else {
      setSwipeDistance(0);
    }
  }, [disabled, isDeleting, deleteThreshold, onDelete]);

  const deleteProgress = Math.min(Math.abs(swipeDistance) / deleteThreshold, 1);

  return (
    <div className={`relative overflow-hidden ${className}`} {...props}>
      {/* Delete Background */}
      <motion.div
        className="absolute inset-0 bg-red-500 flex items-center justify-end px-4"
        animate={{ 
          opacity: deleteProgress,
          x: swipeDistance
        }}
        transition={animationConfig}
      >
        <div className="flex items-center space-x-2 text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="font-medium">Delete</span>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -deleteThreshold * 1.2, right: 0 }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{ 
          x: isDeleting ? -window.innerWidth : swipeDistance,
          opacity: isDeleting ? 0 : 1
        }}
        transition={animationConfig}
      >
        {children}
      </motion.div>
    </div>
  );
};

// PropTypes
SwipeGesture.propTypes = {
  children: PropTypes.node.isRequired,
  onSwipeLeft: PropTypes.func,
  onSwipeRight: PropTypes.func,
  onSwipeUp: PropTypes.func,
  onSwipeDown: PropTypes.func,
  threshold: PropTypes.number,
  velocity: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

PinchToZoom.propTypes = {
  children: PropTypes.node.isRequired,
  minScale: PropTypes.number,
  maxScale: PropTypes.number,
  initialScale: PropTypes.number,
  onScaleChange: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

LongPressGesture.propTypes = {
  children: PropTypes.node.isRequired,
  onLongPress: PropTypes.func,
  onLongPressStart: PropTypes.func,
  onLongPressEnd: PropTypes.func,
  duration: PropTypes.number,
  threshold: PropTypes.number,
  disabled: PropTypes.bool,
  showFeedback: PropTypes.bool,
  className: PropTypes.string
};

PullToRefresh.propTypes = {
  children: PropTypes.node.isRequired,
  onRefresh: PropTypes.func,
  threshold: PropTypes.number,
  disabled: PropTypes.bool,
  refreshing: PropTypes.bool,
  className: PropTypes.string
};

Draggable.propTypes = {
  children: PropTypes.node.isRequired,
  onDragStart: PropTypes.func,
  onDrag: PropTypes.func,
  onDragEnd: PropTypes.func,
  constraints: PropTypes.object,
  snapBack: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

SwipeToDelete.propTypes = {
  children: PropTypes.node.isRequired,
  onDelete: PropTypes.func,
  deleteThreshold: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default SwipeGesture;