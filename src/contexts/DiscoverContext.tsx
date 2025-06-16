import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export type SearchType = 'all' | 'artisans' | 'users' | 'posts' | 'products';

interface DiscoverState {
  searchQuery: string;
  activeTab: SearchType;
  filters: Record<string, any>;
  currentPage: number;
  loading: boolean;
  results: {
    artisans: any[];
    users: any[];
    posts: any[];
    products: any[];
  };
  totals: {
    artisans: number;
    users: number;
    posts: number;
    products: number;
  };
  pagination: {
    total: number;
    totalPages: number;
    limit: number;
  };
}

type DiscoverAction =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: SearchType }
  | { type: 'SET_FILTERS'; payload: Record<string, any> }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RESULTS'; payload: any }
  | { type: 'RESET_SEARCH' };

interface DiscoverContextType {
  state: DiscoverState;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: SearchType) => void;
  setFilters: (filters: Record<string, any>) => void;
  setCurrentPage: (page: number) => void;
  resetSearch: () => void;
}

const DiscoverContext = createContext<DiscoverContextType | undefined>(
  undefined,
);

const initialState: DiscoverState = {
  searchQuery: '',
  activeTab: 'all',
  filters: {},
  currentPage: 1,
  loading: false,
  results: { artisans: [], users: [], posts: [], products: [] },
  totals: { artisans: 0, users: 0, posts: 0, products: 0 },
  pagination: { total: 0, totalPages: 0, limit: 20 },
};

function discoverReducer(
  state: DiscoverState,
  action: DiscoverAction,
): DiscoverState {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload, currentPage: 1 };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload, currentPage: 1 };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_RESULTS':
      return { ...state, ...action.payload, loading: false };
    case 'RESET_SEARCH':
      return { ...initialState };
    default:
      return state;
  }
}

export const DiscoverProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(discoverReducer, initialState);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('q');
    const type = searchParams.get('type') as SearchType;

    if (query) {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    }
    if (type) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: type });
    }
  }, [searchParams]);

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setActiveTab = (tab: SearchType) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  const setFilters = (filters: Record<string, any>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setCurrentPage = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  const resetSearch = () => {
    dispatch({ type: 'RESET_SEARCH' });
  };

  return (
    <DiscoverContext.Provider
      value={{
        state,
        setSearchQuery,
        setActiveTab,
        setFilters,
        setCurrentPage,
        resetSearch,
      }}
    >
      {children}
    </DiscoverContext.Provider>
  );
};

export const useDiscoverContext = () => {
  const context = useContext(DiscoverContext);
  if (!context) {
    throw new Error('useDiscoverContext must be used within DiscoverProvider');
  }
  return context;
};
