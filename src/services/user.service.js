// src/services/user.service.js
import apiClient from './apiClient';
import { buildQueryParams } from '../utils/helpers'; // Import helper

export const getMyProfileApi = async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
};

export const updateUserProfileApi = async (updateData) => {
    const response = await apiClient.put('/users/profile', updateData);
    return response.data;
};

export const updatePreferredCryptoApi = async (preferredPayoutCrypto) => {
    const response = await apiClient.put('/users/preferred-crypto', preferredPayoutCrypto);
    return response.data;
};

export const changeMyPasswordApi = async (passwordData) => {
    const response = await apiClient.post('/users/change-password', passwordData);
    return response.data;
};

export const setMyWalletPinApi = async (pinData) => {
    const response = await apiClient.post('/users/pin/set', pinData);
    return response.data;
};

export const requestPinChangeOtpApi = async () => {
    const response = await apiClient.post('/users/pin/request-change-otp');
    return response.data;
};

export const changeMyWalletPinApi = async (pinChangeData) => {
    const response = await apiClient.post('/users/pin/change', pinChangeData);
    return response.data;
};

export const setMyPayoutWalletAddressApi = async (walletData) => {
    const response = await apiClient.post('/users/payout-wallet', walletData);
    return response.data;
};

export const requestWalletChangeOtpApi = async () => {
    const response = await apiClient.post('/users/payout-wallet/request-change-otp');
    return response.data;
};

export const changeMyPayoutWalletAddressApi = async (walletChangeData) => {
    const response = await apiClient.put('/users/payout-wallet/change', walletChangeData);
    return response.data;
};

export const getMyActivityLogApi = async (params) => { // params = { page, limit }
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/users/me/activity-log${queryString}`); // <<< UPDATE ENDPOINT
    return response.data;
};

export const getMyNotificationsApi = async (params) => {
    // params = { page, limit, sortBy, sortOrder }
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/users/me/notifications${queryString}`);
    return response.data; // Expected: { success, data: { notifications, totalPages, ... }, message }
};

export const markNotificationAsReadApi = async (notificationId) => {
    const response = await apiClient.patch(`/users/me/notifications/${notificationId}/read`);
    return response.data;
};

export const markAllNotificationsAsReadApi = async () => {
    const response = await apiClient.post('/users/me/notifications/mark-all-read');
    return response.data;
};