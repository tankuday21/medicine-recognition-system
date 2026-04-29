import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  BellIcon,
  BellSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SpeakerWaveIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';
import notificationService from '../../services/notificationService';
import { useLanguage } from '../../contexts/LanguageContext';

const NotificationSettings = ({ onPermissionChange }) => {
  const { t } = useLanguage();
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [availableSounds, setAvailableSounds] = useState([]);
  const [currentSound, setCurrentSound] = useState('');

  useEffect(() => {
    updatePermissionStatus();
    setAvailableSounds(notificationService.getAvailableSounds());
    setCurrentSound(notificationService.selectedSound);
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
  
  const handleSoundChange = (e) => {
    const soundId = e.target.value;
    notificationService.setSoundTheme(soundId);
    setCurrentSound(soundId);
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
        title: t('notifications.notSupported'),
        message: t('notifications.browserNotSupported'),
        type: 'info'
      };
    }
    
    switch (permissionStatus.permission) {
      case 'granted':
        return {
          title: t('notifications.enabled'),
          message: t('notifications.willReceiveReminders'),
          type: 'success'
        };
      case 'denied':
        return {
          title: t('notifications.blocked'),
          message: t('notifications.enableInBrowser'),
          type: 'error'
        };
      default:
        return {
          title: t('notifications.enableNotifications'),
          message: t('notifications.allowToReceive'),
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
                {isRequesting ? t('notifications.requesting') : t('notifications.enableNotifications')}
              </button>
            )}
            
            {permissionStatus.isGranted && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleTestNotification}
                  className="px-4 py-2 border border-blue-200 text-blue-700 text-sm font-medium rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <BellIcon className="w-4 h-4" />
                  {t('notifications.testNotification')}
                </button>
                
                <div className="flex items-center gap-2 ml-auto">
                  <SpeakerWaveIcon className="w-5 h-5 text-gray-400" />
                  <select
                    value={currentSound}
                    onChange={handleSoundChange}
                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[140px]"
                  >
                    {availableSounds.map(sound => (
                      <option key={sound.id} value={sound.id}>
                        {sound.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* Additional Info */}
          {permissionStatus.permission === 'denied' && (
            <div className="mt-3 p-3 bg-white border border-red-200 rounded-md">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">{t('notifications.howToEnable')}</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>{t('notifications.step1')}</li>
                    <li>{t('notifications.step2')}</li>
                    <li>{t('notifications.step3')}</li>
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
                  <p>{t('notifications.notificationsWorking')}</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>{t('notifications.scheduledTimes')}</li>
                    <li>{t('notifications.missedDoseAlerts')}</li>
                    <li>{t('notifications.dailySummaries')}</li>
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