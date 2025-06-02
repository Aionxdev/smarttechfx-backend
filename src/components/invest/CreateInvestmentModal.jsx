// src/components/invest/CreateInvestmentModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { investmentApiService } from '../../services'; // For initiating investment
import { SUPPORTED_CRYPTO_SYMBOLS_FRONTEND, UI_STATE } from '../../utils/constants';
import { formatCurrency, formatCrypto } from '../../utils/formatters';
import logger from '../../utils/logger.util.js';
import './CreateInvestmentModal.css'; // Create this CSS file

const CreateInvestmentModal = ({ isOpen, onClose, selectedPlan, onInvestmentInitiated }) => {
    const [investedAmountUSD, setInvestedAmountUSD] = useState('');
    const [paymentCryptocurrency, setPaymentCryptocurrency] = useState(SUPPORTED_CRYPTO_SYMBOLS_FRONTEND[0] || ''); // Default to first supported
    const [calculatedCryptoAmount, setCalculatedCryptoAmount] = useState(null);
    const [platformWalletAddress, setPlatformWalletAddress] = useState('');
    const [exchangeRate, setExchangeRate] = useState(null);
    const [networkConfirmations, setNetworkConfirmations] = useState(''); // New state

    const [uiState, setUiState] = useState(UI_STATE.IDLE);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [step, setStep] = useState(1); // Step 1: Input amount, Step 2: Show payment details
    const [copySuccess, setCopySuccess] = useState(''); // For clipboard copy feedback
    const [isLoading, setIsLoading] = useState(false); // For loading state

    useEffect(() => {
        if (isOpen && selectedPlan) {
            setInvestedAmountUSD(selectedPlan.investmentRange.minUSD.toString());
            setPaymentCryptocurrency(SUPPORTED_CRYPTO_SYMBOLS_FRONTEND.find(s => s === (selectedPlan.defaultPaymentCrypto || SUPPORTED_CRYPTO_SYMBOLS_FRONTEND[0])) || '');
            resetCalculatedFields();
            setError('');
            setSuccessMessage('');
            setCopySuccess('');
            setStep(1);
            setUiState(UI_STATE.IDLE);
        }
        if (!isOpen) {
            resetCalculatedFields();
        }
    }, [isOpen, selectedPlan]);
    
    const resetCalculatedFields = () => {
        setCalculatedCryptoAmount(null);
        setPlatformWalletAddress('');
        setExchangeRate(null);
        setNetworkConfirmations('');
    };
    
    useEffect(() => {
        const fetchConversion = async () => {
            if (step === 1 && investedAmountUSD && paymentCryptocurrency && selectedPlan) {
                resetCalculatedFields(); // Clear old calculations if inputs change
            }
        };
        fetchConversion();
    }, [investedAmountUSD, paymentCryptocurrency, selectedPlan, step]);


    const handleAmountChange = (e) => {
        setInvestedAmountUSD(e.target.value);
        setError(''); // Clear error on input change
        resetCalculatedFields();
    };

    const handleCryptoChange = (e) => {
        setPaymentCryptocurrency(e.target.value);
        setError('');
        resetCalculatedFields();
    };

    const handleSubmitStep1 = (e) => { // User confirms amount and crypto choice
        e.preventDefault();
        setError('');
        const amount = parseFloat(investedAmountUSD);
        if (isNaN(amount) || amount <= 0) {
            setError("Please enter a valid positive investment amount.");
            return;
        }
        if (amount < selectedPlan.investmentRange.minUSD || amount > selectedPlan.investmentRange.maxUSD) {
            setError(`Amount must be between ${formatCurrency(selectedPlan.investmentRange.minUSD)} and ${formatCurrency(selectedPlan.investmentRange.maxUSD)}.`);
            return;
        }
        if (!paymentCryptocurrency) {
            setError("Please select a payment cryptocurrency.");
            return;
        }
        setStep(2);
        setSuccessMessage(''); // Clear any previous success messages from this step
    };

    const handleConfirmInvestment = async () => {
        setUiState(UI_STATE.LOADING);
        setError('');
        setSuccessMessage('');
        setCopySuccess('');
        try {
            const response = await investmentApiService.createInvestmentApi({
                planId: selectedPlan._id,
                investedAmountUSD: parseFloat(investedAmountUSD),
                paymentCryptocurrency: paymentCryptocurrency,
            });

            if (response.success && response.data?.paymentDetails) {
                const { amount, currency, address, usdEquivalent, rate, networkConfirmationsRequired } = response.data.paymentDetails;
                setCalculatedCryptoAmount(amount);
                setPaymentCryptocurrency(currency);
                setPlatformWalletAddress(address);
                setExchangeRate(rate);
                setInvestedAmountUSD(usdEquivalent.toString());
                setNetworkConfirmations(networkConfirmationsRequired || 'N/A');

                setSuccessMessage("Investment initiated! Please make your payment using the details below.");
                setUiState(UI_STATE.SUCCESS);
                // Step remains 2 to show payment details
                if (onInvestmentInitiated) {
                    // Pass the full investment initiation result including the new investment ID and payment details
                    onInvestmentInitiated(response.data);
                }
            } else {
                throw new Error(response.message || "Failed to initiate investment. No payment details received.");
            }
        } catch (err) {
            logger.error("Error initiating investment:", err);
            const errMsg = err.response?.data?.message || err.message || "Could not initiate investment. Please try again.";
            setError(errMsg);
            // setSuccessMessage(''); // Clear success message on error
            setUiState(UI_STATE.ERROR);
        } finally {
            // Do not set isLoading to false here if we are in step 2 and success,
            // as step 2 success has its own UI. Only set if error.
            if (uiState !== UI_STATE.SUCCESS) setIsLoading(false);
        }
    };

    const copyToClipboard = async (textToCopy, fieldName) => {
        if (!navigator.clipboard) {
            setCopySuccess(`Failed to copy ${fieldName}. Clipboard API not available.`);
            return;
        }
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopySuccess(`${fieldName} copied to clipboard!`);
            setTimeout(() => setCopySuccess(''), 2000); // Clear message after 2 seconds
        } catch (err) {
            setCopySuccess(`Failed to copy ${fieldName}.`);
            logger.error(`Failed to copy ${fieldName}:`, err);
        }
    };


    if (!isOpen || !selectedPlan) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Invest in ${selectedPlan.planName}`} size="md">
            {error && <p className="modal-message error">{error}</p>}
            {successMessage && uiState === UI_STATE.SUCCESS && step === 2 && <p className="modal-message success">{successMessage}</p>}

            {step === 1 && (
                <form onSubmit={handleSubmitStep1} className="create-investment-form">
                    <p>Plan: <strong>{selectedPlan.planName}</strong></p>
                    <p>Daily ROI: {selectedPlan.dailyROIPercentage}% for {selectedPlan.durationDays} days</p>
                    <p>Range: {formatCurrency(selectedPlan.investmentRange.minUSD)} - {formatCurrency(selectedPlan.investmentRange.maxUSD)}</p>

                    <InputField
                        label="Investment Amount (USD)"
                        type="number"
                        name="investedAmountUSD"
                        value={investedAmountUSD}
                        onChange={handleAmountChange}
                        placeholder={`Min ${formatCurrency(selectedPlan.investmentRange.minUSD, 0)}`}
                        min={selectedPlan.investmentRange.minUSD}
                        max={selectedPlan.investmentRange.maxUSD}
                        step="1" // Or "0.01" if you allow cents
                        required
                        disabled={uiState === UI_STATE.LOADING}
                    />
                    <div className="input-field-wrapper">
                        <label htmlFor="paymentCryptocurrency" className="input-label">Pay With</label>
                        <select
                            id="paymentCryptocurrency"
                            name="paymentCryptocurrency"
                            value={paymentCryptocurrency}
                            onChange={handleCryptoChange}
                            className="input-field"
                            required
                            disabled={uiState === UI_STATE.LOADING}
                        >
                            <option value="">-- Select Crypto --</option>
                            {SUPPORTED_CRYPTO_SYMBOLS_FRONTEND.map(symbol => (
                                <option key={symbol} value={symbol}>{symbol}</option>
                            ))}
                        </select>
                    </div>
                    <div className="modal-actions">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={uiState === UI_STATE.LOADING}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={uiState === UI_STATE.LOADING} disabled={uiState === UI_STATE.LOADING}>
                            Proceed to Confirm
                        </Button>
                    </div>
                </form>
            )}

            {step === 2 && uiState !== UI_STATE.SUCCESS && uiState !== UI_STATE.LOADING && ( // Confirmation Step before API Call
                <div className="investment-confirmation-details">
                    <h4>Please confirm your investment:</h4>
                    <p><strong>Plan:</strong> {selectedPlan.planName}</p>
                    <p><strong>Amount:</strong> {formatCurrency(parseFloat(investedAmountUSD))}</p>
                    <p><strong>Pay With:</strong> {paymentCryptocurrency}</p>
                    <p className="confirmation-note">
                        You will be shown the exact crypto amount and payment address after confirming.
                        The exchange rate will be determined at the time of confirmation.
                    </p>
                    <div className="modal-actions">
                        <Button variant="ghost" onClick={() => setStep(1)} disabled={uiState === UI_STATE.LOADING}>Back</Button>
                        <Button variant="primary" onClick={handleConfirmInvestment} isLoading={uiState === UI_STATE.LOADING} disabled={uiState === UI_STATE.LOADING}>
                            Confirm & Get Payment Details
                        </Button>
                    </div>
                </div>
            )}


            {/* {step === 2 && uiState === UI_STATE.SUCCESS && calculatedCryptoAmount !== null && (
                <div className="payment-details-section">
                    <h4>Payment Instructions</h4>
                    <p>Please send exactly:</p>
                    <p className="payment-amount">
                        <strong>{formatCrypto(calculatedCryptoAmount, paymentCryptocurrency)} {paymentCryptocurrency}</strong>
                    </p>
                    <p>(Current rate: 1 {paymentCryptocurrency} = {formatCurrency(exchangeRate, 2, 4)})</p>
                    <p>To the following {paymentCryptocurrency} address:</p>
                    <p className="payment-address">{platformWalletAddress}</p>
                    <p className="payment-warning">
                        Ensure you send the correct amount to the correct address.
                        Incorrect transactions may result in loss of funds.
                    </p>
                    <p>
                        After sending, you can submit your Transaction ID (TXID) from your "My Investments" page
                        for faster verification, or our system will attempt to auto-detect verified payments.
                    </p>
                    <div className="modal-actions">
                        <Button variant="primary" onClick={onClose}>
                            I Understand, Close
                        </Button>
                    </div>
                </div>
            )} */}
            {step === 2 && uiState === UI_STATE.SUCCESS && calculatedCryptoAmount !== null && (
                <div className="payment-details-section">
                    {/* Display success message for payment instructions */}
                    {successMessage && <p className="modal-message success" style={{ textAlign: 'left' }}>{successMessage}</p>}
                    {copySuccess && <p className="copy-feedback">{copySuccess}</p>}

                    <h4>Payment Instructions</h4>
                    <div className="payment-detail-item">
                        <span className="payment-label">Amount to Send:</span>
                        <div className="payment-value-copyable">
                            <strong className="payment-amount">{formatCrypto(calculatedCryptoAmount, paymentCryptocurrency)} {paymentCryptocurrency}</strong>
                            <Button variant="ghost" size="xs" onClick={() => copyToClipboard(calculatedCryptoAmount.toString(), 'Amount')} aria-label="Copy amount">Copy</Button>
                        </div>
                    </div>
                    <p className="rate-info">(Rate: 1 {paymentCryptocurrency} ≈ {formatCurrency(exchangeRate, 2, 4)} USD at time of initiation)</p>

                    <div className="payment-detail-item">
                        <span className="payment-label">{paymentCryptocurrency} Deposit Address:</span>
                        <div className="payment-value-copyable">
                            <strong className="payment-address">{platformWalletAddress}</strong>
                            <Button variant="ghost" size="xs" onClick={() => copyToClipboard(platformWalletAddress, 'Address')} aria-label="Copy address">Copy</Button>
                        </div>
                    </div>
                    {networkConfirmations && networkConfirmations !== 'N/A' && (
                        <p className="rate-info">Required Network Confirmations: {networkConfirmations}</p>
                    )}
                    <p className="payment-warning">
                        <strong>Important:</strong> Send exactly <strong>{formatCrypto(calculatedCryptoAmount, paymentCryptocurrency)} {paymentCryptocurrency}</strong>.
                        Sending a different amount or to a wrong address may result in loss of funds.
                    </p>
                    <p>
                        After making the payment, please submit your Transaction ID (TXID) on the "My Investments" page to expedite verification.
                    </p>
                    <div className="modal-actions">
                        <Button variant="primary" onClick={onClose}>I Have Made the Payment / Close</Button>
                    </div>
                </div>
            )}
            {step === 2 && uiState === UI_STATE.LOADING && (
                <div className="page-loading" style={{ padding: '20px' }}>
                    <Spinner message="Initiating your investment..." />
                </div>
            )}


        </Modal>
    );
};

CreateInvestmentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedPlan: PropTypes.object, // The plan object passed from PlanCard
    onInvestmentInitiated: PropTypes.func, // Callback after successful initiation
};

export default CreateInvestmentModal;