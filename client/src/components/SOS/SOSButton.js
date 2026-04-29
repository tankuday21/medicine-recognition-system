import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SOSButton = ({ onEmergencyTrigger, emergencyContacts, hasLocation, onLocationRefresh }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState(null);
  const { t } = useLanguage();
  
  const countdownTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const handlePressStart = () => {
    if (isTriggering || triggerResult) return;
    
    setIsPressed(true);
    setCountdown(3);
    
    // Vibrate on start
    if (navigator.vibrate) navigator.vibrate(50);
    
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          setIsPressed(false);
          // Trigger SOS immediately
          triggerSOS();
          return 0;
        }
        // Vibrate each second
        if (navigator.vibrate) navigator.vibrate(100);
        return prev - 1;
      });
    }, 1000);
  };

  const handlePressEnd = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setIsPressed(false);
    setCountdown(0);
  };

  const triggerSOS = async () => {
    if (!hasLocation) {
      alert(t('sos.enableLocation'));
      onLocationRefresh();
      return;
    }
    if (emergencyContacts.length === 0) {
      alert(t('sos.addContacts'));
      return;
    }

    setIsTriggering(true);
    setTriggerResult(null);

    // Strong vibration pattern
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);

    try {
      const result = await onEmergencyTrigger();
      setTriggerResult(result);
      
      // Auto reset after 5 seconds
      setTimeout(() => {
        setTriggerResult(null);
      }, 5000);
    } catch (error) {
      setTriggerResult({ success: false, message: error.message });
    } finally {
      setIsTriggering(false);
    }
  };

  const canTrigger = hasLocation && emergencyContacts.length > 0;

  // Result Screen
  if (triggerResult) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        {triggerResult.success ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-3 animate-bounce">
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{t('sos.sent')}</h3>
            <p className="text-gray-500 text-xs mt-0.5">
              {t('sos.contactsNotified', { count: triggerResult.data?.alertsSent || 0 })}
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <XMarkIcon className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{t('sos.failed')}</h3>
            <p className="text-gray-500 text-xs mt-0.5">{triggerResult.message}</p>
          </>
        )}
      </div>
    );
  }

  // Sending Screen
  if (isTriggering) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-3" />
        <h3 className="text-base font-bold text-gray-900">{t('sos.sending')}</h3>
        <p className="text-gray-500 text-[10px] mt-0.5">{t('contacts.title')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-4">
      {/* SOS Button */}
      <div className="relative">
        {/* Outer pulse ring */}
        {canTrigger && !isPressed && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" style={{ animationDuration: '2s' }} />
            <div className="absolute -inset-3 rounded-full border-4 border-red-200 opacity-50" />
          </>
        )}
        
        <button
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          disabled={!canTrigger}
          className={`
            relative w-48 h-48 rounded-full font-bold transition-all duration-200 select-none
            ${isPressed 
              ? 'scale-90 bg-red-800' 
              : 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-2xl'
            }
            ${!canTrigger ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          `}
          style={{
            boxShadow: canTrigger && !isPressed 
              ? '0 15px 40px rgba(239, 68, 68, 0.4), inset 0 -5px 20px rgba(0,0,0,0.2)' 
              : undefined
          }}
        >
          {/* Inner highlight */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
          
          {isPressed && countdown > 0 ? (
            <div className="relative flex flex-col items-center justify-center h-full text-white">
              <span className="text-7xl font-black">{countdown}</span>
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center h-full text-white">
              <ExclamationTriangleIcon className="h-16 w-16 mb-1" />
              <span className="text-3xl font-black tracking-wider">SOS</span>
            </div>
          )}
        </button>

        {/* Progress Ring */}
        {isPressed && (
          <svg className="absolute inset-0 w-48 h-48 -rotate-90 pointer-events-none" viewBox="0 0 192 192">
            <circle
              cx="96" cy="96" r="92"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="96" cy="96" r="92"
              stroke="white"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 92}`}
              strokeDashoffset={`${2 * Math.PI * 92 * (1 - (3 - countdown) / 3)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-3 text-center">
        <p className="text-lg font-bold text-gray-800">
          {isPressed ? t('common.loading') : t('sos.pressHold')}
        </p>
        <p className="text-sm text-gray-500 mt-1 leading-tight">
          {canTrigger 
            ? t('sos.holdFor3Sec')
            : !hasLocation 
              ? t('sos.enableLocation')
              : t('sos.addContacts')
          }
        </p>
      </div>

      {/* Status Pills */}
      <div className="flex gap-2 mt-2">
        <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
          hasLocation ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${hasLocation ? 'bg-green-500' : 'bg-red-500'}`} />
          {hasLocation ? t('sos.locationReady') : t('sos.noLocation')}
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
          emergencyContacts.length > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${emergencyContacts.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`} />
          {emergencyContacts.length} {t('contacts.title')}
        </div>
      </div>
    </div>
  );
};

SOSButton.propTypes = {
  onEmergencyTrigger: PropTypes.func.isRequired,
  emergencyContacts: PropTypes.array.isRequired,
  hasLocation: PropTypes.bool.isRequired,
  onLocationRefresh: PropTypes.func.isRequired
};

export default SOSButton;
