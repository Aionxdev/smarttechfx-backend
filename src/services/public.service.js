// src/services/public.service.js
import apiClient from './apiClient';
import { buildQueryParams } from '../utils/helpers';
import logger from '../utils/logger.util.js';


export const getPublicCryptoPricesApi = async (symbolsArray) => {
    const params = symbolsArray && symbolsArray.length > 0 ? { symbols: symbolsArray.join(',') } : {};
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/public/crypto-prices${queryString}`);
    return response.data; // Expects { success, data: { BTC: price, ETH: price, ... }, message }
};


export const getFreePublicCryptoPricesApi = async (coinIdsArray = null) => {
    try {
        let endpoint = '/public/crypto-prices-free';
        if (coinIdsArray && coinIdsArray.length > 0) {
            endpoint += `?ids=${coinIdsArray.join(',')}`;
        }
        const response = await apiClient.get(endpoint);
        // Assuming your backend ApiResponse wraps data in response.data.data
        if (response.data && response.data.success) {
            return { success: true, data: response.data.data };
        } else {
            return { success: false, message: response.data.message || "Failed to parse price data from backend", data: [] };
        }
    } catch (error) {
        logger.error("Frontend Service: Error fetching proxied crypto prices:", error.response?.data?.message || error.message);
        return { success: false, message: error.response?.data?.message || error.message || 'Network error fetching prices', data: [] };
    }
};

