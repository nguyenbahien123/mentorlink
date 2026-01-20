import React, { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext({
    isDarkMode: false,
    toggleTheme: () => { },
});

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check if theme is stored in localStorage
        const savedTheme = localStorage.getItem('theme');
        // If user has previously chosen a theme, use it
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        // If no saved theme, check user's system preference
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Apply theme to document
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark-mode');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.body.classList.remove('dark-mode');
        }

        // Save user preference
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);