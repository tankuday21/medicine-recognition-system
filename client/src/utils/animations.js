// Animation utilities and custom hooks for React components

import { useEffect, useRef, useState, useCallback } from 'react';

// Easing functions
export const easing = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  easeInQuint: (t) => t * t * t * t * t,
  easeOutQuint: (t) => 1 + (--t) * t * t * t * t,
  easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
  easeInSine: (t) => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: (t) => Math.sin(t * Math.PI / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  easeInCirc: (t) => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: (t) => Math.sqrt(1 - (--t) * t),
  easeInOutCirc: (t) => {
    if (t < 0.5) return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
    return (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
  },
  easeInBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  easeInElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
  easeInBounce: (t) => 1 - easing.easeOutBounce(1 - t),
  easeOutBounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  easeInOutBounce: (t) => t < 0.5
    ? (1 - easing.easeOutBounce(1 - 2 * t)) / 2
    : (1 + easing.easeOutBounce(2 * t - 1)) / 2
};

// Animation class for complex animations
export class Animation {
  constructor(options = {}) {
    this.duration = options.duration || 300;
    this.easing = options.easing || easing.easeOutQuad;
    this.onUpdate = options.onUpdate || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.delay = options.delay || 0;
    
    this.startTime = null;
    this.isRunning = false;
    this.isPaused = false;
    this.pausedTime = 0;
    this.animationId = null;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = performance.now() + this.delay;
    this.animate();
    
    return this;
  }

  pause() {
    if (!this.isRunning || this.isPaused) return;
    
    this.isPaused = true;
    this.pausedTime = performance.now();
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    return this;
  }

  resume() {
    if (!this.isPaused) return;
    
    this.isPaused = false;
    const pauseDuration = performance.now() - this.pausedTime;
    this.startTime += pauseDuration;
    this.animate();
    
    return this;
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    return this;
  }

  animate() {
    if (!this.isRunning || this.isPaused) return;
    
    const currentTime = performance.now();
    
    if (currentTime < this.startTime) {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }
    
    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    const easedProgress = this.easing(progress);
    
    this.onUpdate(easedProgress, progress);
    
    if (progress >= 1) {
      this.isRunning = false;
      this.onComplete();
    } else {
      this.animationId = requestAnimationFrame(() => this.animate());
    }
  }
}

// React hooks for animations

// Fade in animation hook
export const useFadeIn = (duration = 300, delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const animation = new Animation({
      duration,
      delay,
      easing: easing.easeOutQuad,
      onUpdate: (progress) => {
        element.style.opacity = progress;
        element.style.transform = `translateY(${(1 - progress) * 20}px)`;
      },
      onComplete: () => {
        setIsVisible(true);
      }
    });

    animation.start();

    return () => animation.stop();
  }, [duration, delay]);

  return [elementRef, isVisible];
};

// Slide in animation hook
export const useSlideIn = (direction = 'left', duration = 300, delay = 0) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const getTransform = (progress) => {
      const distance = 100;
      const offset = (1 - progress) * distance;
      
      switch (direction) {
        case 'left':
          return `translateX(-${offset}px)`;
        case 'right':
          return `translateX(${offset}px)`;
        case 'up':
          return `translateY(-${offset}px)`;
        case 'down':
          return `translateY(${offset}px)`;
        default:
          return `translateX(-${offset}px)`;
      }
    };

    const animation = new Animation({
      duration,
      delay,
      easing: easing.easeOutCubic,
      onUpdate: (progress) => {
        element.style.opacity = progress;
        element.style.transform = getTransform(progress);
      }
    });

    animation.start();

    return () => animation.stop();
  }, [direction, duration, delay]);

  return elementRef;
};

// Scale animation hook
export const useScale = (duration = 200, delay = 0) => {
  const elementRef = useRef(null);

  const animate = useCallback((fromScale = 0, toScale = 1) => {
    const element = elementRef.current;
    if (!element) return;

    const animation = new Animation({
      duration,
      delay,
      easing: easing.easeOutBack,
      onUpdate: (progress) => {
        const scale = fromScale + (toScale - fromScale) * progress;
        element.style.transform = `scale(${scale})`;
        element.style.opacity = progress;
      }
    });

    animation.start();
    return animation;
  }, [duration, delay]);

  return [elementRef, animate];
};

// Stagger animation hook for lists
export const useStagger = (itemCount, duration = 300, staggerDelay = 50) => {
  const containerRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const animate = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    setIsAnimating(true);
    const items = container.children;

    Array.from(items).forEach((item, index) => {
      const animation = new Animation({
        duration,
        delay: index * staggerDelay,
        easing: easing.easeOutQuad,
        onUpdate: (progress) => {
          item.style.opacity = progress;
          item.style.transform = `translateY(${(1 - progress) * 30}px)`;
        },
        onComplete: () => {
          if (index === items.length - 1) {
            setIsAnimating(false);
          }
        }
      });

      animation.start();
    });
  }, [itemCount, duration, staggerDelay]);

  return [containerRef, animate, isAnimating];
};

// Intersection observer animation hook
export const useIntersectionAnimation = (options = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
          
          const animation = new Animation({
            duration: options.duration || 600,
            delay: options.delay || 0,
            easing: options.easing || easing.easeOutQuad,
            onUpdate: (progress) => {
              element.style.opacity = progress;
              element.style.transform = `translateY(${(1 - progress) * 50}px)`;
            }
          });

          animation.start();
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px'
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasAnimated, options]);

  return [elementRef, isVisible];
};

// Parallax scroll hook
export const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * speed;
      element.style.transform = `translateY(${parallax}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return elementRef;
};

// Morphing animation between states
export const useMorph = (duration = 400) => {
  const elementRef = useRef(null);

  const morph = useCallback((fromState, toState) => {
    const element = elementRef.current;
    if (!element) return;

    const animation = new Animation({
      duration,
      easing: easing.easeInOutCubic,
      onUpdate: (progress) => {
        // Interpolate between states
        Object.keys(toState).forEach(property => {
          const fromValue = fromState[property] || 0;
          const toValue = toState[property];
          const currentValue = fromValue + (toValue - fromValue) * progress;
          
          if (property === 'opacity') {
            element.style.opacity = currentValue;
          } else if (property === 'scale') {
            element.style.transform = `scale(${currentValue})`;
          } else if (property === 'rotate') {
            element.style.transform = `rotate(${currentValue}deg)`;
          } else if (property === 'x') {
            element.style.transform = `translateX(${currentValue}px)`;
          } else if (property === 'y') {
            element.style.transform = `translateY(${currentValue}px)`;
          }
        });
      }
    });

    animation.start();
    return animation;
  }, [duration]);

  return [elementRef, morph];
};

// Loading animation hook
export const useLoadingAnimation = () => {
  const elementRef = useRef(null);
  const animationRef = useRef(null);

  const start = useCallback(() => {
    const element = elementRef.current;
    if (!element || animationRef.current) return;

    let rotation = 0;
    
    const animate = () => {
      rotation += 5;
      element.style.transform = `rotate(${rotation}deg)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return [elementRef, start, stop];
};

// Pulse animation hook
export const usePulse = (duration = 1000, intensity = 0.1) => {
  const elementRef = useRef(null);
  const animationRef = useRef(null);

  const start = useCallback(() => {
    const element = elementRef.current;
    if (!element || animationRef.current) return;

    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = (elapsed % duration) / duration;
      const scale = 1 + Math.sin(progress * Math.PI * 2) * intensity;
      
      element.style.transform = `scale(${scale})`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [duration, intensity]);

  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    const element = elementRef.current;
    if (element) {
      element.style.transform = 'scale(1)';
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return [elementRef, start, stop];
};

// Utility functions for CSS animations
export const createKeyframes = (name, keyframes) => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ${name} {
      ${Object.entries(keyframes).map(([key, value]) => `
        ${key} {
          ${Object.entries(value).map(([prop, val]) => `${prop}: ${val};`).join(' ')}
        }
      `).join('')}
    }
  `;
  document.head.appendChild(style);
  return name;
};

export const removeKeyframes = (name) => {
  const styles = document.querySelectorAll('style');
  styles.forEach(style => {
    if (style.textContent.includes(`@keyframes ${name}`)) {
      style.remove();
    }
  });
};

// Performance-optimized animation utilities
export const requestIdleAnimation = (callback) => {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback);
  } else {
    return setTimeout(callback, 16); // Fallback to 60fps
  }
};

export const cancelIdleAnimation = (id) => {
  if ('cancelIdleCallback' in window) {
    cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};