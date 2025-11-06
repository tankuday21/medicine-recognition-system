import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  CameraIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  HeartIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  NewspaperIcon,
  UserCircleIcon,
  HandRaisedIcon,
  BoltIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      title: t('scanner.title'),
      description: t('scanner.description'),
      icon: CameraIcon,
      path: '/scanner',
      color: 'bg-blue-500'
    },
    {
      title: t('chat.title'),
      description: t('chat.description'),
      icon: ChatBubbleLeftRightIcon,
      path: '/chat',
      color: 'bg-green-500'
    },
    {
      title: t('reminders.title'),
      description: t('reminders.description'),
      icon: ClockIcon,
      path: '/reminders',
      color: 'bg-purple-500'
    },
    {
      title: t('symptoms.title'),
      description: t('symptoms.description'),
      icon: HeartIcon,
      path: '/symptoms',
      color: 'bg-red-500'
    },
    {
      title: t('reports.title'),
      description: t('reports.description'),
      icon: DocumentTextIcon,
      path: '/reports',
      color: 'bg-indigo-500'
    },
    {
      title: t('sos.title'),
      description: t('sos.description'),
      icon: ExclamationTriangleIcon,
      path: '/sos',
      color: 'bg-red-600'
    },
    {
      title: t('priceLookup.title'),
      description: t('priceLookup.description'),
      icon: CurrencyDollarIcon,
      path: '/price-lookup',
      color: 'bg-yellow-500'
    },
    {
      title: t('news.title'),
      description: t('news.description'),
      icon: NewspaperIcon,
      path: '/news',
      color: 'bg-gray-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 max-w-7xl">
          <div className="text-center">
            {isAuthenticated && user?.name ? (
              <>
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <HandRaisedIcon className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-yellow-300 animate-bounce" />
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white">
                    Welcome back, {user.name}!
                  </h1>
                </div>
                <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
                  Your health journey continues here
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-4 sm:mb-6 px-4">
                  Your Digital Health
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                    Companion
                  </span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
                  AI-powered medicine identification, health tracking, and personalized care - all in one place
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-xl"
                  >
                    Get Started Free
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/scanner')}
                    className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                  >
                    Try Scanner Now
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-12 md:h-16 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Quick Actions */}
        {isAuthenticated && (
          <div className="py-6 sm:py-8 md:py-12 -mt-4 sm:-mt-6 md:-mt-8">
            <div className="flex items-center mb-4 sm:mb-6 md:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg">
                  <BoltIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-600" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  Quick Actions
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <Card
                variant="medical"
                hoverable
                pressable
                onClick={() => navigate('/scanner')}
                className="cursor-pointer transform transition-all duration-300 md:hover:scale-105 hover:shadow-xl"
              >
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-5">
                    <div className="flex-shrink-0 p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg">
                      <CameraIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-9 md:w-9 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1 md:mb-2">
                        {t('scanner.title')}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 line-clamp-2">
                        Scan and identify medications instantly with AI
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card
                variant="medical"
                hoverable
                pressable
                borderAccent="danger"
                onClick={() => navigate('/sos')}
                className="cursor-pointer bg-gradient-to-br from-red-50 to-pink-50 transform transition-all duration-300 md:hover:scale-105 hover:shadow-xl"
              >
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-5">
                    <div className="flex-shrink-0 p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg">
                      <ExclamationTriangleIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-9 md:w-9 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-red-900 mb-0.5 sm:mb-1 md:mb-2">
                        {t('sos.title')}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-red-700 line-clamp-2">
                        {t('sos.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="py-8 sm:py-12 md:py-16">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <BuildingOffice2Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                All Features
              </h2>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Comprehensive healthcare tools designed to keep you healthy and informed
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {features.map((feature) => (
              <Card
                key={feature.path}
                variant="elevated"
                hoverable
                pressable
                onClick={() => navigate(feature.path)}
                className="cursor-pointer group transform transition-all duration-300 md:hover:scale-105 hover:shadow-lg"
              >
                <div className="p-3 sm:p-4 md:p-6 flex flex-col h-full">
                  <div className={`${feature.color} p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-lg sm:rounded-xl md:rounded-2xl w-fit mb-2 sm:mb-3 md:mb-4 lg:mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md sm:shadow-lg`}>
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 md:mb-3 line-clamp-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-sm text-gray-600 leading-relaxed flex-grow line-clamp-2 sm:line-clamp-3">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Authentication Prompt */}
        {!isAuthenticated && (
          <div className="py-8 sm:py-12 md:py-16">
            <Card className="border border-blue-200 sm:border-2 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg sm:shadow-xl">
              <div className="p-4 sm:p-6 md:p-8 lg:p-12">
                <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8">
                  <div className="flex-shrink-0">
                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl">
                      <UserCircleIcon className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
                      Get the Most Out of Mediot
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-4 sm:mb-5 md:mb-6 leading-relaxed">
                      Create an account to save your data, set medication reminders, track your health journey, and access personalized AI-powered features.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => navigate('/register')}
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform md:hover:scale-105 transition-all"
                      >
                        {t('auth.signUp')}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate('/login')}
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold border-2 hover:bg-gray-50"
                      >
                        {t('auth.signIn')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {/* Footer Spacing */}
        <div className="pb-6 sm:pb-8 md:pb-12"></div>
      </div>
    </div>
  );
};

export default Home;