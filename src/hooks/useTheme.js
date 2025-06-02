// src/hooks/useTheme.js
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext.jsx'; // Ensure ThemeContext is default or named export

/**
 * Custom hook to access theme context.
 * Throws an error if used outside of a ThemeProvider.
 * @returns {{ theme: string, toggleTheme: Function }}
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};