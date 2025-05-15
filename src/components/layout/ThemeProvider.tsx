import React from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <div className="font-sans text-artisan-navy bg-artisan-cream min-h-screen">
      {children}
    </div>
  );
};
