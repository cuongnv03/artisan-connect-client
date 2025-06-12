import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from 'react';
import { User } from '../types/auth';
import { authService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_INITIALIZED' }
  | { type: 'CLEAR_ERROR' };

interface AuthContextType {
  state: AuthState;
  login: (
    emailOrUsername: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  register: (data: {
    email: string;
    username?: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      };
    case 'AUTH_INITIALIZED':
      return {
        ...state,
        isInitialized: true,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const isRefreshing = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      // Prevent multiple initialization
      if (isRefreshing.current) return;

      const token = localStorage.getItem('accessToken');

      if (!token) {
        dispatch({ type: 'AUTH_INITIALIZED' });
        return;
      }

      try {
        // Verify token validity
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          // Token expired, try refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken && !isRefreshing.current) {
            isRefreshing.current = true;
            try {
              const response = await authService.refreshToken(refreshToken);
              localStorage.setItem('accessToken', response.accessToken);
              if (response.refreshToken) {
                localStorage.setItem('refreshToken', response.refreshToken);
              }
              dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
            } finally {
              isRefreshing.current = false;
            }
          } else {
            throw new Error('No refresh token available');
          }
        } else {
          // Token valid, fetch user data
          const user = await authService.getCurrentUser();
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        dispatch({ type: 'AUTH_ERROR', payload: '' });
      }
    };

    initAuth();
  }, []);

  const login = async (
    emailOrUsername: string,
    password: string,
    rememberMe = false,
  ) => {
    dispatch({ type: 'AUTH_START' });

    try {
      console.log('Attempting login with:', { emailOrUsername, rememberMe });

      const response = await authService.login({
        emailOrUsername,
        password,
        rememberMe,
      });

      console.log('Login response:', response);

      localStorage.setItem('accessToken', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error: any) {
      console.log('Login error:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Đăng nhập thất bại';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    username?: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.register(data);

      localStorage.setItem('accessToken', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
