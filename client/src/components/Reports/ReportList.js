import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  DocumentTextIcon,
  PhotoIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  EyeIcon,
  TrashIcon,
  ChevronRightIcon,
  SparklesIcon,
  EllipsisVerticalIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  AnimatedList,
  AnimatedListItem,
  GlassCard,
  StatusBadge,
  EmptyState
} from '../ui/PremiumComponents';

const ReportList = ({ reports, onReportSelect, onReportsChange }) => {
  const { t } = useLanguage();
  const [activeMenu, setActiveMenu] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newName, setNewName] = useState('');

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 shadow-inner">
          <DocumentTextIcon className="h-6 w-6" />
        </div>
      );
    } else {
      return (
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shadow-inner">
          <PhotoIcon className="h-6 w-6" />
        </div>
      );
    }
  };

  const getStatusType = (status) => {
    switch (status) {
      case 'processed': return 'success';
      case 'processing': return 'info';
      case 'failed': return 'error';
      default: return 'neutral';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = async () => {
    if (!selectedReport) return;
    try {
      const response = await fetch(`/api/reports/${selectedReport._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setShowDeleteModal(false);
        onReportsChange();
      }
    } catch (error) { console.error('Delete error:', error); }
  };

  const handleRename = async () => {
    if (!selectedReport || !newName.trim() || newName === selectedReport.fileName) return;
    try {
      const response = await fetch(`/api/reports/${selectedReport._id}/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ fileName: newName })
      });
      const data = await response.json();
      if (data.success) {
        setShowRenameModal(false);
        onReportsChange();
      }
    } catch (error) { console.error('Rename error:', error); }
  };

  const openRenameModal = (e, report) => {
    e.stopPropagation();
    setActiveMenu(null);
    setSelectedReport(report);
    setNewName(report.fileName);
    setShowRenameModal(true);
  };

  const openDeleteModal = (e, report) => {
    e.stopPropagation();
    setActiveMenu(null);
    setSelectedReport(report);
    setShowDeleteModal(true);
  };

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={DocumentTextIcon}
        title={t('reports.noReportsYet')}
        description={t('reports.uploadFirstReport')}
      />
    );
  }

  return (
    <AnimatedList className="space-y-4">
      {reports.map((report) => {
        const isCritical = report.healthMetrics?.summary?.overallStatus === 'critical';
        
        return (
          <AnimatedListItem key={report._id}>
            <GlassCard
              className={`!p-5 group relative overflow-visible transition-all hover:ring-2 hover:ring-blue-500/30 cursor-pointer ${isCritical ? 'ring-1 ring-red-500/20' : ''}`}
              onClick={() => onReportSelect(report)}
            >
              {isCritical && (
                <div className="absolute top-0 right-0 w-2 h-2 mt-4 mr-4 bg-red-500 rounded-full animate-ping" />
              )}
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getFileIcon(report.fileType)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="space-y-1 mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-base leading-tight">
                      {report.fileName}
                    </h3>
                    <div className="flex">
                      <StatusBadge
                        status={getStatusType(report.processingStatus)}
                        text={
                          report.processingStatus === 'processing' 
                            ? `${report.processingProgress || 0}%` 
                            : report.processingStatus === 'failed'
                            ? 'Failed'
                            : 'Healthy'
                        }
                        dot={true}
                        size="xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(report.fileSize)}</span>
                  </div>
                </div>

                <div className="relative flex-shrink-0 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === report._id ? null : report._id);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <EllipsisVerticalIcon className="h-6 w-6" />
                  </button>

                  <AnimatePresence>
                    {activeMenu === report._id && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(null);
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                          <button
                            onClick={(e) => openRenameModal(e, report)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => openDeleteModal(e, report)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Delete
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {report.processingStatus === 'processing' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-slate-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${report.processingProgress || 0}%` }}
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  />
                </div>
              )}
            </GlassCard>
          </AnimatedListItem>
        );
      })}

      {/* Custom Rename Modal */}
      <AnimatePresence>
        {showRenameModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setShowRenameModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/20"
            >
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Rename Report</h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">Assign a more clinical or personal name to your document.</p>
              
              <div className="relative mb-8">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter new name..."
                  className="w-full px-6 py-4 bg-gray-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowRenameModal(false)}
                  className="flex-1 py-4 px-6 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRename}
                  className="flex-1 py-4 px-6 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all"
                >
                  Save Name
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-red-500/10"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6">
                <TrashIcon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Delete Report?</h3>
              <p className="text-sm text-gray-500 mb-8 font-medium">This action is permanent and will remove all associated health metrics and AI insights.</p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDelete}
                  className="w-full py-4 px-6 bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-500/25 hover:bg-red-600 transition-all"
                >
                  Yes, Delete Permanently
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-4 px-6 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatedList>
  );
};

ReportList.propTypes = {
  reports: PropTypes.array.isRequired,
  onReportSelect: PropTypes.func.isRequired,
  onReportsChange: PropTypes.func
};

export default ReportList;