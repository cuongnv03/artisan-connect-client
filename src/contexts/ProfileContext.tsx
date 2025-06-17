import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Profile, UpdateProfileDto } from '../types/user';
import { userService } from '../services/user.service';
import { useAuth } from './AuthContext';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

type ProfileAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROFILE'; payload: Profile }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

interface ProfileContextType {
  state: ProfileState;
  updateProfile: (data: UpdateProfileDto) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

function profileReducer(
  state: ProfileState,
  action: ProfileAction,
): ProfileState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const { state: authState } = useAuth();

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      refreshProfile();
    }
  }, [authState.isAuthenticated]);

  const refreshProfile = async () => {
    if (!authState.user) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const profile = await userService.getProfile();
      dispatch({ type: 'SET_PROFILE', payload: profile });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateProfile = async (data: UpdateProfileDto) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const updatedProfile = await userService.updateUserProfile(data);
      dispatch({ type: 'SET_PROFILE', payload: updatedProfile });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    state,
    updateProfile,
    refreshProfile,
    clearError,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
