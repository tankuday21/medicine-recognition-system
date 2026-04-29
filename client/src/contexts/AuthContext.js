import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,
  isGuest: localStorage.getItem('mediot_guest_mode') === 'true'
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      localStorage.removeItem('mediot_guest_mode'); // Remove guest mode when logging in
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isGuest: false,
        isLoading: false
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('mediot_guest_mode');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isGuest: false,
        isLoading: false
      };
    case 'SET_GUEST_MODE':
      localStorage.setItem('mediot_guest_mode', 'true');
      return {
        ...state,
        isGuest: true,
        isAuthenticated: false,
        isLoading: false
      };
    case 'LOAD_USER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isGuest: false,
        isLoading: false
      };
    case 'LOAD_USER_FAIL':
      localStorage.removeItem('token');
      const isGuest = localStorage.getItem('mediot_guest_mode') === 'true';
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isGuest: isGuest,
        isLoading: false
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios interceptor for auth token
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    if (state.token) {
      loadUser();
    } else {
      dispatch({ type: 'LOAD_USER_FAIL' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async () => {
    try {
      const response = await api.get('/auth/profile');
      dispatch({ type: 'LOAD_USER_SUCCESS', payload: response.data.user });
    } catch (error) {
      console.error('Load user error:', error);
      dispatch({ type: 'LOAD_USER_FAIL' });
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const setGuestMode = () => {
    dispatch({ type: 'SET_GUEST_MODE' });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      dispatch({ type: 'UPDATE_USER', payload: response.data.user });
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    loadUser,
    setGuestMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};