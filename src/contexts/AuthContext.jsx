// // // import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
// // // import PropTypes from 'prop-types';
// // // import { useNavigate, useLocation } from 'react-router-dom';
// // // import * as authApiService from '../services/auth.service.js';
// // // import useLocalStorage from '../hooks/useLocalStorage';
// // // import { LOCAL_STORAGE_KEYS, ROUTES, USER_ROLES } from '../utils/constants';
// // // import logger from '../utils/logger.util.js';

// // // const INITIAL_USER_STATE = null;
// // // export const AuthContext = createContext(undefined);

// // // // Global flag to prevent multiple logout triggers from concurrent 401s
// // // // This flag should be managed carefully.
// // // if (typeof window !== 'undefined') {
// // //     window._authSessionFailed = false;
// // // }


// // // export const AuthProvider = ({ children }) => {
// // //     const [user, setUser] = useLocalStorage(LOCAL_STORAGE_KEYS.AUTH_USER, INITIAL_USER_STATE);
// // //     const [isAuthenticated, setIsAuthenticated] = useState(false); // Initialize false
// // //     const [isLoading, setIsLoading] = useState(true); // Start true to check initial auth state
// // //     const [authError, setAuthError] = useState(null);

// // //     const navigate = useNavigate();
// // //     const location = useLocation();

// // //     // Effect to set isAuthenticated based on user state from localStorage/initial check
// // //     useEffect(() => {
// // //         if (user) {
// // //             setIsAuthenticated(true);
// // //             // If user exists, we might want to verify their session on app load
// // //             // This helps catch cases where localStorage has user but token is long expired
// // //             // For now, this is handled by API calls failing and triggering logout.
// // //         } else {
// // //             setIsAuthenticated(false);
// // //         }
// // //         setIsLoading(false); // Finished initial auth check
// // //     }, [user]);


// // //     const logout = useCallback(async (isSessionExpired = false) => {
// // //         // Prevent multiple logout calls if already in process or logged out
// // //         if (!isAuthenticated && !localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USER)) {
// // //             // If not redirecting and already on login, do nothing further
// // //             if (isSessionExpired && location.pathname === ROUTES.LOGIN) return;
// // //             // If already on login, no need to navigate again unless specifically forced
// // //             if (location.pathname !== ROUTES.LOGIN) navigate(ROUTES.LOGIN, { replace: true });
// // //             return;
// // //         }

// // //         logger.info(`AuthContext: Initiating logout. Session expired: ${isSessionExpired}`);
// // //         setIsLoading(true); // Show loading during logout process
// // //         setAuthError(null);

// // //         try {
// // //             await authApiService.logoutUserApi(); // Attempt to invalidate backend session/cookie
// // //             logger.info('AuthContext: Logout API call successful.');
// // //         } catch (err) {
// // //             logger.error('AuthContext: Logout API call failed, proceeding with client-side cleanup:', err.message);
// // //         } finally {
// // //             setUser(INITIAL_USER_STATE); // Clears user from localStorage and context state
// // //             // setIsAuthenticated(false); // This will be set by the useEffect watching `user`

// // //             // Clear other user-specific local storage items
// // //             Object.keys(localStorage).forEach(key => {
// // //                 if (key.startsWith('stfx_chatHistory_') || key.startsWith('stfx_seenBroadcasts_')) {
// // //                     localStorage.removeItem(key);
// // //                 }
// // //             });

// // //             if (typeof window !== 'undefined') {
// // //                 window._authSessionFailed = false; // Reset the global flag
// // //             }
// // //             setIsLoading(false); // Done with logout process

// // //             // Only redirect if not already on a public/auth page or if explicitly forced by session expiry
// // //             const publicAuthPaths = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD, ROUTES.HOME];
// // //             if (isSessionExpired || !publicAuthPaths.includes(location.pathname)) {
// // //                 logger.info('AuthContext: Redirecting to login page after logout.');
// // //                 navigate(ROUTES.LOGIN, {
// // //                     replace: true,
// // //                     state: isSessionExpired && location.pathname !== ROUTES.LOGIN ? { from: location, sessionExpired: true } : undefined
// // //                 });
// // //             }
// // //         }
// // //     }, [setUser, navigate, isAuthenticated, location]);


// // //     // Listen for the custom event from apiClient to trigger logout
// // //     useEffect(() => {
// // //         const handleSessionExpiredLogout = () => {
// // //             if (typeof window !== 'undefined' && window._authSessionFailed) { // Ensure it was triggered by apiClient
// // //                 logger.warn("AuthContext: 'auth_session_expired_logout' event received. Logging out.");
// // //                 logout(true); // Pass true to indicate session expired and force redirect
// // //             }
// // //         };

// // //         if (typeof window !== 'undefined') {
// // //             window.addEventListener('auth_session_expired_logout', handleSessionExpiredLogout);
// // //         }
// // //         return () => {
// // //             if (typeof window !== 'undefined') {
// // //                 window.removeEventListener('auth_session_expired_logout', handleSessionExpiredLogout);
// // //             }
// // //         };
// // //     }, [logout]); // `logout` is memoized


// // //     const login = useCallback(async (email, password) => {
// // //         if (typeof window !== 'undefined') {
// // //             window._authSessionFailed = false; // Reset flag on new login attempt
// // //         }
// // //         setIsLoading(true);
// // //         setAuthError(null);
// // //         try {
// // //             const response = await authApiService.loginUserApi({ email, password });
// // //             if (response.success && response.data.user) {
// // //                 const loggedInUser = response.data.user;
// // //                 setUser(loggedInUser); // This updates localStorage and triggers useEffect for isAuthenticated
// // //                 logger.info('AuthContext: Login successful', { email: loggedInUser.email, role: loggedInUser.role });

// // //                 const intendedPath = location.state?.from?.pathname;
// // //                 let redirectTo = ROUTES.USER_DASHBOARD; // Default for investor

// // //                 if (loggedInUser.role === USER_ROLES.ADMIN) {
// // //                     redirectTo = (intendedPath && intendedPath.startsWith('/admin')) ? intendedPath : ROUTES.ADMIN_DASHBOARD;
// // //                 } else if (loggedInUser.role === USER_ROLES.SUPPORT_AGENT) {
// // //                     redirectTo = (intendedPath && intendedPath.startsWith('/support')) ? intendedPath : ROUTES.SUPPORT_DASHBOARD;
// // //                 } else {
// // //                     const authRoutes = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD, ROUTES.HOME];
// // //                     if (intendedPath && !authRoutes.includes(intendedPath)) {
// // //                         redirectTo = intendedPath;
// // //                     } else {
// // //                         redirectTo = ROUTES.USER_DASHBOARD;
// // //                     }
// // //                 }
// // //                 navigate(redirectTo, { replace: true });
// // //                 return { success: true, user: loggedInUser };
// // //             } else {
// // //                 // This path might be hit if apiService doesn't throw for non-2xx but returns success:false
// // //                 const message = response.message || 'Login failed (unknown reason).';
// // //                 setAuthError(message);
// // //                 throw new Error(message); // Ensure an error is thrown for LoginForm
// // //             }
// // //         } catch (err) {
// // //             const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
// // //             logger.error('AuthContext: Login error', { errorMessage, originalErrorDetails: err });
// // //             setAuthError(errorMessage);
// // //             // No need to setUser(null) or setIsAuthenticated(false) here,
// // //             // as the login attempt failed, existing state remains until logout.
// // //             throw new Error(errorMessage); // Re-throw for LoginForm to catch
// // //         } finally {
// // //             setIsLoading(false);
// // //         }
// // //     }, [setUser, navigate, location.state]);

// // //     const register = useCallback(async (userData) => {
// // //         setIsLoading(true);
// // //         setAuthError(null);
// // //         try {
// // //             const response = await authApiService.registerUserApi(userData);
// // //             if (response.success) {
// // //                 logger.info('AuthContext: Registration successful', { email: response.data?.email || userData.email });
// // //                 return { success: true, message: response.message || "Registration successful. Please verify your email.", data: response.data };
// // //             } else {
// // //                 throw new Error(response.message || 'Registration failed.');
// // //             }
// // //         } catch (err) {
// // //             const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
// // //             logger.error('AuthContext: Registration error', { errorMessage, originalErrorDetails: err });
// // //             setAuthError(errorMessage);
// // //             throw new Error(errorMessage);
// // //         } finally {
// // //             setIsLoading(false);
// // //         }
// // //     }, []); // No dependencies that change typically

// // //     const fetchAndUpdateUser = useCallback(async () => {
// // //         if (!isAuthenticated) {
// // //             logger.debug("AuthContext: fetchAndUpdateUser - not authenticated, skipping.");
// // //             return;
// // //         }
// // //         logger.debug("AuthContext: Attempting to fetch and update user data via /auth/me.");
// // //         try {
// // //             const response = await authApiService.getCurrentUserApi();
// // //             if (response.success && response.data) {
// // //                 setUser(response.data);
// // //                 logger.info("AuthContext: User data refreshed successfully via /auth/me for", response.data.email);
// // //             } else {
// // //                 logger.warn('AuthContext: Failed to refresh user data from /auth/me (API non-success). Logging out.', response.message);
// // //                 await logout(true); // Force logout and redirect
// // //             }
// // //         } catch (error) {
// // //             logger.error('AuthContext: Error fetching current user data for update:', error);
// // //             if (error.response?.status === 401 || error.response?.status === 403) {
// // //                 logger.warn('AuthContext: Received 401/403 on /auth/me. Logging out.');
// // //                 await logout(true); // Force logout and redirect
// // //             }
// // //         }
// // //     }, [isAuthenticated, setUser, logout]);

// // //     const contextValue = useMemo(() => ({
// // //         user,
// // //         isAuthenticated,
// // //         isLoading,
// // //         error: authError,
// // //         login,
// // //         logout,
// // //         register,
// // //         setUser, // Expose setUser carefully
// // //         fetchAndUpdateUser,
// // //         clearAuthError: () => setAuthError(null)
// // //     }), [user, isAuthenticated, isLoading, authError, login, logout, register, setUser, fetchAndUpdateUser]);

// // //     return (
// // //         <AuthContext.Provider value={contextValue}>
// // //             {children}
// // //         </AuthContext.Provider>
// // //     );
// // // };

// // // AuthProvider.propTypes = {
// // //     children: PropTypes.node.isRequired,
// // // };

// // src/contexts/AuthContext.jsx
// import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
// import PropTypes from 'prop-types';
// import { useNavigate, useLocation } from 'react-router-dom';
// import * as authApiService from '../services/auth.service.js';
// import useLocalStorage from '../hooks/useLocalStorage';
// import { LOCAL_STORAGE_KEYS, ROUTES, USER_ROLES } from '../utils/constants';
// import logger from '../utils/logger.util.js';

// const INITIAL_USER_STATE = null;
// export const AuthContext = createContext({
//     user: INITIAL_USER_STATE,
//     isAuthenticated: false,
//     isLoading: true,
//     authError: null,
//     login: async () => { throw new Error("Login function not yet implemented in AuthContext") },
//     logout: async () => { throw new Error("Logout function not yet implemented in AuthContext") },
//     register: async () => { throw new Error("Register function not yet implemented in AuthContext") },
//     fetchAndUpdateUser: async () => { throw new Error("fetchAndUpdateUser function not yet implemented") },
//     clearAuthError: () => { },
//     token: null, // Placeholder if you ever need to expose token directly (not for HttpOnly)
// });

// // Global flag to manage if a session expiry logout is already in progress
// // This helps prevent multiple logout triggers from concurrent 401s.
// if (typeof window !== 'undefined') {
//     window._isLoggingOutDueToExpiry = false;
// }

// export const AuthProvider = ({ children }) => {
//     const [user, setUserInLocalStorage] = useLocalStorage(LOCAL_STORAGE_KEYS.AUTH_USER, INITIAL_USER_STATE);
//     const [currentUser, setCurrentUser] = useState(user); // Local state for current user, synced with localStorage
//     const [isAuthenticated, setIsAuthenticated] = useState(!!user);
//     const [isLoading, setIsLoading] = useState(true); // Start true: checking initial auth state
//     const [authError, setAuthError] = useState(null);
//     // We don't store the actual JWT token in context if it's HttpOnly.
//     // The 'token' in context could be used if you ever switch to client-side token storage.

//     const navigate = useNavigate();
//     const location = useLocation();

//     // Sync local currentUser state with user from localStorage on initial load or if 'user' (from LS) changes
//     useEffect(() => {
//         logger.debug("AuthContext: User from localStorage changed or initial load.", user);
//         setCurrentUser(user);
//         setIsAuthenticated(!!user);
//         setIsLoading(false); // Finished initial check based on localStorage
//     }, [user]);


//     const logout = useCallback(async (isTriggeredBySessionExpiry = false) => {
//         // Prevent multiple logout calls if already in process or logged out
//         if (!isAuthenticated && !currentUser) {
//             logger.info("AuthContext: Logout called but already effectively logged out.");
//             // If already on login and triggered by session expiry, don't navigate again
//             if (isTriggeredBySessionExpiry && location.pathname === ROUTES.LOGIN) return;
//             if (location.pathname !== ROUTES.LOGIN) navigate(ROUTES.LOGIN, { replace: true });
//             return;
//         }

//         logger.info(`AuthContext: Initiating logout. Triggered by session expiry: ${isTriggeredBySessionExpiry}`);
//         setIsLoading(true); // Indicate process is starting
//         setAuthError(null);

//         try {
//             await authApiService.logoutUserApi(); // Attempt to invalidate backend session/cookie
//             logger.info('AuthContext: Logout API call successful.');
//         } catch (err) {
//             logger.error('AuthContext: Logout API call failed, proceeding with client-side cleanup:', err.message);
//         } finally {
//             setUserInLocalStorage(INITIAL_USER_STATE); // Clears user from localStorage
//             setCurrentUser(INITIAL_USER_STATE);      // Clears local context state
//             setIsAuthenticated(false);                // Explicitly set auth status

//             Object.keys(localStorage).forEach(key => {
//                 if (key.startsWith('stfx_chatHistory_') || key.startsWith('stfx_seenBroadcasts_')) {
//                     localStorage.removeItem(key);
//                 }
//             });

//             if (typeof window !== 'undefined') {
//                 window._isLoggingOutDueToExpiry = false; // Reset the flag
//             }
//             setIsLoading(false);

//             logger.info('AuthContext: Logout process complete. Navigating to login.');
//             navigate(ROUTES.LOGIN, {
//                 replace: true,
//                 state: isTriggeredBySessionExpiry ? { from: location, sessionExpired: true } : undefined
//             });
//         }
//     }, [setUserInLocalStorage, navigate, isAuthenticated, currentUser, location]);


//     // Listen for the custom event from apiClient to trigger logout
//     useEffect(() => {
//         const handleSessionExpiredLogout = () => {
//             if (typeof window !== 'undefined' && !window._isLoggingOutDueToExpiry) {
//                 window._isLoggingOutDueToExpiry = true; // Set flag to prevent multiple triggers
//                 logger.warn("AuthContext: 'auth_session_expired_logout' event received. Initiating logout.");
//                 logout(true); // Pass true to indicate it's due to session expiry
//             } else if (typeof window !== 'undefined' && window._isLoggingOutDueToExpiry) {
//                 logger.info("AuthContext: 'auth_session_expired_logout' event received, but logout already in progress.");
//             }
//         };

//         if (typeof window !== 'undefined') {
//             window.addEventListener('auth_session_expired_logout', handleSessionExpiredLogout);
//             logger.info("AuthContext: Event listener for 'auth_session_expired_logout' attached.");
//         }
//         return () => {
//             if (typeof window !== 'undefined') {
//                 window.removeEventListener('auth_session_expired_logout', handleSessionExpiredLogout);
//                 logger.info("AuthContext: Event listener for 'auth_session_expired_logout' removed.");
//             }
//         };
//     }, [logout]); // Depends on the memoized logout function


//     const login = useCallback(async (email, password) => {
//         if (typeof window !== 'undefined') {
//             window._isLoggingOutDueToExpiry = false; // Reset any pending expiry logout state
//         }
//         setIsLoading(true);
//         setAuthError(null);
//         try {
//             const response = await authApiService.loginUserApi({ email, password });
//             if (response.success && response.data.user) {
//                 const loggedInUser = response.data.user;
//                 // IMPORTANT: Set user in localStorage first, then local state, then isAuthenticated
//                 setUserInLocalStorage(loggedInUser);
//                 setCurrentUser(loggedInUser);
//                 setIsAuthenticated(true);
//                 logger.info('AuthContext: Login successful', { email: loggedInUser.email, role: loggedInUser.role });

//                 const intendedPath = location.state?.from?.pathname;
//                 let redirectTo = ROUTES.USER_DASHBOARD;

//                 if (loggedInUser.role === USER_ROLES.ADMIN) {
//                     redirectTo = (intendedPath && intendedPath.startsWith('/admin')) ? intendedPath : ROUTES.ADMIN_DASHBOARD;
//                 } else if (loggedInUser.role === USER_ROLES.SUPPORT_AGENT) {
//                     redirectTo = (intendedPath && intendedPath.startsWith('/support')) ? intendedPath : ROUTES.SUPPORT_DASHBOARD;
//                 } else {
//                     const authRoutes = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD, ROUTES.HOME];
//                     if (intendedPath && !authRoutes.includes(intendedPath) && intendedPath !== '/') {
//                         redirectTo = intendedPath;
//                     } else {
//                         redirectTo = ROUTES.USER_DASHBOARD;
//                     }
//                 }
//                 logger.info(`AuthContext: Navigating to ${redirectTo} after login.`);
//                 navigate(redirectTo, { replace: true });
//                 return { success: true, user: loggedInUser };
//             } else {
//                 const message = response.message || 'Login failed. Please check your credentials.';
//                 setAuthError(message);
//                 throw new Error(message); // Propagate error for LoginForm
//             }
//         } catch (err) {
//             const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
//             logger.error('AuthContext: Login error', { errorMessage, originalErrorDetails: err });
//             setAuthError(errorMessage);
//             setCurrentUser(INITIAL_USER_STATE); // Ensure user state is cleared on failed login
//             setIsAuthenticated(false);
//             throw new Error(errorMessage);
//         } finally {
//             setIsLoading(false);
//         }
//     }, [setUserInLocalStorage, navigate, location.state]);

    // const register = useCallback(async (userData) => {
    //     // ... (register logic as before, ensure it throws error for form to catch)
    //     setIsLoading(true);
    //     setAuthError(null);
    //     try {
    //         const response = await authApiService.registerUserApi(userData);
    //         if (response.success) {
    //             logger.info('AuthContext: Registration successful', { email: response.data?.email || userData.email });
    //             return { success: true, message: response.message || "Registration successful.", data: response.data };
    //         } else {
    //             throw new Error(response.message || 'Registration failed.');
    //         }
    //     } catch (err) {
    //         const errorMessage = err.response?.data?.message || err.message || 'Registration failed.';
    //         setAuthError(errorMessage);
    //         throw new Error(errorMessage);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }, []);

//     const fetchAndUpdateUser = useCallback(async () => {
//         // This function is usually called when app loads or user revisits after a while
//         // to ensure the context `user` is up-to-date with the backend,
//         // and to implicitly verify the active session token.
//         if (!isAuthenticated && !localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USER)) {
//             logger.debug("AuthContext: fetchAndUpdateUser - no persisted user or not authenticated, skipping /me call.");
//             setIsLoading(false); // Ensure loading is false if we skip
//             return;
//         }

//         logger.debug("AuthContext: Attempting to fetch and update user data via /auth/me.");
//         // Don't set global isLoading here to avoid full page loader, unless desired
//         // const previousIsLoading = isLoading;
//         // setIsLoading(true);
//         try {
//             const response = await authApiService.getCurrentUserApi();
//             if (response.success && response.data) {
//                 setUserInLocalStorage(response.data); // This will trigger the useEffect to update currentUser and isAuthenticated
//                 logger.info("AuthContext: User data refreshed successfully via /auth/me for", response.data.email);
//             } else {
//                 logger.warn('AuthContext: Failed to refresh user data from /auth/me (API non-success), logging out.', response.message);
//                 await logout(true);
//             }
//         } catch (error) {
//             logger.error('AuthContext: Error fetching current user data for update:', error);
//             if (error.response?.status === 401 || error.response?.status === 403) {
//                 logger.warn('AuthContext: Received 401/403 on /auth/me. Logging out.');
//                 await logout(true);
//             }
//         } finally {
//             // setIsLoading(previousIsLoading); // Restore previous loading state or just false
//             // setIsLoading(false); // If we set it true at the start of this func
//         }
//     }, [isAuthenticated, setUserInLocalStorage, logout]);


//     // Initial check on app load - if a user exists in localStorage, try to validate them.
//     // This helps catch cases where localStorage has a user but their token is actually invalid from the start.
//     useEffect(() => {
//         const validatePersistedUser = async () => {
//             const persistedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USER);
//             if (persistedUser) {
//                 logger.info("AuthContext: Persisted user found in localStorage, attempting to validate session via /auth/me.");
//                 // We don't want to set main isLoading here, fetchAndUpdateUser can manage its own if needed
//                 await fetchAndUpdateUser(); // This will call /auth/me
//             } else {
//                 setIsLoading(false); // No user in LS, nothing to validate, stop initial loading.
//             }
//         };
//         validatePersistedUser();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []); // Run only once on initial mount


//     const contextValue = useMemo(() => ({
//         user: currentUser, // Use the local state `currentUser` for consumers
//         isAuthenticated,
//         isLoading,
//         error: authError,
//         login,
//         logout,
//         register,
//         setUser: setUserInLocalStorage, // This will update localStorage and subsequently currentUser
//         fetchAndUpdateUser,
//         clearAuthError: () => setAuthError(null)
//     }), [currentUser, isAuthenticated, isLoading, authError, login, logout, register, setUserInLocalStorage, fetchAndUpdateUser]);

//     return (
//         <AuthContext.Provider value={contextValue}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// AuthProvider.propTypes = {
//     children: PropTypes.node.isRequired,
// };

// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import * as authApiService from '../services/auth.service.js';
import useLocalStorage from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_KEYS, ROUTES, USER_ROLES } from '../utils/constants';
import logger from '../utils/logger.util.js';
import apiClient from '../services/apiClient.js';

const INITIAL_USER_STATE = null;
export const AuthContext = createContext({ /* ... same as before ... */ });

if (typeof window !== 'undefined') {
    window._isLoggingOutDueToExpiry = false;
}

export const AuthProvider = ({ children }) => {
    const [userFromLS, setUserInLocalStorage] = useLocalStorage(LOCAL_STORAGE_KEYS.AUTH_USER, INITIAL_USER_STATE);
    const [currentUser, setCurrentUser] = useState(INITIAL_USER_STATE); // Start with null, populate after validation
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Start false
    const [isLoading, setIsLoading] = useState(true); // True until initial validation is complete
    const [authError, setAuthError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    const performClientSideLogoutCleanup = useCallback(() => {
        setUserInLocalStorage(INITIAL_USER_STATE);
        setCurrentUser(INITIAL_USER_STATE);
        setIsAuthenticated(false);
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('stfx_chatHistory_') || key.startsWith('stfx_seenBroadcasts_')) {
                localStorage.removeItem(key);
            }
        });
        if (typeof window !== 'undefined') {
            window._isLoggingOutDueToExpiry = false;
        }
        logger.info("AuthContext: Client-side logout cleanup performed.");
    }, [setUserInLocalStorage]);


    const logout = useCallback(async (isTriggeredBySessionExpiry = false) => {
        if (typeof window !== 'undefined' && window._isLoggingOutDueToExpiry && !isTriggeredBySessionExpiry) {
            // If a session expiry logout is already flagged, and this is a manual logout,
            // let the session expiry one complete to avoid race conditions with navigation.
            // Or, simply proceed if current logout is also session expiry.
            logger.info("AuthContext: Manual logout called while session expiry logout might be in progress. Proceeding.");
        }

        logger.info(`AuthContext: Initiating logout. Triggered by session expiry: ${isTriggeredBySessionExpiry}`);
        // No need to set isLoading for logout unless it's a very long async operation
        // setIsLoading(true);
        setAuthError(null);

        try {
            // Only call API if authenticated, to avoid errors if already effectively logged out
            if (isAuthenticated || localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USER)) {
                await authApiService.logoutUserApi();
                logger.info('AuthContext: Logout API call successful.');
            } else {
                logger.info("AuthContext: Skipping logout API call as user is not authenticated.");
            }
        } catch (err) {
            logger.error('AuthContext: Logout API call failed, proceeding with client-side cleanup:', err.message);
        } finally {
            performClientSideLogoutCleanup();
            // setIsLoading(false); // if set true above

            logger.info('AuthContext: Logout process complete. Navigating to login.');
            // Only navigate if not already on a public page or login page during session expiry
            const publicRoutes = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.HOME, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD];
            if (!(isTriggeredBySessionExpiry && publicRoutes.includes(location.pathname))) {
                navigate(ROUTES.LOGIN, {
                    replace: true,
                    state: isTriggeredBySessionExpiry ? { from: location, sessionExpired: true } : undefined
                });
            }
        }
    }, [performClientSideLogoutCleanup, navigate, location, isAuthenticated]);


    // Effect for handling session expiry event
    useEffect(() => {
        const handleSessionExpiredLogout = () => {
            if (typeof window !== 'undefined' && !window._isLoggingOutDueToExpiry) {
                window._isLoggingOutDueToExpiry = true;
                logger.warn("AuthContext: 'auth_session_expired_logout' event received. Initiating logout.");
                logout(true);
            } else if (typeof window !== 'undefined' && window._isLoggingOutDueToExpiry) {
                logger.info("AuthContext: 'auth_session_expired_logout' event, but logout already flagged.");
            }
        };
        if (typeof window !== 'undefined') {
            window.addEventListener('auth_session_expired_logout', handleSessionExpiredLogout);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('auth_session_expired_logout', handleSessionExpiredLogout);
            }
        };
    }, [logout]);


    // Function to validate session and update user (called on init and manually)
    const fetchAndUpdateUser = useCallback(async (isInitialLoad = false) => {
        logger.debug(`AuthContext: fetchAndUpdateUser called. isInitialLoad: ${isInitialLoad}`);
        if (!isInitialLoad) setIsLoading(true); // Set loading for manual refreshes, not for initial hidden one

        try {
            const response = await authApiService.getCurrentUserApi(); // Calls /auth/me
            if (response.success && response.data) {
                setUserInLocalStorage(response.data); // This will update userFromLS
                setCurrentUser(response.data);      // Directly update currentUser
                setIsAuthenticated(true);
                logger.info("AuthContext: User data (re)validated successfully for", response.data.email);
                if (!isInitialLoad) setIsLoading(false);
                return response.data; // Return user data
            } else {
                logger.warn('AuthContext: /auth/me call non-success or no data. Logging out.', response.message);
                // Don't call logout(true) here if it's just a refresh failing, let API client trigger it
                // Only if it's an explicit 401 should we force logout.
                // For now, if /me fails and it's not 401, just clear local state.
                // The API client interceptor will handle 401s by dispatching event.
                if (!isInitialLoad) performClientSideLogoutCleanup(); // Clear if manual refresh fails not due to 401
                if (!isInitialLoad) setIsLoading(false);
                return null;
            }
        } catch (error) {
            logger.error('AuthContext: Error during /auth/me call:', error);
            // If it's 401/403, the apiClient interceptor should dispatch 'auth_session_expired_logout'
            // which then calls logout(true).
            // If it's another error, we might not need to log out, just clear local state.
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                if (!isInitialLoad) performClientSideLogoutCleanup(); // Clear local state if /me fails for other reasons during manual refresh
            }
            if (!isInitialLoad) setIsLoading(false);
            return null;
        }
    }, [setUserInLocalStorage, performClientSideLogoutCleanup]);


    // Initial authentication check on component mount
    useEffect(() => {
        const validateInitialSession = async () => {
            logger.info("AuthContext: Initializing - validating session.");
            setIsLoading(true); // Global loading starts
            const storedUser = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USER)); // Parse directly

            if (storedUser) {
                logger.debug("AuthContext: Found user in localStorage. Validating with /auth/me.");
                try {
                    // Attempt to fetch user data to validate the session
                    // This effectively replaces the direct call to fetchAndUpdateUser for initial load
                    const response = await authApiService.getCurrentUserApi();
                    if (response.success && response.data) {
                        setUserInLocalStorage(response.data); // Sync LS
                        setCurrentUser(response.data);
                        setIsAuthenticated(true);
                        logger.info("AuthContext: Initial session validated for", response.data.email);
                    } else {
                        // /me call failed (not 401, or success:false), session likely invalid
                        logger.warn("AuthContext: Initial /auth/me validation failed (non-success). Clearing session.", response.message);
                        performClientSideLogoutCleanup();
                    }
                } catch (error) {
                    // /me call threw an error (e.g., 401, network error)
                    logger.error("AuthContext: Error during initial /auth/me validation. Clearing session.", error.message);
                    performClientSideLogoutCleanup(); // This will clear LS and state
                }
            } else {
                logger.debug("AuthContext: No user in localStorage. No session to validate.");
                // No user in LS, so definitely not authenticated.
                setCurrentUser(null);
                setIsAuthenticated(false);
            }
            setIsLoading(false); // Global loading ends after initial validation attempt
            logger.info("AuthContext: Initialization complete. isLoading:", false, "isAuthenticated:", !!localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USER));
        };

        validateInitialSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount


    const login = useCallback(async (email, password) => {
        // ... (login logic is mostly the same as your provided one)
        // Ensure it sets isLoading, authError, and navigates correctly.
        // Critical part:
        // setUserInLocalStorage(loggedInUser);
        // setCurrentUser(loggedInUser);
        // setIsAuthenticated(true);
        // ... (navigation)
        if (typeof window !== 'undefined') window._isLoggingOutDueToExpiry = false;
        setIsLoading(true); setAuthError(null);
        try {
            delete apiClient.defaults.headers.common['Authorization']; // Clear old token if any
            const response = await authApiService.loginUserApi({ email, password });
            if (response.success && response.data.user) {
                const loggedInUser = response.data.user;
                const token = response.data.accessToken; // Assuming backend sends token for non-HttpOnly setups

                if (token) { // If backend sends token (not HttpOnly)
                    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token); // Store actual token
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
                setUserInLocalStorage(loggedInUser); // Stores user object
                setCurrentUser(loggedInUser);
                setIsAuthenticated(true);
                logger.info('AuthContext: Login successful', { email: loggedInUser.email });

                // ... (your redirection logic based on role and location.state.from)
                const intendedPath = location.state?.from?.pathname;
                let redirectTo = ROUTES.USER_DASHBOARD;
                if (loggedInUser.role === USER_ROLES.ADMIN) redirectTo = (intendedPath && intendedPath.startsWith('/admin')) ? intendedPath : ROUTES.ADMIN_DASHBOARD;
                else if (loggedInUser.role === USER_ROLES.SUPPORT_AGENT) redirectTo = (intendedPath && intendedPath.startsWith('/support')) ? intendedPath : ROUTES.SUPPORT_DASHBOARD;
                else { /* ... user redirection ... */ }
                navigate(redirectTo, { replace: true });

                return { success: true, user: loggedInUser };
            } else {
                const message = response.message || 'Login failed.';
                setAuthError(message); throw new Error(message);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Login error.';
            logger.error('AuthContext: Login error', { errorMessage });
            setAuthError(errorMessage);
            setCurrentUser(INITIAL_USER_STATE); setIsAuthenticated(false);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN); // Clear token on failed login
            delete apiClient.defaults.headers.common['Authorization'];
            throw new Error(errorMessage);
        } finally { setIsLoading(false); }
    }, [setUserInLocalStorage, navigate, location.state]);

    const register = useCallback(async (userData) => {
        // ... (register logic as before, ensure it throws error for form to catch)
        setIsLoading(true);
        setAuthError(null);
        try {
            const response = await authApiService.registerUserApi(userData);
            if (response.success) {
                logger.info('AuthContext: Registration successful', { email: response.data?.email || userData.email });
                return { success: true, message: response.message || "Registration successful.", data: response.data };
            } else {
                throw new Error(response.message || 'Registration failed.');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed.';
            setAuthError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const contextValue = useMemo(() => ({
        user: currentUser,
        isAuthenticated,
        isLoading,
        error: authError,
        login,
        logout,
        register,
        // setUser: setUserInLocalStorage, // Exposing this might be too broad; fetchAndUpdateUser is safer
        fetchAndUpdateUser: () => fetchAndUpdateUser(false), // Pass false for manual calls
        clearAuthError: () => setAuthError(null),
        // token: localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN), // If you need to expose a client-stored token
    }), [currentUser, isAuthenticated, isLoading, authError, login, logout, register, fetchAndUpdateUser]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = { children: PropTypes.node.isRequired };