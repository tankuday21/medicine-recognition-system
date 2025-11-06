import React from 'react';
import PropTypes from 'prop-types';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const HealthTrends = ({ data }) => {
  const { trends, abnormalTrends, improvementAreas } = data;

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />;
      case 'decreasing':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />;
      case 'stable':
        return <MinusIcon className="h-5 w-5 text-gray-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-700';
      case 'decreasing':
        return 'text-red-700';
      case 'stable':
        return 'text-gray-700';
      default:
        return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatValue = (value, unit) => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)} ${unit || ''}`;
    }
    return `${value} ${unit || ''}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Health Metrics Trends */}
      {trends.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Health Metric Trends</h4>
          <div className="space-y-3">
            {trends.slice(0, 6).map((metric, index) => (
              <div key={metric.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium text-gray-900">{metric.name}</div>
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                      {metric.trend}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-1">
                    Latest: {formatValue(metric.latestValue?.value, metric.unit)}
                    {metric.latestValue?.date && (
                      <span className="ml-2 text-gray-400">
                        ({formatDate(metric.latestValue.date)})
                      </span>
                    )}
                  </div>
                  
                  {metric.changePercentage !== 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {metric.changePercentage > 0 ? '+' : ''}{metric.changePercentage}% change
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    metric.latestValue?.isNormal 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {metric.latestValue?.isNormal ? 'Normal' : 'Abnormal'}
                  </div>
                  
                  {metric.normalRange && (
                    <div className="text-xs text-gray-500 mt-1">
                      Normal: {metric.normalRange.min}-{metric.normalRange.max} {metric.unit}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {trends.length > 6 && (
            <div className="text-center mt-4">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all {trends.length} metrics
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recent Abnormal Readings */}
      {abnormalTrends.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            Recent Abnormal Readings
          </h4>
          <div className="space-y-2">
            {abnormalTrends.slice(0, 5).map((reading, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{reading.metricName}</div>
                  <div className="text-sm text-gray-600">
                    Value: {formatValue(reading.value)} 
                    <span className="text-gray-400 ml-2">
                      (Normal: {reading.normalRange.min}-{reading.normalRange.max})
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(reading.date)}
                  </div>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(reading.severity)}`}>
                  {reading.severity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Areas */}
      {improvementAreas.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Areas for Improvement</h4>
          <div className="space-y-2">
            {improvementAreas.map((area, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-blue-900">{area.area}</div>
                  <div className="text-sm text-blue-700">{area.description}</div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  area.priority === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {area.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {trends.length === 0 && abnormalTrends.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <InformationCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p>No health trend data available.</p>
          <p className="text-sm mt-2">Upload health reports to see trends and insights.</p>
        </div>
      )}
    </div>
  );
};

HealthTrends.propTypes = {
  data: PropTypes.shape({
    trends: PropTypes.array.isRequired,
    abnormalTrends: PropTypes.array.isRequired,
    improvementAreas: PropTypes.array.isRequired
  }).isRequired
};

export default HealthTrends;