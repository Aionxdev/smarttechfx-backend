// src/services/index.js
export { default as apiClient } from './apiClient.js'; // Export the configured instance

export * as authApiService from './auth.service.js';
export * as userApiService from './user.service.js';
export * as investmentApiService from './investment.service.js';
export * as withdrawalApiService from './withdrawal.service.js';
export * as planApiService from './plan.service.js';
export * as adminApiService from './admin.service.js';
export * as publicApiService from './public.service.js';
export * as analyticsApiService from './analytics.service.js';
