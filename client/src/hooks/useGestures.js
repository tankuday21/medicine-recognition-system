// Gesture Management Hook
// Advanced gesture recognition and management utilities

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAnimations } from './useAnimations';

/**
 * Multi-Touch Gesture Hook
 * Handles complex multi-touch gestures
 */
export const useMultiTouchGestures = ({
  onPinch,
  onRotate,
  onTwoFingerTap,
  onThreeFingerTap,
  enabled = true
} = {}) => {
  const [touches, setTouches] = useState([]);
  const [gestureState, setGestureState] = useState({
    scale: 1,
    rotation: 0,
    center: { x: 0, y: 0 }
  });
  
  const lastGestureState = useRef({
    scale: 1,
    rotation: 0,
    distance: 0,
    angle: 0
  });

  const calculateDistance = useCallback((touch1, touch2) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  const calculateAngle = useCallback((touch1, touch2) => {
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * 180 / Math.PI;
  }, []);

  const calculateCenter = useCallback((touches) => {
    const x = touches.reduce((sum, touch) => sum + touch.clientX, 0) / touches.length;
    const y = touches.reduce((sum, touch) => sum + touch.clientY, 0) / touches.length;
    return { x, y };
  }, []);

  const handleTouchStart = useCallback((event) => {
    if (!enabled) return;
    
    const touchList = Array.from(event.touches);
    setTouches(touchList);

    if (touchList.length === 2) {
      const distance = calculateDistance(touchList[0], touchList[1]);
      const angle = calculateAngle(touchList[0], touchList[1]);
      
      lastGestureState.current = {
        scale: 1,
        rotation: 0,
        distance,
        angle
      };
    }
  }, [enabled, calculateDistance, calculateAngle]);

  const handleTouchMove = useCallback((event) => {
    if (!enabled) return;
    
    const touchList = Array.from(event.touches);
    setTouches(touchList);

    if (touchList.length === 2) {
      const currentDistance = calculateDistance(touchList[0], touchList[1]);
      const currentAngle = calculateAngle(touchList[0], touchList[1]);
      const center = calculateCenter(touchList);

      if (lastGestureState.current.distance > 0) {
        const scale = currentDistance / lastGestureState.current.distance;
        let rotation = currentAngle - lastGestureState.current.angle;
        
        // Normalize rotation to -180 to 180
        if (rotation > 180) rotation -= 360;
        if (rotation < -180) rotation += 360;

        const newGestureState = {
          scale,
          rotation,
          center
        };

        setGestureState(newGestureState);

        // Trigger callbacks
        if (Math.abs(scale - 1) > 0.01) {
          onPinch?.(scale, center);
        }
        
        if (Math.abs(rotation) > 1) {
          onRotate?.(rotation, center);
        }
      }
    }
  }, [enabled, calculateDistance, calculateAngle, calculateCenter, onPinch, onRotate]);

  const handleTouchEnd = useCallback((event) => {
    if (!enabled) return;
    
    const touchList = Array.from(event.touches);
    setTouches(touchList);

    // Detect tap gestures
    if (event.changedTouches.length === 2 && touchList.length === 0) {
      onTwoFingerTap?.();
    } else if (event.changedTouches.length === 3 && touchList.length === 0) {
      onThreeFingerTap?.();
    }

    // Reset gesture state
    if (touchList.length < 2) {
      setGestureState({
        scale: 1,
        rotation: 0,
        center: { x: 0, y: 0 }
      });
      lastGestureState.current = {
        scale: 1,
        rotation: 0,
        distance: 0,
        angle: 0
      };
    }
  }, [enabled, onTwoFingerTap, onThreeFingerTap]);

  return {
    touches,
    gestureState,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};

/**
 * Swipe Gesture Hook
 * Advanced swipe detection with velocity and direction
 */
export const useSwipeGesture = ({
  onSwipe,
  onSwipeStart,
  onSwipeEnd,
  threshold = 50,
  velocity = 0.3,
  maxTime = 1000,
  enabled = true
} = {}) => {
  const [isSwipping, setIsSwipping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const startTouch = useRef(null);
  const startTime = useRef(0);

  const handleTouchStart = useCallback((event) => {
    if (!enabled) return;
    
    const touch = event.touches[0];
    startTouch.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    startTime.current = Date.now();
    setIsSwipping(true);
    onSwipeStart?.(startTouch.current);
  }, [enabled, onSwipeStart]);

  const handleTouchMove = useCallback((event) => {
    if (!enabled || !startTouch.current) return;
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - startTouch.current.x;
    const deltaY = touch.clientY - startTouch.current.y;
    
    // Determine primary direction
    let direction = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    setSwipeDirection(direction);
  }, [enabled]);

  const handleTouchEnd = useCallback((event) => {
    if (!enabled || !startTouch.current) return;
    
    const touch = event.changedTouches[0];
    const endTime = Date.now();
    const deltaTime = endTime - startTime.current;
    
    const deltaX = touch.clientX - startTouch.current.x;
    const deltaY = touch.clientY - startTouch.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const swipeVelocity = distance / deltaTime;
    
    setIsSwipping(false);
    
    // Check if it qualifies as a swipe
    if (distance >= threshold && swipeVelocity >= velocity && deltaTime <= maxTime) {
      const swipeData = {
        direction: swipeDirection,
        distance,
        velocity: swipeVelocity,
        deltaX,
        deltaY,
        duration: deltaTime,
        startPoint: startTouch.current,
        endPoint: { x: touch.clientX, y: touch.clientY }
      };
      
      onSwipe?.(swipeData);
    }
    
    onSwipeEnd?.();
    startTouch.current = null;
    setSwipeDirection(null);
  }, [enabled, threshold, velocity, maxTime, swipeDirection, onSwipe, onSwipeEnd]);

  return {
    isSwipping,
    swipeDirection,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};

/**
 * Long Press Gesture Hook
 * Detects long press with customizable duration and movement threshold
 */
export const useLongPressGesture = ({
  onLongPress,
  onLongPressStart,
  onLongPressEnd,
  duration = 500,
  threshold = 10,
  enabled = true
} = {}) => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const startPosition = useRef(null);

  const startLongPress = useCallback((event) => {
    if (!enabled) return;
    
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    startPosition.current = { x: clientX, y: clientY };
    setIsLongPressing(true);
    setProgress(0);
    onLongPressStart?.();

    // Progress tracking
    intervalRef.current = setInterval(() => {
      setProgress(prev => Math.min(prev + (100 / (duration / 50)), 100));
    }, 50);

    // Long press timeout
    timeoutRef.current = setTimeout(() => {
      setIsLongPressing(false);
      setProgress(0);
      onLongPress?.();
      onLongPressEnd?.();
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, duration);
  }, [enabled, duration, onLongPress, onLongPressStart, onLongPressEnd]);

  const cancelLongPress = useCallback((event) => {
    if (!isLongPressing) return;

    // Check movement threshold
    if (event && startPosition.current) {
      const clientX = event.touches ? event.touches[0]?.clientX : event.clientX;
      const clientY = event.touches ? event.touches[0]?.clientY : event.clientY;
      
      if (clientX !== undefined && clientY !== undefined) {
        const deltaX = Math.abs(clientX - startPosition.current.x);
        const deltaY = Math.abs(clientY - startPosition.current.y);
        
        if (deltaX > threshold || deltaY > threshold) {
          // Movement exceeded threshold
          clearTimeout(timeoutRef.current);
          clearInterval(intervalRef.current);
          setIsLongPressing(false);
          setProgress(0);
          onLongPressEnd?.();
          return;
        }
      }
    }

    // Normal cancellation (touch end, mouse up, etc.)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsLongPressing(false);
    setProgress(0);
    onLongPressEnd?.();
  }, [isLongPressing, threshold, onLongPressEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    isLongPressing,
    progress,
    gestureHandlers: {
      onMouseDown: startLongPress,
      onMouseUp: cancelLongPress,
      onMouseLeave: cancelLongPress,
      onMouseMove: cancelLongPress,
      onTouchStart: startLongPress,
      onTouchEnd: cancelLongPress,
      onTouchMove: cancelLongPress
    }
  };
};

/**
 * Drag Gesture Hook
 * Advanced drag handling with constraints and momentum
 */
export const useDragGesture = ({
  onDragStart,
  onDrag,
  onDragEnd,
  constraints,
  momentum = false,
  enabled = true
} = {}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const startPosition = useRef({ x: 0, y: 0 });
  const lastPosition = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);
  const { getAnimationConfig } = useAnimations();

  const applyConstraints = useCallback((pos) => {
    if (!constraints) return pos;
    
    let { x, y } = pos;
    
    if (constraints.left !== undefined) x = Math.max(x, constraints.left);
    if (constraints.right !== undefined) x = Math.min(x, constraints.right);
    if (constraints.top !== undefined) y = Math.max(y, constraints.top);
    if (constraints.bottom !== undefined) y = Math.min(y, constraints.bottom);
    
    return { x, y };
  }, [constraints]);

  const handleDragStart = useCallback((event) => {
    if (!enabled) return;
    
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    startPosition.current = { x: clientX, y: clientY };
    lastPosition.current = { x: clientX, y: clientY };
    lastTime.current = Date.now();
    
    setIsDragging(true);
    onDragStart?.({ x: clientX, y: clientY });
  }, [enabled, onDragStart]);

  const handleDrag = useCallback((event) => {
    if (!enabled || !isDragging) return;
    
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const currentTime = Date.now();
    
    const deltaX = clientX - startPosition.current.x;
    const deltaY = clientY - startPosition.current.y;
    
    const newPosition = applyConstraints({ x: deltaX, y: deltaY });
    setPosition(newPosition);
    
    // Calculate velocity for momentum
    if (momentum) {
      const timeDelta = currentTime - lastTime.current;
      if (timeDelta > 0) {
        const velocityX = (clientX - lastPosition.current.x) / timeDelta;
        const velocityY = (clientY - lastPosition.current.y) / timeDelta;
        setVelocity({ x: velocityX, y: velocityY });
      }
    }
    
    lastPosition.current = { x: clientX, y: clientY };
    lastTime.current = currentTime;
    
    onDrag?.(newPosition, { x: clientX, y: clientY });
  }, [enabled, isDragging, applyConstraints, momentum, onDrag]);

  const handleDragEnd = useCallback(() => {
    if (!enabled || !isDragging) return;
    
    setIsDragging(false);
    
    // Apply momentum if enabled
    if (momentum && (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1)) {
      const animationConfig = getAnimationConfig('default');
      const momentumDistance = {
        x: velocity.x * 100, // Adjust multiplier as needed
        y: velocity.y * 100
      };
      
      const finalPosition = applyConstraints({
        x: position.x + momentumDistance.x,
        y: position.y + momentumDistance.y
      });
      
      setPosition(finalPosition);
    }
    
    onDragEnd?.(position, velocity);
    setVelocity({ x: 0, y: 0 });
  }, [enabled, isDragging, momentum, velocity, position, applyConstraints, onDragEnd, getAnimationConfig]);

  return {
    isDragging,
    position,
    velocity,
    dragHandlers: {
      onMouseDown: handleDragStart,
      onMouseMove: handleDrag,
      onMouseUp: handleDragEnd,
      onTouchStart: handleDragStart,
      onTouchMove: handleDrag,
      onTouchEnd: handleDragEnd
    },
    resetPosition: () => setPosition({ x: 0, y: 0 })
  };
};

/**
 * Haptic Feedback Hook
 * Provides haptic feedback for gestures (where supported)
 */
export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type = 'light') => {
    if (typeof window === 'undefined' || !window.navigator.vibrate) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [50, 50, 50],
      warning: [20, 20, 20]
    };
    
    const pattern = patterns[type] || patterns.light;
    window.navigator.vibrate(pattern);
  }, []);

  const triggerSelectionHaptic = useCallback(() => {
    triggerHaptic('light');
  }, [triggerHaptic]);

  const triggerImpactHaptic = useCallback((intensity = 'medium') => {
    triggerHaptic(intensity);
  }, [triggerHaptic]);

  const triggerNotificationHaptic = useCallback((type = 'success') => {
    triggerHaptic(type);
  }, [triggerHaptic]);

  return {
    triggerHaptic,
    triggerSelectionHaptic,
    triggerImpactHaptic,
    triggerNotificationHaptic,
    isSupported: typeof window !== 'undefined' && !!window.navigator.vibrate
  };
};

export default useMultiTouchGestures;