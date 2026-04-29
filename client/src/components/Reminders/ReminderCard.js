import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ClockIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const ReminderCard = ({ reminder, onEdit, onDelete, onToggleActive, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getFrequencyLabel = (frequency) => {
    const labels = {
      once: 'Once daily',
      twice: 'Twice daily',
      thrice: 'Three times daily',
      four_times: 'Four times daily',
      custom: 'Custom schedule'
    };
    return labels[frequency] || frequency;
  };

  const getAdherenceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`bg-white border rounded-lg shadow-sm transition-all duration-200 ${
      reminder.isActive ? 'border-gray-200' : 'border-gray-300 opacity-75'
    }`}>
      {/* Main Content */}
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              reminder.isActive ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <BeakerIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${
                reminder.isActive ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {reminder.medicineName}
                </h3>
                {!reminder.isActive && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex-shrink-0">
                    Paused
                  </span>
                )}
              </div>
              
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                {reminder.dosage} • {getFrequencyLabel(reminder.frequency)}
              </p>
              
              <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500">
                <span className="truncate max-w-[150px] sm:max-w-none">Times: {reminder.times.map(formatTime).join(', ')}</span>
                {reminder.adherencePercentage !== undefined && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAdherenceColor(reminder.adherencePercentage)}`}>
                      {reminder.adherencePercentage}% adherence
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2 self-end sm:self-start ml-auto sm:ml-4">
            <button
              onClick={() => onToggleActive(reminder._id, !reminder.isActive)}
              className={`p-2 rounded-full transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
                reminder.isActive 
                  ? 'text-yellow-600 hover:bg-yellow-50' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
              title={reminder.isActive ? 'Pause reminder' : 'Resume reminder'}
            >
              {reminder.isActive ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
            </button>
            
            <button
              onClick={() => onEdit(reminder)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Edit reminder"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="View details"
            >
              <ChartBarIcon className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => onDelete(reminder._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Delete reminder"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Schedule Details</h4>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Start Date:</dt>
                    <dd className="text-gray-900">{formatDate(reminder.startDate)}</dd>
                  </div>
                  {reminder.endDate && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">End Date:</dt>
                      <dd className="text-gray-900">{formatDate(reminder.endDate)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Status:</dt>
                    <dd className={`font-medium ${reminder.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                      {reminder.isActive ? 'Active' : 'Paused'}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Adherence Info</h4>
                <dl className="space-y-1">
                  {reminder.adherencePercentage !== undefined && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Adherence:</dt>
                      <dd className="text-gray-900">{reminder.adherencePercentage}%</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Created:</dt>
                    <dd className="text-gray-900">{formatDate(reminder.createdAt)}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {reminder.notes && (
              <div className="mt-3 sm:mt-4">
                <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">Notes</h4>
                <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-2 sm:p-3 rounded-lg">
                  {reminder.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

ReminderCard.propTypes = {
  reminder: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    medicineName: PropTypes.string.isRequired,
    dosage: PropTypes.string.isRequired,
    frequency: PropTypes.string.isRequired,
    times: PropTypes.arrayOf(PropTypes.string).isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string,
    isActive: PropTypes.bool.isRequired,
    notes: PropTypes.string,
    adherencePercentage: PropTypes.number,
    createdAt: PropTypes.string.isRequired
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleActive: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func
};

export default ReminderCard;