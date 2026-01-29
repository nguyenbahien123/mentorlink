import React, { createContext, useEffect, useContext } from 'react';

// Force light-only theme: no dark mode allowed
export const ThemeContext = createContext({
    isDarkMode: false,
    toggleTheme: () => { },
});

export const ThemeProvider = ({ children }) => {
    const isDarkMode = false; // always light

    // Ensure document uses light theme on mount
    useEffect(() => {
        try {
            document.documentElement.setAttribute('data-theme', 'light');
            document.body.classList.remove('dark-mode');
            // persist light theme to localStorage for consistency (optional)
            localStorage.setItem('theme', 'light');
        } catch (e) {
            // ignore
        }
    }, []);

    const toggleTheme = () => {
        // no-op: theme is fixed to light
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);