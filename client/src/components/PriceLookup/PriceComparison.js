import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import PropTypes from 'prop-types';
import {
  MapPinIcon,
  StarIcon,
  PhoneIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
  TagIcon,
  ArrowTopRightOnSquareIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  BeakerIcon,
  InformationCircleIcon,
  TruckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const PriceComparison = ({ results, userLocation }) => {
  const { t } = useLanguage();
  const { medicine, priceComparisons, summary, relatedDrugs } = results;
  const [showDrugInfo, setShowDrugInfo] = useState(false);

  const formatPrice = (price) => `₹${price.toFixed(2)}`;

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

  return (
    <div className="space-y-6 mt-6">
      {/* ─── Medicine Info Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 rounded-[2.5rem] p-6 text-white relative overflow-hidden"
      >
        {/* Decorative */}
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <BeakerIcon className="w-32 h-32" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {medicine.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-500/20 text-primary-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-primary-500/20">
                    <ShieldCheckIcon className="w-3 h-3" />
                    {t('price.verified')}
                  </span>
                )}
                <span className="px-2.5 py-1 bg-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest rounded-lg">
                  {medicine.source}
                </span>
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-1">
                {medicine.genericName}
              </h3>
              {medicine.brandName && (
                <p className="text-white/50 text-sm font-bold">{medicine.brandName}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {medicine.dosageForm && (
              <span className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-black text-white/80">
                {medicine.dosageForm}
              </span>
            )}
            {medicine.strength && medicine.strength !== 'Standard' && (
              <span className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-black text-white/80">
                {medicine.strength}
              </span>
            )}
            {medicine.route && (
              <span className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-black text-white/80">
                {medicine.route}
              </span>
            )}
            {medicine.manufacturer && medicine.manufacturer !== 'Various' && medicine.manufacturer !== 'Unknown Manufacturer' && (
              <span className="px-3 py-1.5 bg-cyan-500/20 rounded-xl text-xs font-black text-cyan-300">
                {medicine.manufacturer}
              </span>
            )}
          </div>

          {/* Expandable Drug Info */}
          {(medicine.indications || medicine.warnings || medicine.activeIngredient) && (
            <div>
              <button
                onClick={() => setShowDrugInfo(!showDrugInfo)}
                className="flex items-center gap-2 text-xs font-black text-white/50 uppercase tracking-widest hover:text-white/80 transition-colors"
              >
                <InformationCircleIcon className="w-4 h-4" />
                <span>{t('price.drugDetails')}</span>
                {showDrugInfo ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
              </button>

              <AnimatePresence>
                {showDrugInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-3">
                      {medicine.activeIngredient && (
                        <div className="p-3 bg-white/5 rounded-2xl">
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t('price.activeIngredient')}</p>
                          <p className="text-sm text-white/80 font-medium">{medicine.activeIngredient}</p>
                        </div>
                      )}
                      {medicine.indications && (
                        <div className="p-3 bg-white/5 rounded-2xl">
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t('price.indications')}</p>
                          <p className="text-xs text-white/70 font-medium leading-relaxed">{medicine.indications}</p>
                        </div>
                      )}
                      {medicine.warnings && (
                        <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/10">
                          <p className="text-[10px] font-black text-red-400/80 uppercase tracking-widest mb-1">⚠ {t('price.warnings')}</p>
                          <p className="text-xs text-red-300/70 font-medium leading-relaxed">{medicine.warnings}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── Price Summary Stats ─── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: t('price.bestPrice'),
            value: formatPrice(summary.lowestPrice),
            gradient: 'from-primary-500 to-cyan-500',
            icon: TagIcon
          },
          {
            label: t('price.mrp'),
            value: formatPrice(summary.mrp || summary.highestPrice),
            gradient: 'from-slate-600 to-slate-700',
            icon: CurrencyRupeeIcon
          },
          {
            label: t('price.maxSavings'),
            value: formatPrice(summary.maxSavings),
            gradient: 'from-blue-500 to-indigo-500',
            icon: SparklesIcon
          },
          {
            label: t('price.bestDiscount'),
            value: `${summary.bestDiscountPercent || 0}%`,
            gradient: 'from-amber-500 to-orange-500',
            icon: TagIcon
          }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-800 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full -translate-y-4 translate-x-4`} />
            <div className="relative z-10">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Pharmacy Comparison List ─── */}
      <div>
        <div className="flex items-center justify-between px-1 mb-4">
          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BuildingStorefrontIcon className="h-4 w-4 text-primary-500 stroke-[2.5]" />
            {t('price.priceComparison')}
          </h4>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {t('price.inStockCount', { inStock: summary.pharmaciesInStock, total: summary.totalPharmacies })}
          </span>
        </div>

        <div className="space-y-3">
          {priceComparisons.map((comparison, index) => {
            const isBestPrice = index === 0;
            const savings = comparison.price.discount;

            return (
              <motion.div
                key={comparison.pharmacy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className={`
                  bg-white dark:bg-slate-900 rounded-[2rem] border-2 transition-all overflow-hidden
                  ${isBestPrice
                    ? 'border-primary-200 dark:border-primary-900/50 ring-4 ring-primary-500/10'
                    : 'border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900/30'
                  }
                `}
              >
                {/* Best Price Banner */}
                {isBestPrice && (
                  <div className="bg-gradient-to-r from-primary-500 to-cyan-500 px-5 py-2 flex items-center gap-2">
                    <SparklesIcon className="w-3.5 h-3.5 text-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('price.bestPrice')}</span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Pharmacy Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-base font-black text-slate-900 dark:text-white truncate">
                          {comparison.pharmacy.name}
                        </h5>
                        {comparison.pharmacy.type === 'online' && (
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-md border border-blue-100 dark:border-blue-900/30">
                            {t('price.online')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">
                        <div className="flex items-center gap-1">
                          <div className="flex">{getRatingStars(comparison.pharmacy.rating)}</div>
                          <span className="text-[10px] text-slate-400">({comparison.pharmacy.reviewCount})</span>
                        </div>
                        {comparison.distance && (
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="h-3 w-3" />
                            <span>{comparison.distance} km</span>
                          </div>
                        )}
                      </div>

                      {/* Stock + Delivery badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className={`
                          inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest
                          ${comparison.price.inStock
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                            : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30'
                          }
                        `}>
                          {comparison.price.inStock ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                          {comparison.price.inStock ? t('price.inStock') : t('price.outOfStock')}
                        </span>
                        {comparison.pharmacy.deliveryAvailable && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            <TruckIcon className="w-3 h-3" />
                            {t('price.delivery')}
                          </span>
                        )}
                      </div>

                      {comparison.pharmacy.cashback && (
                        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-2">
                          ✨ {comparison.pharmacy.cashback}
                        </p>
                      )}
                    </div>

                    {/* Price Column */}
                    <div className="text-right flex-shrink-0">
                      {comparison.price.discount > 0 && (
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <span className="text-xs text-slate-400 line-through font-bold">
                            ₹{comparison.price.mrp?.toFixed(2) || comparison.price.price.toFixed(2)}
                          </span>
                          <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-md">
                            -{comparison.price.discountPercent}%
                          </span>
                        </div>
                      )}
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        ₹{comparison.price.finalPrice.toFixed(2)}
                      </div>
                      {comparison.price.pricePerUnit && (
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                          ₹{comparison.price.pricePerUnit}/unit
                        </p>
                      )}
                      {savings > 0 && (
                        <p className="text-[10px] font-black text-emerald-500 mt-1">
                          {t('common.save')} ₹{savings.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {comparison.pharmacy.hasOnlineOrdering && comparison.pharmacy.website && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                      <a
                        href={comparison.pharmacy.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-[0.98]"
                      >
                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        <span>{t('price.visitStore')}</span>
                      </a>
                      {comparison.pharmacy.phone && (
                        <a
                          href={`tel:${comparison.pharmacy.phone}`}
                          className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
                        >
                          <PhoneIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── Related Drugs ─── */}
      {relatedDrugs && relatedDrugs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
            {t('price.relatedFormulations')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {relatedDrugs.map((drug, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-100 dark:border-slate-700 capitalize"
              >
                {drug.name || drug}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

PriceComparison.propTypes = {
  results: PropTypes.object.isRequired,
  userLocation: PropTypes.object
};

export default PriceComparison;