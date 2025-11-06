import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const NotificationTest = () => {
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const status = notificationService.getPermissionStatus();
    setPermissionStatus(status);
  }, []);

  const addTestResult = (test, success, message) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      success,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const requestPermission = async () => {
    try {
      const result = await notificationService.requestPermission();
      if (result.success) {
        setPermissionStatus(notificationService.getPermissionStatus());
        addTestResult('Permission Request', true, result.message);
      } else {
        addTestResult('Permission Request', false, result.message);
      }
    } catch (error) {
      addTestResult('Permission Request', false, error.message);
    }
  };

  const testBasicNotification = () => {
    try {
      const notification = notificationService.showTestNotification();
      if (notification) {
        addTestResult('Basic Notification', true, 'Test notification shown successfully');
      } else {
        addTestResult('Basic Notification', false, 'Failed to show notification');
      }
    } catch (error) {
      addTestResult('Basic Notification', false, error.message);
    }
  };

  const testMedicationReminder = () => {
    try {
      const mockReminderItem = {
        reminderId: 'test-123',
        medicineName: 'Test Medicine',
        dosage: '10mg',
        scheduledTime: new Date().toISOString()
      };

      const notification = notificationService.showMedicationReminder(
        'Test Medicine',
        '10mg',
        new Date().toLocaleTimeString(),
        mockReminderItem
      );

      if (notification) {
        addTestResult('Medication Reminder', true, 'Medication reminder shown with actions');
      } else {
        addTestResult('Medication Reminder', false, 'Failed to show medication reminder');
      }
    } catch (error) {
      addTestResult('Medication Reminder', false, error.message);
    }
  };

  const testScheduledNotification = () => {
    try {
      const mockSchedule = [{
        reminderId: 'test-scheduled',
        medicineName: 'Scheduled Test Medicine',
        dosage: '5mg',
        scheduledTime: new Date(Date.now() + 5000).toISOString(), // 5 seconds from now
        status: 'pending'
      }];

      const result = notificationService.scheduleNotifications(mockSchedule);
      if (result.success) {
        addTestResult('Scheduled Notification', true, `${result.message} (will appear in 5 seconds)`);
      } else {
        addTestResult('Scheduled Notification', false, result.message);
      }
    } catch (error) {
      addTestResult('Scheduled Notification', false, error.message);
    }
  };

  const testEarlyReminder = () => {
    try {
      const notification = notificationService.showEarlyReminder('Test Medicine', '10mg', 5);
      if (notification) {
        addTestResult('Early Reminder', true, 'Early reminder shown successfully');
      } else {
        addTestResult('Early Reminder', false, 'Failed to show early reminder');
      }
    } catch (error) {
      addTestResult('Early Reminder', false, error.message);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BellIcon className="h-5 w-5 mr-2 text-blue-600" />
          Notification System Test
        </h3>
        <button
          onClick={clearResults}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear Results
        </button>
      </div>

      {/* Permission Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Permission Status</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span className="w-24">Supported:</span>
            <span className={`font-medium ${permissionStatus?.isSupported ? 'text-green-600' : 'text-red-600'}`}>
              {permissionStatus?.isSupported ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-24">Permission:</span>
            <span className={`font-medium ${
              permissionStatus?.isGranted ? 'text-green-600' : 
              permissionStatus?.canRequest ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {permissionStatus?.permission || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={requestPermission}
          disabled={permissionStatus?.isGranted}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Request Permission
        </button>

        <button
          onClick={testBasicNotification}
          disabled={!permissionStatus?.isGranted}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Test Basic Notification
        </button>

        <button
          onClick={testMedicationReminder}
          disabled={!permissionStatus?.isGranted}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Test Medication Reminder
        </button>

        <button
          onClick={testScheduledNotification}
          disabled={!permissionStatus?.isGranted}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Test Scheduled (5s delay)
        </button>

        <button
          onClick={testEarlyReminder}
          disabled={!permissionStatus?.isGranted}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Test Early Reminder
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Test Results</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testResults.map((result) => (
              <div
                key={result.id}
                className={`flex items-start p-3 rounded-lg ${
                  result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex-shrink-0 mr-3">
                  {result.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.test}
                    </p>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  <p className={`text-sm ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Testing Instructions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>First, click "Request Permission" to enable notifications</li>
              <li>Test basic notifications to ensure they work</li>
              <li>Try medication reminders with action buttons</li>
              <li>Test scheduled notifications (will appear after 5 seconds)</li>
              <li>Check that notifications appear even when the browser tab is not active</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationTest;