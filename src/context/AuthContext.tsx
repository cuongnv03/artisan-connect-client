import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { User } from '../types/user.types';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

// Define context types
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESET_ERROR' };

interface AuthContextProps {
  state: AuthState;
  login: (
    emailOrUsername: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  register: (formData: {
    email: string;
    username?: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  resetError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
      };
    case 'RESET_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if token exists on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');

      if (token) {
        try {
          // Verify token validity
          const decodedToken: any = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp < currentTime) {
            // Token expired
            await logout();
          } else {
            // Token valid, fetch user data
            const user = await AuthService.getCurrentUser();
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          dispatch({ type: 'LOGIN_FAILURE', payload: 'Session expired' });
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: '' });
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (
    emailOrUsername: string,
    password: string,
    rememberMe = false,
  ) => {
    dispatch({ type: 'LOGIN_REQUEST' });

    try {
      const response = await AuthService.login({
        emailOrUsername,
        password,
        rememberMe,
      });

      localStorage.setItem('accessToken', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (formData: {
    email: string;
    username?: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    dispatch({ type: 'LOGIN_REQUEST' });

    try {
      const response = await AuthService.register(formData);

      localStorage.setItem('accessToken', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Reset error function
  const resetError = () => {
    dispatch({ type: 'RESET_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        resetError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
