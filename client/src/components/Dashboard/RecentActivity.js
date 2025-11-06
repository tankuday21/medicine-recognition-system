import React from 'react';
import PropTypes from 'prop-types';
import {
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  BeakerIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const RecentActivity = ({ data }) => {
  const activities = [];

  // Add recent reports
  if (data.reportSummary?.recentReports) {
    data.reportSummary.recentReports.forEach(report => {
      activities.push({
        type: 'report',
        title: 'Health Report Uploaded',
        description: report.fileName,
        timestamp: report.createdAt,
        status: report.processingStatus,
        confidence: report.confidence,
        icon: DocumentTextIcon,
        iconColor: 'text-blue-600'
      });
    });
  }

  // Add recent adherence events (from last few days)
  if (data.adherenceAnalytics?.dailyAdherence) {
    const recentDays = data.adherenceAnalytics.dailyAdherence.slice(-3);
    recentDays.forEach(day => {
      if (day.taken > 0 || day.missed > 0) {
        activities.push({
          type: 'adherence',
          title: day.adherenceRate >= 80 ? 'Good Medication Adherence' : 'Missed Medications',
          description: `${day.taken} taken, ${day.missed} missed (${day.adherenceRate}%)`,
          timestamp: day.date,
          status: day.adherenceRate >= 80 ? 'good' : 'poor',
          icon: day.adherenceRate >= 80 ? CheckCircleIcon : XCircleIcon,
          iconColor: day.adherenceRate >= 80 ? 'text-green-600' : 'text-red-600'
        });
      }
    });
  }

  // Add abnormal health readings
  if (data.healthTrends?.abnormalTrends) {
    data.healthTrends.abnormalTrends.slice(-3).forEach(trend => {
      activities.push({
        type: 'health_alert',
        title: 'Abnormal Health Reading',
        description: `${trend.metricName}: ${trend.value}`,
        timestamp: trend.date,
        status: trend.severity,
        icon: ExclamationTriangleIcon,
        iconColor: trend.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
      });
    });
  }

  // Sort activities by timestamp (most recent first)
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Take only the most recent 8 activities
  const recentActivities = activities.slice(0, 8);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getStatusColor = (type, status) => {
    switch (type) {
      case 'report':
        switch (status) {
          case 'processed':
            return 'bg-green-100 text-green-800';
          case 'failed':
            return 'bg-red-100 text-red-800';
          default:
            return 'bg-yellow-100 text-yellow-800';
        }
      case 'adherence':
        return status === 'good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
      case 'health_alert':
        switch (status) {
          case 'critical':
            return 'bg-red-100 text-red-800';
          case 'high':
            return 'bg-orange-100 text-orange-800';
          default:
            return 'bg-yellow-100 text-yellow-800';
        }
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (type, status) => {
    switch (type) {
      case 'report':
        switch (status) {
          case 'processed':
            return 'Processed';
          case 'failed':
            return 'Failed';
          default:
            return 'Processing';
        }
      case 'adherence':
        return status === 'good' ? 'Good' : 'Needs Attention';
      case 'health_alert':
        return status.charAt(0).toUpperCase() + status.slice(1);
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {recentActivities.length > 0 ? (
        <div className="space-y-3">
          {recentActivities.map((activity, index) => {
            const IconComponent = activity.icon;
            return (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`p-2 rounded-lg bg-white ${activity.iconColor}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.description}
                      </p>
                      
                      {activity.confidence && (
                        <p className="text-xs text-gray-500 mt-1">
                          Confidence: {Math.round(activity.confidence * 100)}%
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end space-y-1 ml-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.type, activity.status)}`}>
                        {getStatusText(activity.type, activity.status)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p>No recent activity to display.</p>
          <p className="text-sm mt-2">Start using Mediot to see your activity here.</p>
        </div>
      )}

      {/* Activity Summary */}
      {recentActivities.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {data.reportSummary?.totalReports || 0}
              </div>
              <div className="text-xs text-gray-600">Reports</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {data.adherenceAnalytics?.adherencePercentage || 0}%
              </div>
              <div className="text-xs text-gray-600">Adherence</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {data.medicationInsights?.activeMedications || 0}
              </div>
              <div className="text-xs text-gray-600">Medications</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h5>
        <div className="grid grid-cols-2 gap-2">
          <a
            href="/reminders"
            className="flex items-center justify-center p-2 text-sm bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ClockIcon className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-blue-900">Reminders</span>
          </a>
          
          <a
            href="/reports"
            className="flex items-center justify-center p-2 text-sm bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <DocumentTextIcon className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-green-900">Upload</span>
          </a>
        </div>
      </div>
    </div>
  );
};

RecentActivity.propTypes = {
  data: PropTypes.object.isRequired
};

export default RecentActivity;