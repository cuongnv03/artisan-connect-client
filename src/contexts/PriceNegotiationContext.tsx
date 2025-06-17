import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { useSocketContext } from './SocketContext';
import { useToastContext } from './ToastContext';
import {
  PriceNegotiationWithDetails,
  NegotiationSummary,
  NegotiationStatus,
} from '../types/price-negotiation';

interface PriceNegotiationState {
  activeNegotiations: NegotiationSummary[];
  pendingCount: number;
  isLoading: boolean;
}

type PriceNegotiationAction =
  | { type: 'SET_NEGOTIATIONS'; payload: NegotiationSummary[] }
  | { type: 'ADD_NEGOTIATION'; payload: NegotiationSummary }
  | { type: 'UPDATE_NEGOTIATION'; payload: NegotiationSummary }
  | { type: 'UPDATE_PENDING_COUNT'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean };

interface PriceNegotiationContextType {
  state: PriceNegotiationState;
  refreshNegotiations: () => void;
  markAsRead: (negotiationId: string) => void;
}

const PriceNegotiationContext = createContext<
  PriceNegotiationContextType | undefined
>(undefined);

const initialState: PriceNegotiationState = {
  activeNegotiations: [],
  pendingCount: 0,
  isLoading: false,
};

function priceNegotiationReducer(
  state: PriceNegotiationState,
  action: PriceNegotiationAction,
): PriceNegotiationState {
  switch (action.type) {
    case 'SET_NEGOTIATIONS':
      return {
        ...state,
        activeNegotiations: action.payload,
        pendingCount: action.payload.filter(
          (n) => n.status === NegotiationStatus.PENDING,
        ).length,
      };
    case 'ADD_NEGOTIATION':
      return {
        ...state,
        activeNegotiations: [action.payload, ...state.activeNegotiations],
        pendingCount:
          action.payload.status === NegotiationStatus.PENDING
            ? state.pendingCount + 1
            : state.pendingCount,
      };
    case 'UPDATE_NEGOTIATION':
      return {
        ...state,
        activeNegotiations: state.activeNegotiations.map((n) =>
          n.id === action.payload.id ? action.payload : n,
        ),
        pendingCount:
          state.activeNegotiations.filter(
            (n) =>
              n.id !== action.payload.id &&
              n.status === NegotiationStatus.PENDING,
          ).length +
          (action.payload.status === NegotiationStatus.PENDING ? 1 : 0),
      };
    case 'UPDATE_PENDING_COUNT':
      return { ...state, pendingCount: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export const PriceNegotiationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(priceNegotiationReducer, initialState);
  const { state: authState } = useAuth();
  const { socket } = useSocketContext();
  const { info } = useToastContext();

  // Socket listeners for real-time updates
  React.useEffect(() => {
    if (!socket || !authState.isAuthenticated) return;

    socket.on(
      'price-negotiation-created',
      (negotiation: NegotiationSummary) => {
        dispatch({ type: 'ADD_NEGOTIATION', payload: negotiation });
        if (authState.user?.role === 'ARTISAN') {
          info('Bạn có yêu cầu thương lượng mới!');
        }
      },
    );

    socket.on(
      'price-negotiation-updated',
      (negotiation: NegotiationSummary) => {
        dispatch({ type: 'UPDATE_NEGOTIATION', payload: negotiation });
        if (authState.user?.role === 'CUSTOMER') {
          info('Artisan đã phản hồi thương lượng của bạn!');
        }
      },
    );

    return () => {
      socket.off('price-negotiation-created');
      socket.off('price-negotiation-updated');
    };
  }, [socket, authState.isAuthenticated, authState.user?.role, info]);

  const refreshNegotiations = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { priceNegotiationService } = await import(
        '../services/price-negotiation.service'
      );
      const response = await priceNegotiationService.getMyNegotiations({
        page: 1,
        limit: 50,
        status: [NegotiationStatus.PENDING, NegotiationStatus.COUNTER_OFFERED],
      });
      dispatch({ type: 'SET_NEGOTIATIONS', payload: response.data });
    } catch (error) {
      console.error('Error refreshing negotiations:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [authState.isAuthenticated]);

  const markAsRead = useCallback(
    (negotiationId: string) => {
      // Mark negotiation as read in the UI
      const negotiation = state.activeNegotiations.find(
        (n) => n.id === negotiationId,
      );
      if (negotiation && negotiation.status === NegotiationStatus.PENDING) {
        dispatch({
          type: 'UPDATE_PENDING_COUNT',
          payload: Math.max(0, state.pendingCount - 1),
        });
      }
    },
    [state.activeNegotiations, state.pendingCount],
  );

  const handleNegotiationCreated = useCallback(
    (negotiation: NegotiationSummary) => {
      dispatch({ type: 'ADD_NEGOTIATION', payload: negotiation });
      if (authState.user?.role === 'ARTISAN') {
        info('Bạn có yêu cầu thương lượng mới!');
      }
    },
    [authState.user?.role, info],
  );

  React.useEffect(() => {
    refreshNegotiations();
  }, [refreshNegotiations]);

  const value = {
    state,
    refreshNegotiations,
    markAsRead,
    handleNegotiationCreated,
  };

  return (
    <PriceNegotiationContext.Provider value={value}>
      {children}
    </PriceNegotiationContext.Provider>
  );
};

export function usePriceNegotiationContext() {
  const context = useContext(PriceNegotiationContext);
  if (context === undefined) {
    throw new Error(
      'usePriceNegotiationContext must be used within a PriceNegotiationProvider',
    );
  }
  return context;
}
