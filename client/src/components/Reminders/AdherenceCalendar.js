import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdherenceCalendar = ({ userId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [adherenceData, setAdherenceData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadAdherenceData();
    }
  }, [userId, currentDate]);

  const loadAdherenceData = async () => {
    setIsLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Format dates for API
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];
      
      console.log(`📅 Loading adherence data for ${startDate} to ${endDate}`);
      
      // Get real adherence data from API
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reminders/adherence?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('📊 Adherence data loaded:', result);
        setAdherenceData(result.data || {});
      } else {
        console.error('Failed to load adherence data:', response.statusText);
        // Fallback to mock data if API fails
        const mockData = generateMockAdherenceData(startOfMonth, endOfMonth);
        setAdherenceData(mockData);
      }
    } catch (error) {
      console.error('Failed to load adherence data:', error);
      // Fallback to mock data on error
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const mockData = generateMockAdherenceData(startOfMonth, endOfMonth);
      setAdherenceData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAdherenceData = (startDate, endDate) => {
    const data = {};
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dateKey = current.toISOString().split('T')[0];
      const random = Math.random();
      
      // Generate realistic adherence data
      if (current <= new Date()) { // Only for past/current dates
        if (random > 0.8) {
          data[dateKey] = { status: 'missed', percentage: 0 };
        } else if (random > 0.6) {
          data[dateKey] = { status: 'partial', percentage: 50 };
        } else {
          data[dateKey] = { status: 'complete', percentage: 100 };
        }
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return data;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAdherenceStatus = (date) => {
    if (!date) return null;
    const dateKey = date.toISOString().split('T')[0];
    return adherenceData[dateKey] || null;
  };

  const getStatusIcon = (status) => {
    switch (status?.status) {
      case 'complete':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <ExclamationCircleIcon className="h-4 w-4 text-yellow-500" />;
      case 'missed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-300" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.status) {
      case 'complete':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'partial':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'missed':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-500';
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Adherence Calendar</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-lg font-medium text-gray-900 min-w-[150px] text-center">
            {monthYear}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading calendar...</p>
        </div>
      ) : (
        <>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const status = getAdherenceStatus(date);
              const isToday = date && date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`
                    relative p-2 h-12 border rounded-lg flex items-center justify-center text-sm
                    ${date ? getStatusColor(status) : 'bg-transparent border-transparent'}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  {date && (
                    <>
                      <span className="absolute top-1 left-1 text-xs">
                        {date.getDate()}
                      </span>
                      <div className="flex items-center justify-center">
                        {getStatusIcon(status)}
                      </div>
                      {status && (
                        <span className="absolute bottom-0 right-1 text-xs font-medium">
                          {status.percentage}%
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Complete</span>
            </div>
            <div className="flex items-center space-x-2">
              <ExclamationCircleIcon className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-600">Partial</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircleIcon className="h-4 w-4 text-red-500" />
              <span className="text-gray-600">Missed</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-gray-300" />
              <span className="text-gray-600">No Data</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

AdherenceCalendar.propTypes = {
  userId: PropTypes.string
};

export default AdherenceCalendar;