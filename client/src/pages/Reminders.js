import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReminderForm from '../components/Reminders/ReminderForm';
import NotificationSettings from '../components/Reminders/NotificationSettings';
import NotificationTest from '../components/Reminders/NotificationTest';
import AdherenceCalendar from '../components/Reminders/AdherenceCalendar';
import notificationService from '../services/notificationService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  ClockIcon,
  PlusIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  CogIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const Reminders = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [stats, setStats] = useState(null);
  const [conflicts, setConflicts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notificationPermission, setNotificationPermission] = useState(null);
  const { isAuthenticated } = useAuth();

  const tabs = [
    { id: 'today', name: 'Today', icon: CalendarDaysIcon },
    { id: 'all', name: 'All Reminders', icon: ClockIcon },
    { id: 'calendar', name: 'Calendar', icon: CalendarDaysIcon },
    { id: 'stats', name: 'Statistics', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize notification permission status
      const permissionStatus = notificationService.getPermissionStatus();
      setNotificationPermission(permissionStatus);

      if (activeTab === 'today') {
        loadTodaysSchedule();
      } else if (activeTab === 'all') {
        loadReminders();
        loadConflicts();
      } else if (activeTab === 'stats') {
        loadStats();
      }
    }
  }, [isAuthenticated, activeTab]);

  const loadTodaysSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reminders/today', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setTodaysSchedule(data.data);

        // Schedule notifications if permission is granted
        if (notificationPermission?.isGranted) {
          const scheduleResult = notificationService.scheduleNotifications(data.data);
          if (scheduleResult.success) {
            console.log(`[SUCCESS] ${scheduleResult.message}`);
          }
        } else if (notificationPermission?.canRequest) {
          // Show notification permission prompt if not yet requested
          console.log('[INFO] Notification permission not granted - user can enable in settings');
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Failed to load today\'s schedule:', error);
      setError('Failed to load today\'s schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reminders?isActive=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setReminders(data.data.reminders);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
      setError('Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reminders/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConflicts = async () => {
    try {
      const response = await fetch('/api/reminders/conflicts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setConflicts(data.data);
      }
    } catch (error) {
      console.error('Failed to load conflicts:', error);
    }
  };

  const handleNotificationPermissionChange = (permission) => {
    setNotificationPermission(permission);
  };

  const handleCreateReminder = async (reminderData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reminderData)
      });

      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        setEditingReminder(null);
        // Refresh current tab data
        if (activeTab === 'today') {
          loadTodaysSchedule();
        } else if (activeTab === 'all') {
          loadReminders();
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Failed to create reminder:', error);
      setError('Failed to create reminder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const handleUpdateReminder = async (reminderData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reminders/${editingReminder._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reminderData)
      });

      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        setEditingReminder(null);
        // Refresh current tab data
        if (activeTab === 'today') {
          loadTodaysSchedule();
        } else if (activeTab === 'all') {
          loadReminders();
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Failed to update reminder:', error);
      setError('Failed to update reminder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        // Refresh current tab data
        if (activeTab === 'today') {
          loadTodaysSchedule();
        } else if (activeTab === 'all') {
          loadReminders();
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      setError('Failed to delete reminder');
    }
  };

  const handleExportData = async () => {
    try {
      // Get all reminders and stats
      const remindersResponse = await fetch('/api/reminders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const statsResponse = await fetch('/api/reminders/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const remindersData = await remindersResponse.json();
      const statsData = await statsResponse.json();

      const exportData = {
        exportDate: new Date().toISOString(),
        reminders: remindersData.success ? remindersData.data.reminders : [],
        statistics: statsData.success ? statsData.data : null
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `mediot-reminders-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      setError('Failed to export data');
    }
  };

  const handleLogDose = async (reminderId, scheduledTime, status) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          scheduledTime,
          status,
          takenTime: status === 'taken' ? new Date().toISOString() : null
        })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh today's schedule
        loadTodaysSchedule();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Failed to log dose:', error);
      setError('Failed to log dose');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'taken':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'missed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'skipped':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'taken':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'missed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'skipped':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600">
            Please sign in to manage your medication reminders and track your adherence.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medication Reminders</h1>
          <p className="text-gray-600">Manage your medication schedule and track adherence</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export</span>
          </button>
          
          <button
            onClick={() => {
              setEditingReminder(null);
              setShowForm(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Reminder</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Reminder Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <ReminderForm
              editingReminder={editingReminder}
              onSave={editingReminder ? handleUpdateReminder : handleCreateReminder}
              onCancel={() => {
                setShowForm(false);
                setEditingReminder(null);
              }}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Today's Schedule */}
          {activeTab === 'today' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading schedule...</p>
                </div>
              ) : todaysSchedule.length > 0 ? (
                <div className="space-y-3">
                  {todaysSchedule.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${getStatusColor(item.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <h3 className="font-medium">{item.medicineName}</h3>
                            <p className="text-sm opacity-75">
                              {item.dosage} • {formatTime(item.scheduledTime)}
                            </p>
                          </div>
                        </div>

                        {item.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleLogDose(item.reminderId, item.scheduledTime, 'taken')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Taken
                            </button>
                            <button
                              onClick={() => handleLogDose(item.reminderId, item.scheduledTime, 'skipped')}
                              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                            >
                              Skip
                            </button>
                            <button
                              onClick={() => handleLogDose(item.reminderId, item.scheduledTime, 'missed')}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              Missed
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No medications scheduled for today</p>
                </div>
              )}
            </div>
          )}

          {/* All Reminders */}
          {activeTab === 'all' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">All Active Reminders</h2>
                {conflicts && conflicts.totalConflicts > 0 && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <ExclamationCircleIcon className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      {conflicts.totalConflicts} scheduling conflict{conflicts.totalConflicts > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Conflicts Display */}
              {conflicts && conflicts.conflicts.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-3">Scheduling Conflicts</h3>
                  <div className="space-y-2">
                    {conflicts.conflicts.map((conflict, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-800 font-medium">{conflict.message}</p>
                          <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
                            {conflict.medications.map((med, medIndex) => (
                              <li key={medIndex}>{med.medicineName} ({med.dosage})</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading reminders...</p>
                </div>
              ) : reminders.length > 0 ? (
                <div className="space-y-4">
                  {reminders.map((reminder) => (
                    <div key={reminder._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{reminder.medicineName}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {reminder.dosage} • {reminder.frequency.replace('_', ' ')} daily
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Times: {reminder.times.join(', ')}</span>
                            <span>•</span>
                            <span>Started: {new Date(reminder.startDate).toLocaleDateString()}</span>
                            {reminder.adherencePercentage !== undefined && (
                              <>
                                <span>•</span>
                                <span>Adherence: {reminder.adherencePercentage}%</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditReminder(reminder)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit reminder"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReminder(reminder._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete reminder"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No active reminders found</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-3 text-blue-600 hover:text-blue-800"
                  >
                    Create your first reminder
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Calendar */}
          {activeTab === 'calendar' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Adherence Calendar</h2>
              <AdherenceCalendar userId={isAuthenticated ? 'current-user' : null} />
            </div>
          )}

          {/* Statistics */}
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Adherence Statistics</h2>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading statistics...</p>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900">Overall Adherence</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.adherencePercentage}%</p>
                    <p className="text-sm text-blue-700">Last {stats.period}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900">Doses Taken</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalTaken}</p>
                    <p className="text-sm text-green-700">Out of {stats.totalScheduled} scheduled</p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-medium text-red-900">Doses Missed</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.totalMissed}</p>
                    <p className="text-sm text-red-700">Missed doses</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-medium text-yellow-900">Doses Skipped</h3>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.totalSkipped}</p>
                    <p className="text-sm text-yellow-700">Intentionally skipped</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No statistics available yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Start taking your medications to see adherence statistics
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>

              <div className="space-y-6">
                <NotificationSettings onPermissionChange={handleNotificationPermissionChange} />
                
                {/* Notification Testing */}
                <NotificationTest />

                {/* Additional Settings */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Reminder Preferences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Show missed dose alerts
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Daily adherence summary
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Weekly adherence report
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reminders;