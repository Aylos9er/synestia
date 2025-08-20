import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme types
const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
  WIN95: 'win95'
};

// Theme context
const ThemeContext = createContext();

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(THEMES.DARK);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('synestia-theme');
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('synestia-theme', theme);
    // Apply theme class to document body
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const toggleTheme = () => {
    const themes = Object.values(THEMES);
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;