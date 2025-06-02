// src/services/plan.service.js
import apiClient from './apiClient';

// For users to view available plans (core data)
export const getAvailableInvestmentPlansApi = async () => {
    const response = await apiClient.get('/plans'); // Uses /api/v1/plans
    return response.data;
};

// For users to view the detailed plan guide with illustrations
export const getPublicInvestmentPlanGuideApi = async () => {
    const response = await apiClient.get('/public/investment-plan-guide');
    return response.data;
};

// For user to view a specific plan by ID (if needed separately from guide)
export const getPublicPlanByIdApi = async (planId) => {
    const response = await apiClient.get(`/plans/${planId}`);
    return response.data;
};