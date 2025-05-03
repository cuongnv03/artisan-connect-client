import React, {
  createContext,
  useReducer,
  useContext,
  Dispatch,
  ReactNode,
} from 'react';
import { AuthProvider, useAuth } from './AuthContext';

// Create a generic context creator for common store patterns
export function createStore<StateType, ActionType>(
  reducer: (state: StateType, action: ActionType) => StateType,
  initialState: StateType,
) {
  type StoreContextType = {
    state: StateType;
    dispatch: Dispatch<ActionType>;
  };

  // Create a context with the appropriate type
  const StoreContext = createContext<StoreContextType | undefined>(undefined);

  // Create a provider component
  const StoreProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const value = { state, dispatch };

    return (
      <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
    );
  };

  // Create a hook to use the store
  const useStore = () => {
    const context = useContext(StoreContext);
    if (context === undefined) {
      throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
  };

  return { StoreProvider, useStore };
}

export { AuthProvider, useAuth };
