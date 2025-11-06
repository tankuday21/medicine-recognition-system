import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  UserCircleIcon, 
  PencilIcon, 
  HeartIcon, 
  PhoneIcon,
  CogIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    allergies: [],
    chronicConditions: [],
    emergencyContacts: [],
    preferences: {
      language: 'en',
      theme: 'auto',
      units: 'metric',
      notifications: {
        reminders: true,
        news: true,
        emergency: true
      }
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        allergies: user.allergies || [],
        chronicConditions: user.chronicConditions || [],
        emergencyContacts: user.emergencyContacts || [],
        preferences: {
          ...user.preferences,
          notifications: user.preferences?.notifications || {
            reminders: true,
            news: true,
            emergency: true
          }
        }
      });
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/profile/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let endpoint = '/api/profile/basic';
      let data = {
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender
      };

      if (activeTab === 'medical') {
        endpoint = '/api/profile/medical';
        data = {
          allergies: formData.allergies.filter(a => a.trim()),
          chronicConditions: formData.chronicConditions.filter(c => c.trim())
        };
      } else if (activeTab === 'emergency') {
        endpoint = '/api/profile/emergency-contacts';
        data = {
          emergencyContacts: formData.emergencyContacts.filter(c => c.name && c.phone)
        };
      } else if (activeTab === 'preferences') {
        endpoint = '/api/profile/preferences';
        data = { preferences: formData.preferences };
      }

      const response = await api.put(endpoint, data);
      
      if (response.data.user) {
        await updateProfile(response.data.user);
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: UserCircleIcon },
    { id: 'medical', name: 'Medical Info', icon: HeartIcon },
    { id: 'emergency', name: 'Emergency', icon: PhoneIcon },
    { id: 'preferences', name: 'Preferences', icon: CogIcon },
    { id: 'stats', name: 'Statistics', icon: ChartBarIcon }
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsEditing(false);
                  setMessage({ type: '', text: '' });
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Basic Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-lg font-semibold mb-6">Your Statistics</h2>
              
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900">Reminders</h3>
                    <p className="text-2xl font-bold text-blue-600">{stats.reminders.active}</p>
                    <p className="text-sm text-blue-700">Active reminders</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900">Scans</h3>
                    <p className="text-2xl font-bold text-green-600">{stats.scans.total}</p>
                    <p className="text-sm text-green-700">Total scans performed</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-purple-900">AI Chats</h3>
                    <p className="text-2xl font-bold text-purple-600">{stats.chatMessages}</p>
                    <p className="text-sm text-purple-700">Messages exchanged</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-medium text-yellow-900">Symptom Checks</h3>
                    <p className="text-2xl font-bold text-yellow-600">{stats.symptomChecks}</p>
                    <p className="text-sm text-yellow-700">Health assessments</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-medium text-indigo-900">Reports</h3>
                    <p className="text-2xl font-bold text-indigo-600">{stats.reports}</p>
                    <p className="text-sm text-indigo-700">Medical reports analyzed</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900">This Month</h3>
                    <p className="text-2xl font-bold text-gray-600">{stats.scans.thisMonth}</p>
                    <p className="text-sm text-gray-700">Scans this month</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading statistics...</p>
                </div>
              )}
            </div>
          )}

          {/* Other tabs would be implemented similarly */}
          {activeTab !== 'basic' && activeTab !== 'stats' && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {tabs.find(t => t.id === activeTab)?.name} - Coming Soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;