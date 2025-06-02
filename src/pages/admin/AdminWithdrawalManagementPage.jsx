// src/pages/admin/AdminWithdrawalManagementPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import InputField from '../../components/common/InputField';
import Card from '../../components/common/Card';
import { adminApiService } from '../../services';
import { APP_NAME, ROUTES, UI_STATE, WITHDRAWAL_STATUS } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import { formatDate, formatCurrency, formatCrypto } from '../../utils/formatters';
import './AdminWithdrawalManagementPage.css';

const AdminWithdrawalManagementPage = () => {
    const navigate = useNavigate();
    const [withdrawals, setWithdrawals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: WITHDRAWAL_STATUS.PENDING, // Default to pending
        userId: '',
        page: 1,
        limit: 15,
        sortBy: 'requestDate',
        sortOrder: 'asc' // Show oldest pending first
    });
    const [totalPages, setTotalPages] = useState(1);
    const [totalWithdrawals, setTotalWithdrawals] = useState(0);

    // For Modals (Approve/Reject)
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [modalActionType, setModalActionType] = useState(''); // 'approve' or 'reject'
    const [actionFormData, setActionFormData] = useState({
        platformTransactionId: '', // For approve
        rejectionReason: ''      // For reject
    });
    const [modalUiState, setModalUiState] = useState(UI_STATE.IDLE);
    const [modalMessage, setModalMessage] = useState('');

    const fetchWithdrawals = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const activeFilters = { ...filters };
            Object.keys(activeFilters).forEach(key => {
                if (activeFilters[key] === '' || activeFilters[key] === null) delete activeFilters[key];
            });
            const response = await adminApiService.getAllWithdrawalsAdminApi(activeFilters);
            if (response.success) {
                setWithdrawals(response.data.withdrawals || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalWithdrawals(response.data.totalWithdrawals || 0);
            } else setError(response.message || 'Failed to load withdrawals.');
        } catch (err) {
            logger.error("Error fetching withdrawals for admin:", err);
            setError(err.response?.data?.message || err.message || 'An error occurred.');
        } finally { setIsLoading(false); }
    }, [filters]);

    useEffect(() => {
        document.title = `Manage Withdrawals - Admin | ${APP_NAME}`;
        fetchWithdrawals();
    }, [fetchWithdrawals]);

    // const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
    // const handleSearch = (e) => { e.preventDefault(); fetchWithdrawals(); };
    const handlePageChange = (newPage) => setFilters(prev => ({ ...prev, page: newPage }));
    const handleActionFormChange = (e) => setActionFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const openActionModal = (actionType, withdrawal) => {
        setSelectedWithdrawal(withdrawal);
        setModalActionType(actionType);
        setActionFormData({ platformTransactionId: '', rejectionReason: '' }); // Reset
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
            if (modalActionType === 'approve') {
                if (!actionFormData.platformTransactionId.trim()) {
                    setModalMessage('Platform Transaction ID is required for approval.');
                    setModalUiState(UI_STATE.ERROR);
                    return;
                }
                response = await adminApiService.approveWithdrawalByAdminApi(selectedWithdrawal._id, {
                    platformTransactionId: actionFormData.platformTransactionId
                });
            } else if (modalActionType === 'reject') {
                if (!actionFormData.rejectionReason.trim()) {
                    setModalMessage('Rejection reason is required.');
                    setModalUiState(UI_STATE.ERROR);
                    return;
                }
                response = await adminApiService.rejectWithdrawalByAdminApi(selectedWithdrawal._id, {
                    rejectionReason: actionFormData.rejectionReason
                });
            }

            if (response.success) {
                setModalMessage(`Withdrawal ${modalActionType === 'approve' ? 'approved' : 'rejected'} successfully!`);
                setModalUiState(UI_STATE.SUCCESS);
                fetchWithdrawals(); // Refresh list
                setTimeout(() => setIsActionModalOpen(false), 1500);
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            logger.error(`Error performing admin action (${modalActionType}) on withdrawal:`, err);
            setModalMessage(err.response?.data?.message || err.message || `Failed to ${modalActionType} withdrawal.`);
            setModalUiState(UI_STATE.ERROR);
        }
    };

    const columns = React.useMemo(() => [
        { Header: 'Request Date', accessor: 'requestDate', Cell: ({ value }) => formatDate(value, 'MMM dd, yyyy HH:mm') },
        { Header: 'User', Cell: ({ row }) => <Link to={ROUTES.ADMIN_USER_DETAILS.replace(':userId', row.original.user?._id)}>{row.original.user?.email || 'N/A'}</Link> },
        { Header: 'Amount (USD)', accessor: 'amountUSD', Cell: ({ value }) => formatCurrency(value) },
        { Header: 'Crypto', Cell: ({ row }) => `${formatCrypto(row.original.amountCrypto || 0, row.original.cryptocurrency)} ${row.original.cryptocurrency}` },
        { Header: 'To Address', accessor: 'userPayoutWalletAddress', Cell: ({ value }) => value ? <span title={value} className="address-truncate">{value}</span> : '-' },
        { Header: 'Status', accessor: 'status', Cell: ({ value }) => <span className={`status-badge status-withdrawal-${value.toLowerCase()}`}>{value.replace(/([A-Z])/g, ' $1').trim()}</span> },
        { Header: 'Platform TXID', accessor: 'platformTransactionId', Cell: ({ value }) => value ? <span title={value} className="txid-truncate">{value}</span> : '-' },
        {
            Header: 'Actions', Cell: ({ row }) => (
                <div className="table-actions">
                    {/* <Button size="xs" variant="outline" onClick={() => openActionModal('view_details', row.original)}>View</Button> */}
                    {row.original.status === WITHDRAWAL_STATUS.PENDING && (
                        <>
                            <Button size="xs" variant="success" onClick={() => openActionModal('approve', row.original)}>Approve</Button>
                            <Button size="xs" variant="danger" onClick={() => openActionModal('reject', row.original)}>Reject</Button>
                        </>
                    )}
                </div>
            )
        },
    ], [navigate]); // Added navigate to dependencies if used in links

    return (
        <div className="admin-withdrawal-management-page">
            <header className="dashboard-page-header">
                <h1>Manage Withdrawal Requests</h1>
                <p>Review and process user withdrawal requests. Total Pending: {withdrawals.filter(w => w.status === WITHDRAWAL_STATUS.PENDING).length}</p>
            </header>
            {/* TODO: Add Filter Card */}

            {isLoading && withdrawals.length === 0 ? (
                <div className="page-loading"><Spinner size="lg" message="Loading withdrawals..." /></div>
            ) : error ? (
                <div className="page-error">Error: {error} <Button onClick={fetchWithdrawals}>Try Again</Button></div>
            ) : (
                <Card className="table-card">
                    <Table columns={columns} data={withdrawals} isLoading={isLoading} emptyMessage="No withdrawal requests found." />
                </Card>
            )}

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <Button onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page <= 1 || isLoading}>Previous</Button>
                    <span>Page {filters.page} of {totalPages}</span>
                    <Button onClick={() => handlePageChange(filters.page + 1)} disabled={filters.page >= totalPages || isLoading}>Next</Button>
                </div>
            )}

            <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} title={`${modalActionType === 'approve' ? 'Approve' : 'Reject'} Withdrawal (ID: ...${selectedWithdrawal?._id.slice(-6)})`}>
                <form onSubmit={handleModalActionSubmit}>
                    {modalMessage && <p className={`modal-message ${modalUiState === UI_STATE.SUCCESS ? 'success' : (modalUiState === UI_STATE.ERROR ? 'error' : 'info')}`}>{modalMessage}</p>}
                    <p>User: {selectedWithdrawal?.user?.email}</p>
                    <p>Amount: {formatCurrency(selectedWithdrawal?.amountUSD || 0)} ({selectedWithdrawal?.cryptocurrency})</p>
                    <p>To Address: {selectedWithdrawal?.userPayoutWalletAddress}</p>

                    {modalActionType === 'approve' && (
                        <InputField label="Platform Transaction ID (TXID of payout)" name="platformTransactionId" value={actionFormData.platformTransactionId} onChange={handleActionFormChange} required />
                    )}
                    {modalActionType === 'reject' && (
                        <InputField label="Reason for Rejection" name="rejectionReason" type="textarea" value={actionFormData.rejectionReason} onChange={handleActionFormChange} required />
                    )}
                    <div className="modal-actions">
                        <Button type="button" variant="ghost" onClick={() => setIsActionModalOpen(false)} disabled={modalUiState === UI_STATE.LOADING}>Cancel</Button>
                        <Button type="submit" variant={modalActionType === 'approve' ? "success" : "danger"} isLoading={modalUiState === UI_STATE.LOADING} disabled={modalUiState === UI_STATE.LOADING}>
                            {modalActionType === 'approve' ? 'Confirm Approval & Payout' : 'Confirm Rejection'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminWithdrawalManagementPage;