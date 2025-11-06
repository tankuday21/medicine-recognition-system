// Personalized Dashboard Components
// Customizable dashboard with user-specific shortcuts and recommendations

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';
import { useUserBehavior, usePersonalization } from '../../hooks/useSmartInterface';
import { AccessibleButton } from '../accessibility/AccessibleComponents';

/**
 * Draggable Widget Component
 * Individual dashboard widget that can be dragged and customized
 */
export const DashboardWidget = ({ 
  id,
  title,
  children,
  onRemove,
  onEdit,
  isDragging = false,
  className = '',
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={combineClasses(
        'bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200',
        isDragging ? 'opacity-50 rotate-2 scale-105' : '',
        isHovered ? 'shadow-md border-primary-200' : '',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-900">{title}</h3>
        
        {(isHovered || isDragging) && (
          <div className="flex items-center space-x-1">
            {onEdit && (
              <button
                onClick={() => onEdit(id)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                aria-label="Edit widget"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {onRemove && (
              <button
                onClick={() => onRemove(id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                aria-label="Remove widget"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            <div className="p-1 text-gray-400 cursor-move" aria-label="Drag to reorder">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

/**
 * Quick Actions Widget
 * Shows frequently used actions based on user behavior
 */
export const QuickActionsWidget = ({ 
  maxActions = 6,
  className = '',
  ...props 
}) => {
  const { preferences, trackInteraction } = useUserBehavior();
  
  const quickActions = useMemo(() => {
    const mostUsed = preferences.mostUsedFeatures || [];
    const actions = [
      { id: 'new-patient', label: 'New Patient', icon: '👤', feature: 'patients' },
      { id: 'schedule', label: 'Schedule', icon: '📅', feature: 'appointments' },
      { id: 'reports', label: 'Reports', icon: '📊', feature: 'reports' },
      { id: 'medications', label: 'Medications', icon: '💊', feature: 'medications' },
      { id: 'vitals', label: 'Vital Signs', icon: '❤️', feature: 'vitals' },
      { id: 'search', label: 'Search', icon: '🔍', feature: 'search' },
      { id: 'settings', label: 'Settings', icon: '⚙️', feature: 'settings' },
      { id: 'help', label: 'Help', icon: '❓', feature: 'help' }
    ];

    // Sort by usage frequency
    const usageMap = new Map(mostUsed);
    return actions
      .sort((a, b) => (usageMap.get(b.feature) || 0) - (usageMap.get(a.feature) || 0))
      .slice(0, maxActions);
  }, [preferences.mostUsedFeatures, maxActions]);

  const handleActionClick = useCallback((action) => {
    trackInteraction('click', {
      element: 'quick-action',
      action: action.id,
      feature: action.feature,
      timestamp: Date.now()
    });
    
    // Handle action (would typically navigate or trigger action)
    console.log('Quick action clicked:', action);
  }, [trackInteraction]);

  return (
    <DashboardWidget title="Quick Actions" className={className} {...props}>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
          >
            <span className="text-2xl mb-1">{action.icon}</span>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>
    </DashboardWidget>
  );
};

/**
 * Recent Activity Widget
 * Shows recent user activities and quick access to continue tasks
 */
export const RecentActivityWidget = ({ 
  className = '',
  ...props 
}) => {
  const [recentActivities] = useState([
    { id: 1, type: 'patient', title: 'John Doe - Consultation', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'report', title: 'Monthly Health Report', time: '1 day ago', status: 'draft' },
    { id: 3, type: 'appointment', title: 'Dr. Smith Meeting', time: '2 days ago', status: 'scheduled' },
    { id: 4, type: 'medication', title: 'Prescription Update', time: '3 days ago', status: 'pending' }
  ]);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getTypeIcon = useCallback((type) => {
    switch (type) {
      case 'patient': return '👤';
      case 'report': return '📊';
      case 'appointment': return '📅';
      case 'medication': return '💊';
      default: return '📄';
    }
  }, []);

  return (
    <DashboardWidget title="Recent Activity" className={className} {...props}>
      <div className="space-y-3">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
            <span className="text-lg">{getTypeIcon(activity.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
            <span className={combineClasses(
              'px-2 py-1 text-xs font-medium rounded-full',
              getStatusColor(activity.status)
            )}>
              {activity.status}
            </span>
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
};

/**
 * Health Metrics Widget
 * Shows key health metrics and trends
 */
export const HealthMetricsWidget = ({ 
  className = '',
  ...props 
}) => {
  const [metrics] = useState([
    { label: 'Active Patients', value: '1,234', change: '+5.2%', trend: 'up' },
    { label: 'Appointments Today', value: '28', change: '+12%', trend: 'up' },
    { label: 'Pending Reports', value: '7', change: '-15%', trend: 'down' },
    { label: 'Critical Alerts', value: '2', change: '0%', trend: 'stable' }
  ]);

  const getTrendIcon = useCallback((trend) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  }, []);

  const getTrendColor = useCallback((trend) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  }, []);

  return (
    <DashboardWidget title="Health Metrics" className={className} {...props}>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
            <div className={combineClasses('text-xs flex items-center justify-center', getTrendColor(metric.trend))}>
              <span className="mr-1">{getTrendIcon(metric.trend)}</span>
              {metric.change}
            </div>
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
};

/**
 * Shortcuts Widget
 * Customizable shortcuts based on user preferences
 */
export const ShortcutsWidget = ({ 
  className = '',
  ...props 
}) => {
  const [shortcuts, setShortcuts] = useState([
    { id: 'ctrl-n', label: 'New Patient', keys: 'Ctrl+N', action: 'new-patient' },
    { id: 'ctrl-s', label: 'Quick Search', keys: 'Ctrl+K', action: 'search' },
    { id: 'ctrl-r', label: 'Reports', keys: 'Ctrl+R', action: 'reports' },
    { id: 'ctrl-h', label: 'Help', keys: 'F1', action: 'help' }
  ]);

  const [isEditing, setIsEditing] = useState(false);

  const handleShortcutClick = useCallback((shortcut) => {
    console.log('Shortcut activated:', shortcut);
  }, []);

  const handleEditShortcuts = useCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);

  return (
    <DashboardWidget 
      title="Keyboard Shortcuts" 
      className={className}
      onEdit={handleEditShortcuts}
      {...props}
    >
      <div className="space-y-2">
        {shortcuts.map((shortcut) => (
          <div 
            key={shortcut.id}
            className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
            onClick={() => handleShortcutClick(shortcut)}
          >
            <span className="text-sm text-gray-700">{shortcut.label}</span>
            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
              {shortcut.keys}
            </kbd>
          </div>
        ))}
      </div>
      
      {isEditing && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <AccessibleButton size="sm" variant="secondary" className="w-full">
            Customize Shortcuts
          </AccessibleButton>
        </div>
      )}
    </DashboardWidget>
  );
};

/**
 * Personalized Dashboard Container
 * Main dashboard that manages widget layout and personalization
 */
export const PersonalizedDashboard = ({ 
  className = '',
  ...props 
}) => {
  const { preferences, trackInteraction } = useUserBehavior();
  const [dashboardLayout, setDashboardLayout] = useState([
    { id: 'quick-actions', component: 'QuickActionsWidget', position: 0, size: 'medium' },
    { id: 'health-metrics', component: 'HealthMetricsWidget', position: 1, size: 'large' },
    { id: 'recent-activity', component: 'RecentActivityWidget', position: 2, size: 'medium' },
    { id: 'shortcuts', component: 'ShortcutsWidget', position: 3, size: 'small' }
  ]);

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [availableWidgets] = useState([
    { id: 'quick-actions', name: 'Quick Actions', component: 'QuickActionsWidget' },
    { id: 'health-metrics', name: 'Health Metrics', component: 'HealthMetricsWidget' },
    { id: 'recent-activity', name: 'Recent Activity', component: 'RecentActivityWidget' },
    { id: 'shortcuts', name: 'Shortcuts', component: 'ShortcutsWidget' },
    { id: 'calendar', name: 'Calendar', component: 'CalendarWidget' },
    { id: 'notifications', name: 'Notifications', component: 'NotificationsWidget' }
  ]);

  // Load saved layout on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboard-layout');
    if (savedLayout) {
      try {
        setDashboardLayout(JSON.parse(savedLayout));
      } catch (error) {
        console.warn('Failed to load dashboard layout:', error);
      }
    }
  }, []);

  // Save layout changes
  const saveDashboardLayout = useCallback((newLayout) => {
    setDashboardLayout(newLayout);
    localStorage.setItem('dashboard-layout', JSON.stringify(newLayout));
    
    trackInteraction('dashboard-customize', {
      action: 'layout-change',
      widgetCount: newLayout.length,
      timestamp: Date.now()
    });
  }, [trackInteraction]);

  const handleRemoveWidget = useCallback((widgetId) => {
    const newLayout = dashboardLayout.filter(widget => widget.id !== widgetId);
    saveDashboardLayout(newLayout);
  }, [dashboardLayout, saveDashboardLayout]);

  const handleAddWidget = useCallback((widgetType) => {
    const newWidget = {
      id: `${widgetType}-${Date.now()}`,
      component: widgetType,
      position: dashboardLayout.length,
      size: 'medium'
    };
    
    const newLayout = [...dashboardLayout, newWidget];
    saveDashboardLayout(newLayout);
  }, [dashboardLayout, saveDashboardLayout]);

  const renderWidget = useCallback((widget) => {
    const commonProps = {
      key: widget.id,
      id: widget.id,
      onRemove: handleRemoveWidget,
      className: combineClasses(
        widget.size === 'small' ? 'col-span-1' :
        widget.size === 'large' ? 'col-span-2' :
        'col-span-1'
      )
    };

    switch (widget.component) {
      case 'QuickActionsWidget':
        return <QuickActionsWidget {...commonProps} />;
      case 'HealthMetricsWidget':
        return <HealthMetricsWidget {...commonProps} />;
      case 'RecentActivityWidget':
        return <RecentActivityWidget {...commonProps} />;
      case 'ShortcutsWidget':
        return <ShortcutsWidget {...commonProps} />;
      default:
        return (
          <DashboardWidget title="Unknown Widget" {...commonProps}>
            <p className="text-gray-500">Widget type not found</p>
          </DashboardWidget>
        );
    }
  }, [handleRemoveWidget]);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    const timeOfDay = preferences.preferredTimeOfUse || 
      (hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening');
    
    const greetings = {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
      night: 'Good evening'
    };
    
    return greetings[timeOfDay] || 'Hello';
  }, [preferences.preferredTimeOfUse]);

  return (
    <div className={combineClasses('space-y-6', className)} {...props}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, Dr. Smith
          </h1>
          <p className="text-gray-600">
            Here's your personalized dashboard for {new Date().toLocaleDateString()}
          </p>
        </div>
        
        <AccessibleButton
          onClick={() => setIsCustomizing(!isCustomizing)}
          variant="secondary"
        >
          {isCustomizing ? 'Done' : 'Customize'}
        </AccessibleButton>
      </div>

      {/* Customization Panel */}
      {isCustomizing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-3">Add Widgets</h3>
          <div className="flex flex-wrap gap-2">
            {availableWidgets
              .filter(widget => !dashboardLayout.some(layout => layout.component === widget.component))
              .map((widget) => (
                <AccessibleButton
                  key={widget.id}
                  onClick={() => handleAddWidget(widget.component)}
                  size="sm"
                  variant="secondary"
                >
                  + {widget.name}
                </AccessibleButton>
              ))}
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardLayout
          .sort((a, b) => a.position - b.position)
          .map(renderWidget)}
      </div>

      {/* Empty State */}
      {dashboardLayout.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your dashboard is empty
          </h3>
          <p className="text-gray-600 mb-4">
            Add widgets to personalize your dashboard experience
          </p>
          <AccessibleButton onClick={() => setIsCustomizing(true)}>
            Add Widgets
          </AccessibleButton>
        </div>
      )}
    </div>
  );
};

// PropTypes
DashboardWidget.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onRemove: PropTypes.func,
  onEdit: PropTypes.func,
  isDragging: PropTypes.bool,
  className: PropTypes.string
};

QuickActionsWidget.propTypes = {
  maxActions: PropTypes.number,
  className: PropTypes.string
};

RecentActivityWidget.propTypes = {
  className: PropTypes.string
};

HealthMetricsWidget.propTypes = {
  className: PropTypes.string
};

ShortcutsWidget.propTypes = {
  className: PropTypes.string
};

PersonalizedDashboard.propTypes = {
  className: PropTypes.string
};

export default {
  DashboardWidget,
  QuickActionsWidget,
  RecentActivityWidget,
  HealthMetricsWidget,
  ShortcutsWidget,
  PersonalizedDashboard
};