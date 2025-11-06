import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReportUpload from '../components/Reports/ReportUpload';
import ReportList from '../components/Reports/ReportList';
import ReportAnalysis from '../components/Reports/ReportAnalysis';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  DocumentTextIcon,
  PlusIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  const tabs = [
    { id: 'upload', name: 'Upload Report', icon: PlusIcon },
    { id: 'reports', name: 'My Reports', icon: DocumentTextIcon },
    { id: 'analysis', name: 'Analysis', icon: ChartBarIcon }
  ];

  useEffect(() => {
    if (isAuthenticated && activeTab === 'reports') {
      loadReports();
    }
  }, [isAuthenticated, activeTab]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setReports(data.data.reports);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      setError('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (reportData) => {
    setError('');
    // Switch to reports tab to show the uploaded report
    setActiveTab('reports');
    // Reload reports to show the new one
    loadReports();
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    setActiveTab('analysis');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'processed':
        return 'Processed';
      case 'processing':
        return 'Processing...';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600">
            Please sign in to upload and analyze your medical reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Medical Reports</h1>
        <p className="text-gray-600">Upload and analyze your medical reports with AI-powered insights</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Medical Report</h2>
              <ReportUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          )}

          {/* Reports List Tab */}
          {activeTab === 'reports' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Reports</h2>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Upload New</span>
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading reports...</p>
                </div>
              ) : (
                <ReportList 
                  reports={reports} 
                  onReportSelect={handleReportSelect}
                  onReportsChange={loadReports}
                />
              )}
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Analysis</h2>
              {selectedReport ? (
                <ReportAnalysis 
                  report={selectedReport} 
                  onBack={() => setActiveTab('reports')}
                />
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Select a report from the Reports tab to view analysis</p>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="mt-3 text-blue-600 hover:text-blue-800"
                  >
                    Go to Reports
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {reports.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{reports.length}</p>
                <p className="text-gray-600">Total Reports</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {reports.filter(r => r.processingStatus === 'processed').length}
                </p>
                <p className="text-gray-600">Processed</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {reports.filter(r => r.processingStatus === 'processing').length}
                </p>
                <p className="text-gray-600">Processing</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;