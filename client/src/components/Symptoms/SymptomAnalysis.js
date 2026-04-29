import React from 'react';
import PropTypes from 'prop-types';
import {
  BoltIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  HeartIcon,
  PhoneIcon,
  LightBulbIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const SymptomAnalysis = ({ result, symptoms, onRestart }) => {
  const { conditions, hasEmergencySymptoms, criticalSymptoms, recommendSeekCare } = result;

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-100 ring-red-500/20';
      case 'moderate':
        return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20';
      case 'mild':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100 ring-slate-500/20';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'moderate':
        return 'bg-amber-500 text-white';
      case 'mild':
        return 'bg-emerald-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-100 rounded-xl">
            <DocumentTextIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Medical Analysis</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">AI-Generated Report</p>
          </div>
        </div>
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <ArrowPathIcon className="h-4 w-4 stroke-[3]" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* Emergency Alert - High Priority */}
      {hasEmergencySymptoms && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 bg-red-600 rounded-[2.5rem] text-white shadow-2xl shadow-red-500/40 relative overflow-hidden group"
        >
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-3xl">
              <ExclamationTriangleIcon className="h-10 w-10 text-white animate-pulse" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black tracking-tight mb-2 uppercase italic">Immediate Emergency</h3>
              <p className="text-red-50 font-bold leading-relaxed mb-6">
                Your reported symptoms indicate a serious medical situation. 
                Please do not wait—contact emergency services or go to the nearest ER right away.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <a
                  href="tel:911"
                  className="flex items-center gap-3 px-8 py-4 bg-white text-red-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-xl transition-all active:scale-95"
                >
                  <PhoneIcon className="h-5 w-5 stroke-[3]" />
                  Call 911 Now
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Critical Symptoms Alert */}
      {criticalSymptoms.length > 0 && !hasEmergencySymptoms && (
        <div className="p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-[2.5rem] flex items-start gap-5">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-2xl">
            <BoltIcon className="h-7 w-7 text-amber-600" />
          </div>
          <div>
            <h3 className="font-black text-amber-900 dark:text-amber-200 text-lg">Priority Attention Needed</h3>
            <p className="text-amber-800 dark:text-amber-300 text-sm mt-1 font-medium leading-relaxed">
              We detected symptoms that require medical evaluation soon. Please reach out to your doctor or visit an urgent care center today.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {criticalSymptoms.map((symptom, index) => (
                <span key={index} className="px-3 py-1 bg-amber-200/50 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-300/30">
                  {symptom.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Seek Care Recommendation */}
      {recommendSeekCare && !hasEmergencySymptoms && (
        <div className="p-6 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-[2.5rem] flex items-start gap-5">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl">
            <HeartIcon className="h-7 w-7 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-black text-indigo-900 dark:text-indigo-200 text-lg">Consultation Recommended</h3>
            <p className="text-indigo-800 dark:text-indigo-300 text-sm mt-1 font-medium leading-relaxed">
              Based on the patterns observed, a professional medical opinion is advised to rule out underlying issues.
            </p>
          </div>
        </div>
      )}

      {/* Possible Conditions Grid */}
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 px-2">Possible Conditions</h3>
        
        {conditions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {conditions.map((condition, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-[2.5rem] border-2 ring-4 ring-transparent transition-all hover:ring-primary-500/10 ${getSeverityStyles(condition.severity)}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${getSeverityBadge(condition.severity)}`}>
                      <ShieldCheckIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-xl text-slate-900 dark:text-white">{condition.condition}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm font-black text-primary-600">{condition.probability}% Match Rate</span>
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{condition.matchingSymptoms}/{condition.totalSymptoms} Symptoms</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getSeverityBadge(condition.severity)}`}>
                    {condition.severity} Risk
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Self-Care */}
                  {condition.selfCare && condition.selfCare.length > 0 && (
                    <div className="p-5 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-white/20">
                      <h5 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <LightBulbIcon className="w-4 h-4 text-amber-500 stroke-[2.5]" />
                        Self-Care Guide
                      </h5>
                      <ul className="space-y-3">
                        {condition.selfCare.map((care, careIndex) => (
                          <li key={careIndex} className="flex items-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                            <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            {care}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pro Advice */}
                  {condition.seeDoctor && (
                    <div className="p-5 bg-primary-600 rounded-3xl text-white shadow-xl shadow-primary-500/20">
                      <h5 className="font-black text-white text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <HeartIcon className="w-4 h-4 stroke-[2.5]" />
                        Professional Advice
                      </h5>
                      <p className="text-sm font-bold leading-relaxed">
                        {condition.seeDoctor}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
            <InformationCircleIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-black text-slate-400">No Match Found</p>
            <p className="text-sm font-medium text-slate-500 mt-1 max-w-xs mx-auto">
              We couldn't identify a specific condition. Please consult a professional for an accurate diagnosis.
            </p>
          </div>
        )}
      </div>

      {/* Summary Table */}
      <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <DocumentTextIcon className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-6">Reported Symptoms Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {symptoms.map((symptom, index) => (
              <div key={index} className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-black text-sm">{symptom.name}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {symptom.duration} • {symptom.severity}
                  </p>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-primary-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-4">
          <InformationCircleIcon className="h-6 w-6 text-slate-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Medical Information Only</p>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
              This AI-powered analysis is for educational purposes only. It is not a clinical diagnosis or medical advice. Always consult with a licensed healthcare provider before making medical decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

SymptomAnalysis.propTypes = {
  result: PropTypes.object.isRequired,
  symptoms: PropTypes.array.isRequired,
  onRestart: PropTypes.func.isRequired
};

export default SymptomAnalysis;