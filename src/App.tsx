import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { router } from './router';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
