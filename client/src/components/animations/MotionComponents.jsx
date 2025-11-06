// Premium Motion Components
// Framer Motion-based animation components for micro-interactions

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Animation Variants Library
 * Consistent motion design patterns
 */
export const animationVariants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },

  scaleInCenter: {
    initial: { opacity: 0, scale: 0.8, transformOrigin: 'center' },
    animate: { opacity: 1, scale: 1, transformOrigin: 'center' },
    exit: { opacity: 0, scale: 0.8, transformOrigin: 'center' },
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  // Slide animations
  slideInUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  slideInDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  // Stagger animations
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  staggerChildrenFast: {
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  },

  // Button interactions
  buttonTap: {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.02 },
    transition: { duration: 0.15, ease: 'easeOut' }
  },

  buttonPress: {
    whileTap: { scale: 0.98, y: 1 },
    whileHover: { y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
    transition: { duration: 0.15, ease: 'easeOut' }
  },

  // Card interactions
  cardHover: {
    whileHover: { 
      y: -4, 
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    whileTap: { scale: 0.98 }
  },

  cardFloat: {
    whileHover: { 
      y: -2, 
      boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  },

  // Medical-specific animations
  heartbeat: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },

  pulse: {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },

  // Loading animations
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  },

  dots: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }
};

/**
 * Motion Wrapper Component
 * Generic wrapper for applying motion to any element
 */
export const MotionWrapper = ({
  children,
  variant = 'fadeIn',
  custom,
  delay = 0,
  duration,
  className = '',
  ...props
}) => {
  const motionProps = custom || animationVariants[variant] || animationVariants.fadeIn;
  
  // Apply delay if specified
  if (delay > 0 && motionProps.transition) {
    motionProps.transition = {
      ...motionProps.transition,
      delay
    };
  }

  // Override duration if specified
  if (duration && motionProps.transition) {
    motionProps.transition = {
      ...motionProps.transition,
      duration
    };
  }

  return (
    <motion.div
      className={className}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Animated Button Component
 * Button with built-in micro-interactions
 */
export const AnimatedButton = ({
  children,
  variant = 'buttonTap',
  disabled = false,
  className = '',
  ...props
}) => {
  const motionProps = disabled ? {} : (animationVariants[variant] || animationVariants.buttonTap);

  return (
    <motion.button
      className={className}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.button>
  );
};

/**
 * Animated Card Component
 * Card with hover and interaction animations
 */
export const AnimatedCard = ({
  children,
  variant = 'cardHover',
  className = '',
  ...props
}) => {
  const motionProps = animationVariants[variant] || animationVariants.cardHover;

  return (
    <motion.div
      className={className}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Stagger Container Component
 * Container that staggers animation of children
 */
export const StaggerContainer = ({
  children,
  variant = 'staggerChildren',
  className = '',
  ...props
}) => {
  const motionProps = animationVariants[variant] || animationVariants.staggerChildren;

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Stagger Item Component
 * Individual item within a stagger container
 */
export const StaggerItem = ({
  children,
  variant = 'fadeInUp',
  className = '',
  ...props
}) => {
  const motionProps = animationVariants[variant] || animationVariants.fadeInUp;

  return (
    <motion.div
      className={className}
      variants={motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Page Transition Component
 * Handles page-level transitions
 */
export const PageTransition = ({
  children,
  variant = 'fadeInUp',
  className = '',
  ...props
}) => {
  const motionProps = animationVariants[variant] || animationVariants.fadeInUp;

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Modal Transition Component
 * Specialized transition for modals and overlays
 */
export const ModalTransition = ({
  children,
  isOpen,
  className = '',
  ...props
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={className}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Loading Spinner Component
 * Animated loading indicator
 */
export const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-gray-500',
    white: 'text-white',
    medical: 'text-primary-600'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      variants={animationVariants.spinner}
      animate="animate"
      {...props}
    >
      <svg
        className="w-full h-full"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
};

/**
 * Loading Dots Component
 * Three-dot loading animation
 */
export const LoadingDots = ({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const colorClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-gray-500',
    white: 'bg-white',
    medical: 'bg-primary-600'
  };

  return (
    <div className={`flex space-x-1 ${className}`} {...props}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
          variants={animationVariants.dots}
          animate="animate"
          transition={{
            delay: index * 0.2,
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton Screen Component
 * Animated skeleton for loading states
 */
export const SkeletonLoader = ({
  lines = 3,
  avatar = false,
  className = '',
  ...props
}) => {
  const shimmer = {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  return (
    <div className={`animate-pulse ${className}`} {...props}>
      <div className="flex space-x-4">
        {avatar && (
          <motion.div
            className="rounded-full bg-gray-300 h-10 w-10"
            style={{
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%'
            }}
            variants={shimmer}
            animate="animate"
          />
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <motion.div
              key={index}
              className="h-4 bg-gray-300 rounded"
              style={{
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                width: index === lines - 1 ? '75%' : '100%'
              }}
              variants={shimmer}
              animate="animate"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Medical Heartbeat Animation Component
 * Specialized animation for medical contexts
 */
export const HeartbeatAnimation = ({
  children,
  active = true,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      className={className}
      variants={active ? animationVariants.heartbeat : {}}
      animate={active ? "animate" : ""}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Notification Toast Animation Component
 * Animated notification with auto-dismiss
 */
export const NotificationToast = ({
  children,
  isVisible,
  position = 'top-right',
  className = '',
  ...props
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed z-50 ${positionClasses[position]} ${className}`}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// PropTypes
MotionWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  custom: PropTypes.object,
  delay: PropTypes.number,
  duration: PropTypes.number,
  className: PropTypes.string
};

AnimatedButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

AnimatedCard.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  className: PropTypes.string
};

StaggerContainer.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  className: PropTypes.string
};

StaggerItem.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  className: PropTypes.string
};

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  className: PropTypes.string
};

ModalTransition.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  className: PropTypes.string
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white', 'medical']),
  className: PropTypes.string
};

LoadingDots.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white', 'medical']),
  className: PropTypes.string
};

SkeletonLoader.propTypes = {
  lines: PropTypes.number,
  avatar: PropTypes.bool,
  className: PropTypes.string
};

HeartbeatAnimation.propTypes = {
  children: PropTypes.node.isRequired,
  active: PropTypes.bool,
  className: PropTypes.string
};

NotificationToast.propTypes = {
  children: PropTypes.node.isRequired,
  isVisible: PropTypes.bool.isRequired,
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center']),
  className: PropTypes.string
};

export default MotionWrapper;