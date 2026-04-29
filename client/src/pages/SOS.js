import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import SOSButton from '../components/SOS/SOSButton';
import EmergencyContacts from '../components/SOS/EmergencyContacts';
import LocationService from '../services/locationService';
import {
  ExclamationTriangleIcon,
  PhoneIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  PlusCircleIcon,
  HeartIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { BackButton } from '../components/ui/PremiumComponents';

const SOS = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sos');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [isHelplinesExpanded, setIsHelplinesExpanded] = useState(false);
  const [isAnyContactExpanded, setIsAnyContactExpanded] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (isAuthenticated) {
      loadEmergencyContacts();
      getCurrentLocation();
    }
  }, [isAuthenticated]);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError('');

    try {
      const locationResult = await LocationService.getCurrentLocation();
      if (locationResult.success) {
        setLocation(locationResult.data);
      } else {
        setLocationError(locationResult.message);
      }
    } catch (error) {
      setLocationError(t('sos.failedToGetLocation'));
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const loadEmergencyContacts = async () => {
    try {
      const response = await fetch('/api/emergency/contacts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setEmergencyContacts(data.data);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const handleEmergencyTrigger = async () => {
    try {
      setError('');
      let currentLocation = location;

      if (!currentLocation) {
        const locationResult = await LocationService.getCurrentLocation();
        if (locationResult.success) {
          currentLocation = locationResult.data;
          setLocation(currentLocation);
        } else {
          throw new Error(t('sos.locationRequired'));
        }
      }

      const response = await fetch('/api/emergency/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          emergencyType: 'emergency',
          message: t('sos.emergencyAssistanceNeeded'),
          location: currentLocation
        })
      });

      const data = await response.json();
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 relative">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <BackButton onClick={() => navigate(-1)} />
        </div>

        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-sm w-full border border-gray-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('auth.signInRequired')}</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              {t('auth.sosAccessNotice')}
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
              >
                {t('auth.signIn')}
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      {/* Main Content */}
      <div className="px-4 pt-4 flex-1 flex flex-col min-h-0">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => navigate(-1)} />
            <div>
              <h1 className="text-lg font-black text-gray-900 tracking-tight leading-tight">{t('nav.emergencySOS')}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-1 h-1 rounded-full ${
                  isLoadingLocation ? 'bg-yellow-500 animate-pulse' : 
                  location ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className={`text-[8px] font-bold uppercase tracking-widest ${locationError ? 'text-red-500' : 'text-gray-400'}`}>
                  {isLoadingLocation ? t('common.detectingLocation') : 
                   locationError ? locationError :
                   location ? t('sos.locationReady') : t('sos.noLocation')}
                </span>
                {locationError && !isLoadingLocation && (
                  <button 
                    onClick={getCurrentLocation}
                    className="text-[8px] font-black text-indigo-600 uppercase tracking-widest hover:underline ml-1"
                  >
                    {t('common.retry')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Tab Switcher */}
        <div className="bg-white p-1.5 rounded-3xl shadow-xl shadow-gray-100/50 mb-4 flex gap-1.5 border border-gray-50">
          <button
            onClick={() => setActiveTab('sos')}
            className={`flex-1 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'sos'
                ? 'bg-red-600 text-white shadow-md shadow-red-100'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
            {t('sos.title')}
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'contacts'
                ? 'bg-red-600 text-white shadow-md shadow-red-100'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <UserGroupIcon className="h-4 w-4" />
            {t('contacts.title')}
          </button>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`flex-1 min-h-0 flex flex-col ${activeTab === 'contacts' ? 'overflow-y-auto' : 'overflow-hidden'}`}
            style={activeTab === 'contacts' ? { WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' } : {}}
          >
            {activeTab === 'sos' ? (
              <div className="bg-white rounded-[2.5rem] p-3 shadow-sm border-2 border-gray-50 h-full flex flex-col">
                <div className="flex-1 flex flex-col justify-center">
                  <SOSButton
                    onEmergencyTrigger={handleEmergencyTrigger}
                    emergencyContacts={emergencyContacts}
                    hasLocation={!!location}
                    onLocationRefresh={getCurrentLocation}
                  />
                </div>

                {/* Location Verification Panel */}
                <div className="mt-2 bg-gray-50 rounded-3xl p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('common.liveVerification')}</p>
                    {location?.isIPBased && (
                      <span className="text-[8px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">{t('common.approxIPLocation')}</span>
                    )}
                  </div>
                  
                  {location ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <MapPinIcon className="h-3 w-3 text-red-500" />
                        </div>
                        <p className="text-[10px] text-gray-700 font-bold line-clamp-1">
                          {location.address || t('common.locatingAddress')}
                        </p>
                      </div>
                      <div className="flex gap-4 pl-8">
                        <div className="flex flex-col">
                          <span className="text-[7px] text-gray-400 font-bold uppercase tracking-tighter">{t('common.latitude')}</span>
                          <span className="text-[9px] text-gray-600 font-mono font-bold">{location.latitude.toFixed(6)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7px] text-gray-400 font-bold uppercase tracking-tighter">{t('common.longitude')}</span>
                          <span className="text-[9px] text-gray-600 font-mono font-bold">{location.longitude.toFixed(6)}</span>
                        </div>
                        {location.accuracy && (
                          <div className="flex flex-col">
                            <span className="text-[7px] text-gray-400 font-bold uppercase tracking-tighter">{t('common.precision')}</span>
                            <span className="text-[9px] text-gray-600 font-bold">±{Math.round(location.accuracy)}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 flex items-center justify-center gap-2 text-gray-400">
                      <div className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-bounce" />
                      <p className="text-[10px] font-bold">{t('common.waitingForLocation')}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="px-1 pb-20">
                <EmergencyContacts
                  contacts={emergencyContacts}
                  onContactsChange={loadEmergencyContacts}
                  onExpand={(expanded) => setIsAnyContactExpanded(expanded)}
                  location={location}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Emergency Helplines FAB - Hidden when a contact is expanded */}
      <AnimatePresence>
        {!isAnyContactExpanded && (
          <div className="fixed bottom-6 right-6 z-40">
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsHelplinesExpanded(true)}
              className="w-16 h-16 bg-red-600 text-white rounded-full shadow-xl shadow-red-200 flex items-center justify-center border-4 border-white relative group"
            >
              {/* Pulse Effect */}
              <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20 group-hover:hidden" />
              <PhoneIcon className="h-8 w-8" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Emergency Helplines Modal */}
      <AnimatePresence>
        {isHelplinesExpanded && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[60] overflow-hidden flex flex-col"
          >
            {/* Header / Close Bar */}
            <div 
              className="w-full py-4 flex flex-col items-center cursor-pointer border-b border-gray-50"
              onClick={() => setIsHelplinesExpanded(false)}
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-12 pt-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('sos.quickHelp')}</h2>
                  <p className="text-sm text-gray-500">{t('sos.officialHelplines')}</p>
                </div>
                <button 
                  onClick={() => setIsHelplinesExpanded(false)}
                  className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 active:scale-90 transition-transform"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { num: '112', label: t('sos.helpline112Label'), desc: t('sos.helpline112Desc'), color: 'from-red-500 to-red-600', icon: ShieldCheckIcon },
                  { num: '100', label: t('sos.helpline100Label'), desc: t('sos.helpline100Desc'), color: 'from-blue-500 to-blue-600', icon: IdentificationIcon },
                  { num: '108', label: t('sos.helpline108Label'), desc: t('sos.helpline108Desc'), color: 'from-green-500 to-green-600', icon: PlusCircleIcon },
                  { num: '101', label: t('sos.helpline101Label'), desc: t('sos.helpline101Desc'), color: 'from-orange-500 to-orange-600', icon: ExclamationTriangleIcon },
                  { num: '1091', label: t('sos.helpline1091Label'), desc: t('sos.helpline1091Desc'), color: 'from-pink-500 to-pink-600', icon: HeartIcon },
                  { num: '1098', label: t('sos.helpline1098Label'), desc: t('sos.helpline1098Desc'), color: 'from-indigo-500 to-indigo-600', icon: UserGroupIcon }
                ].map((item) => (
                  <motion.a
                    key={item.num}
                    href={`tel:${item.num}`}
                    whileTap={{ scale: 0.98 }}
                    className="p-1 bg-gray-50 rounded-[2rem] border-2 border-transparent hover:border-gray-200 transition-all block"
                  >
                    <div className="flex items-center gap-4 p-4 bg-white rounded-[1.8rem] shadow-sm">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}>
                        <item.icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-black text-gray-900">{item.label}</h3>
                          <span className="text-xl font-black text-red-600">{item.num}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Bottom Info */}
              <div className="mt-8 p-6 bg-blue-50 rounded-[2.5rem] border border-blue-100">
                <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2">{t('common.importantNotice')}</p>
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  {t('sos.sosMisuseWarning')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SOS;
