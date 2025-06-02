// src/pages/admin/AdminDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import MetricCard from '../../components/dashboard/MetricCard';
import ChartComponent from '../../components/dashboard/ChartComponent';
import Card from '../../components/common/Card';
import { adminApiService } from '../../services';
import useAuth from '../../hooks/useAuth';
import { APP_NAME, UI_STATE, CHART_COLORS } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/formatters';
import './AdminDashboardPage.css'; // Page-specific styles

const AdminDashboardPage = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = `Admin Dashboard - ${APP_NAME}`;
        const fetchAdminDashboard = async () => {
            if (!user) {
                setIsLoading(false); // Stop loading if no user
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                // This API call needs to return the comprehensive data structure outlined above
                const response = await adminApiService.getAdminDashboardOverviewApi();
                if (response.success && response.data) {
                    setDashboardData(response.data);
                } else {
                    setError(response.message || 'Failed to load admin dashboard data.');
                    setDashboardData(null); // Clear data on error
                }
            } catch (err) {
                logger.error("Failed to fetch admin dashboard data:", err);
                setError(err.response?.data?.message || err.message || "Could not load admin dashboard data.");
                setDashboardData(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAdminDashboard();
    }, [user]);

    if (isLoading) return <div className="page-loading admin-dashboard-loading"><Spinner size="xl" message="Loading Admin Dashboard..." /></div>;
    if (error) return <div className="page-error admin-dashboard-error">Error: {error}</div>;
    if (!dashboardData) return <div className="page-info admin-dashboard-no-data">No dashboard data available. Please check if the backend service is running and returning data.</div>;

    // --- Chart Data Preparation ---
    const userGrowthChartData = {
        labels: dashboardData.userGrowth?.labels || [],
        datasets: [{
            label: 'New Users',
            data: dashboardData.userGrowth?.values || [],
            borderColor: CHART_COLORS.PRIMARY,
            backgroundColor: `${CHART_COLORS.PRIMARY}30`, // For area fill
            fill: true,
            tension: 0.3
        }]
    };

    const investmentTrendChartData = {
        labels: dashboardData.investmentTrend?.labels || [],
        datasets: [{
            label: 'Total Investment (USD)',
            data: dashboardData.investmentTrend?.values || [],
            borderColor: CHART_COLORS.ACCENT_GREEN,
            backgroundColor: `${CHART_COLORS.ACCENT_GREEN}30`,
            fill: true,
            tension: 0.3
        }]
    };

    const planPopularityChartData = {
        labels: (dashboardData.planPopularity || []).map(p => p.planName),
        datasets: [{
            label: 'Number of Investments',
            data: (dashboardData.planPopularity || []).map(p => p.investmentCount),
            backgroundColor: [
                CHART_COLORS.PRIMARY,
                CHART_COLORS.ACCENT_GREEN,
                CHART_COLORS.ACCENT_ORANGE,
                '#FF6384', '#36A2EB',
            ],
            hoverOffset: 4
        }]
    };

    const cryptoUsageChartData = {
        labels: (dashboardData.cryptoUsageStats || []).map(c => c.coin),
        datasets: [{
            label: 'Investment Volume by Crypto (USD)',
            data: (dashboardData.cryptoUsageStats || []).map(c => c.totalUSDValue),
            backgroundColor: [
                '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED',
                '#70C1B3', '#F3FFBD', '#B2DBBF', '#247BA0', '#F1A208'
            ], // Add more distinct colors
            hoverOffset: 4
        }]
    };


    return (
        <div className="admin-dashboard-page">
            <header className="dashboard-page-header">
                <h1>Platform Overview</h1>
                <p>Key metrics and insights for SmartTechFX.</p>
            </header>

            <section className="metrics-grid">
                <MetricCard title="Total Users" value={dashboardData.totalUsers || 0} />
                <MetricCard title="Active Users" value={dashboardData.activeUsers || 0} />
                <MetricCard title="Total Invested (USD)" value={formatCurrency(dashboardData.totalInvestedUSD || 0)} />
                <MetricCard title="Active Investments" value={dashboardData.activeInvestmentsCount || 0} />
                <MetricCard title="Pending Withdrawals" value={dashboardData.pendingWithdrawalsCount || 0} />
                <MetricCard title="Pending Verifications" value={dashboardData.pendingInvestmentVerifications || 0} />
            </section>

            <section className="admin-charts-grid">
                <Card title="User Growth Trend" className="chart-card">
                    {dashboardData.userGrowth?.labels?.length > 0 ? (
                        <ChartComponent type="line" data={userGrowthChartData} />
                    ) : <p className="no-chart-data">User growth data not available.</p>}
                </Card>

                <Card title="Investment Value Trend" className="chart-card">
                    {dashboardData.investmentTrend?.labels?.length > 0 ? (
                        <ChartComponent type="line" data={investmentTrendChartData} />
                    ) : <p className="no-chart-data">Investment trend data not available.</p>}
                </Card>

                <Card title="Plan Popularity (by Investment Count)" className="chart-card">
                    {dashboardData.planPopularity?.length > 0 ? (
                        <ChartComponent type="doughnut" data={planPopularityChartData} options={{ maintainAspectRatio: true, cutout: '50%' }} />
                    ) : <p className="no-chart-data">Plan popularity data not available.</p>}
                </Card>

                <Card title="Crypto Usage (by Investment Volume)" className="chart-card">
                    {dashboardData.cryptoUsageStats?.length > 0 ? (
                        <ChartComponent type="pie" data={cryptoUsageChartData} options={{ maintainAspectRatio: true }} />
                    ) : <p className="no-chart-data">Crypto usage data not available.</p>}
                </Card>
            </section>

            <section className="admin-quick-stats-card">
                <Card title="Quick Stats Snapshot">
                    <p><strong>New Users (Last 30 Days):</strong> {dashboardData.newUsersLast30Days || 0}</p>
                    {/* Add more specific stats here if they are single values from dashboardData */}
                    <p>This section can highlight other important single numbers or alerts.</p>
                </Card>
            </section>
        </div>
    );
};

export default AdminDashboardPage;