import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import HealthOverview from '../components/Dashboard/HealthOverview';
import AdherenceChart from '../components/Dashboard/AdherenceChart';
import HealthTrends from '../components/Dashboard/HealthTrends';
import RecentActivity from '../components/Dashboard/RecentActivity';
import Recommendations from '../components/Dashboard/Recommendations';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import {
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  HeartIcon,
  LightBulbIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();

  const timeframeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, timeframe]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/analytics/dashboard?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card variant="elevated" className="text-center">
          <div className="p-8">
            <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign In Required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to view your personalized health dashboard and analytics.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <Card variant="gradient" className="mb-8 bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0 shadow-xl">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  Welcome back, {user?.name || 'User'}! <HandRaisedIcon className="h-8 w-8 inline-block" />
                </h1>
                <p className="text-white/90 text-lg">Here's your health overview and insights</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  variant="medical"
                  size="md"
                  className="bg-white"
                >
                  {timeframeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                
                <Button
                  onClick={loadDashboardData}
                  disabled={isLoading}
                  variant="outline"
                  size="md"
                  loading={isLoading}
                  className="bg-white text-primary-600 hover:bg-gray-50"
                >
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card variant="outline" borderAccent="danger" className="mb-6 bg-red-50">
            <div className="p-4">
              <p className="text-red-700">{error}</p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && !dashboardData && (
          <Card variant="elevated" className="text-center">
            <div className="p-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading your health dashboard...</p>
            </div>
          </Card>
        )}

        {/* Dashboard Content */}
        {dashboardData && (
          <div className="space-y-6">
            {/* Health Score Overview */}
            <Card 
              variant="elevated" 
              borderAccent={dashboardData.overallHealthScore >= 80 ? 'success' : dashboardData.overallHealthScore >= 60 ? 'warning' : 'danger'}
              className={getHealthScoreBackground(dashboardData.overallHealthScore)}
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Overall Health Score</h2>
                    <p className="text-sm sm:text-base text-gray-600">Based on medication adherence, health trends, and activity</p>
                  </div>
                  <div className="text-center sm:text-right flex-shrink-0">
                    <div className={`text-3xl sm:text-4xl font-bold ${getHealthScoreColor(dashboardData.overallHealthScore)}`}>
                      {dashboardData.overallHealthScore}/100
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Health Score</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - Charts and Trends */}
            <div className="xl:col-span-2 space-y-6 sm:space-y-8">
              {/* Health Overview Cards */}
              <HealthOverview data={dashboardData} />

              {/* Adherence Chart */}
              {dashboardData.adherenceAnalytics && (
                <Card variant="elevated" hoverable>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <ChartBarIcon className="h-6 w-6 text-primary-600 mr-3" />
                      <h3 className="text-lg font-bold text-gray-900">Medication Adherence</h3>
                    </div>
                    <AdherenceChart data={dashboardData.adherenceAnalytics} />
                  </div>
                </Card>
              )}

              {/* Health Trends */}
              {dashboardData.healthTrends && dashboardData.healthTrends.trends.length > 0 && (
                <Card variant="elevated" hoverable>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <HeartIcon className="h-6 w-6 text-red-600 mr-3" />
                      <h3 className="text-lg font-bold text-gray-900">Health Trends</h3>
                    </div>
                    <HealthTrends data={dashboardData.healthTrends} />
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column - Activity and Recommendations */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Card variant="elevated" hoverable>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <ClockIcon className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                  </div>
                  <RecentActivity data={dashboardData} />
                </div>
              </Card>

              {/* Recommendations */}
              {dashboardData.recommendations && dashboardData.recommendations.length > 0 && (
                <Card variant="elevated" hoverable borderAccent="warning" className="bg-yellow-50">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <LightBulbIcon className="h-6 w-6 text-yellow-600 mr-3" />
                      <h3 className="text-lg font-bold text-gray-900">Recommendations</h3>
                    </div>
                    <Recommendations data={dashboardData.recommendations} />
                  </div>
                </Card>
              )}

              {/* Quick Actions */}
              <Card variant="elevated" hoverable>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Card 
                      variant="medical" 
                      hoverable 
                      pressable 
                      onClick={() => navigate('/reminders')}
                      className="cursor-pointer bg-blue-50"
                    >
                      <div className="p-4 flex items-center">
                        <ClockIcon className="h-6 w-6 text-blue-600 mr-3" />
                        <span className="text-blue-900 font-semibold">Manage Reminders</span>
                      </div>
                    </Card>
                    
                    <Card 
                      variant="medical" 
                      hoverable 
                      pressable 
                      onClick={() => navigate('/reports')}
                      className="cursor-pointer bg-green-50"
                    >
                      <div className="p-4 flex items-center">
                        <DocumentTextIcon className="h-6 w-6 text-green-600 mr-3" />
                        <span className="text-green-900 font-semibold">Upload Report</span>
                      </div>
                    </Card>
                    
                    <Card 
                      variant="medical" 
                      hoverable 
                      pressable 
                      onClick={() => navigate('/symptoms')}
                      className="cursor-pointer bg-purple-50"
                    >
                      <div className="p-4 flex items-center">
                        <HeartIcon className="h-6 w-6 text-purple-600 mr-3" />
                        <span className="text-purple-900 font-semibold">Check Symptoms</span>
                      </div>
                    </Card>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-sm text-gray-500 mt-6">
            <p>Dashboard last updated: {new Date(dashboardData.generatedAt).toLocaleString()}</p>
            <p className="mt-1">Data shown for: {timeframeOptions.find(t => t.value === timeframe)?.label}</p>
          </div>
        </div>
      )}

        {/* Empty State */}
        {!isLoading && !dashboardData && !error && (
          <Card variant="elevated" className="text-center">
            <div className="p-12">
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Data Available</h3>
              <p className="text-gray-600 mb-6">
                Start using Mediot to see your personalized health dashboard.
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/reminders')}
                >
                  Set Up Reminders
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/reports')}
                >
                  Upload Report
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;