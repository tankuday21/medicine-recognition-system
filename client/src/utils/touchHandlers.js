// Touch interaction utilities for mobile optimization

export class TouchHandler {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      threshold: 10, // Minimum distance for swipe
      timeout: 300, // Maximum time for tap
      ...options
    };
    
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.isTracking = false;
    
    this.bindEvents();
  }

  bindEvents() {
    if (!this.element) return;

    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
  }

  handleTouchStart(e) {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
    this.isTracking = true;

    if (this.options.onTouchStart) {
      this.options.onTouchStart(e, { x: this.startX, y: this.startY });
    }
  }

  handleTouchMove(e) {
    if (!this.isTracking) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;

    if (this.options.onTouchMove) {
      this.options.onTouchMove(e, { deltaX, deltaY, x: touch.clientX, y: touch.clientY });
    }

    // Prevent scrolling if we're handling the gesture
    if (this.options.preventDefault && (Math.abs(deltaX) > this.options.threshold || Math.abs(deltaY) > this.options.threshold)) {
      e.preventDefault();
    }
  }

  handleTouchEnd(e) {
    if (!this.isTracking) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    const deltaTime = Date.now() - this.startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    this.isTracking = false;

    // Determine gesture type
    if (deltaTime < this.options.timeout && distance < this.options.threshold) {
      // Tap
      if (this.options.onTap) {
        this.options.onTap(e, { x: touch.clientX, y: touch.clientY });
      }
    } else if (distance > this.options.threshold) {
      // Swipe
      const direction = this.getSwipeDirection(deltaX, deltaY);
      if (this.options.onSwipe) {
        this.options.onSwipe(e, { direction, deltaX, deltaY, distance });
      }
    }

    if (this.options.onTouchEnd) {
      this.options.onTouchEnd(e, { deltaX, deltaY, deltaTime, distance });
    }
  }

  handleTouchCancel(e) {
    this.isTracking = false;
    if (this.options.onTouchCancel) {
      this.options.onTouchCancel(e);
    }
  }

  getSwipeDirection(deltaX, deltaY) {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  destroy() {
    if (!this.element) return;

    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);
  }
}

// React hook for touch gestures
export const useTouchGestures = (ref, options = {}) => {
  React.useEffect(() => {
    if (!ref.current) return;

    const touchHandler = new TouchHandler(ref.current, options);

    return () => {
      touchHandler.destroy();
    };
  }, [ref, options]);
};

// Utility functions for mobile detection
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const getViewportSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024
  };
};

// Haptic feedback for mobile devices
export const triggerHapticFeedback = (type = 'light') => {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate([30, 10, 30]);
        break;
      case 'success':
        navigator.vibrate([100, 30, 100]);
        break;
      case 'error':
        navigator.vibrate([200, 100, 200]);
        break;
      default:
        navigator.vibrate(10);
    }
  }
};

// Prevent zoom on double tap
export const preventZoom = (element) => {
  let lastTouchEnd = 0;
  
  element.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
};

// Smooth scroll to element
export const smoothScrollTo = (element, options = {}) => {
  const defaultOptions = {
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
    ...options
  };

  if (element && element.scrollIntoView) {
    element.scrollIntoView(defaultOptions);
  }
};

// Mobile-optimized debounce for scroll events
export const mobileDebounce = (func, wait = 16) => {
  let timeout;
  let lastExecTime = 0;
  
  return function executedFunction(...args) {
    const context = this;
    const currentTime = Date.now();
    
    const later = () => {
      timeout = null;
      lastExecTime = currentTime;
      func.apply(context, args);
    };

    // For mobile, use requestAnimationFrame for better performance
    if (isMobileDevice() && 'requestAnimationFrame' in window) {
      if (timeout) {
        cancelAnimationFrame(timeout);
      }
      timeout = requestAnimationFrame(later);
    } else {
      // Standard debounce for desktop
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    }
  };
};

export default {
  TouchHandler,
  useTouchGestures,
  isMobileDevice,
  isTouchDevice,
  getViewportSize,
  triggerHapticFeedback,
  preventZoom,
  smoothScrollTo,
  mobileDebounce
};