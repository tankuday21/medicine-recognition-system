import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReportAnalysis from '../components/Reports/ReportAnalysis';
import { BackButton, GlassCard, LoadingSkeleton } from '../components/ui/PremiumComponents';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReport();
  }, [id]);

  // Poll for report status if it's still processing
  useEffect(() => {
    let intervalId;
    if (report?.processingStatus === 'processing') {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch(`/api/reports/${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setReport(data.data);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [report, id]);

  const loadReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/reports/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.data);
      } else {
        setError(data.message || 'Failed to load report');
      }
    } catch (err) {
      console.error('Failed to load report:', err);
      setError('An error occurred while loading the report');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-4 sm:p-6 pt-safe">
        <div className="max-w-6xl mx-auto space-y-6">
          <LoadingSkeleton className="h-20 w-full rounded-2xl" />
          <LoadingSkeleton className="h-64 w-full rounded-3xl" />
          <LoadingSkeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4 pt-safe">
        <GlassCard className="text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Report not found'}</p>
          <button
            onClick={() => navigate('/reports')}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg"
          >
            Back to Reports
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-safe font-sans pb-20">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <ReportAnalysis
          report={report}
          onBack={() => navigate('/reports')}
        />
      </div>
    </div>
  );
};

export default ReportDetail;
