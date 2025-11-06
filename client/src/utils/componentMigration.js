// Component Migration Utility
// Handles automatic migration of legacy components to premium components

import React from 'react';
import { performanceMonitor } from './performanceMonitor';

/**
 * Component Migration Manager
 * Provides utilities for migrating legacy components to premium versions
 */
export class ComponentMigrationManager {
  constructor() {
    this.migrationMap = new Map();
    this.migrationHistory = [];
    this.fallbackComponents = new Map();
    
    this.initializeMigrationMap();
  }

  /**
   * Initialize the migration mapping
   */
  initializeMigrationMap() {
    // Button migrations
    this.migrationMap.set('button', {
      component: 'Button',
      importPath: '../components/ui/Button',
      propMappings: {
        'class': 'className',
        'disabled': 'disabled',
        'type': 'type',
        'onclick': 'onClick'
      },
      defaultProps: {
        variant: 'primary',
        size: 'md'
      },
      transformProps: this.transformButtonProps
    });

    // Input migrations
    this.migrationMap.set('input', {
      component: 'Input',
      importPath: '../components/ui/Input',
      propMappings: {
        'class': 'className',
        'type': 'type',
        'placeholder': 'placeholder',
        'value': 'value',
        'onchange': 'onChange',
        'disabled': 'disabled'
      },
      defaultProps: {
        variant: 'medical',
        size: 'md'
      },
      transformProps: this.transformInputProps
    });

    // Card migrations
    this.migrationMap.set('div.card', {
      component: 'Card',
      importPath: '../components/ui/Card',
      propMappings: {
        'class': 'className'
      },
      defaultProps: {
        variant: 'elevated',
        hoverable: true
      },
      transformProps: this.transformCardProps
    });

    // Modal migrations
    this.migrationMap.set('div.modal', {
      component: 'Modal',
      importPath: '../components/ui/Modal',
      propMappings: {
        'class': 'className'
      },
      defaultProps: {
        variant: 'medical',
        animation: 'slideUp'
      },
      transformProps: this.transformModalProps
    });
  }

  /**
   * Transform button props for migration
   */
  transformButtonProps = (props) => {
    const transformed = { ...props };

    // Map CSS classes to variants
    if (props.className) {
      if (props.className.includes('btn-primary')) {
        transformed.variant = 'primary';
      } else if (props.className.includes('btn-secondary')) {
        transformed.variant = 'secondary';
      } else if (props.className.includes('btn-danger')) {
        transformed.variant = 'danger';
      } else if (props.className.includes('btn-success')) {
        transformed.variant = 'success';
      }

      // Map sizes
      if (props.className.includes('btn-sm')) {
        transformed.size = 'sm';
      } else if (props.className.includes('btn-lg')) {
        transformed.size = 'lg';
      }

      // Clean up className
      transformed.className = props.className
        .replace(/btn-[a-z]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Add touch optimization
    transformed.className = `${transformed.className || ''} touch-target`.trim();

    return transformed;
  };

  /**
   * Transform input props for migration
   */
  transformInputProps = (props) => {
    const transformed = { ...props };

    // Map CSS classes to variants
    if (props.className) {
      if (props.className.includes('form-control')) {
        transformed.variant = 'medical';
      }
      
      // Clean up className
      transformed.className = props.className
        .replace(/form-control/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Add touch optimization
    transformed.className = `${transformed.className || ''} touch-optimized`.trim();

    return transformed;
  };

  /**
   * Transform card props for migration
   */
  transformCardProps = (props) => {
    const transformed = { ...props };

    // Map CSS classes to variants
    if (props.className) {
      if (props.className.includes('card-interactive')) {
        transformed.variant = 'interactive';
        transformed.hoverable = true;
        transformed.pressable = true;
      } else if (props.className.includes('card-medical')) {
        transformed.variant = 'medical';
      }

      // Clean up className
      transformed.className = props.className
        .replace(/card(-[a-z]+)?/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return transformed;
  };

  /**
   * Transform modal props for migration
   */
  transformModalProps = (props) => {
    const transformed = { ...props };

    // Map CSS classes to variants
    if (props.className) {
      if (props.className.includes('modal-medical')) {
        transformed.variant = 'medical';
      }

      // Clean up className
      transformed.className = props.className
        .replace(/modal(-[a-z]+)?/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return transformed;
  };

  /**
   * Create a migrated component wrapper
   */
  createMigratedComponent(legacyType, props, children) {
    const migration = this.migrationMap.get(legacyType);
    
    if (!migration) {
      console.warn(`No migration available for component type: ${legacyType}`);
      return null;
    }

    try {
      // Transform props
      const transformedProps = migration.transformProps ? 
        migration.transformProps(props) : 
        this.mapProps(props, migration.propMappings);

      // Apply default props
      const finalProps = {
        ...migration.defaultProps,
        ...transformedProps
      };

      // Track migration
      this.trackMigration(legacyType, migration.component);

      // Return the migrated component
      return {
        component: migration.component,
        props: finalProps,
        children,
        importPath: migration.importPath
      };

    } catch (error) {
      console.error(`Migration failed for ${legacyType}:`, error);
      return null;
    }
  }

  /**
   * Map legacy props to premium component props
   */
  mapProps(legacyProps, mappings) {
    const mapped = {};

    Object.entries(legacyProps).forEach(([key, value]) => {
      const mappedKey = mappings[key] || key;
      mapped[mappedKey] = value;
    });

    return mapped;
  }

  /**
   * Track migration for analytics
   */
  trackMigration(from, to) {
    const migration = {
      from,
      to,
      timestamp: Date.now()
    };

    this.migrationHistory.push(migration);

    // Track with performance monitor
    performanceMonitor.recordMetric('componentMigration', {
      from,
      to,
      success: true
    });
  }

  /**
   * Get migration statistics
   */
  getMigrationStats() {
    const stats = {
      totalMigrations: this.migrationHistory.length,
      migrationsByType: {},
      recentMigrations: this.migrationHistory.slice(-10)
    };

    this.migrationHistory.forEach(migration => {
      const key = `${migration.from} -> ${migration.to}`;
      stats.migrationsByType[key] = (stats.migrationsByType[key] || 0) + 1;
    });

    return stats;
  }
}

// Create singleton instance
export const componentMigrationManager = new ComponentMigrationManager();

/**
 * Higher-Order Component for automatic migration
 */
export const withMigration = (WrappedComponent, legacyType) => {
  return React.forwardRef((props, ref) => {
    const migration = componentMigrationManager.createMigratedComponent(
      legacyType,
      props,
      props.children
    );

    if (migration) {
      // Return the migrated component
      return React.createElement(WrappedComponent, {
        ...migration.props,
        ref
      }, migration.children);
    }

    // Fallback to original component
    return React.createElement(WrappedComponent, { ...props, ref }, props.children);
  });
};

/**
 * Legacy Button Component with automatic migration
 */
export const LegacyButton = withMigration(
  React.forwardRef((props, ref) => {
    // Import the premium Button component
    const { Button } = require('../components/ui/Button');
    return React.createElement(Button, { ...props, ref });
  }),
  'button'
);

/**
 * Legacy Input Component with automatic migration
 */
export const LegacyInput = withMigration(
  React.forwardRef((props, ref) => {
    // Import the premium Input component
    const { Input } = require('../components/ui/Input');
    return React.createElement(Input, { ...props, ref });
  }),
  'input'
);

/**
 * Legacy Card Component with automatic migration
 */
export const LegacyCard = withMigration(
  React.forwardRef((props, ref) => {
    // Import the premium Card component
    const { Card } = require('../components/ui/Card');
    return React.createElement(Card, { ...props, ref });
  }),
  'div.card'
);

/**
 * Utility function to migrate a React element
 */
export const migrateElement = (element) => {
  if (!React.isValidElement(element)) {
    return element;
  }

  const { type, props } = element;
  let legacyType = null;

  // Determine legacy type
  if (type === 'button') {
    legacyType = 'button';
  } else if (type === 'input') {
    legacyType = 'input';
  } else if (type === 'div' && props.className?.includes('card')) {
    legacyType = 'div.card';
  } else if (type === 'div' && props.className?.includes('modal')) {
    legacyType = 'div.modal';
  }

  if (legacyType) {
    const migration = componentMigrationManager.createMigratedComponent(
      legacyType,
      props,
      props.children
    );

    if (migration) {
      // Create the migrated element
      const PremiumComponent = require(migration.importPath).default;
      return React.createElement(
        PremiumComponent,
        migration.props,
        migration.children
      );
    }
  }

  // Recursively migrate children
  const migratedChildren = React.Children.map(element.props.children, child => {
    return migrateElement(child);
  });

  // Return element with migrated children
  return React.cloneElement(element, {}, migratedChildren);
};

/**
 * Component that automatically migrates its children
 */
export const MigrationWrapper = ({ children, enabled = true }) => {
  if (!enabled) {
    return children;
  }

  const migratedChildren = React.Children.map(children, child => {
    return migrateElement(child);
  });

  return React.createElement(React.Fragment, {}, migratedChildren);
};

/**
 * Hook for component migration
 */
export const useMigration = (componentType) => {
  const [isMigrated, setIsMigrated] = React.useState(false);

  React.useEffect(() => {
    const migration = componentMigrationManager.migrationMap.get(componentType);
    setIsMigrated(!!migration);
  }, [componentType]);

  const migrate = React.useCallback((props, children) => {
    return componentMigrationManager.createMigratedComponent(
      componentType,
      props,
      children
    );
  }, [componentType]);

  return {
    isMigrated,
    migrate,
    migrationStats: componentMigrationManager.getMigrationStats()
  };
};

/**
 * Batch migration utility
 */
export const batchMigrateComponents = (components) => {
  const results = [];

  components.forEach(({ type, props, children }) => {
    const migration = componentMigrationManager.createMigratedComponent(
      type,
      props,
      children
    );

    results.push({
      original: { type, props, children },
      migrated: migration,
      success: !!migration
    });
  });

  return results;
};

/**
 * Migration validation utility
 */
export const validateMigration = (original, migrated) => {
  const validation = {
    success: true,
    warnings: [],
    errors: []
  };

  // Check if essential props are preserved
  const essentialProps = ['onClick', 'onChange', 'onSubmit', 'disabled', 'value'];
  
  essentialProps.forEach(prop => {
    if (original.props[prop] && !migrated.props[prop]) {
      validation.warnings.push(`Essential prop '${prop}' may have been lost during migration`);
    }
  });

  // Check if accessibility attributes are preserved
  const a11yProps = ['aria-label', 'aria-describedby', 'role', 'tabIndex'];
  
  a11yProps.forEach(prop => {
    if (original.props[prop] && !migrated.props[prop]) {
      validation.warnings.push(`Accessibility prop '${prop}' may have been lost during migration`);
    }
  });

  if (validation.warnings.length > 0 || validation.errors.length > 0) {
    validation.success = false;
  }

  return validation;
};

export default {
  ComponentMigrationManager,
  componentMigrationManager,
  withMigration,
  LegacyButton,
  LegacyInput,
  LegacyCard,
  migrateElement,
  MigrationWrapper,
  useMigration,
  batchMigrateComponents,
  validateMigration
};"