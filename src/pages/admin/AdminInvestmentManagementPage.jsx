// src/pages/admin/AdminInvestmentManagementPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import InputField from '../../components/common/InputField';
import Card from '../../components/common/Card';
import { adminApiService } from '../../services'; // investmentService used if adminVerifyAndActivateInvestment is there
import { APP_NAME, ROUTES, UI_STATE, INVESTMENT_STATUS } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import { formatDate, formatCurrency } from '../../utils/formatters';
import './AdminInvestmentManagementPage.css';

const AdminInvestmentManagementPage = () => {
    const navigate = useNavigate();
    const [investments, setInvestments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '', userId: '', planId: '', // Add planId if useful
        page: 1, limit: 15, sortBy: 'createdAt', sortOrder: 'desc'
    });
    const [totalPages, setTotalPages] = useState(1);
    const [totalInvestments, setTotalInvestments] = useState(0);

    // For Modals (Verify/Cancel)
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState(null);
    const [modalActionType, setModalActionType] = useState(''); // 'verify' or 'cancel'
    const [actionFormData, setActionFormData] = useState({
        transactionId: '', // For verify
        actualCryptoAmountReceived: '', // For verify
        reason: '', // For cancel
        adminNotes: '' // For verify
    });
    const [modalUiState, setModalUiState] = useState(UI_STATE.IDLE);
    const [modalMessage, setModalMessage] = useState('');


    const fetchInvestments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const activeFilters = { ...filters };
            Object.keys(activeFilters).forEach(key => {
                if (activeFilters[key] === '' || activeFilters[key] === null) delete activeFilters[key];
            });
            const response = await adminApiService.getAllInvestmentsAdminApi(activeFilters);
            if (response.success) {
                setInvestments(response.data.investments || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalInvestments(response.data.totalInvestments || 0);
            } else setError(response.message || 'Failed to load investments.');
        } catch (err) {
            logger.error("Error fetching investments for admin:", err);
            setError(err.response?.data?.message || err.message || 'An error occurred.');
        } finally { setIsLoading(false); }
    }, [filters]);

    useEffect(() => {
        document.title = `Manage Investments - Admin | ${APP_NAME}`;
        fetchInvestments();
    }, [fetchInvestments]);

    // const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
    // const handleSearch = (e) => { e.preventDefault(); fetchInvestments(); };
    const handlePageChange = (newPage) => setFilters(prev => ({ ...prev, page: newPage }));
    const handleActionFormChange = (e) => setActionFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));


    const openActionModal = (actionType, investment) => {
        setSelectedInvestment(investment);
        setModalActionType(actionType);
        setActionFormData({ // Reset form data
            transactionId: investment.transactionId || '', // Pre-fill if user submitted
            actualCryptoAmountReceived: investment.paymentAmountCrypto?.toString() || '', // Pre-fill expected for admin
            reason: '',
            adminNotes: investment.adminNotes || ''
        });
        setModalMessage('');
        setModalUiState(UI_STATE.IDLE);
        setIsActionModalOpen(true);
    };

    const handleModalActionSubmit = async (e) => {
        e.preventDefault();
        setModalUiState(UI_STATE.LOADING);
        setModalMessage('');
        try {
            let response;
            if (modalActionType === 'verify') {
                response = await adminApiService.verifyInvestmentByAdminApi(selectedInvestment._id, {
                    transactionId: actionFormData.transactionId,
                    actualCryptoAmountReceived: parseFloat(actionFormData.actualCryptoAmountReceived),
                    adminNotes: actionFormData.adminNotes
                });
            } else if (modalActionType === 'cancel') {
                response = await adminApiService.cancelPendingInvestmentByAdminApi(selectedInvestment._id, {
                    reason: actionFormData.reason
                });
            }

            if (response.success) {
                setModalMessage(`Investment ${modalActionType === 'verify' ? 'verified' : 'cancelled'} successfully!`);
                setModalUiState(UI_STATE.SUCCESS);
                fetchInvestments(); // Refresh list
                setTimeout(() => setIsActionModalOpen(false), 1500);
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            logger.error(`Error performing admin action (${modalActionType}) on investment:`, err);
            setModalMessage(err.response?.data?.message || err.message || `Failed to ${modalActionType} investment.`);
            setModalUiState(UI_STATE.ERROR);
        }
    };

    const columns = React.useMemo(() => [
        {
            Header: 'User',
            // No accessor needed if Cell directly uses `row`
            Cell: ({ row }) => { // `row` is the investment object here
                // console.log("Rendering 'User' cell, row data:", JSON.parse(JSON.stringify(row))); // For debugging
                // `row.user` is the populated user object from the backend
                // Ensure backend populates `user` field on Investment model when fetching for admin
                const userId = row.user?._id;
                const userEmail = row.user?.email;
                if (userId && userEmail) {
                    return <Link to={ROUTES.ADMIN_USER_DETAILS.replace(':userId', userId)}>{userEmail}</Link>;
                }
                return 'N/A';
            }
        },
        { Header: 'Plan', accessor: 'planNameSnapshot', Cell: ({ row }) => row.planNameSnapshot || 'N/A' },
        { Header: 'Amount (USD)', accessor: 'investedAmountUSD', Cell: ({ row }) => formatCurrency(row.investedAmountUSD || 0) },
        { Header: 'Crypto Pmt', Cell: ({ row }) => row.paymentCryptocurrency ? `${row.paymentAmountCrypto || 0} ${row.paymentCryptocurrency}` : 'N/A' },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => value ? <span className={`status-badge status-${value.toLowerCase()}`}>{value.replace(/([A-Z])/g, ' $1').trim()}</span> : 'N/A'
        },
        {
            Header: 'User TXID',
            accessor: 'transactionId', // This is the user-submitted or admin-confirmed TXID on the Investment doc
            Cell: ({ value }) => value ? <span title={value} className="txid-truncate">{value}</span> : 'Not Submitted'
        },
        { Header: 'Invested On', accessor: 'investmentDate', Cell: ({ value }) => value ? formatDate(value, 'MMM dd, yyyy') : '-' },
        { Header: 'Activated On', accessor: 'activationDate', Cell: ({ value }) => value ? formatDate(value, 'MMM dd, yyyy') : '-' },
        { Header: 'Matures On', accessor: 'maturityDate', Cell: ({ value }) => value ? formatDate(value, 'MMM dd, yyyy') : '-' },
        {
            Header: 'Actions',
            Cell: ({ row }) => { // `row` is the investment object
                if (!row?._id) return null;
                return (
                    <div className="table-actions">
                        {/* TODO: Create an AdminInvestmentDetailsPage or use a modal */}
                        {/* <Button size="xs" variant="outline" onClick={() => navigate(`/admin/investments/${row._id}/details`)}>View</Button> */}
                        {row.status === INVESTMENT_STATUS.PENDING_VERIFICATION && (
                            <>
                                <Button size="xs" variant="success" onClick={() => openActionModal('verify', row)}>Verify</Button>
                                <Button size="xs" variant="danger" onClick={() => openActionModal('cancel', row)}>Cancel</Button>
                            </>
                        )}
                    </div>
                );
            }
        },
    ], [navigate, openActionModal]); // Add openActionModal to dependencies if it's defined in component scope and memoized


    return (
        <div className="admin-investment-management-page">
            <header className="dashboard-page-header">
                <h1>Manage All Investments</h1>
                <p>Oversee and manage user investment activities. Total Investments: {totalInvestments}</p>
            </header>
            {/* TODO: Add Filter Card similar to User Management */}

            {isLoading && investments.length === 0 ? (
                <div className="page-loading"><Spinner size="lg" message="Loading investments..." /></div>
            ) : error ? (
                <div className="page-error">Error: {error} <Button onClick={fetchInvestments}>Try Again</Button></div>
            ) : (
                <Card className="table-card">
                    <Table columns={columns} data={investments} isLoading={isLoading} emptyMessage="No investments found." />
                </Card>
            )}

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <Button onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page <= 1 || isLoading}>Previous</Button>
                    <span>Page {filters.page} of {totalPages}</span>
                    <Button onClick={() => handlePageChange(filters.page + 1)} disabled={filters.page >= totalPages || isLoading}>Next</Button>
                </div>
            )}

            {/* Action Modal */}
            <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} title={`${modalActionType === 'verify' ? 'Verify' : 'Cancel'} Investment (ID: ...${selectedInvestment?._id.slice(-6)})`}>
                <form onSubmit={handleModalActionSubmit}>
                    {modalMessage && <p className={`modal-message ${modalUiState === UI_STATE.SUCCESS ? 'success' : (modalUiState === UI_STATE.ERROR ? 'error' : 'info')}`}>{modalMessage}</p>}

                    {modalActionType === 'verify' && (
                        <>
                            <p>User: {selectedInvestment?.user?.email}</p>
                            <p>Plan: {selectedInvestment?.planNameSnapshot}</p>
                            <p>Expected: {selectedInvestment?.paymentAmountCrypto} {selectedInvestment?.paymentCryptocurrency} ({formatCurrency(selectedInvestment?.investedAmountUSD)})</p>
                            <p>User Submitted TXID: {selectedInvestment?.transactionId || "N/A - Admin to provide"}</p>
                            <InputField label="Confirmed Blockchain TXID" name="transactionId" value={actionFormData.transactionId} onChange={handleActionFormChange} required />
                            <InputField label="Actual Crypto Amount Received" name="actualCryptoAmountReceived" type="number" step="any" value={actionFormData.actualCryptoAmountReceived} onChange={handleActionFormChange} required />
                            {/* <InputField label="Admin Notes (Optional)" name="adminNotes" type="textarea" value={actionFormData.adminNotes} onChange={handleActionFormChange} /> */}
                        </>
                    )}
                    {modalActionType === 'cancel' && (
                        <>
                            <p>User: {selectedInvestment?.user?.email}</p>
                            <p>Plan: {selectedInvestment?.planNameSnapshot}</p>
                            <InputField label="Reason for Cancellation" name="reason" type="textarea" value={actionFormData.reason} onChange={handleActionFormChange} required />
                        </>
                    )}

                    <div className="modal-actions">
                        <Button type="button" variant="ghost" onClick={() => setIsActionModalOpen(false)} disabled={modalUiState === UI_STATE.LOADING}>Cancel</Button>
                        <Button type="submit" variant={modalActionType === 'verify' ? "success" : "danger"} isLoading={modalUiState === UI_STATE.LOADING} disabled={modalUiState === UI_STATE.LOADING}>
                            {modalActionType === 'verify' ? 'Verify & Activate' : 'Confirm Cancellation'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminInvestmentManagementPage;