import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  BellIcon,
  BellSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import notificationService from '../../services/notificationService';

const NotificationSettings = ({ onPermissionChange }) => {
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    updatePermissionStatus();
  }, []);

  const updatePermissionStatus = () => {
    const status = notificationService.getPermissionStatus();
    setPermissionStatus(status);
    
    if (onPermissionChange) {
      onPermissionChange(status);
    }
  };

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      const result = await notificationService.requestPermission();
      updatePermissionStatus();
      
      if (result.success) {
        // Show test notification
        setTimeout(() => {
          notificationService.showTestNotification();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to request permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTestNotification = () => {
    notificationService.showTestNotification();
  };

  if (!permissionStatus) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (!permissionStatus.isSupported) {
      return <BellSlashIcon className="h-6 w-6 text-gray-400" />;
    }
    
    switch (permissionStatus.permission) {
      case 'granted':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'denied':
        return <BellSlashIcon className="h-6 w-6 text-red-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    if (!permissionStatus.isSupported) {
      return 'bg-gray-50 border-gray-200';
    }
    
    switch (permissionStatus.permission) {
      case 'granted':
        return 'bg-green-50 border-green-200';
      case 'denied':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusMessage = () => {
    if (!permissionStatus.isSupported) {
      return {
        title: 'Notifications Not Supported',
        message: 'Your browser does not support push notifications.',
        type: 'info'
      };
    }
    
    switch (permissionStatus.permission) {
      case 'granted':
        return {
          title: 'Notifications Enabled',
          message: 'You will receive medication reminders and alerts.',
          type: 'success'
        };
      case 'denied':
        return {
          title: 'Notifications Blocked',
          message: 'Please enable notifications in your browser settings to receive medication reminders.',
          type: 'error'
        };
      default:
        return {
          title: 'Enable Notifications',
          message: 'Allow notifications to receive medication reminders and never miss a dose.',
          type: 'warning'
        };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className={`p-4 border rounded-lg ${getStatusColor()}`}>
      <div className="flex items-start space-x-3">
        {getStatusIcon()}
        
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">
            {statusMessage.title}
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            {statusMessage.message}
          </p>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            {permissionStatus.canRequest && (
              <button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isRequesting ? 'Requesting...' : 'Enable Notifications'}
              </button>
            )}
            
            {permissionStatus.isGranted && (
              <button
                onClick={handleTestNotification}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
              >
                Test Notification
              </button>
            )}
          </div>
          
          {/* Additional Info */}
          {permissionStatus.permission === 'denied' && (
            <div className="mt-3 p-3 bg-white border border-red-200 rounded-md">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">How to enable notifications:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Click the lock icon in your browser's address bar</li>
                    <li>Change notifications from "Block" to "Allow"</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
          
          {permissionStatus.isGranted && (
            <div className="mt-3 p-3 bg-white border border-green-200 rounded-md">
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-700">
                  <p>Notifications are working! You'll receive reminders for:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Scheduled medication times</li>
                    <li>Missed dose alerts</li>
                    <li>Daily adherence summaries</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

NotificationSettings.propTypes = {
  onPermissionChange: PropTypes.func
};

export default NotificationSettings;