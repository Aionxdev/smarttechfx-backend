// src/pages/user/MyPlansPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PlanCard from '../../components/plans/PlanCard';
import InvestmentItem from '../../components/dashboard/InvestmentItem';
import Button from '../../components/common/Button';
import { planApiService, investmentApiService } from '../../services';
import useAuth from '../../hooks/useAuth';
import { APP_NAME, ROUTES, UI_STATE, INVESTMENT_STATUS } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal'; // For "Submit TXID"
import InputField from '../../components/common/InputField'; // For TXID input in modal
import { formatCurrency } from '../../utils/formatters.js'; // Add this import
import './MyPlansPage.css'; // Create this for page-specific styles

import CreateInvestmentModal from '../../components/invest/CreateInvestmentModal'; // Import the new modal


const MyPlansPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    // State management

    const [availablePlans, setAvailablePlans] = useState([]);
    const [userInvestments, setUserInvestments] = useState([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);
    const [isLoadingInvestments, setIsLoadingInvestments] = useState(true);
    const [error, setError] = useState(null);

    const [activeTab, setActiveTab] = useState('available'); // 'available' or 'myInvestments'

    // For Submit TXID Modal
    const [isTxidModalOpen, setIsTxidModalOpen] = useState(false);
    const [selectedInvestmentForTxid, setSelectedInvestmentForTxid] = useState(null);
    const [txidValue, setTxidValue] = useState('');
    const [txidSubmitState, setTxidSubmitState] = useState(UI_STATE.IDLE);
    const [txidModalMessage, setTxidModalMessage] = useState('');

    const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
    const [planToInvest, setPlanToInvest] = useState(null);

    useEffect(() => {
        document.title = `My Investment Plans - ${APP_NAME}`;
        fetchAvailablePlans();
        fetchUserInvestments();
    }, []);

    const fetchAvailablePlans = async () => {
        setIsLoadingPlans(true);
        try {
            const response = await planApiService.getPublicInvestmentPlanGuideApi();
            if (response.success) {
                setAvailablePlans(response.data || []);
            } else {
                setError(response.message || 'Failed to load available plans.');
            }
        } catch (err) {
            logger.error("Error fetching available plans:", err);
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoadingPlans(false);
        }
    };

    const fetchUserInvestments = async () => {
        if (!user?._id) return;
        setIsLoadingInvestments(true);
        try {
            const response = await investmentApiService.getMyInvestmentsApi({
                sortBy: 'createdAt',
                sortOrder: 'desc',
                limit: 100 // Fetch a good number for display
            });
            if (response.success) {
                setUserInvestments(response.data.investments || []);
            } else {
                setError(response.message || 'Failed to load your investments.');
            }
        } catch (err) {
            logger.error("Error fetching user investments:", err);
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoadingInvestments(false);
        }
    };

    // const handleInvestNow = (selectedPlan) => {
    //     logger.info("User wants to invest in plan:", selectedPlan.planName);
    //     setPlanToInvest(selectedPlan);
    //     setIsInvestmentModalOpen(true);
    // };


    const handleInvestNow = (selectedPlan) => { // Renamed for clarity
        logger.info("User wants to invest in plan:", selectedPlan.planName);
        setPlanToInvest(selectedPlan);
        setIsInvestmentModalOpen(true);
    };

    // const handleInvestmentInitiated = (newInvestmentId) => {
    //     logger.info("Investment initiated with ID:", newInvestmentId);
    //     setIsInvestmentModalOpen(false); // Close investment modal
    //     fetchUserInvestments(); // Refresh user's investments list
    //     // Optionally, open the TXID submission modal right away, or guide user
    //     // For now, just log and let user submit TXID from MyInvestments list
    //     alert("Investment initiated! Please make your payment and submit the TXID from 'My Investments' section for verification.");
    // };

    const handleInvestmentInitiated = (initiationResult) => {
        // initiationResult now contains { investmentId, message, paymentDetails }
        logger.info("Investment initiated with ID:", initiationResult.investmentId, "Payment Details:", initiationResult.paymentDetails);

        // Investment modal (CreateInvestmentModal) will show payment details.
        // We don't close it immediately here. The user closes it after noting details.
        // When CreateInvestmentModal's onClose is called, THEN we can open TXID modal.
        // For now, let's keep the alert and refresh. The TXID modal is triggered from InvestmentItem.

        fetchUserInvestments(); // Refresh user's investments list to show the new PENDING_VERIFICATION one

        // Prepare for potential TXID submission if user closes payment details modal
        // and wants to submit TXID immediately.
        // We need the newly created investment object for the TXID modal.
        // The `initiationResult.investmentId` is what we have.
        // We can set this up for a generic "Submit TXID" button that could appear.
        // For now, the TXID modal on this page is triggered by clicking an InvestmentItem.
        // The alert guides them to My Investments.
        // For a smoother UX, after the CreateInvestmentModal is closed by the user,
        // we could show a new prompt or button: "Paid? Submit TXID for [New Investment ID]"
        alert("Investment initiated! Please make your payment. You can submit the TXID from the 'My Investments' list or the investment details page.");
        setActiveTab('myInvestments'); // Switch tab to show their investments
    };

    const handleInvestmentAction = (actionType, investment) => {
        if (actionType === 'submit_txid') {
            setSelectedInvestmentForTxid(investment);
            setTxidValue(investment.transactionId || ''); // Pre-fill if already there
            setTxidModalMessage('');
            setTxidSubmitState(UI_STATE.IDLE);
            setIsTxidModalOpen(true);
        } else if (actionType === 'withdraw_roi') {
            // Navigate to withdrawal page, possibly pre-filling details related to this investment
            navigate(ROUTES.USER_WITHDRAW, { state: { fromInvestment: investment._id, amount: investment.expectedTotalProfitUSD } });
        }
    };

    const handleSubmitTxid = async (e) => {
        e.preventDefault();
        if (!selectedInvestmentForTxid || !txidValue.trim()) {
            setTxidModalMessage('TXID cannot be empty.');
            return;
        }
        setTxidSubmitState(UI_STATE.LOADING);
        setTxidModalMessage('');
        try {
            const response = await investmentApiService.submitInvestmentTxidApi(selectedInvestmentForTxid._id, { transactionId: txidValue });
            if (response.success) {
                setTxidModalMessage('TXID submitted successfully! Awaiting admin verification.');
                setTxidSubmitState(UI_STATE.SUCCESS);
                fetchUserInvestments(); // Refresh investments list
                setTimeout(() => setIsTxidModalOpen(false), 2000);
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            logger.error("Error submitting TXID:", err);
            setTxidModalMessage(err.message || 'Failed to submit TXID.');
            setTxidSubmitState(UI_STATE.ERROR);
        }
    };


    const renderContent = () => {
        if (error) return <div className="page-error">Error: {error}</div>;

        if (activeTab === 'available') {
            if (isLoadingPlans) return <div className="page-loading"><Spinner size="lg" message="Loading available plans..." /></div>;
            return availablePlans.length > 0 ? (
                <div className="plans-grid">
                    {availablePlans.map(plan => (
                        <PlanCard key={plan._id} plan={plan} onInvestNowClick={handleInvestNow} />
                    ))}
                </div>
            ) : <p>No investment plans are currently available.</p>;
        }

        if (activeTab === 'myInvestments') {
            if (isLoadingInvestments) return <div className="page-loading"><Spinner size="lg" message="Loading your investments..." /></div>;
            return userInvestments.length > 0 ? (
                <div className="investments-list-myplans"> {/* Different class for specific styling */}
                    {userInvestments.map(inv => (
                        <InvestmentItem key={inv._id} investment={inv} onActionClick={handleInvestmentAction} />
                    ))}
                </div>
            ) : <p>You have not made any investments yet.</p>;
        }
        return null;
    };


    return (
        <div className="my-plans-page">
            <header className="dashboard-page-header">
                <h1>Investment Plans</h1>
                <p>Explore opportunities and manage your portfolio.</p>
            </header>

            <div className="tabs-container">
                <Button
                    onClick={() => setActiveTab('available')}
                    variant={activeTab === 'available' ? 'primary' : 'outline'}
                >
                    Available Plans
                </Button>
                <Button
                    onClick={() => setActiveTab('myInvestments')}
                    variant={activeTab === 'myInvestments' ? 'primary' : 'outline'}
                >
                    My Investments
                </Button>
            </div>

            <CreateInvestmentModal
                isOpen={isInvestmentModalOpen}
                onClose={() => setIsInvestmentModalOpen(false)}
                selectedPlan={planToInvest}
                onInvestmentInitiated={handleInvestmentInitiated}
            />

            <section className="tab-content">
                {renderContent()}
            </section>

            {selectedInvestmentForTxid && (
                <Modal
                    isOpen={isTxidModalOpen}
                    onClose={() => { setIsTxidModalOpen(false); setSelectedInvestmentForTxid(null); }}
                    title={`Submit Transaction ID for ${selectedInvestmentForTxid?.planNameSnapshot || 'Investment'}`}
                >
                    <form onSubmit={handleSubmitTxid}>
                        <p>
                            Plan: <strong>{selectedInvestmentForTxid?.planNameSnapshot}</strong><br />
                            Amount: <strong>{formatCurrency(selectedInvestmentForTxid?.investedAmountUSD || 0)} ({selectedInvestmentForTxid?.paymentAmountCrypto} {selectedInvestmentForTxid?.paymentCryptocurrency})</strong>
                        </p>
                        <InputField
                            label="Transaction ID (TXID)" name="txid" value={txidValue}
                            onChange={(e) => setTxidValue(e.target.value)}
                            placeholder="Enter the blockchain transaction ID" required
                            disabled={txidSubmitState === UI_STATE.LOADING}
                        />
                        {txidModalMessage && (
                            <p className={`modal-message ${txidSubmitState === UI_STATE.SUCCESS ? 'success' : (txidSubmitState === UI_STATE.ERROR ? 'error' : 'info')}`}>
                                {txidModalMessage}
                            </p>
                        )}
                        <div className="modal-actions">
                            <Button type="button" variant="ghost" onClick={() => { setIsTxidModalOpen(false); setSelectedInvestmentForTxid(null); }} disabled={txidSubmitState === UI_STATE.LOADING}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" isLoading={txidSubmitState === UI_STATE.LOADING} disabled={txidSubmitState === UI_STATE.LOADING}>
                                Submit TXID
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Submit TXID Modal */}
            <Modal
                isOpen={isTxidModalOpen}
                onClose={() => setIsTxidModalOpen(false)}
                title={`Submit Transaction ID for ${selectedInvestmentForTxid?.planNameSnapshot || 'Investment'}`}
            >
                <form onSubmit={handleSubmitTxid}>
                    <p>
                        Plan: <strong>{selectedInvestmentForTxid?.planNameSnapshot}</strong><br />
                        Amount: <strong>{formatCurrency(selectedInvestmentForTxid?.investedAmountUSD || 0)} ({selectedInvestmentForTxid?.paymentAmountCrypto} {selectedInvestmentForTxid?.paymentCryptocurrency})</strong>
                    </p>
                    <InputField
                        label="Transaction ID (TXID)"
                        name="txid"
                        value={txidValue}
                        onChange={(e) => setTxidValue(e.target.value)}
                        placeholder="Enter the blockchain transaction ID"
                        required
                        disabled={txidSubmitState === UI_STATE.LOADING}
                    />
                    {txidModalMessage && (
                        <p className={`modal-message ${txidSubmitState === UI_STATE.SUCCESS ? 'success' : (txidSubmitState === UI_STATE.ERROR ? 'error' : 'info')}`}>
                            {txidModalMessage}
                        </p>
                    )}
                    <div className="modal-actions">
                        <Button type="button" variant="ghost" onClick={() => setIsTxidModalOpen(false)} disabled={txidSubmitState === UI_STATE.LOADING}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={txidSubmitState === UI_STATE.LOADING} disabled={txidSubmitState === UI_STATE.LOADING}>
                            Submit TXID
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MyPlansPage;