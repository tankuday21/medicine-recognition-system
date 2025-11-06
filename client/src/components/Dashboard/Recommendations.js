import React from 'react';
import PropTypes from 'prop-types';
import {
  LightBulbIcon,
  ClockIcon,
  HeartIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Recommendations = ({ data }) => {
  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'adherence':
        return ClockIcon;
      case 'timing':
        return ClockIcon;
      case 'health_monitoring':
        return HeartIcon;
      case 'reporting':
        return DocumentTextIcon;
      default:
        return LightBulbIcon;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <InformationCircleIcon className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <CheckCircleIcon className="h-4 w-4 text-blue-600" />;
      default:
        return <InformationCircleIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Medication Management':
        return 'bg-purple-100 text-purple-800';
      case 'Medication Timing':
        return 'bg-blue-100 text-blue-800';
      case 'Health Monitoring':
        return 'bg-red-100 text-red-800';
      case 'Health Tracking':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Sort recommendations by priority (high -> medium -> low)
  const sortedRecommendations = [...data].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className="space-y-4">
      {sortedRecommendations.length > 0 ? (
        <div className="space-y-3">
          {sortedRecommendations.map((recommendation, index) => {
            const IconComponent = getRecommendationIcon(recommendation.type);
            return (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${getPriorityColor(recommendation.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {recommendation.title}
                      </h4>
                      
                      <div className="flex items-center space-x-2 ml-2">
                        {getPriorityIcon(recommendation.priority)}
                        <span className="text-xs font-medium capitalize">
                          {recommendation.priority}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      {recommendation.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(recommendation.category)}`}>
                        {recommendation.category}
                      </span>
                      
                      {recommendation.actionable && (
                        <button className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                          Take Action →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <CheckCircleIcon className="h-12 w-12 text-green-300 mx-auto mb-4" />
          <p className="font-medium text-gray-700">Great job!</p>
          <p className="text-sm mt-1">No recommendations at this time.</p>
          <p className="text-sm text-gray-400 mt-2">Keep up the good work with your health management.</p>
        </div>
      )}

      {/* Action Summary */}
      {sortedRecommendations.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-red-600">
                {sortedRecommendations.filter(r => r.priority === 'high').length}
              </div>
              <div className="text-xs text-gray-600">High Priority</div>
            </div>
            
            <div>
              <div className="font-semibold text-yellow-600">
                {sortedRecommendations.filter(r => r.priority === 'medium').length}
              </div>
              <div className="text-xs text-gray-600">Medium Priority</div>
            </div>
            
            <div>
              <div className="font-semibold text-blue-600">
                {sortedRecommendations.filter(r => r.actionable).length}
              </div>
              <div className="text-xs text-gray-600">Actionable</div>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-900 mb-3">Health Tips</h5>
        <div className="space-y-2">
          <div className="flex items-start space-x-2 text-sm text-gray-600">
            <LightBulbIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span>Set consistent medication times to improve adherence</span>
          </div>
          
          <div className="flex items-start space-x-2 text-sm text-gray-600">
            <LightBulbIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span>Upload health reports regularly for better insights</span>
          </div>
          
          <div className="flex items-start space-x-2 text-sm text-gray-600">
            <LightBulbIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span>Review your dashboard weekly to track progress</span>
          </div>
        </div>
      </div>
    </div>
  );
};

Recommendations.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      priority: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      actionable: PropTypes.bool,
      category: PropTypes.string.isRequired
    })
  ).isRequired
};

export default Recommendations;