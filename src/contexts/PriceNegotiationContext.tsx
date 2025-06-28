import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { useSocketContext } from './SocketContext';
import { useToastContext } from './ToastContext';
import { priceNegotiationService } from '../services/price-negotiation.service';
import {
  NegotiationSummary,
  NegotiationStatus,
} from '../types/price-negotiation';

interface PriceNegotiationState {
  // Sent negotiations (where current user is customer)
  sentNegotiations: NegotiationSummary[];
  sentPendingCount: number;
  sentLoading: boolean;

  // Received negotiations (where current user is artisan)
  receivedNegotiations: NegotiationSummary[];
  receivedPendingCount: number;
  receivedLoading: boolean;

  // General state
  isInitialized: boolean;
}

type PriceNegotiationAction =
  // Sent negotiations actions
  | { type: 'SET_SENT_NEGOTIATIONS'; payload: NegotiationSummary[] }
  | { type: 'ADD_SENT_NEGOTIATION'; payload: NegotiationSummary }
  | { type: 'UPDATE_SENT_NEGOTIATION'; payload: NegotiationSummary }
  | { type: 'SET_SENT_LOADING'; payload: boolean }
  | { type: 'UPDATE_SENT_PENDING_COUNT'; payload: number }

  // Received negotiations actions
  | { type: 'SET_RECEIVED_NEGOTIATIONS'; payload: NegotiationSummary[] }
  | { type: 'ADD_RECEIVED_NEGOTIATION'; payload: NegotiationSummary }
  | { type: 'UPDATE_RECEIVED_NEGOTIATION'; payload: NegotiationSummary }
  | { type: 'SET_RECEIVED_LOADING'; payload: boolean }
  | { type: 'UPDATE_RECEIVED_PENDING_COUNT'; payload: number }

  // General actions
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'CLEAR_ALL_DATA' };

interface PriceNegotiationContextType {
  state: PriceNegotiationState;

  // Sent negotiations methods
  refreshSentNegotiations: () => Promise<void>;
  getSentPendingCount: () => number;

  // Received negotiations methods
  refreshReceivedNegotiations: () => Promise<void>;
  getReceivedPendingCount: () => number;

  // General methods
  refreshAllNegotiations: () => Promise<void>;
  markNegotiationAsRead: (
    negotiationId: string,
    type: 'sent' | 'received',
  ) => void;
  handleNegotiationCreated: (negotiation: NegotiationSummary) => void;
  handleNegotiationUpdated: (negotiation: NegotiationSummary) => void;
}

const PriceNegotiationContext = createContext<
  PriceNegotiationContextType | undefined
>(undefined);

const initialState: PriceNegotiationState = {
  sentNegotiations: [],
  sentPendingCount: 0,
  sentLoading: false,

  receivedNegotiations: [],
  receivedPendingCount: 0,
  receivedLoading: false,

  isInitialized: false,
};

function priceNegotiationReducer(
  state: PriceNegotiationState,
  action: PriceNegotiationAction,
): PriceNegotiationState {
  switch (action.type) {
    // Sent negotiations
    case 'SET_SENT_NEGOTIATIONS':
      return {
        ...state,
        sentNegotiations: action.payload,
        sentPendingCount: action.payload.filter(
          (n) => n.status === NegotiationStatus.PENDING,
        ).length,
      };

    case 'ADD_SENT_NEGOTIATION':
      return {
        ...state,
        sentNegotiations: [action.payload, ...state.sentNegotiations],
        sentPendingCount:
          action.payload.status === NegotiationStatus.PENDING
            ? state.sentPendingCount + 1
            : state.sentPendingCount,
      };

    case 'UPDATE_SENT_NEGOTIATION':
      return {
        ...state,
        sentNegotiations: state.sentNegotiations.map((n) =>
          n.id === action.payload.id ? action.payload : n,
        ),
        sentPendingCount:
          state.sentNegotiations.filter(
            (n) =>
              n.id !== action.payload.id &&
              n.status === NegotiationStatus.PENDING,
          ).length +
          (action.payload.status === NegotiationStatus.PENDING ? 1 : 0),
      };

    case 'SET_SENT_LOADING':
      return { ...state, sentLoading: action.payload };

    case 'UPDATE_SENT_PENDING_COUNT':
      return { ...state, sentPendingCount: action.payload };

    // Received negotiations
    case 'SET_RECEIVED_NEGOTIATIONS':
      return {
        ...state,
        receivedNegotiations: action.payload,
        receivedPendingCount: action.payload.filter(
          (n) => n.status === NegotiationStatus.PENDING,
        ).length,
      };

    case 'ADD_RECEIVED_NEGOTIATION':
      return {
        ...state,
        receivedNegotiations: [action.payload, ...state.receivedNegotiations],
        receivedPendingCount:
          action.payload.status === NegotiationStatus.PENDING
            ? state.receivedPendingCount + 1
            : state.receivedPendingCount,
      };

    case 'UPDATE_RECEIVED_NEGOTIATION':
      return {
        ...state,
        receivedNegotiations: state.receivedNegotiations.map((n) =>
          n.id === action.payload.id ? action.payload : n,
        ),
        receivedPendingCount:
          state.receivedNegotiations.filter(
            (n) =>
              n.id !== action.payload.id &&
              n.status === NegotiationStatus.PENDING,
          ).length +
          (action.payload.status === NegotiationStatus.PENDING ? 1 : 0),
      };

    case 'SET_RECEIVED_LOADING':
      return { ...state, receivedLoading: action.payload };

    case 'UPDATE_RECEIVED_PENDING_COUNT':
      return { ...state, receivedPendingCount: action.payload };

    // General actions
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };

    case 'CLEAR_ALL_DATA':
      return {
        ...initialState,
        isInitialized: true,
      };

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
  const { info, success } = useToastContext();

  // Socket listeners for real-time updates
  React.useEffect(() => {
    if (!socket || !authState.isAuthenticated || !authState.user) return;

    // Listen for new negotiations created
    socket.on(
      'price-negotiation-created',
      (negotiation: NegotiationSummary) => {
        handleNegotiationCreated(negotiation);
      },
    );

    // Listen for negotiation updates (responses, status changes)
    socket.on(
      'price-negotiation-updated',
      (negotiation: NegotiationSummary) => {
        handleNegotiationUpdated(negotiation);
      },
    );

    return () => {
      socket.off('price-negotiation-created');
      socket.off('price-negotiation-updated');
    };
  }, [socket, authState.isAuthenticated, authState.user?.id]);

  // Refresh sent negotiations (where current user is customer)
  const refreshSentNegotiations = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.user) return;

    try {
      dispatch({ type: 'SET_SENT_LOADING', payload: true });

      const response = await priceNegotiationService.getMySentNegotiations({
        page: 1,
        limit: 50,
        status: [NegotiationStatus.PENDING, NegotiationStatus.COUNTER_OFFERED],
      });

      dispatch({ type: 'SET_SENT_NEGOTIATIONS', payload: response.data });
    } catch (error) {
      console.error('Error refreshing sent negotiations:', error);
    } finally {
      dispatch({ type: 'SET_SENT_LOADING', payload: false });
    }
  }, [authState.isAuthenticated, authState.user]);

  // Refresh received negotiations (where current user is artisan)
  const refreshReceivedNegotiations = useCallback(async () => {
    if (
      !authState.isAuthenticated ||
      !authState.user ||
      authState.user.role !== 'ARTISAN'
    ) {
      return;
    }

    try {
      dispatch({ type: 'SET_RECEIVED_LOADING', payload: true });

      const response = await priceNegotiationService.getMyReceivedNegotiations({
        page: 1,
        limit: 50,
        status: [NegotiationStatus.PENDING, NegotiationStatus.COUNTER_OFFERED],
      });

      dispatch({ type: 'SET_RECEIVED_NEGOTIATIONS', payload: response.data });
    } catch (error) {
      console.error('Error refreshing received negotiations:', error);
    } finally {
      dispatch({ type: 'SET_RECEIVED_LOADING', payload: false });
    }
  }, [authState.isAuthenticated, authState.user]);

  // Refresh all negotiations
  const refreshAllNegotiations = useCallback(async () => {
    await Promise.all([
      refreshSentNegotiations(),
      refreshReceivedNegotiations(),
    ]);

    if (!state.isInitialized) {
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    }
  }, [
    refreshSentNegotiations,
    refreshReceivedNegotiations,
    state.isInitialized,
  ]);

  // Handle new negotiation created
  const handleNegotiationCreated = useCallback(
    (negotiation: NegotiationSummary) => {
      if (!authState.user) return;

      // If current user is the artisan (received a new negotiation)
      if (negotiation.artisan?.id === authState.user.id) {
        dispatch({ type: 'ADD_RECEIVED_NEGOTIATION', payload: negotiation });
        info('Bạn có yêu cầu thương lượng mới!');
      }

      // If current user is the customer (sent a new negotiation)
      if (negotiation.customer?.id === authState.user.id) {
        dispatch({ type: 'ADD_SENT_NEGOTIATION', payload: negotiation });
        success('Yêu cầu thương lượng đã được gửi!');
      }
    },
    [authState.user, info, success],
  );

  // Handle negotiation updated
  const handleNegotiationUpdated = useCallback(
    (negotiation: NegotiationSummary) => {
      if (!authState.user) return;

      // If current user is the customer (received a response)
      if (negotiation.customer?.id === authState.user.id) {
        dispatch({ type: 'UPDATE_SENT_NEGOTIATION', payload: negotiation });

        // Show notification based on status
        if (negotiation.status === NegotiationStatus.ACCEPTED) {
          success('Nghệ nhân đã chấp nhận thương lượng của bạn!');
        } else if (negotiation.status === NegotiationStatus.REJECTED) {
          info('Nghệ nhân đã từ chối thương lượng của bạn');
        } else if (negotiation.status === NegotiationStatus.COUNTER_OFFERED) {
          info('Nghệ nhân đã gửi đề nghị mới cho bạn!');
        }
      }

      // If current user is the artisan (status changed on their negotiation)
      if (negotiation.artisan?.id === authState.user.id) {
        dispatch({ type: 'UPDATE_RECEIVED_NEGOTIATION', payload: negotiation });
      }
    },
    [authState.user, info, success],
  );

  // Mark negotiation as read
  const markNegotiationAsRead = useCallback(
    (negotiationId: string, type: 'sent' | 'received') => {
      if (type === 'sent') {
        const negotiation = state.sentNegotiations.find(
          (n) => n.id === negotiationId,
        );
        if (negotiation && negotiation.status === NegotiationStatus.PENDING) {
          dispatch({
            type: 'UPDATE_SENT_PENDING_COUNT',
            payload: Math.max(0, state.sentPendingCount - 1),
          });
        }
      } else {
        const negotiation = state.receivedNegotiations.find(
          (n) => n.id === negotiationId,
        );
        if (negotiation && negotiation.status === NegotiationStatus.PENDING) {
          dispatch({
            type: 'UPDATE_RECEIVED_PENDING_COUNT',
            payload: Math.max(0, state.receivedPendingCount - 1),
          });
        }
      }
    },
    [
      state.sentNegotiations,
      state.receivedNegotiations,
      state.sentPendingCount,
      state.receivedPendingCount,
    ],
  );

  // Get pending counts
  const getSentPendingCount = useCallback(() => {
    return state.sentPendingCount;
  }, [state.sentPendingCount]);

  const getReceivedPendingCount = useCallback(() => {
    return state.receivedPendingCount;
  }, [state.receivedPendingCount]);

  // Initialize data when user changes
  React.useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      refreshAllNegotiations();
    } else {
      dispatch({ type: 'CLEAR_ALL_DATA' });
    }
  }, [authState.isAuthenticated, authState.user?.id, refreshAllNegotiations]);

  const value: PriceNegotiationContextType = {
    state,
    refreshSentNegotiations,
    refreshReceivedNegotiations,
    refreshAllNegotiations,
    getSentPendingCount,
    getReceivedPendingCount,
    markNegotiationAsRead,
    handleNegotiationCreated,
    handleNegotiationUpdated,
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

// Helper hook for easy access to pending counts
export function usePriceNegotiationCounts() {
  const { state, getSentPendingCount, getReceivedPendingCount } =
    usePriceNegotiationContext();

  return {
    sentPendingCount: getSentPendingCount(),
    receivedPendingCount: getReceivedPendingCount(),
    totalPendingCount: getSentPendingCount() + getReceivedPendingCount(),
    isLoading: state.sentLoading || state.receivedLoading,
    isInitialized: state.isInitialized,
  };
}

// Helper hook for notifications badge
export function usePriceNegotiationBadge() {
  const { state } = usePriceNegotiationContext();
  const { user } = useAuth().state;

  // For customers: show sent pending count
  // For artisans: show received pending count
  const badgeCount =
    user?.role === 'ARTISAN'
      ? state.receivedPendingCount
      : state.sentPendingCount;

  return {
    count: badgeCount,
    show: badgeCount > 0,
    isLoading: state.sentLoading || state.receivedLoading,
  };
}
