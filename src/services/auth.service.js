// src/services/auth.service.js
import apiClient from './apiClient';

export const registerUserApi = async (userData) => {
    // try/catch will be handled by useApi hook or component calling this
    const response = await apiClient.post('/auth/register', userData);
    return response.data; // Assuming backend returns { success, message, data }
};

export const loginUserApi = async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
};

export const logoutUserApi = async () => {
    // Backend will clear HttpOnly cookies.
    // Client side state clearing is handled in AuthContext.
    const response = await apiClient.post('/auth/logout');
    return response.data;
};

export const refreshAccessTokenApi = async () => {
    // This endpoint relies on HttpOnly refresh token cookie being sent by browser
    const response = await apiClient.post('/auth/refresh-token');
    return response.data;
};

export const sendOtpApi = async (email, purpose) => {
    const response = await apiClient.post('/auth/send-otp', { email, purpose });
    return response.data;
};

export const verifyOtpApi = async (email, otp, purpose) => {
    const response = await apiClient.post('/auth/verify-otp', { email, otp, purpose });
    return response.data;
};

export const requestPasswordResetApi = async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPasswordApi = async (token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
};

export const getCurrentUserApi = async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
};