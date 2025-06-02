// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } // Assuming AuthContext is default export from '../contexts/AuthContext.jsx'
    from '../contexts/AuthContext.jsx'; // Adjust path if AuthContext is not default export

/**
 * Custom hook to access authentication context.
 * Throws an error if used outside of an AuthProvider.
 * @returns {object} The authentication context value (e.g., { user, login, logout, isAuthenticated, isLoading, token }).
 */
const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default useAuth;