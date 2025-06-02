// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
// apiClient is not strictly needed here if authApiService handles all calls.
// However, if you ever needed to clear global Axios headers on logout, it might be.
// import apiClient from '../services/apiClient';
import * as authApiService from '../services/auth.service.js'; // API calls for login, logout, register etc.
import useLocalStorage from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_KEYS, ROUTES, USER_ROLES, UI_STATE } from '../utils/constants'; // Ensure USER_ROLES is imported
import logger from '../utils/logger.util.js';

// 1. Define INITIAL_USER_STATE for useLocalStorage
const INITIAL_USER_STATE = null;

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useLocalStorage(LOCAL_STORAGE_KEYS.AUTH_USER, INITIAL_USER_STATE);
    const [isAuthenticated, setIsAuthenticated] = useState(!!user);
    const [isLoading, setIsLoading] = useState(true); // Start true to check initial auth state
    const [authError, setAuthError] = useState(null); // Renamed from 'error' to be more specific

    const navigate = useNavigate();
    const location = useLocation();

    // Effect to check authentication status on initial load or when user changes
    useEffect(() => {
        if (user) {
            setIsAuthenticated(true);
            // For HttpOnly cookies, browser handles sending. No Axios default header needed for JWT.
        } else {
            setIsAuthenticated(false);
        }
        setIsLoading(false); // Finished initial auth check
    }, [user]);

    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        setAuthError(null);
        try {
            const response = await authApiService.loginUserApi({ email, password });
            if (response.success && response.data.user) {
                const loggedInUser = response.data.user;
                setUser(loggedInUser); // This also triggers the useEffect above
                // setIsAuthenticated(true); // Handled by useEffect based on user
                logger.info('AuthContext: Login successful', { email: loggedInUser.email, role: loggedInUser.role });

                // Role-based redirection
                const intendedPath = location.state?.from?.pathname;
                let redirectTo = ROUTES.HOME; // Default fallback

                if (loggedInUser.role === USER_ROLES.ADMIN) {
                    redirectTo = (intendedPath && intendedPath.startsWith('/admin')) ? intendedPath : ROUTES.ADMIN_DASHBOARD;
                } else if (loggedInUser.role === USER_ROLES.SUPPORT_AGENT) {
                    redirectTo = (intendedPath && intendedPath.startsWith('/support')) ? intendedPath : ROUTES.SUPPORT_DASHBOARD;
                } else { // Default to User (Investor)
                    // Don't redirect to auth pages if intendedPath was one of them
                    const authRoutes = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD];
                    if (intendedPath && !authRoutes.includes(intendedPath)) {
                        redirectTo = intendedPath;
                    } else {
                        redirectTo = ROUTES.USER_DASHBOARD;
                    }
                }
                navigate(redirectTo, { replace: true });
                return { success: true, user: loggedInUser };
            } else {
                // This case should ideally be caught by the catch block if loginUserApi throws for non-success
                const message = response.message || 'Login failed due to an unknown issue.';
                setAuthError(message);
                return { success: false, message };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
            logger.error('AuthContext: Login error', { errorMessage, originalError: err });
            setAuthError(errorMessage);
            // setUser(null); // Already handled if we throw and component catches
            // setIsAuthenticated(false);
            // Don't setIsLoading(false) here, let finally block do it.
            // Re-throw for the component to handle or return specific error structure
            throw new Error(errorMessage); // Re-throw to be caught by LoginForm
        } finally {
            setIsLoading(false);
        }
    }, [setUser, navigate, location.state]);

    const register = useCallback(async (userData) => {
        setIsLoading(true);
        setAuthError(null);
        try {
            const response = await authApiService.registerUserApi(userData);
            if (response.success) {
                logger.info('AuthContext: Registration successful', { email: response.data?.email || userData.email });
                // Navigation to verify email page is handled by RegisterForm component
                return { success: true, message: response.message, data: response.data };
            } else {
                throw new Error(response.message || 'Registration failed.');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
            logger.error('AuthContext: Registration error', { errorMessage, originalError: err });
            setAuthError(errorMessage); // Set error for RegisterForm to potentially display
            throw new Error(errorMessage); // Re-throw
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async (shouldRedirect = true) => {
        setIsLoading(true); // Indicate loading during logout process
        setAuthError(null);
        logger.info('AuthContext: Initiating logout.');
        try {
            await authApiService.logoutUserApi(); // Call API to invalidate session/cookies on backend
            logger.info('AuthContext: Logout API call successful.');
        } catch (err) {
            logger.error('AuthContext: Logout API call failed, proceeding with client-side logout:', err.message);
            // Still proceed with client-side cleanup even if API call fails
        } finally {
            setUser(INITIAL_USER_STATE); // Clear user from localStorage & state
            // setIsAuthenticated(false); // Handled by useEffect based on user
            // Any other client-side cleanup
            // e.g., clear other specific localStorage items related to the user
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('stfx_chatHistory_')) { // Clear chat histories
                    localStorage.removeItem(key);
                }
                if (key.startsWith('stfx_seenBroadcasts_')) { // Clear seen broadcasts
                    localStorage.removeItem(key);
                }
            });
            setIsLoading(false);
            if (shouldRedirect) {
                logger.info('AuthContext: Redirecting to login page after logout.');
                navigate(ROUTES.LOGIN, { replace: true });
            }
        }
    }, [setUser, navigate]);

    const fetchAndUpdateUser = useCallback(async () => {
        if (!isAuthenticated) { // Only if already thought to be authenticated
            logger.debug("AuthContext: fetchAndUpdateUser called but not authenticated, skipping.");
            return;
        }
        logger.debug("AuthContext: Attempting to fetch and update user data.");
        // setIsLoading(true); // Optional: show loading state for this specific action
        try {
            const response = await authApiService.getCurrentUserApi(); // Call GET /auth/me
            if (response.success && response.data) {
                setUser(response.data); // Update user in localStorage and context state
                logger.info("AuthContext: User data refreshed successfully.", response.data.email);
            } else {
                logger.warn('AuthContext: Failed to refresh user data from /auth/me, API call reported non-success. Logging out.', response.message);
                await logout(); // Force logout
            }
        } catch (error) {
            logger.error('AuthContext: Error fetching current user for update:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                logger.warn('AuthContext: Received 401/403 on /auth/me. Logging out.');
                await logout(); // Force logout
            }
            // Do not set global authError here unless desired
        } finally {
            // setIsLoading(false);
        }
    }, [isAuthenticated, setUser, logout]);

    // Memoize the context value to prevent unnecessary re-renders of consumers
    // when the provider's parent re-renders.
    const contextValue = useMemo(() => ({
        user,
        isAuthenticated,
        isLoading, // Global loading state for auth operations
        error: authError, // Global auth error
        login,
        logout,
        register,
        setUser, // Expose setUser if direct manipulation is ever needed (use with caution)
        fetchAndUpdateUser,
        clearAuthError: () => setAuthError(null) // Function to clear auth errors
    }), [user, isAuthenticated, isLoading, authError, login, logout, register, setUser, fetchAndUpdateUser]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
// import PropTypes from 'prop-types';
// import { useNavigate, useLocation } from 'react-router-dom';
// import * as authApiService from '../services/auth.service.js';
// import useLocalStorage from '../hooks/useLocalStorage';
// import { LOCAL_STORAGE_KEYS, ROUTES, USER_ROLES } from '../utils/constants';
// import logger from '../utils/logger.util.js';

// const INITIAL_USER_STATE = null;
// export const AuthContext = createContext(undefined);

// // Global flag to prevent multiple logout triggers from concurrent 401s
// // This flag should be managed carefully.
// if (typeof window !== 'undefined') {
//     window._authSessionFailed = false;
// }


// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useLocalStorage(LOCAL_STORAGE_KEYS.AUTH_USER, INITIAL_USER_STATE);
//     const [isAuthenticated, setIsAuthenticated] = useState(false); // Initialize false
//     const [isLoading, setIsLoading] = useState(true); // Start true to check initial auth state
//     const [authError, setAuthError] = useState(null);

//     const navigate = useNavigate();
//     const location = useLocation();

//     // Effect to set isAuthenticated based on user state from localStorage/initial check
//     useEffect(() => {
//         if (user) {
//             setIsAuthenticated(true);
//             // If user exists, we might want to verify their session on app load
//             // This helps catch cases where localStorage has user but token is long expired
//             // For now, this is handled by API calls failing and triggering logout.
//         } else {
//             setIsAuthenticated(false);
//         }
//         setIsLoading(false); // Finished initial auth check
//     }, [user]);


//     const logout = useCallback(async (isSessionExpired = false) => {
//         // Prevent multiple logout calls if already in process or logged out
//         if (!isAuthenticated && !localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USER)) {
//             // If not redirecting and already on login, do nothing further
//             if (isSessionExpired && location.pathname === ROUTES.LOGIN) return;
//             // If already on login, no need to navigate again unless specifically forced
//             if (location.pathname !== ROUTES.LOGIN) navigate(ROUTES.LOGIN, { replace: true });
//             return;
//         }

//         logger.info(`AuthContext: Initiating logout. Session expired: ${isSessionExpired}`);
//         setIsLoading(true); // Show loading during logout process
//         setAuthError(null);

//         try {
//             await authApiService.logoutUserApi(); // Attempt to invalidate backend session/cookie
//             logger.info('AuthContext: Logout API call successful.');
//         } catch (err) {
//             logger.error('AuthContext: Logout API call failed, proceeding with client-side cleanup:', err.message);
//         } finally {
//             setUser(INITIAL_USER_STATE); // Clears user from localStorage and context state
//             // setIsAuthenticated(false); // This will be set by the useEffect watching `user`

//             // Clear other user-specific local storage items
//             Object.keys(localStorage).forEach(key => {
//                 if (key.startsWith('stfx_chatHistory_') || key.startsWith('stfx_seenBroadcasts_')) {
//                     localStorage.removeItem(key);
//                 }
//             });

//             if (typeof window !== 'undefined') {
//                 window._authSessionFailed = false; // Reset the global flag
//             }
//             setIsLoading(false); // Done with logout process

//             // Only redirect if not already on a public/auth page or if explicitly forced by session expiry
//             const publicAuthPaths = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD, ROUTES.HOME];
//             if (isSessionExpired || !publicAuthPaths.includes(location.pathname)) {
//                 logger.info('AuthContext: Redirecting to login page after logout.');
//                 navigate(ROUTES.LOGIN, {
//                     replace: true,
//                     state: isSessionExpired && location.pathname !== ROUTES.LOGIN ? { from: location, sessionExpired: true } : undefined
//                 });
//             }
//         }
//     }, [setUser, navigate, isAuthenticated, location]);


//     // Listen for the custom event from apiClient to trigger logout
//     useEffect(() => {
//         const handleSessionExpiredLogout = () => {
//             if (typeof window !== 'undefined' && window._authSessionFailed) { // Ensure it was triggered by apiClient
//                 logger.warn("AuthContext: 'auth_session_expired_logout' event received. Logging out.");
//                 logout(true); // Pass true to indicate session expired and force redirect
//             }
//         };

//         if (typeof window !== 'undefined') {
//             window.addEventListener('auth_session_expired_logout', handleSessionExpiredLogout);
//         }
//         return () => {
//             if (typeof window !== 'undefined') {
//                 window.removeEventListener('auth_session_expired_logout', handleSessionExpiredLogout);
//             }
//         };
//     }, [logout]); // `logout` is memoized


//     const login = useCallback(async (email, password) => {
//         if (typeof window !== 'undefined') {
//             window._authSessionFailed = false; // Reset flag on new login attempt
//         }
//         setIsLoading(true);
//         setAuthError(null);
//         try {
//             const response = await authApiService.loginUserApi({ email, password });
//             if (response.success && response.data.user) {
//                 const loggedInUser = response.data.user;
//                 setUser(loggedInUser); // This updates localStorage and triggers useEffect for isAuthenticated
//                 logger.info('AuthContext: Login successful', { email: loggedInUser.email, role: loggedInUser.role });

//                 const intendedPath = location.state?.from?.pathname;
//                 let redirectTo = ROUTES.USER_DASHBOARD; // Default for investor

//                 if (loggedInUser.role === USER_ROLES.ADMIN) {
//                     redirectTo = (intendedPath && intendedPath.startsWith('/admin')) ? intendedPath : ROUTES.ADMIN_DASHBOARD;
//                 } else if (loggedInUser.role === USER_ROLES.SUPPORT_AGENT) {
//                     redirectTo = (intendedPath && intendedPath.startsWith('/support')) ? intendedPath : ROUTES.SUPPORT_DASHBOARD;
//                 } else {
//                     const authRoutes = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD, ROUTES.HOME];
//                     if (intendedPath && !authRoutes.includes(intendedPath)) {
//                         redirectTo = intendedPath;
//                     } else {
//                         redirectTo = ROUTES.USER_DASHBOARD;
//                     }
//                 }
//                 navigate(redirectTo, { replace: true });
//                 return { success: true, user: loggedInUser };
//             } else {
//                 // This path might be hit if apiService doesn't throw for non-2xx but returns success:false
//                 const message = response.message || 'Login failed (unknown reason).';
//                 setAuthError(message);
//                 throw new Error(message); // Ensure an error is thrown for LoginForm
//             }
//         } catch (err) {
//             const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
//             logger.error('AuthContext: Login error', { errorMessage, originalErrorDetails: err });
//             setAuthError(errorMessage);
//             // No need to setUser(null) or setIsAuthenticated(false) here,
//             // as the login attempt failed, existing state remains until logout.
//             throw new Error(errorMessage); // Re-throw for LoginForm to catch
//         } finally {
//             setIsLoading(false);
//         }
//     }, [setUser, navigate, location.state]);

//     const register = useCallback(async (userData) => {
//         setIsLoading(true);
//         setAuthError(null);
//         try {
//             const response = await authApiService.registerUserApi(userData);
//             if (response.success) {
//                 logger.info('AuthContext: Registration successful', { email: response.data?.email || userData.email });
//                 return { success: true, message: response.message || "Registration successful. Please verify your email.", data: response.data };
//             } else {
//                 throw new Error(response.message || 'Registration failed.');
//             }
//         } catch (err) {
//             const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
//             logger.error('AuthContext: Registration error', { errorMessage, originalErrorDetails: err });
//             setAuthError(errorMessage);
//             throw new Error(errorMessage);
//         } finally {
//             setIsLoading(false);
//         }
//     }, []); // No dependencies that change typically

//     const fetchAndUpdateUser = useCallback(async () => {
//         if (!isAuthenticated) {
//             logger.debug("AuthContext: fetchAndUpdateUser - not authenticated, skipping.");
//             return;
//         }
//         logger.debug("AuthContext: Attempting to fetch and update user data via /auth/me.");
//         try {
//             const response = await authApiService.getCurrentUserApi();
//             if (response.success && response.data) {
//                 setUser(response.data);
//                 logger.info("AuthContext: User data refreshed successfully via /auth/me for", response.data.email);
//             } else {
//                 logger.warn('AuthContext: Failed to refresh user data from /auth/me (API non-success). Logging out.', response.message);
//                 await logout(true); // Force logout and redirect
//             }
//         } catch (error) {
//             logger.error('AuthContext: Error fetching current user data for update:', error);
//             if (error.response?.status === 401 || error.response?.status === 403) {
//                 logger.warn('AuthContext: Received 401/403 on /auth/me. Logging out.');
//                 await logout(true); // Force logout and redirect
//             }
//         }
//     }, [isAuthenticated, setUser, logout]);

//     const contextValue = useMemo(() => ({
//         user,
//         isAuthenticated,
//         isLoading,
//         error: authError,
//         login,
//         logout,
//         register,
//         setUser, // Expose setUser carefully
//         fetchAndUpdateUser,
//         clearAuthError: () => setAuthError(null)
//     }), [user, isAuthenticated, isLoading, authError, login, logout, register, setUser, fetchAndUpdateUser]);

//     return (
//         <AuthContext.Provider value={contextValue}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// AuthProvider.propTypes = {
//     children: PropTypes.node.isRequired,
// };