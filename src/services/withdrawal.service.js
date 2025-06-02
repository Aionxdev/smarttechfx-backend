// // src/services/withdrawal.service.js
// import apiClient from './apiClient';
// import { buildQueryParams } from '../utils/helpers';

// export const requestWithdrawalApi = async (withdrawalData) => {
//     // withdrawalData = { amountUSD, cryptocurrency, pin }
//     const response = await apiClient.post('/withdrawals/request', withdrawalData);
//     return response.data;
// };

// export const getMyWithdrawalsApi = async (params) => {
//     // params = { page, limit, status, sortBy, sortOrder }
//     const queryString = buildQueryParams(params);
//     const response = await apiClient.get(`/withdrawals${queryString}`);
//     return response.data;
// };

// export const getMyWithdrawalByIdApi = async (withdrawalId) => {
//     const response = await apiClient.get(`/withdrawals/${withdrawalId}`);
//     return response.data;
// };

// export const getMyPayoutWalletAddressesApi = async () => {
//     const response = await apiClient.get('/withdrawals/payout-addresses');
//     return response.data;
// };

// export const getWalletAddressInstructionsApi = async () => {
//     const response = await apiClient.get('/withdrawals/instructions');
//     return response.data;
// };

// export const getWithdrawalTransactionStatusApi = async (withdrawalId) => {
//     const response = await apiClient.get(`/withdrawals/${withdrawalId}/status`);
//     return response.data;
// };

// src/services/withdrawal.service.js
import apiClient from './apiClient';
import { buildQueryParams } from '../utils/helpers';

const WITHDRAWALS_BASE_URL = '/withdrawals'; // Define base URL

export const requestWithdrawalApi = async (withdrawalData) => {
    try {
        const response = await apiClient.post(`${WITHDRAWALS_BASE_URL}/request`, withdrawalData);
        return response.data;
    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error in requestWithdrawalApi:", error);
        throw error; // Re-throw the error to be handled by the component
    }
};

export const getMyWithdrawalsApi = async (params) => {
    try {
        const queryString = buildQueryParams(params);
        const response = await apiClient.get(`${WITHDRAWALS_BASE_URL}/${queryString}`);
        return response.data;
    } catch (error) {
        console.error("Error in getMyWithdrawalsApi:", error);
        throw error;
    }
};

export const getMyWithdrawalByIdApi = async (withdrawalId) => {
    try {
        const response = await apiClient.get(`${WITHDRAWALS_BASE_URL}/${withdrawalId}`);
        return response.data;
    } catch (error) {
        console.error("Error in getMyWithdrawalByIdApi:", error);
        throw error;
    }
};

export const getMyPayoutWalletAddressesApi = async () => {
    try {
        const response = await apiClient.get(`${WITHDRAWALS_BASE_URL}/payout-addresses`);
        return response.data;
    } catch (error) {
        console.error("Error in getMyPayoutWalletAddressesApi:", error);
        throw error;
    }
};

export const getWalletAddressInstructionsApi = async () => {
    try {
        const response = await apiClient.get(`${WITHDRAWALS_BASE_URL}/instructions`);
        return response.data;
    } catch (error) {
        console.error("Error in getWalletAddressInstructionsApi:", error);
        throw error;
    }
};

export const getWithdrawalTransactionStatusApi = async (withdrawalId) => {
    try {
        const response = await apiClient.get(`${WITHDRAWALS_BASE_URL}/${withdrawalId}/status`);
        return response.data;
    } catch (error) {
        console.error("Error in getWithdrawalTransactionStatusApi:", error);
        throw error;
    }
};

// New function to get dashboard summary
export const getDashboardSummaryApi = async () => {
    try {
        const response = await apiClient.get('/analytics/user/dashboard-summary');
        return response.data;
    } catch (error) {
        console.error("Error in getDashboardSummaryApi:", error);
        throw error;
    }
};