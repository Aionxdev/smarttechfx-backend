// src/services/analytics.service.js (Frontend)
import apiClient from './apiClient';
import { buildQueryParams } from '../utils/helpers'; // For GET requests with params


/**
 * Fetches the user's dashboard summary metrics.
 * Corresponds to backend: analyticsController.getUserDashboardSummaryController
 * Backend route: GET /api/v1/analytics/user/dashboard-summary
 */
export const getUserDashboardSummaryApi = async () => {
    const response = await apiClient.get(`/analytics/user/dashboard-summary`); // Backend infers userId from token
    return response.data;
    // Expected: { success, data: { totalCurrentPortfolioValue, totalProfitEarned, activeInvestmentsCount, ... }, message }
};

// --- User Dashboard Analytics ---

/**
 * Fetches the user's investment portfolio value history for charts.
 * Corresponds to backend: analyticsService.getUserInvestmentPortfolioValueHistory
 * Backend route: Likely GET /api/v1/analytics/user/portfolio-history (needs to be defined on backend)
 * @param {string} userId - The ID of the user.
 * @param {number} periodDays - Lookback period in days (e.g., 30, 90).
 */
export const getUserPortfolioHistoryApi = async (userId, periodDays = 30) => {
    // Assuming the backend route is something like /users/:userId/analytics/portfolio-history
    // Or if the backend infers userId from the authenticated session:
    const params = { days: periodDays };
    const queryString = buildQueryParams(params);
    // Adjust endpoint if it's namespaced under /users/:userId/ or if backend infers user
    // For now, assuming a generic analytics endpoint that might use req.user.userId
    const response = await apiClient.get(`/analytics/user/portfolio-history${queryString}`);
    return response.data; // Expected: { success, data: { currentValueUSD, chartData: { labels, values } }, message }
};

/**
 * Fetches the user's coin usage breakdown.
 * Corresponds to backend: analyticsService.getUserCoinUsageBreakdown
 * Backend route: Likely GET /api/v1/analytics/user/coin-usage
 */
export const getUserCoinUsageApi = async () => {
    // Adjust endpoint as needed
    const response = await apiClient.get(`/analytics/user/coin-usage`); // Assuming backend uses req.user.userId
    return response.data; // Expected: { success, data: [{ coin, totalInvestedUSD, count }], message }
};


// --- Admin Dashboard Analytics ---
// Note: Many admin analytics are already covered by adminApiService calls to specific admin routes.
// This service could house calls to dedicated, aggregated analytics endpoints if you create them.

/**
 * Fetches platform-wide analytics for the admin.
 * Corresponds to backend: admin.controller.js -> getPlatformAnalytics
 * Backend route: GET /api/v1/admin/platform/analytics
 * @param {object} params - Optional parameters like { period, leaderboardLimit }
 */
export const getPlatformAnalyticsAdminApi = async (params) => {
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/admin/platform/analytics${queryString}`);
    return response.data;
    // Expected data structure:
    // {
    //   userStats,
    //   investmentStats,
    //   planPopularity,
    //   roiOwed,
    //   withdrawalTrends,
    //   userLeaderboard,
    // }
};


// --- Support Dashboard Analytics ---

/**
 * Fetches support chat volume statistics.
 * Corresponds to backend: analyticsService.getSupportChatVolumeStats
 * Backend route: Likely GET /api/v1/support/analytics/chat-volume
 * @param {object} params - e.g., { period: 'daily' | 'weekly' | 'monthly' }
 */
export const getSupportChatVolumeStatsApi = async (params) => {
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/support/analytics/chat-volume${queryString}`);
    return response.data; // Expected: { success, data: { period, escalatedChatVolume, estimatedFallbackRate }, message }
};

/**
 * Fetches support resolution time statistics.
 * Corresponds to backend: analyticsService.getSupportResolutionTimeStats
 * Backend route: Likely GET /api/v1/support/analytics/resolution-time
 * @param {object} params - e.g., { period: 'daily' | 'weekly' | 'monthly' }
 */
export const getSupportResolutionTimeStatsApi = async (params) => {
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/support/analytics/resolution-time${queryString}`);
    return response.data; // Expected: { success, data: { period, resolvedCount, averageResolutionTimeMinutes }, message }
};

/**
 * Fetches top user issues based on chat escalation tags.
 * Corresponds to backend: analyticsService.getSupportTopUserIssues
 * Backend route: Likely GET /api/v1/support/analytics/top-issues
 * @param {object} params - e.g., { limit: 5, period: 'monthly' }
 */
export const getSupportTopUserIssuesApi = async (params) => {
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/support/analytics/top-issues${queryString}`);
    return response.data; // Expected: { success, data: [{ issueTag, count }], message }
};

// Example for a combined support dashboard API call if you create one on the backend
export const getSupportDashboardAnalyticsApi = async (params) => {
    // This is the one used in SupportDashboardPage.jsx
    // It assumes the backend /support/analytics/dashboard endpoint bundles various stats.
    // If not, the page needs to call the individual stats functions above.
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/support/analytics/dashboard${queryString}`);
    return response.data;
    // Expected: { success, data: { chatVolumeStats, resolutionTimeStats, topUserIssues, myOpenTicketsCount }, message }
};
