// src/services/admin.service.js
import apiClient from './apiClient';
import { buildQueryParams } from '../utils/helpers';

// --- Admin Dashboard ---
export const getAdminDashboardOverviewApi = async () => {
    const response = await apiClient.get('/admin/platform/dashboard-overview');
    return response.data;
};

// --- Admin User Management ---
export const getAllUsersAdminApi = async (params) => {
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/admin/users${queryString}`);
    return response.data;
};

export const getUserDetailsAdminApi = async (userId) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
};

export const updateUserStatusAdminApi = async (userId, statusData) => {
    // statusData = { status: "Active" | "Suspended" | "Deactivated", reason?: "..." }
    const response = await apiClient.put(`/admin/users/${userId}/status`, statusData);
    return response.data;
};

export const updateUserKycStatusAdminApi = async (userId, kycData) => {
    // kycData = { kycStatus: "Verified" | "Rejected", rejectionReason?: "..." }
    const response = await apiClient.put(`/admin/users/${userId}/kyc`, kycData);
    return response.data;
};


// --- Admin Plan Management ---
export const createPlanAdminApi = async (planData) => {
    const response = await apiClient.post('/admin/plans', planData);
    return response.data;
};

export const getAllPlansAdminApi = async (params) => {
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/admin/plans${queryString}`);
    return response.data;
};

export const getPlanByIdAdminApi = async (planId) => {
    const response = await apiClient.get(`/admin/plans/${planId}`);
    return response.data;
};

export const updatePlanAdminApi = async (planId, updateData) => {
    const response = await apiClient.put(`/admin/plans/${planId}`, updateData);
    return response.data;
};

export const togglePlanStatusAdminApi = async (planId, statusData) => {
    // statusData = { isActive: true | false }
    const response = await apiClient.patch(`/admin/plans/${planId}/status`, statusData);
    return response.data;
};

export const deletePlanAdminApi = async (planId) => {
    const response = await apiClient.delete(`/admin/plans/${planId}`);
    return response.data;
};


// --- Admin Investment Management ---
export const getAllInvestmentsAdminApi = async (params) => {
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/admin/investments${queryString}`);
    return response.data;
};

export const getInvestmentDetailsAdminApi = async (investmentId) => {
    const response = await apiClient.get(`/admin/investments/${investmentId}`);
    return response.data;
}

export const verifyInvestmentByAdminApi = async (investmentId, verificationData) => {
    // verificationData = { transactionId, actualCryptoAmountReceived, adminNotes? }
    const response = await apiClient.post(`/admin/investments/${investmentId}/verify`, verificationData);
    return response.data;
};

export const cancelPendingInvestmentByAdminApi = async (investmentId, cancellationData) => {
    // cancellationData = { reason: "..." }
    const response = await apiClient.post(`/admin/investments/${investmentId}/cancel`, cancellationData);
    return response.data;
};


// --- Admin Withdrawal Management ---
export const getAllWithdrawalsAdminApi = async (params) => {
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/admin/withdrawals${queryString}`);
    return response.data;
};

export const getWithdrawalDetailsAdminApi = async (withdrawalId) => { // Added for completeness
    const response = await apiClient.get(`/admin/withdrawals/${withdrawalId}`); // Assuming such an endpoint exists or will be added
    return response.data;
};

export const approveWithdrawalByAdminApi = async (withdrawalId, approvalData) => {
    // approvalData = { platformTransactionId: "..." }
    const response = await apiClient.post(`/admin/withdrawals/${withdrawalId}/approve`, approvalData);
    return response.data;
};

export const rejectWithdrawalByAdminApi = async (withdrawalId, rejectionData) => {
    // rejectionData = { rejectionReason: "..." }
    const response = await apiClient.post(`/admin/withdrawals/${withdrawalId}/reject`, rejectionData);
    return response.data;
};


// --- Admin Platform Settings ---
export const getSupportedCryptosAdminApi = async () => {
    const response = await apiClient.get('/admin/platform/supported-cryptos');
    return response.data;
};

export const addSupportedCryptoAdminApi = async (cryptoData) => {
    const response = await apiClient.post('/admin/platform/supported-cryptos', cryptoData);
    return response.data;
};

export const updateSupportedCryptoAdminApi = async (cryptoId, updateData) => {
    const response = await apiClient.put(`/admin/platform/supported-cryptos/${cryptoId}`, updateData);
    return response.data;
};
// Consider adding deleteSupportedCryptoAdminApi if needed

export const broadcastAnnouncementAdminApi = async (announcementData) => {
    const response = await apiClient.post('/admin/platform/broadcast', announcementData);
    return response.data;
};

// --- Admin Analytics & Logs ---
export const getPlatformAnalyticsAdminApi = async (params) => { // params e.g. { period: 'monthly', leaderboardLimit: 10 }
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/admin/platform/analytics${queryString}`);
    return response.data;
};

export const viewSystemLogsAdminApi = async (params) => {
    // params = { page, limit, level, eventType, userId, sortBy, sortOrder }
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/admin/platform/logs${queryString}`);
    return response.data;
};

export const getAllAnnouncementsAdminApi = async (params) => { // params for pagination if added
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/admin/platform/announcements${queryString}`);
    return response.data;
};

export const deleteAnnouncementAdminApi = async (notificationId) => {
    const response = await apiClient.delete(`/admin/platform/announcements/${notificationId}`);
    return response.data;
};