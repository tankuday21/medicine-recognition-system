// Contextual Tooltips Component
// Smart tooltips that provide contextual help based on user interaction

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { helpContentManager } from '../../utils/helpSystem';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

/**
 * Contextual Tooltip Provider
 * Manages and displays contextual tooltips throughout the application
 */
export const ContextualTooltipProvider = ({ children, context }) => {
  const [activeTooltips, setActiveTooltips] = useState(new Map());
  const [tooltipElements, setTooltipElements] = useState(new Map());
  const observerRef = useRef(null);
  const contextRef = useRef(context);

  useEffect(() => {
    contextRef.current = context;
    loadContextualTips();
  }, [context]);

  const loadContextualTips = useCallback(() => {
    if (!context) return;

    const tips = helpContentManager.getContextualTips(context);
    const newTooltipElements = new Map();

    tips.forEach(tip => {
      const element = document.querySelector(tip.element);
      if (element) {
        newTooltipElements.set(tip.element, {
          element,
          tip,
          isVisible: false,
          position: { x: 0, y: 0 }
        });
      }
    });

    setTooltipElements(newTooltipElements);
  }, [context]);

  const showTooltip = useCallback((selector, trigger = 'manual') => {
    const tooltipData = tooltipElements.get(selector);
    if (!tooltipData) return;

    const { element, tip } = tooltipData;
    const rect = element.getBoundingClientRect();
    const position = calculateTooltipPosition(rect, tip.position);

    setActiveTooltips(prev => {
      const updated = new Map(prev);
      updated.set(selector, {
        ...tip,
        position,
        trigger,
        timestamp: Date.now()
      });
      return updated;
    });
  }, [tooltipElements]);

  const hideTooltip = useCallback((selector) => {
    setActiveTooltips(prev => {
      const updated = new Map(prev);
      updated.delete(selector);
      return updated;
    });
  }, []);

  const calculateTooltipPosition = (elementRect, preferredPosition = 'bottom') => {
    const tooltipWidth = 280;
    const tooltipHeight = 120;
    const offset = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x, y, position = preferredPosition;

    switch (preferredPosition) {
      case 'top':
        x = elementRect.left + elementRect.width / 2 - tooltipWidth / 2;
        y = elementRect.top - tooltipHeight - offset;
        
        if (y < 0) {
          position = 'bottom';
          y = elementRect.bottom + offset;
        }
        break;
        
      case 'bottom':
        x = elementRect.left + elementRect.width / 2 - tooltipWidth / 2;
        y = elementRect.bottom + offset;
        
        if (y + tooltipHeight > viewportHeight) {
          position = 'top';
          y = elementRect.top - tooltipHeight - offset;
        }
        break;
        
      default:
        x = elementRect.left + elementRect.width / 2 - tooltipWidth / 2;
        y = elementRect.bottom + offset;
        position = 'bottom';
    }

    // Ensure tooltip stays within viewport
    if (x < 8) {
      x = 8;
    } else if (x + tooltipWidth > viewportWidth - 8) {
      x = viewportWidth - tooltipWidth - 8;
    }

    return { x, y, position };
  };

  return (
    <>
      {children}
      
      {/* Render active tooltips */}
      {createPortal(
        <AnimatePresence>
          {Array.from(activeTooltips.entries()).map(([selector, tooltip]) => (
            <ContextualTooltip
              key={selector}
              selector={selector}
              tooltip={tooltip}
              onClose={() => hideTooltip(selector)}
            />
          ))}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

/**
 * Individual Contextual Tooltip Component
 */
const ContextualTooltip = ({ selector, tooltip, onClose }) => {
  const tooltipRef = useRef(null);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-50 max-w-xs"
      style={{
        left: tooltip.position.x,
        top: tooltip.position.y
      }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="tooltip"
      aria-live="polite"
    >
      <Card className="p-4 shadow-lg border-2 border-blue-200 bg-blue-50">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm text-blue-900">
            {tooltip.title}
          </h3>
          
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/50 text-blue-900"
            title="Close"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-sm text-blue-900 mb-3">
          <p>{tooltip.content}</p>
        </div>

        <div className="flex items-center justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-xs text-blue-900 hover:bg-white/50"
          >
            Got it
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

/**
 * Hook for manually triggering contextual tooltips
 */
export const useContextualTooltips = (context) => {
  const showTooltip = useCallback((selector, options = {}) => {
    const event = new CustomEvent('show-contextual-tooltip', {
      detail: { selector, context, ...options }
    });
    document.dispatchEvent(event);
  }, [context]);

  const hideTooltip = useCallback((selector) => {
    const event = new CustomEvent('hide-contextual-tooltip', {
      detail: { selector, context }
    });
    document.dispatchEvent(event);
  }, [context]);

  return {
    showTooltip,
    hideTooltip
  };
};

export default ContextualTooltipProvider;