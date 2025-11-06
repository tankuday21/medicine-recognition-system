// Offline Data Management Hooks
// React hooks for offline-first data management

import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineManager, offlineAPIClient } from '../services/offlineManager';
import { apiCache } from '../services/cacheManager';
import { useNetworkInfo } from './usePerformance';

/**
 * Offline-First Data Hook
 * Manages data with offline-first strategy
 */
export const useOfflineData = (key, fetchFn, options = {}) => {
  const {
    cacheTime = 300000, // 5 minutes
    staleTime = 60000,  // 1 minute
    refetchOnReconnect = true,
    fallbackData = null,
    syncOnMount = true
  } = options;

  const [data, setData] = useState(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const fetchRef = useRef(fetchFn);
  const networkInfo = useNetworkInfo();

  // Update fetch function reference
  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  // Load cached data on mount
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cached = await offlineManager.getOfflineData(key);
        if (cached) {
          setData(cached);
          setLastFetch(new Date(cached.timestamp || Date.now()));
          
          // Check if data is stale
          const age = Date.now() - (cached.timestamp || 0);
          setIsStale(age > staleTime);
        }
      } catch (err) {
        console.warn('Failed to load cached data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCachedData();
  }, [key, staleTime]);

  // Fetch fresh data
  const fetchData = useCallback(async (force = false) => {
    if (!force && isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchRef.current();
      
      // Store in offline cache
      await offlineManager.storeOfflineData(key, {
        ...result,
        timestamp: Date.now()
      });

      setData(result);
      setLastFetch(new Date());
      setIsStale(false);
      
      return result;
    } catch (err) {
      setError(err);
      
      // Try to use cached data if available
      const cached = await offlineManager.getOfflineData(key);
      if (cached && !data) {
        setData(cached);
        setIsStale(true);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [key, isLoading, data]);

  // Handle network status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (refetchOnReconnect && (isStale || !data)) {
        fetchData();
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchData, refetchOnReconnect, isStale, data]);

  // Initial fetch
  useEffect(() => {
    if (syncOnMount && navigator.onLine && !data) {
      fetchData();
    }
  }, [syncOnMount, data, fetchData]);

  // Auto-refresh stale data
  useEffect(() => {
    if (!isStale || !navigator.onLine) return;

    const timer = setTimeout(() => {
      fetchData();
    }, 1000); // Refresh stale data after 1 second

    return () => clearTimeout(timer);
  }, [isStale, fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return {
    data,
    isLoading,
    error,
    isStale,
    isOffline,
    lastFetch,
    refetch,
    networkQuality: networkInfo.effectiveType
  };
};

/**
 * Offline Mutation Hook
 * Handles data mutations with offline queueing
 */
export const useOfflineMutation = (mutationFn, options = {}) => {
  const {
    onSuccess,
    onError,
    onSettled,
    optimisticUpdate = true,
    invalidateKeys = []
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(async (variables, mutationOptions = {}) => {
    setIsLoading(true);
    setError(null);

    const {
      optimistic = optimisticUpdate,
      onMutationSuccess = onSuccess,
      onMutationError = onError,
      onMutationSettled = onSettled
    } = mutationOptions;

    try {
      let result;

      if (navigator.onLine) {
        // Online: execute mutation immediately
        result = await mutationFn(variables);
        setData(result);
        
        // Invalidate related cache keys
        for (const key of invalidateKeys) {
          await offlineManager.storeOfflineData(key, null);
        }
        
        onMutationSuccess?.(result, variables);
      } else {
        // Offline: queue mutation and apply optimistic update
        await offlineManager.addOfflineAction({
          type: 'mutation',
          mutationFn: mutationFn.toString(),
          variables,
          timestamp: Date.now()
        });

        if (optimistic) {
          // Apply optimistic update
          result = { ...variables, _optimistic: true, _timestamp: Date.now() };
          setData(result);
          onMutationSuccess?.(result, variables);
        }
      }

      return result;
    } catch (err) {
      setError(err);
      onMutationError?.(err, variables);
      throw err;
    } finally {
      setIsLoading(false);
      onMutationSettled?.(data, error, variables);
    }
  }, [mutationFn, optimisticUpdate, onSuccess, onError, onSettled, invalidateKeys, data, error]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    mutate,
    data,
    error,
    isLoading,
    reset
  };
};

/**
 * Offline Sync Hook
 * Manages synchronization of offline actions
 */
export const useOfflineSync = () => {
  const [syncStatus, setSyncStatus] = useState({
    isActive: false,
    progress: 0,
    total: 0,
    errors: []
  });

  useEffect(() => {
    const handleSyncEvents = (event) => {
      switch (event.type) {
        case 'sync-start':
          setSyncStatus(prev => ({ ...prev, isActive: true, errors: [] }));
          break;
          
        case 'sync-progress':
          setSyncStatus(prev => ({
            ...prev,
            progress: event.data.completed,
            total: event.data.total
          }));
          break;
          
        case 'sync-complete':
          setSyncStatus(prev => ({
            ...prev,
            isActive: false,
            progress: event.data.length,
            total: event.data.length
          }));
          break;
          
        case 'sync-error':
          setSyncStatus(prev => ({
            ...prev,
            errors: [...prev.errors, event.data]
          }));
          break;
      }
    };

    offlineManager.addEventListener(handleSyncEvents);
    return () => offlineManager.removeEventListener(handleSyncEvents);
  }, []);

  const forceSync = useCallback(async () => {
    try {
      await offlineManager.forcSync();
    } catch (error) {
      console.error('Force sync failed:', error);
      throw error;
    }
  }, []);

  const clearSyncQueue = useCallback(async () => {
    try {
      await offlineManager.clearAllOfflineData();
      setSyncStatus({
        isActive: false,
        progress: 0,
        total: 0,
        errors: []
      });
    } catch (error) {
      console.error('Clear sync queue failed:', error);
      throw error;
    }
  }, []);

  return {
    syncStatus,
    forceSync,
    clearSyncQueue
  };
};

/**
 * Cached API Hook
 * Uses API cache with stale-while-revalidate strategy
 */
export const useCachedAPI = (url, options = {}) => {
  const {
    method = 'GET',
    body,
    headers = {},
    cacheTime = 300000, // 5 minutes
    staleTime = 60000,  // 1 minute
    enabled = true
  } = options;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCache.cachedFetch(url, {
        method,
        body,
        headers
      });

      setData(result);
      setIsStale(false);
    } catch (err) {
      setError(err);
      
      // Try to get stale cached data
      const cached = await apiCache.get(url, { method, body, headers });
      if (cached) {
        setData(cached.data);
        setIsStale(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [url, method, body, headers, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    // Invalidate cache and refetch
    apiCache.invalidate(url);
    return fetchData();
  }, [url, fetchData]);

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch
  };
};

/**
 * Offline Storage Hook
 * Direct interface to offline storage
 */
export const useOfflineStorage = () => {
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    available: 0,
    quota: 0
  });

  useEffect(() => {
    const updateStorageInfo = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          setStorageInfo({
            used: estimate.usage || 0,
            available: (estimate.quota || 0) - (estimate.usage || 0),
            quota: estimate.quota || 0
          });
        } catch (error) {
          console.warn('Failed to get storage estimate:', error);
        }
      }
    };

    updateStorageInfo();
    
    // Update every 30 seconds
    const interval = setInterval(updateStorageInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  const storeData = useCallback(async (key, data, type = 'general') => {
    try {
      await offlineManager.storeOfflineData(key, data, type);
      return true;
    } catch (error) {
      console.error('Failed to store offline data:', error);
      return false;
    }
  }, []);

  const getData = useCallback(async (key) => {
    try {
      return await offlineManager.getOfflineData(key);
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }, []);

  const getDataByType = useCallback(async (type) => {
    try {
      return await offlineManager.getOfflineDataByType(type);
    } catch (error) {
      console.error('Failed to get offline data by type:', error);
      return [];
    }
  }, []);

  const clearOldData = useCallback(async (maxAge = 7 * 24 * 60 * 60 * 1000) => {
    try {
      return await offlineManager.clearOldOfflineData(maxAge);
    } catch (error) {
      console.error('Failed to clear old offline data:', error);
      return 0;
    }
  }, []);

  return {
    storageInfo,
    storeData,
    getData,
    getDataByType,
    clearOldData
  };
};

/**
 * Background Sync Hook
 * Manages background synchronization
 */
export const useBackgroundSync = (tag = 'offline-sync') => {
  const [isSupported] = useState('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype);
  const [isRegistered, setIsRegistered] = useState(false);

  const registerSync = useCallback(async () => {
    if (!isSupported) {
      console.warn('Background sync not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      setIsRegistered(true);
      return true;
    } catch (error) {
      console.error('Failed to register background sync:', error);
      return false;
    }
  }, [isSupported, tag]);

  useEffect(() => {
    if (isSupported) {
      registerSync();
    }
  }, [isSupported, registerSync]);

  return {
    isSupported,
    isRegistered,
    registerSync
  };
};

export default {
  useOfflineData,
  useOfflineMutation,
  useOfflineSync,
  useCachedAPI,
  useOfflineStorage,
  useBackgroundSync
};