import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  HeartIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  BellIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('dashboard.greeting.morning'));
    else if (hour < 17) setGreeting(t('dashboard.greeting.afternoon'));
    else setGreeting(t('dashboard.greeting.evening'));

    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analytics/dashboard?timeframe=30d', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ChartBarIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('common.appName')}</h2>
          <p className="text-gray-500 mb-6">{t('auth.signInRequired')}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-200 active:scale-98 transition-all"
          >
            {t('auth.signIn')}
          </button>
        </div>
      </div>
    );
  }

  const healthScore = dashboardData?.overallHealthScore || 78;
  const adherenceRate = dashboardData?.adherenceAnalytics?.overallRate || 85;

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 px-4 pt-6 pb-24 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          {/* Greeting */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {new Date().getHours() < 18 ? (
                <SunIcon className="h-5 w-5 text-yellow-300" />
              ) : (
                <MoonIcon className="h-5 w-5 text-indigo-200" />
              )}
              <span className="text-indigo-200 text-sm">{greeting}</span>
            </div>
            <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <BellIcon className="h-5 w-5 text-white" />
            </button>
          </div>
          
          <h1 className="text-2xl font-bold text-white">
            {user?.name || 'User'} 👋
          </h1>
          <p className="text-indigo-200 text-sm mt-1">
            {t('dashboard.healthInsight')}
          </p>
        </div>
      </div>

      {/* Main Content - Overlapping cards */}
      <div className="px-4 -mt-16 relative z-20 space-y-4">
        
        {/* Health Score Card */}
        <div className="bg-white rounded-3xl shadow-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-500 text-sm">{t('dashboard.healthScore')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">{healthScore}</span>
                <span className="text-gray-400">/100</span>
              </div>
            </div>
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#E5E7EB" strokeWidth="10" fill="none" />
                <circle
                  cx="50" cy="50" r="40"
                  stroke="url(#gradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${healthScore * 2.51} 251`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
          </div>
          
          {/* Mini Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('dashboard.adherence'), value: `${adherenceRate}%`, trend: 'up', color: 'emerald' },
              { label: t('dashboard.reminders'), value: dashboardData?.upcomingReminders || 3, trend: 'neutral', color: 'blue' },
              { label: t('dashboard.reports'), value: dashboardData?.recentReports || 2, trend: 'up', color: 'purple' }
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-2xl p-3 text-center">
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className={`text-lg font-bold text-${stat.color}-600`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">{t('dashboard.quickActions')}</h2>
            <span className="text-xs text-gray-400">{t('common.info')}</span>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: CameraIcon, label: t('scanner.title'), path: '/scanner', color: 'from-blue-500 to-cyan-500' },
              { icon: ClockIcon, label: t('reminders.title'), path: '/reminders', color: 'from-orange-500 to-amber-500' },
              { icon: HeartIcon, label: t('profile.settings'), path: '/symptoms', color: 'from-pink-500 to-rose-500' },
              { icon: ExclamationTriangleIcon, label: t('nav.emergencySOS'), path: '/sos', color: 'from-red-500 to-red-600' }
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-600">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-3xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-indigo-500" />
              <h2 className="font-bold text-gray-900">{t('dashboard.todaySchedule')}</h2>
            </div>
            <button 
              onClick={() => navigate('/reminders')}
              className="text-indigo-600 text-sm font-medium flex items-center gap-1"
            >
              {t('dashboard.viewAll')} <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { time: '08:00 AM', medicine: 'Vitamin D3', status: 'taken', dose: '1 tablet' },
                { time: '02:00 PM', medicine: 'Omega-3', status: 'upcoming', dose: '2 capsules' },
                { time: '09:00 PM', medicine: 'Melatonin', status: 'upcoming', dose: '1 tablet' }
              ].map((item, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-4 p-3 rounded-2xl ${
                    item.status === 'taken' ? 'bg-emerald-50' : 'bg-gray-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.status === 'taken' 
                      ? 'bg-emerald-500' 
                      : 'bg-white border-2 border-gray-200'
                  }`}>
                    {item.status === 'taken' ? (
                      <CheckCircleSolid className="h-6 w-6 text-white" />
                    ) : (
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.medicine}</p>
                    <p className="text-xs text-gray-500">{item.dose}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      item.status === 'taken' ? 'text-emerald-600' : 'text-gray-600'
                    }`}>
                      {item.time}
                    </p>
                    <p className={`text-xs ${
                      item.status === 'taken' ? 'text-emerald-500' : 'text-gray-400'
                    }`}>
                      {item.status === 'taken' ? t('dashboard.completed') : t('dashboard.upcoming')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health Insights */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <SparklesIcon className="h-5 w-5" />
            <h2 className="font-bold">{t('dashboard.healthInsight')}</h2>
          </div>
          <p className="text-indigo-100 text-sm leading-relaxed">
            {t('dashboard.improvementInsight')}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-300">{t('dashboard.improvementStat')}</span>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/reports')}
            className="bg-white rounded-2xl shadow-lg p-4 text-left active:scale-98 transition-transform"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <DocumentTextIcon className="h-5 w-5 text-purple-600" />
            </div>
            <p className="font-semibold text-gray-900">{t('dashboard.reports')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('scanner.results')}</p>
          </button>

          <button
            onClick={() => navigate('/chat')}
            className="bg-white rounded-2xl shadow-lg p-4 text-left active:scale-98 transition-transform"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <SparklesIcon className="h-5 w-5 text-blue-600" />
            </div>
            <p className="font-semibold text-gray-900">{t('nav.aiAssistant')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('profile.help')}</p>
          </button>

          <button
            onClick={() => navigate('/price-lookup')}
            className="bg-white rounded-2xl shadow-lg p-4 text-left active:scale-98 transition-transform"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
              <ChartBarIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="font-semibold text-gray-900">{t('common.search')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('reminders.medicineName')}</p>
          </button>

          <button
            onClick={() => navigate('/news')}
            className="bg-white rounded-2xl shadow-lg p-4 text-left active:scale-98 transition-transform"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
              <DocumentTextIcon className="h-5 w-5 text-orange-600" />
            </div>
            <p className="font-semibold text-gray-900">{t('common.info')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('dashboard.healthInsight')}</p>
          </button>
        </div>

        {/* Tip Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">💡</span>
            </div>
            <div>
              <p className="font-semibold text-amber-900 text-sm">{t('dashboard.dailyTip')}</p>
              <p className="text-amber-700 text-xs mt-1">
                {t('reminders.markAsTaken')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
