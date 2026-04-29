import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  PlusIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const BodyPartSelector = ({ onSymptomSelect }) => {
  const [bodyParts, setBodyParts] = useState([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBodyParts();
  }, []);

  const loadBodyParts = async () => {
    try {
      const response = await fetch('/api/symptoms/body-parts');
      const data = await response.json();

      if (data.success) {
        setBodyParts(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Failed to load body parts:', error);
      setError('Failed to load body parts');
    }
  };

  const handleBodyPartSelect = async (bodyPart) => {
    setSelectedBodyPart(bodyPart);
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/symptoms/body-parts/${bodyPart.id}`);
      const data = await response.json();

      if (data.success) {
        setSymptoms(data.data);
      } else {
        setError(data.message);
        setSymptoms([]);
      }
    } catch (error) {
      console.error('Failed to load symptoms:', error);
      setError('Failed to load symptoms');
      setSymptoms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSymptomSelect = (symptom) => {
    onSymptomSelect(symptom);
  };

  const getBodyPartIcon = (bodyPartId) => {
    const icons = {
      head: '🧠',
      face: '😊',
      throat: '🗣️',
      chest: '🫁',
      abdomen: '🤰',
      back: '🦴',
      arms: '💪',
      legs: '🦵',
      general: '🏃'
    };
    return icons[bodyPartId] || '📍';
  };

  const getCategoryStyles = (category) => {
    const styles = {
      general: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      neurological: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      respiratory: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      cardiovascular: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
      gastrointestinal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      musculoskeletal: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      dermatological: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      ent: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      ophthalmological: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
    };
    return styles[category] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  };

  return (
    <div className="space-y-8">
      {/* Body Parts Grid */}
      <div className="grid grid-cols-3 gap-3">
        {bodyParts.map((bodyPart) => (
          <motion.button
            key={bodyPart.id}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleBodyPartSelect(bodyPart)}
            className={`
              p-4 rounded-2xl text-center transition-all relative overflow-hidden group border-2
              ${selectedBodyPart?.id === bodyPart.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-300 shadow-lg shadow-primary-500/10'
                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 hover:border-slate-200'
              }
            `}
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
              {getBodyPartIcon(bodyPart.id)}
            </div>
            <div className="font-black text-[10px] uppercase tracking-widest truncate">
              {bodyPart.name}
            </div>
            <div className="text-[8px] font-bold text-slate-400 mt-1 uppercase">
              {bodyPart.symptoms.length} items
            </div>
            
            {selectedBodyPart?.id === bodyPart.id && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute top-1.5 right-1.5"
              >
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Selected Body Part Symptoms */}
      <AnimatePresence mode="wait">
        {selectedBodyPart ? (
          <motion.div 
            key="symptoms-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="pt-4 border-t border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-5 px-1">
              <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">
                {selectedBodyPart.name} Symptoms
              </h3>
              <span className="text-[10px] font-bold text-slate-400">{symptoms.length} found</span>
            </div>

            {isLoading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-3 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Consulting Database...</p>
              </div>
            ) : symptoms.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {symptoms.map((symptom, idx) => (
                  <motion.button
                    key={symptom.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleSymptomSelect(symptom)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-left hover:border-primary-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group flex items-center justify-between shadow-sm"
                  >
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-primary-600 transition-colors">{symptom.name}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md ${getCategoryStyles(symptom.category)}`}>
                          {symptom.category}
                        </span>
                        {symptom.criticalThreshold && (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md bg-rose-50 text-rose-600 border border-rose-100">
                            Priority
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all">
                      <PlusIcon className="h-4 w-4 stroke-[3]" />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase">No items listed</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center"
          >
            <InformationCircleIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select a body area above to begin</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3">
          <ShieldCheckIcon className="w-5 h-5" />
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}
    </div>
  );
};

BodyPartSelector.propTypes = {
  onSymptomSelect: PropTypes.func.isRequired
};

export default BodyPartSelector;