// Page Wrapper Component - Provides consistent layout with premium UI
import React from 'react';
import Card from './Card';
import Button from './Button';

export const PageWrapper = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 ${className}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        {children}
      </div>
    </div>
  );
};

export const PageHeader = ({ title, subtitle, actions, icon: Icon, className = '' }) => {
  return (
    <Card variant="gradient" className={`mb-8 bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0 shadow-xl ${className}`}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 flex-1">
            {Icon && (
              <div className="flex-shrink-0 p-3 bg-white/20 rounded-xl">
                <Icon className="h-8 w-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              {subtitle && <p className="text-white/90 text-lg">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      </div>
    </Card>
  );
};

export const PageSection = ({ title, icon: Icon, children, className = '', ...props }) => {
  return (
    <Card variant="elevated" hoverable className={className} {...props}>
      <div className="p-6">
        {title && (
          <div className="flex items-center mb-4">
            {Icon && <Icon className="h-6 w-6 text-primary-600 mr-3" />}
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
        )}
        {children}
      </div>
    </Card>
  );
};

export const TabNavigation = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <Card variant="elevated" className={`mb-6 ${className}`}>
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {Icon && <Icon className="h-5 w-5" />}
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </Card>
  );
};

export const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => {
  return (
    <Card variant="elevated" className={`text-center ${className}`}>
      <div className="p-12">
        {Icon && <Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />}
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        {description && <p className="text-gray-600 mb-6">{description}</p>}
        {action}
      </div>
    </Card>
  );
};

export const SignInRequired = ({ icon: Icon, title, description, onSignIn }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <EmptyState
        icon={Icon}
        title={title || 'Sign In Required'}
        description={description || 'Please sign in to access this feature.'}
        action={
          <Button variant="primary" size="lg" onClick={onSignIn}>
            Sign In
          </Button>
        }
      />
    </div>
  );
};

export default PageWrapper;
