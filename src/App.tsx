import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import { MessageProvider } from './contexts/MessageContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CartProvider } from './contexts/CartContext';
import { router } from './router';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider>
            <MessageProvider>
              <ToastProvider>
                <NotificationProvider>
                  <CartProvider>
                    <RouterProvider router={router} />
                  </CartProvider>
                </NotificationProvider>
              </ToastProvider>
            </MessageProvider>
          </SocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
