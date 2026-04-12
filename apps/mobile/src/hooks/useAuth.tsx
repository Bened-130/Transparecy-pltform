import { useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface User {
  id: string;
  phone: string;
  name?: string;
}

interface AuthState {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
  user: User | null;
  error: string | null;
}

type AuthAction =
  | { type: 'RESTORE_TOKEN'; token: string | null; user?: User }
  | { type: 'SIGN_IN'; token: string; user: User }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_ERROR'; error: string };

const initialState: AuthState = {
  isLoading: true,
  isSignout: false,
  userToken: null,
  user: null,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        userToken: action.token,
        user: action.user || null,
        isLoading: false,
      };
    case 'SIGN_IN':
      return {
        ...state,
        isSignout: false,
        userToken: action.token,
        user: action.user,
        error: null,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isSignout: true,
        userToken: null,
        user: null,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isLoading: false,
      };
    default:
      return state;
  }
}

export function useAuth() {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      let userData;

      try {
        userToken = await AsyncStorage.getItem('userToken');
        const userString = await AsyncStorage.getItem('userData');
        userData = userString ? JSON.parse(userString) : null;
      } catch (e) {
        console.error('Failed to restore auth state:', e);
      }

      dispatch({ type: 'RESTORE_TOKEN', token: userToken, user: userData });
    };

    bootstrapAsync();
  }, []);

  const signIn = async (phone: string, otp: string) => {
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp });
      const { token, user } = response.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      dispatch({ type: 'SIGN_IN', token, user });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Authentication failed';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      dispatch({ type: 'SIGN_OUT' });
    } catch (e) {
      console.error('Failed to sign out:', e);
    }
  };

  const requestOTP = async (phone: string) => {
    try {
      await api.post('/auth/request-otp', { phone });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...state,
    signIn,
    signOut,
    requestOTP,
  };
}