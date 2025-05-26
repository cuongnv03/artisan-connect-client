import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeConfig } from '../types/theme';
import { TEMPLATES } from '../data/templates';

interface ThemeContextType {
  currentTheme: ThemeConfig | null;
  setTheme: (theme: ThemeConfig) => void;
  resetTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_THEME = TEMPLATES[0].config; // Modern Blue theme

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load theme from localStorage or default
    const savedTheme = localStorage.getItem('userTheme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        setCurrentTheme(theme);
      } catch (error) {
        console.error('Error parsing saved theme:', error);
        setCurrentTheme(DEFAULT_THEME);
      }
    } else {
      setCurrentTheme(DEFAULT_THEME);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (currentTheme) {
      // Apply theme to CSS variables
      applyThemeToDocument(currentTheme);
      // Save to localStorage
      localStorage.setItem('userTheme', JSON.stringify(currentTheme));
    }
  }, [currentTheme]);

  const setTheme = (theme: ThemeConfig) => {
    setCurrentTheme(theme);
  };

  const resetTheme = () => {
    setCurrentTheme(DEFAULT_THEME);
    localStorage.removeItem('userTheme');
  };

  return (
    <ThemeContext.Provider
      value={{ currentTheme, setTheme, resetTheme, isLoading }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Apply theme to CSS custom properties
const applyThemeToDocument = (theme: ThemeConfig) => {
  const root = document.documentElement;

  // Colors
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-surface', theme.colors.surface);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--color-border', theme.colors.border);

  // Typography
  root.style.setProperty('--font-family', theme.typography.fontFamily);
  root.style.setProperty('--font-heading', theme.typography.headingFont);

  // Layout
  root.style.setProperty('--border-radius', theme.layout.borderRadius);

  // Add theme class to body
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${theme.id}`);
};
