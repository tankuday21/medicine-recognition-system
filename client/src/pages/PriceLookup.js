import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import MedicineSearch from '../components/PriceLookup/MedicineSearch';
import PriceComparison from '../components/PriceLookup/PriceComparison';
import PharmacyFinder from '../components/PriceLookup/PharmacyFinder';
import LocationService from '../services/locationService';
import {
  CurrencyRupeeIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  TagIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PriceLookup = () => {
  const [showLocationInfo, setShowLocationInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [searchResults, setSearchResults] = useState(null);
  const [nearbyPharmacies, setNearbyPharmacies] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();
  const navigate = useNavigate();
  // Lock scroll when modal is open
  useEffect(() => {
    if (showLocationInfo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showLocationInfo]);

  const tabs = [
    { id: 'search', name: t('price.priceSearch'), icon: MagnifyingGlassIcon, desc: t('price.comparePrices') },
    { id: 'pharmacies', name: t('price.nearby'), icon: BuildingStorefrontIcon, desc: t('price.findPharmacies') }
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const locationResult = await LocationService.getCurrentLocation();
      if (locationResult.success) {
        setUserLocation(locationResult.data);
      }
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMedicineSearch = async (medicineName) => {
    try {
      setError('');
      setIsSearching(true);

      const params = new URLSearchParams({ medicine: medicineName });

      if (userLocation) {
        params.append('lat', userLocation.latitude);
        params.append('lng', userLocation.longitude);
      }

      const response = await fetch(`/api/pharmacy/prices/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
      } else {
        setError(data.message || t('common.noResults'));
        setSearchResults(null);
      }
    } catch (error) {
      console.error('Medicine search error:', error);
      setError(t('price.searchFailed'));
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePharmacySearch = async (searchParams) => {
    try {
      setError('');

      if (!userLocation) {
        setError(t('price.locationRequired'));
        return;
      }

      const params = new URLSearchParams({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        radius: searchParams.radius || 10
      });

      if (searchParams.services && searchParams.services.length > 0) {
        params.append('services', searchParams.services.join(','));
      }

      const response = await fetch(`/api/pharmacy/nearby?${params}`);
      const data = await response.json();

      if (data.success) {
        setNearbyPharmacies(data.data);
      } else {
        setError(data.message);
        setNearbyPharmacies(null);
      }
    } catch (error) {
      console.error('Pharmacy search error:', error);
      setError(t('price.nearbyFailed'));
      setNearbyPharmacies(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Location Modal (Outside header to avoid z-index/stacking context issues) */}
      <AnimatePresence>
        {showLocationInfo && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center px-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLocationInfo(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              {/* Modal Header Gradient */}
              <div className="h-24 bg-gradient-to-br from-primary-600 to-primary-400 relative overflow-hidden flex items-center px-6">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <MapPinIcon className="w-20 h-20" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-white">{t('price.myLocation')}</h3>
                  <p className="text-primary-100 text-[10px] font-bold uppercase tracking-widest">{t('price.realTimeGps')}</p>
                </div>
              </div>

              <div className="p-6">
                {userLocation ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('price.address')}</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed line-clamp-2">
                        {userLocation.address || t('price.addressDetected')}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('common.latitude')}</p>
                        <p className="text-sm font-black text-primary-500 tabular-nums">{userLocation.latitude.toFixed(4)}</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('common.longitude')}</p>
                        <p className="text-sm font-black text-primary-500 tabular-nums">{userLocation.longitude.toFixed(4)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{t('price.signalOk')}</span>
                      </div>
                      <button
                        onClick={getCurrentLocation}
                        className="p-2 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-100 transition-all"
                      >
                        <SparklesIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-500">{t('common.detectingLocation')}</p>
                  </div>
                )}

                <button
                  onClick={() => setShowLocationInfo(false)}
                  className="w-full mt-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-[0.98]"
                >
                  {t('common.dismiss')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Premium Header ─── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-cyan-600" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-30%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-60 h-60 bg-primary-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-4 pt-4 pb-8">
          {/* Top Bar */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white/15 backdrop-blur-md rounded-2xl text-white hover:bg-white/25 transition-all active:scale-95"
            >
              <ArrowLeftIcon className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-black text-white tracking-tight">{t('price.medicinePrices')}</h1>
              <p className="text-primary-100 text-xs font-bold uppercase tracking-widest mt-0.5">
                {t('price.realTimeComparison')}
              </p>
            </div>
            
            {/* Location Button in Top Right */}
            <button
              onClick={() => setShowLocationInfo(true)}
              className={`
                p-2.5 rounded-2xl backdrop-blur-md transition-all active:scale-95 relative z-30
                ${showLocationInfo 
                  ? 'bg-white text-primary-600 shadow-xl shadow-black/10' 
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/10'
                }
              `}
            >
              {isLoadingLocation ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MapPinIcon className="w-5 h-5 stroke-[2.5]" />
              )}
              {userLocation && !showLocationInfo && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-primary-600 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Tab Switcher ─── */}
      <div className="px-4 -mt-4 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-1.5 shadow-xl shadow-black/5 border border-slate-100 dark:border-slate-800 flex gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-[1.5rem] text-sm font-black
                transition-all duration-300 active:scale-[0.98]
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }
              `}
            >
              <tab.icon className="w-4 h-4 stroke-[2.5]" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Error Display ─── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="px-4 mt-4"
          >
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl flex items-start gap-3">
              <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black text-red-800 dark:text-red-300">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="text-xs font-bold text-red-500 mt-1 hover:underline"
                >
                  {t('common.dismiss')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Content Area ─── */}
      <div className="px-4 mt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'search' ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Search Component */}
              <MedicineSearch onSearch={handleMedicineSearch} isSearching={isSearching} />

              {/* Results */}
              {isSearching ? (
                <div className="mt-8 text-center py-16">
                  <div className="relative inline-flex">
                    <div className="w-14 h-14 border-4 border-primary-200 dark:border-primary-900 rounded-full" />
                    <div className="absolute inset-0 w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-6">{t('price.searchingPrices')}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {t('price.queryingDatabases')}
                  </p>
                </div>
              ) : searchResults ? (
                <PriceComparison results={searchResults} userLocation={userLocation} />
              ) : (
                <div className="mt-8">
                  {/* Empty State */}
                  <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-950/30 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 rotate-6">
                      <MagnifyingGlassIcon className="h-10 w-10 text-primary-500 -rotate-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{t('price.searchTitle')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                      {t('price.searchSubtitle')}
                    </p>
                  </div>

                  {/* Feature Cards */}
                  <div className="grid grid-cols-1 gap-3 mt-6">
                    {[
                      {
                        icon: ShieldCheckIcon,
                        gradient: 'from-primary-500 to-primary-600',
                        title: t('price.feature1Title'),
                        desc: t('price.feature1Desc')
                      },
                      {
                        icon: TagIcon,
                        gradient: 'from-blue-500 to-indigo-500',
                        title: t('price.feature2Title'),
                        desc: t('price.feature2Desc')
                      },
                      {
                        icon: BoltIcon,
                        gradient: 'from-amber-500 to-orange-500',
                        title: t('price.feature3Title'),
                        desc: t('price.feature3Desc')
                      }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800"
                      >
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">{item.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="pharmacies"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PharmacyFinder
                onSearch={handlePharmacySearch}
                results={nearbyPharmacies}
                userLocation={userLocation}
                hasLocation={!!userLocation}
                onLocationRefresh={getCurrentLocation}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Disclaimer ─── */}
      <div className="px-4 mt-8">
        <div className="p-5 bg-slate-100 dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {t('price.disclaimerTitle')}
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('price.disclaimerText')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceLookup;