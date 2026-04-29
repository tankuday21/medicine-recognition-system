import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  SpeakerWaveIcon, 
  BellIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import notificationService from '../../services/notificationService';
import { useLanguage } from '../../contexts/LanguageContext';

const ReminderSettingsModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [currentSound, setCurrentSound] = useState('');
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [availableSounds, setAvailableSounds] = useState([]);
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentSound(notificationService.selectedSound);
      setLoopEnabled(notificationService.loopSound);
      setAvailableSounds(notificationService.getAvailableSounds());
      setPermissionStatus(notificationService.getPermissionStatus());
    }
  }, [isOpen]);

  const handleSoundChange = (e) => {
    const soundId = e.target.value;
    notificationService.setSoundTheme(soundId);
    setCurrentSound(soundId);
  };

  const toggleLoop = () => {
    const newVal = !loopEnabled;
    notificationService.setLoop(newVal);
    setLoopEnabled(newVal);
  };

  const handleTestSound = () => {
    notificationService.playNotificationSound();
  };

  const handleStopSound = () => {
    notificationService.stopSound();
  };

  const requestPermission = async () => {
    await notificationService.requestPermission();
    setPermissionStatus(notificationService.getPermissionStatus());
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/30 dark:bg-blue-900/10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BellIcon className="w-6 h-6 text-blue-500" />
              Notification Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Permission Status */}
            <div className={`p-4 rounded-2xl border ${
              permissionStatus?.isGranted ? 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {permissionStatus?.isGranted ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {permissionStatus?.isGranted ? 'Notifications Active' : 'Notifications Disabled'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {permissionStatus?.isGranted ? 'You will receive medication alerts' : 'Alerts are currently blocked by browser'}
                    </p>
                  </div>
                </div>
                {!permissionStatus?.isGranted && (
                  <button
                    onClick={requestPermission}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enable
                  </button>
                )}
              </div>
            </div>

            {/* Sound Selection */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <SpeakerWaveIcon className="w-4 h-4" />
                Alert Sound Theme
              </label>
              <div className="grid grid-cols-1 gap-3">
                <select
                  value={currentSound}
                  onChange={handleSoundChange}
                  className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-0 outline-none transition-all"
                >
                  {availableSounds.map(sound => (
                    <option key={sound.id} value={sound.id}>
                      {sound.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleTestSound}
                    className="flex-1 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold rounded-2xl border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                  >
                    <SpeakerWaveIcon className="w-5 h-5" />
                    Play Sample
                  </button>
                  <button
                    onClick={handleStopSound}
                    className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/50 hover:bg-red-100 transition-all"
                    title="Stop Sound"
                  >
                    <StopIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loop Option */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <ArrowPathIcon className={`w-5 h-5 text-blue-600 ${loopEnabled ? 'animate-spin-slow' : ''}`} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Continuous Ringing</p>
                  <p className="text-xs text-gray-500">Keep ringing until turned off</p>
                </div>
              </div>
              <button
                onClick={toggleLoop}
                className={`w-12 h-6 rounded-full transition-colors relative ${loopEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-700'}`}
              >
                <motion.div
                  animate={{ x: loopEnabled ? 26 : 2 }}
                  className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Premium Medical Alerts • Mediot v2.0
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReminderSettingsModal;
