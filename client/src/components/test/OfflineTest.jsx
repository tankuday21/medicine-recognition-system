// Offline and Caching Test Component
// Comprehensive testing of offline functionality and caching strategies

import React, { useState, useCallback, useEffect } from 'react';
import {
  OfflineStatusBanner,
  ConnectionQualityIndicator,
  OfflineModeToggle,
  SyncStatusIndicator,
  GracefulDegradation
} from '../offline/OfflineIndicator';
import {
  useOfflineData,
  useOfflineMutation,
  useOfflineSync,
  useCachedAPI,
  useOfflineStorage,
  useBackgroundSync
} from '../../hooks/useOfflineData';
import { combineClasses } from '../../utils/design-system';
import { offlineManager } from '../../services/offlineManager';
import { apiCache, memoryCache, localStorageCache } from '../../services/cacheManager';

// Mock API functions for testing
const mockAPI = {
  getPatients: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      patients: [
        { id: 1, name: 'John Doe', age: 45, condition: 'Hypertension' },
        { id: 2, name: 'Jane Smith', age: 32, condition: 'Diabetes' },
        { id: 3, name: 'Bob Johnson', age: 67, condition: 'Heart Disease' }
      ],
      timestamp: Date.now()
    };
  },

  createPatient: async (patient) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      ...patient,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
  },

  updatePatient: async (id, updates) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    };
  }
};

const OfflineTest = () => {
  const [activeTab, setActiveTab] = useState('status');
  const [newPatient, setNewPatient] = useState({ name: '', age: '', condition: '' });
  const [cacheStats, setCacheStats] = useState({});

  // Offline data hooks
  const {
    data: patients,
    isLoading: patientsLoading,
    error: patientsError,
    isStale: patientsStale,
    isOffline,
    refetch: refetchPatients
  } = useOfflineData('patients', mockAPI.getPatients, {
    cacheTime: 300000,
    staleTime: 60000
  });

  const {
    mutate: createPatient,
    isLoading: createLoading,
    error: createError
  } = useOfflineMutation(mockAPI.createPatient, {
    onSuccess: () => {
      setNewPatient({ name: '', age: '', condition: '' });
      refetchPatients();
    },
    invalidateKeys: ['patients']
  });

  // Cached API hook
  const {
    data: cachedData,
    isLoading: cachedLoading,
    isStale: cachedStale,
    refetch: refetchCached
  } = useCachedAPI('/api/test-endpoint', {
    method: 'GET',
    enabled: true
  });

  // Sync management
  const { syncStatus, forceSync, clearSyncQueue } = useOfflineSync();

  // Storage management
  const { storageInfo, storeData, getData, clearOldData } = useOfflineStorage();

  // Background sync
  const { isSupported: syncSupported, isRegistered: syncRegistered } = useBackgroundSync();

  // Update cache stats
  useEffect(() => {
    const updateStats = () => {
      setCacheStats({
        memory: memoryCache.getStats(),
        localStorage: localStorageCache.getStats(),
        api: apiCache.getStats()
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreatePatient = useCallback(async () => {
    if (!newPatient.name || !newPatient.age || !newPatient.condition) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await createPatient({
        ...newPatient,
        age: parseInt(newPatient.age)
      });
    } catch (error) {
      console.error('Failed to create patient:', error);
    }
  }, [newPatient, createPatient]);

  const handleStoreTestData = useCallback(async () => {
    const testData = {
      message: 'Test offline storage',
      timestamp: Date.now(),
      random: Math.random()
    };

    const success = await storeData('test-data', testData, 'test');
    alert(success ? 'Data stored successfully' : 'Failed to store data');
  }, [storeData]);

  const handleGetTestData = useCallback(async () => {
    const data = await getData('test-data');
    alert(data ? `Retrieved: ${JSON.stringify(data, null, 2)}` : 'No data found');
  }, [getData]);

  const handleClearCache = useCallback(() => {
    memoryCache.clear();
    localStorageCache.clear();
    apiCache.invalidate('');
    alert('All caches cleared');
  }, []);

  const tabs = [
    { id: 'status', label: 'Offline Status' },
    { id: 'data', label: 'Offline Data' },
    { id: 'cache', label: 'Cache Management' },
    { id: 'sync', label: 'Sync Management' },
    { id: 'storage', label: 'Storage Info' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Offline Status Banner */}
      <OfflineStatusBanner showWhenOnline={true} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Offline & Caching Test Suite
        </h1>
        <p className="text-gray-600 mb-6">
          Comprehensive testing of offline functionality, caching strategies, and data synchronization.
        </p>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-blue-900">Connection</h3>
              <ConnectionQualityIndicator />
            </div>
            <p className="text-sm text-blue-600 mt-1">
              {isOffline ? 'Offline' : 'Online'}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Storage Used</h3>
            <p className="text-lg font-bold text-green-600">
              {Math.round(storageInfo.used / 1024 / 1024)}MB
            </p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900">Sync Status</h3>
            <SyncStatusIndicator detailed={false} />
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900">Background Sync</h3>
            <p className="text-sm text-purple-600">
              {syncSupported ? (syncRegistered ? 'Active' : 'Available') : 'Not Supported'}
            </p>
          </div>
        </div>

        {/* Development Tools */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Development Tools</h3>
          <div className="flex items-center space-x-4">
            <OfflineModeToggle />
            <button
              onClick={handleClearCache}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-200"
            >
              Clear All Caches
            </button>
            <button
              onClick={() => clearOldData()}
              className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors duration-200"
            >
              Clear Old Data
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={combineClasses(
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'status' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Offline Status & Indicators</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Connection Quality</h3>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <ConnectionQualityIndicator showLabel={true} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Sync Status</h3>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <SyncStatusIndicator detailed={true} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Graceful Degradation Examples</h3>
                
                <GracefulDegradation requiresNetwork={true}>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">This feature is available online!</p>
                  </div>
                </GracefulDegradation>

                <GracefulDegradation 
                  requiresNetwork={true}
                  fallback={
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800">Custom offline fallback content</p>
                    </div>
                  }
                >
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">Online-only feature with custom fallback</p>
                  </div>
                </GracefulDegradation>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Offline Data Management</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Patient Data (Offline-First)</h3>
                  
                  {patientsLoading && (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  )}
                  
                  {patientsError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                      Error: {patientsError.message}
                    </div>
                  )}
                  
                  {patients && (
                    <div className="space-y-2">
                      {patientsStale && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
                          Data may be outdated (offline/stale)
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {patients.patients?.map((patient) => (
                          <div key={patient.id} className="p-3 border border-gray-200 rounded">
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-600">
                              Age: {patient.age} | Condition: {patient.condition}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={refetchPatients}
                        className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                      >
                        Refresh Data
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Add New Patient</h3>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Patient Name"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    
                    <input
                      type="number"
                      placeholder="Age"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    
                    <input
                      type="text"
                      placeholder="Condition"
                      value={newPatient.condition}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, condition: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    
                    <button
                      onClick={handleCreatePatient}
                      disabled={createLoading}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                    >
                      {createLoading ? 'Creating...' : 'Add Patient'}
                    </button>
                    
                    {createError && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        {createError.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cache' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Cache Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Memory Cache</h3>
                  <div className="p-4 border border-gray-200 rounded-lg space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Size:</span> {cacheStats.memory?.size || 0}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Max Size:</span> {cacheStats.memory?.maxSize || 0}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Expired:</span> {cacheStats.memory?.expiredItems || 0}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Local Storage Cache</h3>
                  <div className="p-4 border border-gray-200 rounded-lg space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Items:</span> {cacheStats.localStorage?.itemCount || 0}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Size:</span> {Math.round((cacheStats.localStorage?.totalSize || 0) / 1024)}KB
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Expired:</span> {cacheStats.localStorage?.expiredCount || 0}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">API Cache</h3>
                  <div className="p-4 border border-gray-200 rounded-lg space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Memory:</span> {cacheStats.api?.memory?.size || 0}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Storage:</span> {cacheStats.api?.storage?.itemCount || 0}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Pending:</span> {cacheStats.api?.pendingRequests || 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Cached API Test</h3>
                <div className="p-4 border border-gray-200 rounded-lg">
                  {cachedLoading && <p className="text-gray-600">Loading cached data...</p>}
                  {cachedData && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        {cachedStale ? 'Stale cached data:' : 'Fresh cached data:'}
                      </p>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(cachedData, null, 2)}
                      </pre>
                    </div>
                  )}
                  <button
                    onClick={refetchCached}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                  >
                    Refresh Cache
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Sync Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Sync Status</h3>
                  <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span>Active:</span>
                      <span className={syncStatus.isActive ? 'text-blue-600' : 'text-gray-600'}>
                        {syncStatus.isActive ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Progress:</span>
                      <span>{syncStatus.progress}/{syncStatus.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Errors:</span>
                      <span className={syncStatus.errors.length > 0 ? 'text-red-600' : 'text-green-600'}>
                        {syncStatus.errors.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Sync Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={forceSync}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                    >
                      Force Sync Now
                    </button>
                    <button
                      onClick={clearSyncQueue}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                    >
                      Clear Sync Queue
                    </button>
                  </div>
                </div>
              </div>

              {syncStatus.errors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-red-900">Sync Errors</h3>
                  <div className="space-y-1">
                    {syncStatus.errors.map((error, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        {error.message || error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Storage Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Storage Quota</h3>
                  <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span>Used:</span>
                      <span>{Math.round(storageInfo.used / 1024 / 1024)}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span>{Math.round(storageInfo.available / 1024 / 1024)}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Quota:</span>
                      <span>{Math.round(storageInfo.quota / 1024 / 1024)}MB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${storageInfo.quota > 0 ? (storageInfo.used / storageInfo.quota) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Storage Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleStoreTestData}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
                    >
                      Store Test Data
                    </button>
                    <button
                      onClick={handleGetTestData}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                    >
                      Get Test Data
                    </button>
                    <button
                      onClick={() => clearOldData()}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors duration-200"
                    >
                      Clear Old Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineTest;