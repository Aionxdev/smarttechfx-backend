// src/services/investment.service.js
import apiClient from './apiClient';
import { buildQueryParams } from '../utils/helpers';

export const createInvestmentApi = async (investmentData) => {
    // investmentData = { planId, investedAmountUSD, paymentCryptocurrency, transactionId? }
    const response = await apiClient.post('/investments', investmentData);
    return response.data;
};

export const getMyInvestmentsApi = async (params) => {
    // params = { page, limit, status, sortBy, sortOrder }
    const queryString = buildQueryParams(params);
    const response = await apiClient.get(`/investments${queryString}`);
    return response.data;
};

export const getMyInvestmentByIdApi = async (investmentId) => {
    const response = await apiClient.get(`/investments/${investmentId}`);
    return response.data;
};

export const getInvestmentProgressApi = async (investmentId) => {
    const response = await apiClient.get(`/investments/${investmentId}/progress`);
    return response.data;
};

export const submitInvestmentTxidApi = async (investmentId, txidData) => {
    // txidData = { transactionId }
    const response = await apiClient.post(`/investments/${investmentId}/submit-txid`, txidData);
    return response.data;
};