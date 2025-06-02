// src/pages/user/WithdrawPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import { withdrawalApiService } from '../../services';
// import useAuth from '../../hooks/useAuth';
import { APP_NAME, ROUTES, UI_STATE, SUPPORTED_CRYPTO_SYMBOLS_FRONTEND } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import useApi from '../../hooks/useApi'; // Import useApi hook

// Simple formatCrypto helper if not already defined elsewhere
const formatCrypto = (amount, symbol) => {
    if (typeof amount !== 'number') amount = parseFloat(amount);
    if (isNaN(amount)) return '-';
    // A more dynamic precision could be added here based on crypto if needed
    return `${amount.toFixed(symbol?.toUpperCase() === 'USDT' ? 2 : 8)}`;
};
import './WithdrawPage.css';

const WithdrawPage = () => {
    // const { user, fetchAndUpdateUser } = useAuth();
    const location = useLocation();
    // const navigate = useNavigate();

    const [amountUSD, setAmountUSD] = useState('');
    const [cryptocurrency, setCryptocurrency] = useState('');
    const [pin, setPin] = useState('');
    const [payoutAddress, setPayoutAddress] = useState('');

    const [formMessage, setFormMessage] = useState('');
    const [formUiState, setFormUiState] = useState(UI_STATE.IDLE);

    // useApi hook for dashboard summary
    const { data: dashboardSummary, isLoading: isLoadingSummary, fetchData: fetchDashboardSummary } = useApi({ initialData: null });

    const [withdrawalHistory, setWithdrawalHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // useApi hook for payout wallet addresses
    const { data: payoutAddressesData, fetchData: fetchPayoutWalletAddresses } = useApi({ initialData: null });

    // useApi hook for wallet instructions
    const { data: walletInstructions, isLoading: isLoadingInstructions,  fetchData: fetchWalletInstructions } = useApi({ initialData: null });

    const fetchWithdrawalHistory = useCallback(async () => {
        setIsLoadingHistory(true);
        try {
            const response = await withdrawalApiService.getMyWithdrawalsApi({ limit: 10, sortBy: 'requestDate', sortOrder: 'desc' });
            if (response.success) {
                setWithdrawalHistory(response.data.withdrawals || []);
            }
        } catch (err) {
            logger.error("Error fetching withdrawal history:", err);
        } finally {
            setIsLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        document.title = `Withdraw Funds - ${APP_NAME}`;
        // Fetch Dashboard Summary
        fetchDashboardSummary({ method: 'get', url: '/analytics/user/dashboard-summary' });
        // Fetch Withdrawal History
        fetchWithdrawalHistory();
        // Fetch Instructions
        fetchWalletInstructions({ method: 'get', url: '/withdrawals/instructions' });
        // Fetch Payout Wallet Addresses
        fetchPayoutWalletAddresses({ method: 'get', url: '/withdrawals/payout-addresses' });

        if (location.state?.fromInvestment && location.state?.amount) {
            setAmountUSD(String(location.state.amount));
        }
    }, [fetchDashboardSummary, fetchWithdrawalHistory, location.state, fetchWalletInstructions, fetchPayoutWalletAddresses]);

    useEffect(() => {
        if (cryptocurrency && payoutAddressesData) {
            const address = payoutAddressesData[cryptocurrency.toUpperCase()];
            setPayoutAddress(address || 'Not Set - Please configure in Profile.');
        } else {
            setPayoutAddress('');
        }
    }, [cryptocurrency, payoutAddressesData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormUiState(UI_STATE.LOADING);
        setFormMessage('');

        if (!amountUSD || !cryptocurrency || !pin) {
            setFormMessage('All fields (Amount, Cryptocurrency, PIN) are required.');
            setFormUiState(UI_STATE.ERROR);
            return;
        }
        if (parseFloat(amountUSD) <= 0) {
            setFormMessage('Withdrawal amount must be positive.');
            setFormUiState(UI_STATE.ERROR);
            return;
        }
        if (!payoutAddressesData || !payoutAddressesData[cryptocurrency.toUpperCase()]) {
            setFormMessage(`Payout address for ${cryptocurrency} is not set. Please set it in your Profile.`);
            setFormUiState(UI_STATE.ERROR);
            return;
        }

        try {
            const response = await withdrawalApiService.requestWithdrawalApi({
                amountUSD: parseFloat(amountUSD),
                cryptocurrency,
                pin
            });
            if (response.success) {
                setFormMessage(response.message || 'Withdrawal request submitted successfully!');
                setFormUiState(UI_STATE.SUCCESS);
                setAmountUSD('');
                setPin('');
                fetchWithdrawalHistory();
            } else {
                if (response.statusCode === 400 && response.message.includes("Insufficient available balance")) {
                    setFormMessage(response.message); // Display balance error from backend
                } else if (response.statusCode === 403 && response.message.includes("Please verify your email")) {
                    setFormMessage(response.message); // Display email verification error
                } else {
                    setFormMessage(response.message || 'An error occurred during withdrawal request.');
                }
                setFormUiState(UI_STATE.ERROR);
                throw new Error(response.message); // Will be caught below
            }
        } catch (err) {
            logger.error("Withdrawal request error:", err);
            const displayError = err.response?.data?.message || err.message || 'An error occurred.';
            setFormMessage(displayError);
            setFormUiState(UI_STATE.ERROR);
        } finally {
            setFormUiState(UI_STATE.LOADING);
        }
    };

    const withdrawalColumns = React.useMemo(() => [
        { Header: 'Date', accessor: 'requestDate', Cell: ({ row }) => formatDate(row.original.requestDate, 'MMM dd, yyyy HH:mm') },
        { Header: 'Amount (USD)', accessor: 'amountUSD', Cell: ({ row }) => formatCurrency(row.original.amountUSD) },
        { Header: 'Crypto', Cell: ({ row }) => `${row.original.amountCrypto ? formatCrypto(row.original.amountCrypto, row.original.cryptocurrency) : '-'} ${row.original.cryptocurrency}` },
        { Header: 'To Address', accessor: 'userPayoutWalletAddress', Cell: ({ row }) => <span title={row.original.userPayoutWalletAddress} className="address-truncate">{row.original.userPayoutWalletAddress}</span> },
        { Header: 'Status', accessor: 'status', Cell: ({ row }) => <span className={`status-badge status-withdrawal-${row.original.status.toLowerCase()}`}>{row.original.status.replace(/([A-Z])/g, ' $1').trim()}</span> },
        { Header: 'Platform TXID', accessor: 'platformTransactionId', Cell: ({ row }) => row.original.platformTransactionId ? <span title={row.original.platformTransactionId} className="txid-truncate">{row.original.platformTransactionId}</span> : '-' },
    ], []);

    // Extract supported coins from the walletInstructions
    // const supportedCoins = walletInstructions?.data?.supportedCoins || [];

    return (
        <div className="withdraw-page">
            <header className="dashboard-page-header">
                <h1>Request Withdrawal</h1>
                <p>Withdraw your available profits and capital securely.</p>
            </header>

            <div className="withdraw-content-layout">
                <Card title="Withdraw Funds" className="withdraw-form-card">
                    {isLoadingSummary ? <Spinner /> : (
                        <p className="available-balance">
                            Total Profits: <strong>{formatCurrency(dashboardSummary?.totalProfitEarned || 0)}</strong>
                            <small>(This is an estimate. Final eligibility checked upon request.)</small>
                        </p>
                    )}

                    {formMessage && (
                        <p className={`form-message ${formUiState === UI_STATE.SUCCESS ? 'success' : (formUiState === UI_STATE.ERROR ? 'error' : 'info')}`}>
                            {formMessage}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <InputField
                            label="Amount to Withdraw (USD)"
                            type="number"
                            name="amountUSD"
                            value={amountUSD}
                            onChange={(e) => setAmountUSD(e.target.value)}
                            placeholder="e.g., 100.00"
                            required
                            min="0.01"
                            step="0.01"
                            disabled={formUiState === UI_STATE.LOADING}
                        />
                        <div className="input-field-wrapper">
                            <label htmlFor="cryptocurrency" className="input-label">Withdraw To (Cryptocurrency)</label>
                            <select
                                id="cryptocurrency"
                                name="cryptocurrency"
                                value={cryptocurrency}
                                onChange={(e) => setCryptocurrency(e.target.value)}
                                className="input-field"
                                required
                                disabled={formUiState === UI_STATE.LOADING}
                            >
                                <option value="">-- Select Crypto --</option>
                                {payoutAddressesData ? Object.keys(payoutAddressesData).map(symbol => (
                                    <option key={symbol} value={symbol}>{symbol}</option>
                                )) : null}
                            </select>
                        </div>
                        {cryptocurrency && (
                            <div className="payout-address-display">
                                <p><strong>Payout Address:</strong></p>
                                {payoutAddress.startsWith('Not Set') ?
                                    <p className="error-text">
                                        {payoutAddress} <Link to={ROUTES.USER_PROFILE}>Go to Profile</Link>
                                    </p> :
                                    <p className="address-text">{payoutAddress}</p>
                                }
                            </div>
                        )}
                        <InputField
                            label="Wallet PIN"
                            type="password"
                            name="pin"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Enter your 4 or 6 digit PIN"
                            required
                            maxLength={6}
                            disabled={formUiState === UI_STATE.LOADING}
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={formUiState === UI_STATE.LOADING}
                            disabled={formUiState === UI_STATE.LOADING || !payoutAddress || payoutAddress.startsWith('Not Set')}
                        >
                            {formUiState === UI_STATE.LOADING ? 'Processing Request...' : 'Request Withdrawal'}
                        </Button>
                    </form>
                </Card>

                <Card title="Wallet Instructions">
                    {isLoadingInstructions ? <Spinner /> : (
                        <p>{walletInstructions?.message || "No instructions found."}</p>
                    )}
                </Card>

                <Card title="Recent Withdrawal History" className="withdrawal-history-card">
                    {isLoadingHistory ? <Spinner /> : (
                        withdrawalHistory.length > 0 ? (
                            <Table columns={withdrawalColumns} data={withdrawalHistory} />
                        ) : (
                            <p>No withdrawal history yet.</p>
                        )
                    )}
                </Card>
            </div>
        </div>
    );
};

export default WithdrawPage;
