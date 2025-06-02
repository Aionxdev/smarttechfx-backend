// src/hooks/useApi.js
import { useState, useCallback, useContext, useEffect } from 'react';
import apiClient from '../services/apiClient'; // Your configured Axios instance
import { AuthContext } from '../contexts/AuthContext.jsx'; // To auto-include auth token
import logger from '../utils/logger.util.js'; // Assuming you have a logger utility

/**
 * Custom hook for making API calls.
 * @param {object} options - Configuration options.
 * @param {boolean} options.autoTrigger - Whether to trigger the API call on hook initialization (default: false).
 * @param {any} options.initialData - Initial data state (default: null).
 * @returns {{
 *  data: any,
 *  setData: Function,
 *  error: any,
 *  setError: Function,
 *  isLoading: boolean,
 *  setIsLoading: Function,
 *  fetchData: (config: import('axios').AxiosRequestConfig, params?: object, body?: object) => Promise<any>
 * }}
 */
const useApi = (options = { autoTrigger: false, initialData: null }) => {
    const [data, setData] = useState(options.initialData);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(options.autoTrigger);
    const { token } = useContext(AuthContext); // Get token from AuthContext if you want to automatically add it here

    const fetchData = useCallback(async (axiosConfig, requestParams = null, requestBody = null) => {
        setIsLoading(true);
        setError(null);
        setData(options.initialData); // Reset data on new fetch

        try {
            // Construct the config for apiClient
            const config = {
                ...axiosConfig, // method, url
                params: requestParams || axiosConfig.params,
                data: requestBody || axiosConfig.data,
                headers: {
                    ...axiosConfig.headers,
                    ...(token && { Authorization: `Bearer ${token}` }), // Example: Auto-add auth token
                },
            };

            const response = await apiClient(config);
            setData(response.data.data); // Assuming your API response structure is { success, message, data }
            setIsLoading(false);
            return response.data; // Return the full response object
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'An API error occurred';
            const apiErrors = err.response?.data?.errors || [];
            logger.error("useApi Error:", { url: axiosConfig.url, method: axiosConfig.method, errorMessage, apiErrors, originalError: err });
            setError({ message: errorMessage, errors: apiErrors, status: err.response?.status });
            setIsLoading(false);
            throw err; // Re-throw for further handling in component if needed
        }
    }, [options.initialData]); // Add token to dependency array if used

    useEffect(() => {
        if (options.autoTrigger && options.defaultConfig) {
            fetchData(options.defaultConfig);
        }
    }, [options.autoTrigger, options.defaultConfig, fetchData]); // For auto-triggering

    return { data, setData, error, setError, isLoading, setIsLoading, fetchData };
};

export default useApi;