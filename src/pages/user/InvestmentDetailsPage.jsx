// src/pages/user/InvestmentDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { investmentApiService } from '../../services';
import useAuth from '../../hooks/useAuth';
import { APP_NAME, ROUTES, INVESTMENT_STATUS } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { formatDate, formatCurrency } from '../../utils/formatters';
import './InvestmentDetailsPage.css';

const InvestmentDetailsPage = () => {
    const { investmentId } = useParams();
    const { user } = useAuth();
    const [investment, setInvestment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = `Investment Details - ${APP_NAME}`;
        if (user && investmentId) {
            const fetchInvestment = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await investmentApiService.getMyInvestmentByIdApi(investmentId);
                    if (response.success) {
                        setInvestment(response.data);
                    } else {
                        setError(response.message || 'Failed to load investment details.');
                    }
                } catch (err) {
                    logger.error(`Error fetching investment ${investmentId}:`, err);
                    setError(err.response?.data?.message || err.message || 'An error occurred.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInvestment();
        }
    }, [investmentId, user]);

    if (isLoading) return <div className="page-loading"><Spinner size="lg" message="Loading investment details..." /></div>;
    if (error) return <div className="page-error">Error: {error}</div>;
    if (!investment) return <div className="page-info">Investment not found.</div>;

    const calculateProgress = () => {
        if (investment.status === INVESTMENT_STATUS.ACTIVE && investment.activationDate && investment.maturityDate) {
            const totalDuration = new Date(investment.maturityDate).getTime() - new Date(investment.activationDate).getTime();
            const elapsed = Date.now() - new Date(investment.activationDate).getTime();
            return totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 0;
        } else if (investment.status === INVESTMENT_STATUS.MATURED || investment.status === INVESTMENT_STATUS.WITHDRAWN) {
            return 100;
        }
        return 0;
    };
    const progress = calculateProgress();

    return (
        <div className="investment-details-page">
            <header className="dashboard-page-header">
                <h1>Investment Details: {investment.planNameSnapshot}</h1>
                <Link to={ROUTES.USER_PLANS}><Button variant="outline" size="sm">← Back to My Investments</Button></Link>
            </header>

            <Card title="Summary">
                <div className="details-grid">
                    <p><strong>Status:</strong> <span className={`status-badge status-${investment.status.toLowerCase()}`}>{investment.status.replace(/([A-Z])/g, ' $1').trim()}</span></p>
                    <p><strong>Invested Amount (USD):</strong> {formatCurrency(investment.investedAmountUSD)}</p>
                    <p><strong>Payment Crypto:</strong> {investment.paymentAmountCrypto} {investment.paymentCryptocurrency}</p>
                    <p><strong>Daily ROI:</strong> {investment.dailyROIPercentageSnapshot}%</p>
                    <p><strong>Duration:</strong> {investment.durationDaysSnapshot} Days</p>
                    {investment.activationDate && <p><strong>Activation Date:</strong> {formatDate(investment.activationDate, 'PPpp')}</p>}
                    {investment.maturityDate && <p><strong>Maturity Date:</strong> {formatDate(investment.maturityDate, 'PPpp')}</p>}
                    <p><strong>Expected Total Profit (USD):</strong> {formatCurrency(investment.expectedTotalProfitUSD || 0)}</p>
                    {investment.status === INVESTMENT_STATUS.ACTIVE && <p><strong>Current Accrued Profit (USD):</strong> {formatCurrency(investment.currentProfitUSD || 0)}</p>}
                    {investment.transactionId && <p><strong>Transaction ID:</strong> <span className="txid-display">{investment.transactionId}</span></p>}
                    {investment.platformReceivingWalletAddress && <p><strong>Paid To Address:</strong> <span className="wallet-address-display">{investment.platformReceivingWalletAddress}</span></p>}
                </div>
            </Card>

            {(investment.status === INVESTMENT_STATUS.ACTIVE || investment.status === INVESTMENT_STATUS.MATURED) && (
                <Card title="Progress" className="progress-card">
                    <p>Investment Progress: {progress.toFixed(1)}%</p>
                    <div className="progress-bar-container-large">
                        <div className="progress-bar-large" style={{ width: `${progress}%` }}>
                            {progress.toFixed(0)}%
                        </div>
                    </div>
                    {investment.status === INVESTMENT_STATUS.ACTIVE && <p>Time remaining until maturity: {formatDate(investment.maturityDate, 'PP')}</p>}
                    {investment.status === INVESTMENT_STATUS.MATURED && <p>This investment has matured and is ready for profit withdrawal.</p>}
                </Card>
            )}

            {/* TODO: Add section for transaction history related to this investment */}
            {/* <Card title="Related Transactions">
                <p>Coming soon...</p>
            </Card> */}
        </div>
    );
};

export default InvestmentDetailsPage;