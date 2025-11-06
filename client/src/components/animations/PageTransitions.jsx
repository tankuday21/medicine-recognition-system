// Premium Page Transitions
// Smooth page transition animations for navigation

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useAnimations } from '../../hooks/useAnimations';

/**
 * Page Transition Variants
 * Different transition styles for various navigation patterns
 */
export const pageTransitionVariants = {
  // Slide transitions
  slideLeft: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  slideRight: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  slideUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  slideDown: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  // Fade transitions
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  fadeScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  // Medical-specific transitions
  medicalSlide: {
    initial: { x: '100%', opacity: 0, filter: 'blur(4px)' },
    animate: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: { x: '-100%', opacity: 0, filter: 'blur(4px)' },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  medicalFade: {
    initial: { opacity: 0, y: 20, filter: 'blur(2px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -20, filter: 'blur(2px)' },
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  // Stack transitions (for modal-like navigation)
  stack: {
    initial: { opacity: 0, scale: 0.9, y: 50 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 50 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  // Flip transitions
  flipX: {
    initial: { rotateY: -90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: 90, opacity: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  flipY: {
    initial: { rotateX: -90, opacity: 0 },
    animate: { rotateX: 0, opacity: 1 },
    exit: { rotateX: 90, opacity: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

/**
 * Page Transition Wrapper Component
 * Main component for handling page transitions
 */
export const PageTransition = ({
  children,
  variant = 'slideLeft',
  custom,
  className = '',
  ...props
}) => {
  const { getAnimationConfig } = useAnimations();
  const animationConfig = getAnimationConfig('default');

  // Use custom variant or predefined variant
  const transitionVariant = custom || pageTransitionVariants[variant] || pageTransitionVariants.slideLeft;

  // Apply performance-based animation config
  if (animationConfig.enabled) {
    transitionVariant.transition = {
      ...transitionVariant.transition,
      duration: animationConfig.duration,
      ease: animationConfig.ease
    };
  } else {
    // Disable animations if performance is poor
    transitionVariant.transition = { duration: 0 };
  }

  return (
    <motion.div
      className={`page-transition ${className}`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={transitionVariant}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Route Transition Container
 * Handles transitions between different routes
 */
export const RouteTransition = ({
  children,
  routeKey,
  variant = 'slideLeft',
  className = '',
  ...props
}) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition
        key={routeKey}
        variant={variant}
        className={className}
        {...props}
      >
        {children}
      </PageTransition>
    </AnimatePresence>
  );
};

/**
 * Modal Transition Component
 * Specialized transition for modal dialogs
 */
export const ModalTransition = ({
  children,
  isOpen,
  variant = 'stack',
  backdrop = true,
  className = '',
  onBackdropClick,
  ...props
}) => {
  const { getAnimationConfig } = useAnimations();
  const animationConfig = getAnimationConfig('fast');

  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: animationConfig.enabled ? 
      { duration: animationConfig.duration, ease: animationConfig.ease } :
      { duration: 0 }
  };

  const modalVariants = pageTransitionVariants[variant] || pageTransitionVariants.stack;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          {backdrop && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              variants={backdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={onBackdropClick}
            />
          )}

          {/* Modal Content */}
          <motion.div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            {...props}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Bottom Sheet Transition Component
 * Mobile-optimized bottom sheet with slide-up animation
 */
export const BottomSheetTransition = ({
  children,
  isOpen,
  className = '',
  onBackdropClick,
  maxHeight = '90vh',
  ...props
}) => {
  const { getAnimationConfig } = useAnimations();
  const animationConfig = getAnimationConfig('default');

  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: animationConfig.enabled ? 
      { duration: animationConfig.duration * 0.8 } :
      { duration: 0 }
  };

  const sheetVariants = {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
    transition: animationConfig.enabled ? 
      { 
        duration: animationConfig.duration * 1.2, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      } :
      { duration: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onBackdropClick}
          />

          {/* Bottom Sheet */}
          <motion.div
            className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl ${className}`}
            style={{ maxHeight }}
            variants={sheetVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            {...props}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 2rem)` }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Drawer Transition Component
 * Side drawer with slide animation
 */
export const DrawerTransition = ({
  children,
  isOpen,
  position = 'left',
  width = '320px',
  className = '',
  onBackdropClick,
  ...props
}) => {
  const { getAnimationConfig } = useAnimations();
  const animationConfig = getAnimationConfig('default');

  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: animationConfig.enabled ? 
      { duration: animationConfig.duration } :
      { duration: 0 }
  };

  const getDrawerVariants = () => {
    const baseVariants = {
      transition: animationConfig.enabled ? 
        { duration: animationConfig.duration, ease: animationConfig.ease } :
        { duration: 0 }
    };

    switch (position) {
      case 'right':
        return {
          initial: { x: '100%' },
          animate: { x: 0 },
          exit: { x: '100%' },
          ...baseVariants
        };
      case 'top':
        return {
          initial: { y: '-100%' },
          animate: { y: 0 },
          exit: { y: '-100%' },
          ...baseVariants
        };
      case 'bottom':
        return {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
          ...baseVariants
        };
      default: // left
        return {
          initial: { x: '-100%' },
          animate: { x: 0 },
          exit: { x: '-100%' },
          ...baseVariants
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'right':
        return 'top-0 right-0 h-full';
      case 'top':
        return 'top-0 left-0 w-full';
      case 'bottom':
        return 'bottom-0 left-0 w-full';
      default: // left
        return 'top-0 left-0 h-full';
    }
  };

  const drawerVariants = getDrawerVariants();
  const positionClasses = getPositionClasses();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onBackdropClick}
          />

          {/* Drawer */}
          <motion.div
            className={`fixed ${positionClasses} bg-white shadow-2xl z-50 ${className}`}
            style={{ 
              width: ['left', 'right'].includes(position) ? width : 'auto',
              height: ['top', 'bottom'].includes(position) ? width : 'auto'
            }}
            variants={drawerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            {...props}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Staggered List Transition Component
 * Animates list items with staggered timing
 */
export const StaggeredListTransition = ({
  children,
  variant = 'fadeInUp',
  staggerDelay = 0.1,
  className = '',
  ...props
}) => {
  const { getAnimationConfig, getStaggerConfig } = useAnimations();
  const animationConfig = getAnimationConfig('default');
  const staggerConfig = getStaggerConfig(React.Children.count(children));

  const containerVariants = {
    initial: {},
    animate: {
      transition: animationConfig.enabled ? {
        staggerChildren: staggerConfig.staggerChildren,
        delayChildren: staggerConfig.delayChildren
      } : { duration: 0 }
    },
    exit: {
      transition: animationConfig.enabled ? {
        staggerChildren: staggerConfig.staggerChildren * 0.5,
        staggerDirection: -1
      } : { duration: 0 }
    }
  };

  const itemVariants = pageTransitionVariants[variant] || pageTransitionVariants.fadeScale;

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * Medical Page Transition Component
 * Specialized transitions for medical application flows
 */
export const MedicalPageTransition = ({
  children,
  transitionType = 'patient-flow',
  className = '',
  ...props
}) => {
  const getTransitionVariant = () => {
    switch (transitionType) {
      case 'patient-flow':
        return 'medicalSlide';
      case 'appointment':
        return 'slideUp';
      case 'emergency':
        return 'fadeScale';
      case 'report':
        return 'medicalFade';
      default:
        return 'medicalSlide';
    }
  };

  return (
    <PageTransition
      variant={getTransitionVariant()}
      className={`medical-page-transition ${className}`}
      {...props}
    >
      {children}
    </PageTransition>
  );
};

/**
 * Navigation Breadcrumb Transition
 * Animates breadcrumb changes
 */
export const BreadcrumbTransition = ({
  children,
  breadcrumbKey,
  className = '',
  ...props
}) => {
  const { getAnimationConfig } = useAnimations();
  const animationConfig = getAnimationConfig('fast');

  const breadcrumbVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: animationConfig.enabled ? 
      { duration: animationConfig.duration, ease: animationConfig.ease } :
      { duration: 0 }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={breadcrumbKey}
        className={className}
        variants={breadcrumbVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// PropTypes
PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  custom: PropTypes.object,
  className: PropTypes.string
};

RouteTransition.propTypes = {
  children: PropTypes.node.isRequired,
  routeKey: PropTypes.string.isRequired,
  variant: PropTypes.string,
  className: PropTypes.string
};

ModalTransition.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  variant: PropTypes.string,
  backdrop: PropTypes.bool,
  className: PropTypes.string,
  onBackdropClick: PropTypes.func
};

BottomSheetTransition.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  className: PropTypes.string,
  onBackdropClick: PropTypes.func,
  maxHeight: PropTypes.string
};

DrawerTransition.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  position: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
  width: PropTypes.string,
  className: PropTypes.string,
  onBackdropClick: PropTypes.func
};

StaggeredListTransition.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  staggerDelay: PropTypes.number,
  className: PropTypes.string
};

MedicalPageTransition.propTypes = {
  children: PropTypes.node.isRequired,
  transitionType: PropTypes.oneOf(['patient-flow', 'appointment', 'emergency', 'report']),
  className: PropTypes.string
};

BreadcrumbTransition.propTypes = {
  children: PropTypes.node.isRequired,
  breadcrumbKey: PropTypes.string.isRequired,
  className: PropTypes.string
};

export default PageTransition;