import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext';
import { MessageProvider } from './context/MessageContext';
import AppRoutes from './routes';
import './styles/index.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MessageProvider>
          <AppRoutes />
        </MessageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
