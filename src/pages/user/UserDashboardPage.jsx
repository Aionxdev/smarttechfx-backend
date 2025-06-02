// src/pages/user/UserDashboardPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import MetricCard from '../../components/dashboard/MetricCard';
import ChartComponent from '../../components/dashboard/ChartComponent';
import InvestmentItem from '../../components/dashboard/InvestmentItem';
import { investmentApiService, analyticsApiService } from '../../services';
import { APP_NAME, ROUTES, CHART_COLORS, INVESTMENT_STATUS } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { formatCurrency } from '../../utils/formatters';
import './UserDashboardPage.css';
import { useTheme } from '../../hooks/useTheme'; // Import useTheme

const UserDashboardPage = () => {
    const { user } = useAuth();
    const { theme } = useTheme(); // Get theme for chart border colors
    const [summaryData, setSummaryData] = useState({
        totalCurrentPortfolioValue: 0,
        totalProfitEarned: 0,
        activeInvestmentsCount: 0,
    });
    const [portfolioHistory, setPortfolioHistory] = useState({ labels: [], values: [] });
    const [recentInvestments, setRecentInvestments] = useState([]);
    const [coinUsageData, setCoinUsageData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // const [returnChange, setReturnChange] = useState({ daily: 0, weekly: 0, monthly: 0 }); // Keep if you want to implement later

    const fetchData = useCallback(async () => { // Wrapped fetchData in useCallback
        if (!user?._id) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const [
                summaryRes,
                historyRes,
                activeInvestmentsRes,
                coinUsageRes
            ] = await Promise.all([
                analyticsApiService.getUserDashboardSummaryApi(),
                analyticsApiService.getUserPortfolioHistoryApi(user._id, 30),
                investmentApiService.getMyInvestmentsApi({ status: INVESTMENT_STATUS.ACTIVE, limit: 3, sortBy: 'createdAt', sortOrder: 'desc' }),
                analyticsApiService.getUserCoinUsageApi()
            ]);

            if (summaryRes.success) setSummaryData(summaryRes.data || {});
            else logger.error("Failed to fetch dashboard summary:", summaryRes.message);

            if (historyRes.success && historyRes.data?.chartData) setPortfolioHistory(historyRes.data.chartData);
            else {
                logger.error("Failed to fetch portfolio history:", historyRes?.message);
                setPortfolioHistory({ labels: [], values: [] });
            }

            if (activeInvestmentsRes.success && activeInvestmentsRes.data && Array.isArray(activeInvestmentsRes.data.investments)) {
                setRecentInvestments(activeInvestmentsRes.data.investments);
            } else {
                logger.error("Failed to fetch recent investments:", activeInvestmentsRes?.message);
                setRecentInvestments([]);
            }

            if (coinUsageRes.success && coinUsageRes.data) {
                setCoinUsageData(coinUsageRes.data || []);
            } else {
                logger.error("Failed to fetch coin usage data:", coinUsageRes.message);
                setCoinUsageData([]);
            }

        } catch (err) {
            logger.error("Failed to fetch user dashboard data:", err);
            setError(err.response?.data?.message || err.message || "Could not load dashboard data.");
            setSummaryData({ totalCurrentPortfolioValue: 0, totalProfitEarned: 0, activeInvestmentsCount: 0 });
            setPortfolioHistory({ labels: [], values: [] });
            setRecentInvestments([]);
            setCoinUsageData([]);
        } finally {
            setIsLoading(false);
        }
    }, [user?._id]); // Depend on user._id for re-fetching if user changes

    useEffect(() => {
        document.title = `Dashboard - ${APP_NAME}`;
        fetchData();
    }, [fetchData]); // useEffect depends on memoized fetchData

    if (isLoading) {
        return <div className="page-loading"><Spinner size="xl" message="Loading Your Dashboard..." /></div>;
    }
    if (error) {
        return <div className="page-error">Error: {error} <Button onClick={fetchData}>Try Again</Button></div>;
    }

    const portfolioChartData = {
        labels: portfolioHistory.labels || [],
        datasets: [
            {
                label: 'Portfolio Value (USD)',
                data: portfolioHistory.values || [],
                borderColor: CHART_COLORS.PRIMARY,
                backgroundColor: `${CHART_COLORS.PRIMARY}40`, // Slightly more opaque fill
                fill: true,
                tension: 0.3,
                pointBackgroundColor: CHART_COLORS.PRIMARY,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: CHART_COLORS.PRIMARY,
            },
        ],
    };

    const coinUsageChartFormattedData = {
        labels: coinUsageData.map(item => item.coin || 'Unknown'), // Handle undefined coin name
        datasets: [{
            label: 'Investment Distribution',
            data: coinUsageData.map(item => item.totalInvestedUSD || 0), // Handle undefined value
            backgroundColor: [
                CHART_COLORS.PRIMARY, CHART_COLORS.ACCENT_GREEN, CHART_COLORS.ACCENT_ORANGE,
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF',
                // Add more colors if you expect more than 10 crypto types
            ],
            borderColor: theme === 'dark' ? '#1f2937' : '#ffffff', // Card background for slice separation
            borderWidth: 2,
            hoverOffset: 8,
        }]
    };

    const doughnutOptions = {
        cutout: '40%',
        plugins: {
            legend: { position: 'bottom', labels: { padding: 15, boxWidth: 12 } },
        }
        // Tooltip callbacks are handled by defaultOptions in ChartComponent
    };

    return (
        <div className="user-dashboard-page">
            <header className="dashboard-page-header">
                <h1>Welcome, {user?.fullName || user?.email}!</h1>
                <p>Here's an overview of your investment activities.</p>
            </header>

            <section className="metrics-grid">
                <MetricCard title="Total Current Value" value={formatCurrency(summaryData.totalCurrentPortfolioValue || 0)} isLoading={isLoading} />
                <MetricCard title="Total Profit Earned" value={formatCurrency(summaryData.totalProfitEarned || 0)} isLoading={isLoading} />
                <MetricCard title="Active Investments" value={summaryData.activeInvestmentsCount || 0} isLoading={isLoading} />
            </section>

            <section className="charts-section">
                <Card title="Portfolio Value Over Time" className="chart-card-primary">
                    <ChartComponent type="line" data={portfolioChartData} height="320px" />
                </Card>

                <Card title="Coin Usage Distribution" className="chart-card-secondary">
                    <ChartComponent
                        type="doughnut"
                        data={coinUsageChartFormattedData}
                        options={doughnutOptions}
                        height="320px"
                    />
                </Card>
            </section>

            <section className="recent-investments-section">
                <h2>Recent Active Investments</h2>
                {recentInvestments.length > 0 ? (
                    <div className="investments-list">
                        {recentInvestments.map(inv => (
                            <InvestmentItem key={inv._id} investment={inv} />
                        ))}
                    </div>
                ) : (
                    <p className="no-data-message">No active investments yet. <Link to={ROUTES.USER_PLANS}>Explore Plans</Link></p>
                )}
            </section>
        </div>
    );
};

export default UserDashboardPage;