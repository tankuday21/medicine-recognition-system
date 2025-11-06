import React from 'react';
import PropTypes from 'prop-types';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdherenceChart = ({ data }) => {
  const { dailyAdherence, medicationBreakdown, adherencePercentage, onTimePercentage } = data;

  // Get last 14 days for chart
  const chartData = dailyAdherence.slice(-14);

  const getAdherenceColor = (rate) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 80) return 'bg-yellow-500';
    if (rate >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getAdherenceTextColor = (rate) => {
    if (rate >= 90) return 'text-green-700';
    if (rate >= 80) return 'text-yellow-700';
    if (rate >= 70) return 'text-orange-700';
    return 'text-red-700';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{adherencePercentage}%</div>
          <div className="text-sm text-gray-600">Overall Adherence</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{onTimePercentage}%</div>
          <div className="text-sm text-gray-600">On-Time Doses</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{data.streakDays}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>
      </div>

      {/* Daily Adherence Chart */}
      {chartData.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Daily Adherence (Last 14 Days)</h4>
          <div className="space-y-3">
            {chartData.map((day, index) => (
              <div key={day.date} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-600 text-right">
                  <div>{getDayOfWeek(day.date)}</div>
                  <div className="text-xs text-gray-400">{formatDate(day.date)}</div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getAdherenceColor(day.adherenceRate)}`}
                        style={{ width: `${day.adherenceRate}%` }}
                      ></div>
                    </div>
                    <div className={`text-sm font-medium w-12 text-right ${getAdherenceTextColor(day.adherenceRate)}`}>
                      {day.adherenceRate}%
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span>{day.taken}</span>
                    </div>
                    
                    {day.missed > 0 && (
                      <div className="flex items-center space-x-1">
                        <XCircleIcon className="h-4 w-4 text-red-500" />
                        <span>{day.missed}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span>{day.scheduled} scheduled</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication Breakdown */}
      {medicationBreakdown.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Adherence by Medication</h4>
          <div className="space-y-3">
            {medicationBreakdown.slice(0, 5).map((med, index) => (
              <div key={med.medicineName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{med.medicineName}</div>
                  <div className="text-sm text-gray-600">
                    {med.taken} of {med.scheduled} doses taken
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getAdherenceColor(med.adherenceRate)}`}
                      style={{ width: `${med.adherenceRate}%` }}
                    ></div>
                  </div>
                  <div className={`text-sm font-medium w-12 text-right ${getAdherenceTextColor(med.adherenceRate)}`}>
                    {med.adherenceRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {medicationBreakdown.length > 5 && (
            <div className="text-center mt-4">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all {medicationBreakdown.length} medications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {chartData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p>No adherence data available for the selected timeframe.</p>
          <p className="text-sm mt-2">Start taking your medications to see adherence trends.</p>
        </div>
      )}
    </div>
  );
};

AdherenceChart.propTypes = {
  data: PropTypes.shape({
    dailyAdherence: PropTypes.array.isRequired,
    medicationBreakdown: PropTypes.array.isRequired,
    adherencePercentage: PropTypes.number.isRequired,
    onTimePercentage: PropTypes.number.isRequired,
    streakDays: PropTypes.number.isRequired
  }).isRequired
};

export default AdherenceChart;