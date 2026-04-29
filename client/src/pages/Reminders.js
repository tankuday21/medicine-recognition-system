import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import ReminderForm from '../components/Reminders/ReminderForm';
import ReminderSettingsModal from '../components/Reminders/ReminderSettingsModal';
import ConfirmModal from '../components/Common/ConfirmModal';
import { useLayout } from '../contexts/LayoutContext';
import notificationService from '../services/notificationService';
import { useNavigate } from 'react-router-dom';
import {
  ClockIcon,
  PlusIcon,
  CalendarDaysIcon,
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  ArrowLeftIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const Reminders = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Custom Delete Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);
  const { setHideBottomNav } = useLayout();

  // Hide bottom nav when modal is open
  useEffect(() => {
    setHideBottomNav(showForm);
    return () => setHideBottomNav(false);
  }, [showForm, setHideBottomNav]);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'today') {
        loadTodaysSchedule();
      } else {
        loadReminders();
      }
    }
  }, [isAuthenticated, activeTab]);

  const loadTodaysSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reminders/today', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setTodaysSchedule(data.data);
        notificationService.scheduleNotifications(data.data);
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reminders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        // API returns paginated data: { reminders: [], total: ... }
        const remindersList = data.data.reminders || (Array.isArray(data.data) ? data.data : []);
        setReminders(remindersList);
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsTaken = async (reminderId, scheduleTime) => {
    try {
      await fetch(`/api/reminders/${reminderId}/take`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scheduledTime: scheduleTime })
      });
      loadTodaysSchedule();
    } catch (error) {
      console.error('Failed to mark as taken:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReminder(null);
    loadReminders();
    loadTodaysSchedule();
  };

  // Group schedule by time of day
  const groupedSchedule = todaysSchedule.reduce((acc, item) => {
    const hour = new Date(item.scheduledTime).getHours();
    let period = 'morning';
    if (hour >= 12 && hour < 17) period = 'afternoon';
    else if (hour >= 17) period = 'evening';

    if (!acc[period]) acc[period] = [];
    acc[period].push(item);
    return acc;
  }, {});

  const periods = [
    { id: 'morning', label: t('reminders.morning') || 'Morning', icon: SunIcon, color: 'text-amber-500' },
    { id: 'afternoon', label: t('reminders.afternoon') || 'Afternoon', icon: SunIcon, color: 'text-orange-500' },
    { id: 'evening', label: t('reminders.evening') || 'Evening', icon: MoonIcon, color: 'text-indigo-500' }
  ];

  const tabs = [
    { id: 'today', label: t('reminders.today') || 'Today' },
    { id: 'all', label: t('reminders.all') || 'All' }
  ];

  const handleSaveReminder = async (reminderData) => {
    setIsLoading(true);
    try {
      const url = editingReminder
        ? `/api/reminders/${editingReminder._id}`
        : '/api/reminders';

      const method = editingReminder ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reminderData)
      });

      const data = await response.json();

      if (data.success) {
        handleFormSuccess();
      } else {
        console.error('Failed to save reminder:', data.message);
        alert(data.message || 'Failed to save reminder');
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
      alert('An error occurred while saving the reminder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReminder = (reminderId) => {
    setReminderToDelete(reminderId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!reminderToDelete) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/reminders/${reminderToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();

      if (data.success) {
        handleFormSuccess();
      } else {
        alert(data.message || 'Failed to delete reminder');
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('An error occurred while deleting the reminder');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setReminderToDelete(null);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-6">
      {/* Header Stats */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-600 dark:text-gray-400"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('reminders.title') || 'Reminders'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('reminders.manageDaily') || 'Manage your daily medication'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
            aria-label="Settings"
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todaysSchedule.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('reminders.todayDoses') || 'Today\'s doses'}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todaysSchedule.filter(s => s.taken).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('reminders.taken') || 'Taken'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Settings Modal */}
      <ReminderSettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* Tabs */}
      <div className="px-4 py-3">
        <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : activeTab === 'today' ? (
          /* Today's Schedule */
          <div className="space-y-6">
            {periods.map((period) => {
              const items = groupedSchedule[period.id] || [];
              if (items.length === 0) return null;

              return (
                <div key={period.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <period.icon className={`w-5 h-5 ${period.color}`} />
                    <span className="text-base font-bold text-gray-700 dark:text-gray-300">
                      {period.label}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <motion.div
                        key={`${item.reminderId}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm ${item.taken
                          ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-none'
                          : 'border-gray-100 dark:border-slate-800'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => !item.taken && markAsTaken(item.reminderId, item.scheduledTime)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.taken
                              ? 'bg-emerald-500'
                              : 'bg-gray-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                              }`}
                          >
                            {item.taken ? (
                              <CheckCircleSolid className="w-6 h-6 text-white" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm ${item.taken ? 'text-emerald-700 dark:text-emerald-300 line-through' : 'text-gray-900 dark:text-white'
                              }`}>
                              {item.medicineName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.dosage} • {new Date(item.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          {item.taken && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              {t('reminders.taken') || 'Taken'}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}

            {todaysSchedule.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDaysIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  {t('reminders.noRemindersToday') || 'No reminders for today'}
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-blue-500 font-medium text-sm"
                >
                  {t('reminders.addFirst') || 'Add your first reminder'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* All Reminders */
          <div className="space-y-2">
            {reminders.map((reminder, index) => (
              <motion.button
                key={reminder._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setEditingReminder(reminder);
                  setShowForm(true);
                }}
                className="w-full bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 text-left shadow-sm active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${reminder.isActive
                    ? 'bg-blue-100 dark:bg-blue-950/50'
                    : 'bg-gray-100 dark:bg-slate-800'
                    }`}>
                    <BellIcon className={`w-5 h-5 ${reminder.isActive ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {reminder.medicineName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {reminder.dosage} • {reminder.times?.join(', ')}
                    </p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                </div>
              </motion.button>
            ))}

            {reminders.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BellIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('reminders.noReminders') || 'No reminders yet'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowForm(true)}
        className="fixed right-4 z-30 w-14 h-14 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center"
        style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
      >
        <PlusIcon className="w-7 h-7 text-white" />
      </motion.button>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white dark:bg-slate-900 rounded-t-3xl max-h-[90vh] overflow-y-auto"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
            >
              <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingReminder ? t('reminders.editReminder') : t('reminders.addReminder')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingReminder(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4">
                <ReminderForm
                  editingReminder={editingReminder}
                  onSave={handleSaveReminder}
                  onDelete={handleDeleteReminder}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingReminder(null);
                  }}
                  isLoading={isLoading}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title={t('reminders.deleteTitle') || "Delete Reminder"}
        message={t('reminders.confirmDelete') || "Are you sure you want to delete this reminder? This action cannot be undone."}
        confirmText={t('common.delete') || "Delete"}
        isDangerous={true}
      />
    </div>
  );
};

export default Reminders;