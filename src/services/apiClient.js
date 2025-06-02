// src/services/apiClient.js
import axios from 'axios';
import logger from '../utils/logger.util.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    // --- Explicitly disable Axios's default XSRF handling ---
    xsrfCookieName: null, // Setting to null or a non-existent cookie name
    xsrfHeaderName: null, // Setting to null means Axios won't set this header
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        logger.debug(`[API Request] > ${config.method.toUpperCase()} ${config.url}`, { params: config.params, data: config.data });
        return config;
    },
    (error) => {
        logger.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response Interceptor (Token refresh logic remains the same)
// apiClient.interceptors.response.use(
//     (response) => {
//         logger.debug(`[API Response] < Status: ${response.status} from ${response.config.url}`);
//         return response;
//     },
//     async (error) => {
//         logger.error(
//             `[API Response Error] < Status: ${error.response?.status} from ${error.config?.url}`,
//             {
//                 message: error.message,
//                 responseData: error.response?.data,
//                 requestData: error.config?.data,
//                 requestParams: error.config?.params
//             }
//         );

//         const originalRequest = error.config;

//         if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
//             originalRequest._retry = true;
//             logger.info('[API Client] Access token potentially expired (401). Attempting to refresh...');
//             try {
//                 await apiClient.post('/auth/refresh-token');
//                 logger.info('[API Client] Token refresh successful. Retrying original request.');
//                 return apiClient(originalRequest);
//             } catch (refreshError) {
//                 logger.error('[API Client] Token refresh FAILED:', {
//                     message: refreshError.message,
//                     responseData: refreshError.response?.data
//                 });
//                 if (refreshError.response && refreshError.response.status === 401) {
//                     return Promise.reject({ ...refreshError, isRefreshAuthFailure: true });
//                 }
//                 return Promise.reject(refreshError);
//             }
//         }
//         return Promise.reject(error);
//     }
// );

// Response Interceptor (Simplified - No Refresh Logic)
apiClient.interceptors.response.use(
    (response) => {
        logger.debug(`[API Client Response] Status: ${response.status} from ${response.config.url}`, response.data);
        return response;
    },
    async (error) => {
        logger.error(
            `[API Client Response Error] Status: ${error.response?.status} from ${error.config?.url}`,
            { message: error.message, responseData: error.response?.data }
        );

        const originalRequest = error.config;

        // If a 401 is received (and it's not from a login attempt itself, to avoid loops on failed login)
        // And to avoid multiple logout triggers for concurrent failed requests, add a flag.
        if (error.response?.status === 401 && originalRequest && originalRequest.url !== '/auth/login' && !window._authFailed) {
            window._authFailed = true; // Set a global flag to prevent multiple triggers
            logger.warn('[API Client] Received 401 Unauthorized. Token likely expired or invalid. Triggering logout.');

            // Dispatch a custom event that AuthContext can listen to for logout
            window.dispatchEvent(new CustomEvent('auth_session_expired_logout'));

            // Optionally, you might want to clear the flag after a short delay if you want to allow
            // another trigger later, but usually, one trigger leading to logout is enough.
            // setTimeout(() => { window._authFailed = false; }, 2000);
        }

        return Promise.reject(error); // Always reject the original promise that failed
    }
);

export default apiClient;