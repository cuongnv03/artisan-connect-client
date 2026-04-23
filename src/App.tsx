import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import { MessageProvider } from './contexts/MessageContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CartProvider } from './contexts/CartContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { PriceNegotiationProvider } from './contexts/PriceNegotiationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { router } from './router';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <ThemeProvider>
            <SocketProvider>
              <MessageProvider>
                <ProfileProvider>
                  <ToastProvider>
                    <PriceNegotiationProvider>
                      <NotificationProvider>
                        <CartProvider>
                          <Suspense
                            fallback={
                              <div className="flex items-center justify-center min-h-screen">
                                <LoadingSpinner size="lg" />
                              </div>
                            }
                          >
                            <RouterProvider router={router} />
                          </Suspense>
                        </CartProvider>
                      </NotificationProvider>
                    </PriceNegotiationProvider>
                  </ToastProvider>
                </ProfileProvider>
              </MessageProvider>
            </SocketProvider>
          </ThemeProvider>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
