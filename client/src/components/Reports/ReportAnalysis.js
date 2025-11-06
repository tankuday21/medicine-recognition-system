import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  LightBulbIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const ReportAnalysis = ({ report, onBack }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', name: 'Overview', icon: InformationCircleIcon },
    { id: 'metrics', name: 'Health Metrics', icon: ChartBarIcon },
    { id: 'recommendations', name: 'Recommendations', icon: LightBulbIcon },
    { id: 'text', name: 'Extracted Text', icon: DocumentTextIcon }
  ];

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'moderate':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'moderate':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  const getOverallStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'attention_needed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor_concerns':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOverallStatusText = (status) => {
    switch (status) {
      case 'critical':
        return 'Critical - Immediate attention needed';
      case 'attention_needed':
        return 'Attention Needed - Consult healthcare provider';
      case 'minor_concerns':
        return 'Minor Concerns - Monitor values';
      case 'normal':
        return 'Normal - All values within range';
      default:
        return 'Unknown status';
    }
  };

  const formatValue = (value, unit) => {
    return `${value} ${unit}`;
  };

  const formatRange = (range) => {
    return `${range.min} - ${range.max}`;
  };

  if (!report.healthMetrics) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
        <p className="text-gray-600">No analysis data available for this report</p>
        <button
          onClick={onBack}
          className="mt-3 text-blue-600 hover:text-blue-800"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { healthMetrics } = report;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{report.fileName}</h2>
            <p className="text-sm text-gray-600">
              Analyzed on {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Overall Status */}
        {healthMetrics.summary && (
          <div className={`px-4 py-2 rounded-lg border ${getOverallStatusColor(healthMetrics.summary.overallStatus)}`}>
            <span className="font-medium">
              {getOverallStatusText(healthMetrics.summary.overallStatus)}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeSection === section.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <section.icon className="h-4 w-4" />
              <span>{section.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {/* Overview Section */}
        {activeSection === 'overview' && healthMetrics.summary && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">Total Metrics</h3>
                <p className="text-2xl font-bold text-blue-600">{healthMetrics.summary.totalMetrics}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">Normal Values</h3>
                <p className="text-2xl font-bold text-green-600">{healthMetrics.summary.normalMetrics}</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-900">Abnormal Values</h3>
                <p className="text-2xl font-bold text-yellow-600">{healthMetrics.summary.abnormalMetrics}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">Completeness</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {healthMetrics.summary.completeness?.percentage || 0}%
                </p>
              </div>
            </div>

            {/* Categories Analyzed */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Categories Analyzed</h3>
              <div className="flex flex-wrap gap-2">
                {healthMetrics.summary.categoriesAnalyzed?.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Health Metrics Section */}
        {activeSection === 'metrics' && (
          <div className="space-y-6">
            {/* Normal Values */}
            {healthMetrics.metrics?.filter(m => m.isNormal).length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span>Normal Values</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {healthMetrics.metrics.filter(m => m.isNormal).map((metric, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-green-900">{metric.displayName || metric.name}</h4>
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-green-700 mt-1">
                        {formatValue(metric.value, metric.unit)}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Normal range: {formatRange(metric.normalRange)} {metric.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Abnormal Values */}
            {healthMetrics.abnormalFlags?.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                  <span>Values Requiring Attention</span>
                </h3>
                <div className="space-y-4">
                  {healthMetrics.abnormalFlags.map((flag, index) => (
                    <div key={index} className={`border p-4 rounded-lg ${getSeverityColor(flag.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {getSeverityIcon(flag.severity)}
                            <h4 className="font-medium">{flag.displayName || flag.name}</h4>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-white bg-opacity-50">
                              {flag.severity}
                            </span>
                          </div>
                          <p className="text-2xl font-bold mt-1">
                            {formatValue(flag.value, flag.unit)}
                          </p>
                          <p className="text-sm mt-1">
                            Normal range: {formatRange(flag.normalRange)} {flag.unit}
                          </p>
                          {flag.deviation && (
                            <p className="text-sm mt-1">
                              Deviation: {flag.deviation > 0 ? '+' : ''}{flag.deviation.toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Section */}
        {activeSection === 'recommendations' && (
          <div className="space-y-6">
            {healthMetrics.recommendations?.length > 0 ? (
              <div className="space-y-4">
                {healthMetrics.recommendations.map((rec, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <LightBulbIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900">{rec.title}</h4>
                        <p className="text-blue-800 mt-1">{rec.description}</p>
                        {rec.category && (
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {rec.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No specific recommendations available</p>
              </div>
            )}

            {/* General Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-yellow-800">
                  <p className="font-medium">Important Disclaimer</p>
                  <p className="text-sm mt-1">
                    This analysis is for informational purposes only and should not replace professional medical advice. 
                    Always consult with your healthcare provider for proper interpretation of your medical results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Text Section */}
        {activeSection === 'text' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Extracted Text</h3>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {report.extractedText || 'No extracted text available'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ReportAnalysis.propTypes = {
  report: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired
};

export default ReportAnalysis;