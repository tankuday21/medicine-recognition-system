import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import PropTypes from 'prop-types';
import { MagnifyingGlassIcon, MapPinIcon, BuildingStorefrontIcon, PhoneIcon, ClockIcon, StarIcon, GlobeAltIcon, CheckCircleIcon, XCircleIcon, AdjustmentsHorizontalIcon, ArrowTopRightOnSquareIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const PharmacyFinder = ({ onSearch, results, userLocation, hasLocation, onLocationRefresh }) => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useState({
    query: '',
    radius: 10
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showRadiusDropdown, setShowRadiusDropdown] = useState(false);

  const handleSearch = async () => {
    if (!hasLocation) return;

    setIsSearching(true);
    try {
      await onSearch(searchParams);
    } finally {
      setIsSearching(false);
    }
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars || (i === fullStars && hasHalfStar)) {
        stars.push(<StarIconSolid key={i} className="h-3.5 w-3.5 text-amber-400" />);
      } else {
        stars.push(<StarIcon key={i} className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />);
      }
    }
    return stars;
  };

  const getDirectionsUrl = (pharmacy) => {
    const address = encodeURIComponent(pharmacy.address);
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
  };

  const formatDistance = (distance) => {
    if (!distance) return t('price.online');
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance}km`;
  };

  return (
    <>
      {/* Search Bar Overlay Background */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[55]"
            onClick={() => setIsFocused(false)}
          />
        )}
      </AnimatePresence>

      <div className={`relative transition-all duration-500 ease-out z-[60] mb-10 ${isFocused ? '-translate-y-2' : ''}`}>
        {/* Search Controls Card - Entire card remains sharp and elevated on focus */}
        <div className={`
          bg-white dark:bg-slate-900 rounded-[2rem] border transition-all duration-300
          ${isFocused 
            ? 'shadow-2xl shadow-primary-500/20 scale-[1.02] border-transparent' 
            : 'border-slate-100 dark:border-slate-800 shadow-lg shadow-black/5'
          }
        `}>
          <div className="p-5 space-y-5">
            {/* Pharmacy Name Search Bar */}
            <div className={`
              relative flex items-center rounded-2xl transition-all duration-300
              ${isFocused ? 'bg-slate-50 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}
            `}>
              <input
                type="text"
                value={searchParams.query}
                onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                onFocus={() => setIsFocused(true)}
                className="flex-1 py-3.5 pl-5 pr-2 bg-transparent text-slate-900 dark:text-white font-bold placeholder-slate-400 text-sm"
                style={{ 
                  outline: 'none', 
                  border: 'none', 
                  boxShadow: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none'
                }}
                placeholder={t('price.searchPharmacyPlaceholder')}
              />
              <button
                onClick={() => {
                  handleSearch();
                  setIsFocused(false);
                }}
                disabled={!hasLocation || isSearching}
                className="mr-1 w-10 h-10 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-90 flex-shrink-0"
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <MagnifyingGlassIcon className="w-5 h-5 stroke-[2.5]" />
                )}
              </button>
            </div>

            {/* Custom Radius Dropdown */}
            <div className="px-1 relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                {t('price.searchRadius')}
              </label>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRadiusDropdown(!showRadiusDropdown)}
                  className={`
                    w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-bold text-sm flex items-center justify-between transition-all
                    ${showRadiusDropdown 
                      ? 'border-primary-500 bg-white dark:bg-slate-900 shadow-lg shadow-primary-500/10' 
                      : 'border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                    }
                  `}
                >
                  <span>{searchParams.radius} km</span>
                  <motion.div
                    animate={{ rotate: showRadiusDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showRadiusDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-[80] overflow-hidden"
                    >
                      {[5, 10, 15, 25, 50].map((radius) => (
                        <button
                          key={radius}
                          type="button"
                          onClick={() => {
                            setSearchParams(prev => ({ ...prev, radius }));
                            setShowRadiusDropdown(false);
                          }}
                          className={`
                            w-full px-4 py-3 text-left text-sm font-bold transition-colors
                            ${searchParams.radius === radius
                              ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }
                          `}
                        >
                          {radius} km
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={`mt-10 relative z-[10] transition-all duration-300 ${isFocused ? 'blur-[4px] opacity-40' : 'blur-0 opacity-100'}`}>
        {results ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {t('price.foundPharmacies', { count: results.totalFound })}
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t('price.withinRadius', { radius: results.searchRadius })}
            </span>
          </div>

          {results.pharmacies.length > 0 ? (
            <div className="space-y-3">
              {results.pharmacies.map((pharmacy, index) => (
                <motion.div
                  key={pharmacy.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900/30 transition-all overflow-hidden"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-2.5 rounded-xl ${pharmacy.type === 'online' ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-primary-50 dark:bg-primary-950/20'}`}>
                        <BuildingStorefrontIcon className={`w-5 h-5 ${pharmacy.type === 'online' ? 'text-blue-500' : 'text-primary-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-slate-900 dark:text-white truncate">
                            {pharmacy.name}
                          </h4>
                          {pharmacy.type === 'online' && (
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-md border border-blue-100 dark:border-blue-900/30 flex-shrink-0">
                              {t('price.online')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{pharmacy.chain}</p>
                      </div>
                      {pharmacy.isOpen && (
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex-shrink-0">
                          {t('price.open')}
                        </span>
                      )}
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <MapPinIcon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium">{pharmacy.address}</p>
                          {pharmacy.distance && (
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                              {formatDistance(pharmacy.distance)} {t('price.away')}
                              {pharmacy.estimatedTravelTime && ` • ${pharmacy.estimatedTravelTime.formatted}`}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <div className="flex">{getRatingStars(pharmacy.rating)}</div>
                          <span className="text-[10px] text-slate-400 font-bold">({pharmacy.reviewCount})</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {pharmacy.hours?.is24x7 && (
                          <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-purple-100 dark:border-purple-900/30">
                            24×7
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      {pharmacy.type !== 'online' && (
                        <a
                          href={getDirectionsUrl(pharmacy)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-[0.98]"
                        >
                          <MapPinIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{t('price.directions')}</span>
                        </a>
                      )}

                      {pharmacy.website && (
                        <a
                          href={pharmacy.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${pharmacy.type === 'online' ? 'flex-1' : ''} flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]`}
                        >
                          <GlobeAltIcon className="w-3.5 h-3.5" />
                          <span>{t('price.visit')}</span>
                        </a>
                      )}

                      {pharmacy.phone && (
                        <a
                          href={`tel:${pharmacy.phone}`}
                          className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
                        >
                          <PhoneIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-[1.25rem] flex items-center justify-center mx-auto mb-4">
                <BuildingStorefrontIcon className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">{t('price.noPharmaciesFound')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('price.increaseRadius')}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-cyan-50 dark:from-primary-950/30 dark:to-cyan-950/30 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 -rotate-6">
            <BuildingStorefrontIcon className="h-10 w-10 text-primary-500 rotate-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{t('price.findNearbyTitle')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
            {t('price.findNearbySubtitle')}
          </p>
        </div>
      )}
      </div>
    </>
  );
};

PharmacyFinder.propTypes = {
  onSearch: PropTypes.func.isRequired,
  results: PropTypes.object,
  userLocation: PropTypes.object,
  hasLocation: PropTypes.bool.isRequired,
  onLocationRefresh: PropTypes.func.isRequired
};

export default PharmacyFinder;