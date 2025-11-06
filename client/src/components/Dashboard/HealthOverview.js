import React from 'react';
import PropTypes from 'prop-types';
import {
  HeartIcon,
  ClockIcon,
  DocumentTextIcon,
  BeakerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const HealthOverview = ({ data }) => {
  const getAdherenceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAdherenceBackground = (percentage) => {
    if (percentage >= 90) return 'bg-green-50 border-green-200';
    if (percentage >= 80) return 'bg-yellow-50 border-yellow-200';
    if (percentage >= 70) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Medication Adherence */}
      {data.adherenceAnalytics && (
        <div className={`p-6 rounded-lg border ${getAdherenceBackground(data.adherenceAnalytics.adherencePercentage)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white rounded-lg">
              <ClockIcon className={`h-6 w-6 ${getAdherenceColor(data.adherenceAnalytics.adherencePercentage)}`} />
            </div>
            <span className={`text-2xl font-bold ${getAdherenceColor(data.adherenceAnalytics.adherencePercentage)}`}>
              {data.adherenceAnalytics.adherencePercentage}%
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Medication Adherence</h3>
          <p className="text-sm text-gray-600">
            {data.adherenceAnalytics.totalTaken} of {data.adherenceAnalytics.totalScheduled} doses taken
          </p>
          
          {/* Streak Display */}
          {data.adherenceAnalytics.streakDays > 0 && (
            <div className="mt-3 flex items-center space-x-2">
              <FireIcon className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">
                {data.adherenceAnalytics.streakDays} day streak!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Health Reports */}
      {data.reportSummary && (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {formatNumber(data.reportSummary.totalReports)}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Health Reports</h3>
          <p className="text-sm text-gray-600">
            {data.reportSummary.processedReports} processed successfully
          </p>
          
          {data.reportSummary.averageConfidence > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg. Confidence</span>
                <span className="font-medium text-blue-700">{data.reportSummary.averageConfidence}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Health Trends */}
      {data.healthTrends && (
        <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white rounded-lg">
              <HeartIcon className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {formatNumber(data.healthTrends.trends.length)}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Health Metrics</h3>
          <p className="text-sm text-gray-600">
            Tracking {data.healthTrends.trends.length} health indicators
          </p>
          
          {data.healthTrends.abnormalTrends.length > 0 && (
            <div className="mt-3 flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">
                {data.healthTrends.abnormalTrends.length} abnormal readings
              </span>
            </div>
          )}
        </div>
      )}

      {/* Medication Insights */}
      {data.medicationInsights && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white rounded-lg">
              <BeakerIcon className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">
              {formatNumber(data.medicationInsights.activeMedications)}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Active Medications</h3>
          <p className="text-sm text-gray-600">
            {data.medicationInsights.totalMedications} total medications
          </p>
          
          {/* Best Time Slot */}
          {data.medicationInsights.adherenceByTime && data.medicationInsights.adherenceByTime.length > 0 && (
            <div className="mt-3">
              {(() => {
                const bestTime = data.medicationInsights.adherenceByTime
                  .filter(t => t.scheduled > 0)
                  .sort((a, b) => b.adherenceRate - a.adherenceRate)[0];
                
                if (bestTime) {
                  return (
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">
                        Best: {bestTime.timeSlot} ({bestTime.adherenceRate}%)
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

HealthOverview.propTypes = {
  data: PropTypes.object.isRequired
};

export default HealthOverview;