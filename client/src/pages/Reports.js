import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ReportUpload from '../components/Reports/ReportUpload';
import ReportList from '../components/Reports/ReportList';
import ReportAnalysis from '../components/Reports/ReportAnalysis';
import {
  DocumentTextIcon,
  PlusIcon,
  CameraIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  BackButton,
  PageTransition,
  GlassCard,
  StatCard,
  SectionHeader,
  LoadingSkeleton
} from '../components/ui/PremiumComponents';
import { motion, AnimatePresence } from 'framer-motion';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (showUploadModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showUploadModal]);

  useEffect(() => {
    if (isAuthenticated) {
      loadReports();
    }
  }, [isAuthenticated]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reports', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setReports(data.data.reports);
    } catch (error) { console.error('Failed to load reports:', error); }
    finally { setIsLoading(false); }
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    loadReports();
  };

  const handleReportSelect = (report) => {
    navigate(`/reports/${report._id}`);
  };

  const filteredReports = reports.filter(r =>
    r.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.healthMetrics?.providerInfo?.labName && r.healthMetrics.providerInfo.labName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: reports.length,
    processed: reports.filter(r => r.processingStatus === 'processed').length,
    pending: reports.filter(r => r.processingStatus === 'processing').length,
    critical: reports.filter(r => r.healthMetrics?.summary?.overallStatus === 'critical').length
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-safe flex items-center justify-center p-4">
        <GlassCard className="text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('reports.signInRequired')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('reports.signInToUpload')}</p>
          <button onClick={() => navigate('/login')} className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg">{t('reports.signIn')}</button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-safe font-sans pb-20">
      {/* Dynamic Command Center Hero */}
      <section className="relative overflow-hidden pt-6 sm:pt-10 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[80px] sm:blur-[120px] -mr-24 sm:-mr-48 -mt-24 sm:-mt-48" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em]">
                <SparklesIcon className="w-3.5 h-3.5 sm:w-4 h-4" />
                {t('reports.medicalCommandCenter')}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                {t('reports.hello')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">{user?.name?.split(' ')[0] || 'User'}</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium max-w-md leading-relaxed">
                {t('reports.reportsVault', { count: stats.total })}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-3">
              <button
                onClick={() => navigate('/scanner')}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <CameraIcon className="w-4 h-4 sm:w-5 h-5 text-blue-500" />
                {t('reports.scan')}
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xl shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95"
              >
                <PlusIcon className="w-4 h-4 sm:w-5 h-5" />
                {t('reports.addReport')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Toolbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 sticky top-0 z-30 mb-4 -mt-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-100 dark:border-slate-800 p-1.5 sm:p-2 rounded-2xl sm:rounded-[2rem] shadow-xl">
          <div className="relative w-full">
            <div
              className="absolute inset-y-0 left-0 flex items-center pointer-events-none"
              style={{ paddingLeft: '14px' }}
            >
              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('reports.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-4 py-3 bg-gray-100/50 dark:bg-slate-800/50 border-none rounded-xl sm:rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-gray-400"
              style={{ paddingLeft: '48px' }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 min-h-[400px]">
        <AnimatePresence mode="wait">
          <PageTransition key="reports" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4">
                <LoadingSkeleton className="h-32 rounded-3xl w-full" />
                <LoadingSkeleton className="h-32 rounded-3xl w-full" />
              </div>
            ) : reports.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">{t('reports.emptyArchiveTitle')}</h3>
                <p className="text-sm sm:text-base text-gray-500 max-w-xs mb-8 font-medium leading-relaxed">{t('reports.emptyArchiveDesc')}</p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button onClick={() => setShowUploadModal(true)} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">{t('reports.uploadNow')}</button>
                  <button onClick={() => navigate('/scanner')} className="px-8 py-4 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold active:scale-95 transition-transform">{t('reports.openScanner')}</button>
                </div>
              </div>
            ) : (
              <ReportList
                reports={filteredReports}
                onReportSelect={handleReportSelect}
                onReportsChange={loadReports}
              />
            )}
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 sm:p-10">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('reports.uploadReportTitle')}</h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">{t('reports.uploadReportDesc')}</p>
                  </div>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-400 active:scale-90"
                  >
                    <XCircleIcon className="w-8 h-8 sm:w-9 sm:h-9" />
                  </button>
                </div>

                <ReportUpload onUploadSuccess={handleUploadSuccess} />

                <button
                  onClick={() => setShowUploadModal(false)}
                  className="mt-10 w-full py-4 text-gray-400 hover:text-gray-600 font-bold text-xs sm:text-sm tracking-widest uppercase transition-colors border-t border-gray-50 dark:border-slate-800"
                >
                  {t('reports.cancelAndReturn')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;