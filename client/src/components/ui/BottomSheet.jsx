// Premium Bottom Sheet Components
// Mobile-optimized bottom sheets with gestures and animations

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { combineClasses } from '../../utils/design-system';
import { useAnimations } from '../../hooks/useAnimations';
import { useResponsive } from '../../hooks/useDesignSystem';

/**
 * Bottom Sheet Handle Component
 * Drag handle for bottom sheet
 */
export const BottomSheetHandle = ({
  className = '',
  ...props
}) => {
  const handleClasses = combineClasses(
    'flex justify-center pt-3 pb-2',
    className
  );

  return (
    <div className={handleClasses} {...props}>
      <div className="w-10 h-1 bg-gray-300 rounded-full" />
    </div>
  );
};

/**
 * Bottom Sheet Header Component
 * Header with title and optional close button
 */
export const BottomSheetHeader = ({
  children,
  title,
  subtitle,
  onClose,
  showCloseButton = true,
  showHandle = true,
  className = '',
  ...props
}) => {
  const headerClasses = combineClasses(
    'flex-shrink-0',
    className
  );

  return (
    <div className={headerClasses} {...props}>
      {showHandle && <BottomSheetHandle />}
      
      <div className="flex items-center justify-between px-6 pb-4">
        <div className="flex-1 min-w-0">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1 truncate">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Close bottom sheet"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Bottom Sheet Content Component
 * Scrollable content area
 */
export const BottomSheetContent = ({
  children,
  padding = 'default',
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'px-4 pb-4',
    default: 'px-6 pb-6',
    lg: 'px-8 pb-8'
  };

  const contentClasses = combineClasses(
    'flex-1 overflow-y-auto',
    paddingClasses[padding],
    className
  );

  return (
    <div className={contentClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Bottom Sheet Footer Component
 * Fixed footer with actions
 */
export const BottomSheetFooter = ({
  children,
  className = '',
  ...props
}) => {
  const footerClasses = combineClasses(
    'flex-shrink-0 p-6 border-t border-gray-200 bg-white',
    className
  );

  return (
    <div className={footerClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Main Bottom Sheet Component
 * Mobile-optimized bottom sheet with gestures
 */
const BottomSheet = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  height = 'auto',
  maxHeight = '90vh',
  snapPoints = [],
  initialSnap = 0,
  closeOnBackdrop = true,
  closeOnSwipeDown = true,
  showHandle = true,
  showCloseButton = false,
  preventBodyScroll = true,
  className = '',
  ...props
}) => {
  const { getAnimationConfig } = useAnimations();
  const { isMobile } = useResponsive();
  const animationConfig = getAnimationConfig('default');
  const sheetRef = useRef(null);
  const dragControls = useDragControls();
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);

  // Handle body scroll lock
  useEffect(() => {
    if (!preventBodyScroll) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preventBodyScroll]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: animationConfig.duration * 0.8 }
  };

  const sheetVariants = {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: {
      duration: animationConfig.duration * 1.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    
    if (!closeOnSwipeDown) return;

    const { offset, velocity } = info;
    const threshold = 100;
    const velocityThreshold = 500;

    // Close if dragged down significantly or with high velocity
    if (offset.y > threshold || velocity.y > velocityThreshold) {
      onClose?.();
    }
  };

  const handleBackdropClick = closeOnBackdrop ? onClose : undefined;

  const getSheetHeight = () => {
    if (snapPoints.length > 0 && snapPoints[currentSnap]) {
      return snapPoints[currentSnap];
    }
    return height === 'auto' ? 'auto' : height;
  };

  const sheetClasses = combineClasses(
    'fixed bottom-0 left-0 right-0 z-50',
    'bg-white rounded-t-2xl shadow-2xl',
    'flex flex-col',
    className
  );

  const sheetStyle = {
    height: getSheetHeight(),
    maxHeight
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
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
            onClick={handleBackdropClick}
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            className={sheetClasses}
            style={sheetStyle}
            variants={sheetVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            drag={closeOnSwipeDown ? "y" : false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'bottom-sheet-title' : undefined}
            {...props}
          >
            {/* Header */}
            {(title || subtitle || showHandle || showCloseButton) && (
              <BottomSheetHeader
                title={title}
                subtitle={subtitle}
                onClose={onClose}
                showCloseButton={showCloseButton}
                showHandle={showHandle}
              />
            )}

            {/* Content */}
            <BottomSheetContent>
              {children}
            </BottomSheetContent>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

/**
 * Action Sheet Component
 * Bottom sheet with action buttons
 */
export const ActionSheet = ({
  isOpen = false,
  onClose,
  title,
  actions = [],
  cancelText = 'Cancel',
  destructiveIndex = -1,
  ...props
}) => {
  const handleActionClick = (action, index) => {
    action.onPress?.(index);
    if (!action.keepOpen) {
      onClose?.();
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
      {...props}
    >
      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action, index)}
            disabled={action.disabled}
            className={combineClasses(
              'w-full p-4 text-left rounded-lg transition-colors duration-200',
              'hover:bg-gray-50 active:bg-gray-100',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              index === destructiveIndex 
                ? 'text-red-600 hover:bg-red-50 active:bg-red-100' 
                : 'text-gray-900'
            )}
          >
            <div className="flex items-center space-x-3">
              {action.icon && (
                <div className={combineClasses(
                  'w-6 h-6',
                  index === destructiveIndex ? 'text-red-600' : 'text-gray-500'
                )}>
                  {action.icon}
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium">{action.title}</div>
                {action.subtitle && (
                  <div className="text-sm text-gray-500 mt-1">{action.subtitle}</div>
                )}
              </div>
            </div>
          </button>
        ))}
        
        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full p-4 text-center font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 mt-4"
        >
          {cancelText}
        </button>
      </div>
    </BottomSheet>
  );
};

/**
 * Medical Bottom Sheet Component
 * Pre-styled bottom sheet for medical applications
 */
export const MedicalBottomSheet = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  priority = 'normal',
  patientInfo,
  className = '',
  ...props
}) => {
  const priorityStyles = {
    normal: 'border-t-4 border-t-primary-500',
    urgent: 'border-t-4 border-t-yellow-500',
    critical: 'border-t-4 border-t-red-500'
  };

  const sheetClasses = combineClasses(
    priorityStyles[priority],
    className
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      className={sheetClasses}
      {...props}
    >
      {patientInfo && (
        <div className="mb-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {patientInfo.initials || 'P'}
            </div>
            <div>
              <p className="font-medium text-gray-900">{patientInfo.name}</p>
              <p className="text-sm text-gray-600">ID: {patientInfo.id}</p>
            </div>
          </div>
        </div>
      )}
      
      {children}
    </BottomSheet>
  );
};

/**
 * Picker Bottom Sheet Component
 * Bottom sheet with picker/selector functionality
 */
export const PickerBottomSheet = ({
  isOpen = false,
  onClose,
  title = 'Select Option',
  options = [],
  selectedValue,
  onSelect,
  searchable = false,
  multiSelect = false,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState(
    multiSelect ? (Array.isArray(selectedValue) ? selectedValue : []) : []
  );

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleSelect = (option) => {
    if (multiSelect) {
      const newSelection = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value];
      
      setSelectedValues(newSelection);
      onSelect?.(newSelection);
    } else {
      onSelect?.(option.value);
      onClose?.();
    }
  };

  const isSelected = (value) => {
    return multiSelect 
      ? selectedValues.includes(value)
      : selectedValue === value;
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxHeight="80vh"
      {...props}
    >
      {searchable && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      )}

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {filteredOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option)}
            className={combineClasses(
              'w-full p-3 text-left rounded-lg transition-colors duration-200',
              'hover:bg-gray-50 active:bg-gray-100',
              isSelected(option.value) 
                ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                : 'text-gray-900'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                )}
              </div>
              
              {isSelected(option.value) && (
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {multiSelect && (
        <BottomSheetFooter>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSelect?.(selectedValues);
                onClose?.();
              }}
              className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
            >
              Done ({selectedValues.length})
            </button>
          </div>
        </BottomSheetFooter>
      )}
    </BottomSheet>
  );
};

// PropTypes
BottomSheetHandle.propTypes = {
  className: PropTypes.string
};

BottomSheetHeader.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onClose: PropTypes.func,
  showCloseButton: PropTypes.bool,
  showHandle: PropTypes.bool,
  className: PropTypes.string
};

BottomSheetContent.propTypes = {
  children: PropTypes.node.isRequired,
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg']),
  className: PropTypes.string
};

BottomSheetFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

BottomSheet.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxHeight: PropTypes.string,
  snapPoints: PropTypes.arrayOf(PropTypes.string),
  initialSnap: PropTypes.number,
  closeOnBackdrop: PropTypes.bool,
  closeOnSwipeDown: PropTypes.bool,
  showHandle: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  preventBodyScroll: PropTypes.bool,
  className: PropTypes.string
};

ActionSheet.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    icon: PropTypes.node,
    onPress: PropTypes.func,
    disabled: PropTypes.bool,
    keepOpen: PropTypes.bool
  })),
  cancelText: PropTypes.string,
  destructiveIndex: PropTypes.number
};

MedicalBottomSheet.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  priority: PropTypes.oneOf(['normal', 'urgent', 'critical']),
  patientInfo: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string,
    initials: PropTypes.string
  }),
  className: PropTypes.string
};

PickerBottomSheet.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string
  })),
  selectedValue: PropTypes.any,
  onSelect: PropTypes.func,
  searchable: PropTypes.bool,
  multiSelect: PropTypes.bool
};

export default BottomSheet;