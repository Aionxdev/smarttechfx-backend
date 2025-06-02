// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import useLocalStorage from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

export const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
    const [storedTheme, setStoredTheme] = useLocalStorage(LOCAL_STORAGE_KEYS.THEME, 'dark'); // Default to dark
    const [theme, setTheme] = useState(storedTheme);

    useEffect(() => {
        // Apply theme to the body or root element
        document.documentElement.setAttribute('data-theme', theme);
        setStoredTheme(theme); // Persist to localStorage
    }, [theme, setStoredTheme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Memoize context value to prevent unnecessary re-renders of consumers
    const contextValue = useMemo(() => ({
        theme,
        toggleTheme,
    }), [theme]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};