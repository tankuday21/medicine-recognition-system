import React from 'react';
import PropTypes from 'prop-types';
import {
  DocumentTextIcon,
  PhotoIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const ReportList = ({ reports, onReportSelect, onReportsChange }) => {
  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') {
      return <DocumentTextIcon className="h-8 w-8 text-red-500" />;
    } else {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = async (reportId, reportName) => {
    if (!window.confirm(`Are you sure you want to delete "${reportName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the reports list
        if (onReportsChange) {
          onReportsChange();
        }
      } else {
        alert('Failed to delete report: ' + data.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete report');
    }
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 mb-2">No reports uploaded yet</p>
        <p className="text-sm text-gray-400">
          Upload your first medical report to get started with AI-powered analysis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report._id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              {/* File Icon */}
              <div className="flex-shrink-0">
                {getFileIcon(report.fileType)}
              </div>

              {/* Report Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {report.fileName}
                </h3>
                
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span>{formatFileSize(report.fileSize)}</span>
                  <span>•</span>
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  {report.confidence && (
                    <>
                      <span>•</span>
                      <span>Confidence: {Math.round(report.confidence * 100)}%</span>
                    </>
                  )}
                </div>

                {/* Status */}
                <div className="mt-2 flex items-center space-x-2">
                  {getStatusIcon(report.processingStatus)}
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.processingStatus)}`}
                  >
                    {getStatusText(report.processingStatus)}
                  </span>
                </div>

                {/* Health Metrics Summary */}
                {report.healthMetrics && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">
                      {report.healthMetrics.metrics?.length || 0} health metrics found
                    </span>
                    {report.healthMetrics.abnormalFlags?.length > 0 && (
                      <span className="ml-2 text-yellow-600">
                        • {report.healthMetrics.abnormalFlags.length} abnormal values
                      </span>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {report.processingStatus === 'failed' && report.errorMessage && (
                  <div className="mt-2 text-sm text-red-600">
                    Error: {report.errorMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {report.processingStatus === 'processed' && (
                <button
                  onClick={() => onReportSelect(report)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Analysis"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={() => handleDelete(report._id, report.fileName)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Report"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Processing Progress */}
          {report.processingStatus === 'processing' && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ClockIcon className="h-4 w-4 animate-spin" />
                <span>Analyzing report with AI...</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

ReportList.propTypes = {
  reports: PropTypes.array.isRequired,
  onReportSelect: PropTypes.func.isRequired,
  onReportsChange: PropTypes.func
};

export default ReportList;