// src/pages/admin/AdminUserDetailsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApiService } from '../../services'; 
// import useAuth from '../../hooks/useAuth';
import { APP_NAME, ROUTES, UI_STATE, ACCOUNT_STATUS, KYC_STATUS, USER_ROLES } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField'; // For reason input
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import './AdminUserDetailsPage.css';

const AdminUserDetailsPage = () => {
    const { userId } = useParams();
    // const { user: adminUser } = useAuth(); // Admin performing actions

    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [actionMessage, setActionMessage] = useState({ text: '', type: UI_STATE.IDLE });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(''); // 'status' or 'kyc'
    const [newStatus, setNewStatus] = useState('');
    const [statusReason, setStatusReason] = useState('');
    const [newKycStatus, setNewKycStatus] = useState('');
    const [kycRejectionReason, setKycRejectionReason] = useState('');


    const fetchUserDetails = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await adminApiService.getUserDetailsAdminApi(userId);
            if (response.success) {
                setSelectedUser(response.data);
                setNewStatus(response.data.status); // Pre-fill for modal
                setNewKycStatus(response.data.kycStatus); // Pre-fill for modal
            } else {
                setError(response.message || 'Failed to load user details.');
            }
        } catch (err) {
            logger.error(`Error fetching user details for ${userId}:`, err);
            setError(err.response?.data?.message || err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        document.title = `User Details - Admin | ${APP_NAME}`;
        fetchUserDetails();
    }, [fetchUserDetails]);

    const showMessage = (text, type, duration = 4000) => {
        setActionMessage({ text, type });
        setTimeout(() => setActionMessage({ text: '', type: UI_STATE.IDLE }), duration);
    };

    const openActionModal = (action) => {
        setModalAction(action);
        if (action === 'status') {
            setNewStatus(selectedUser?.status || '');
            setStatusReason('');
        } else if (action === 'kyc') {
            setNewKycStatus(selectedUser?.kycStatus || '');
            setKycRejectionReason(selectedUser?.kycDetails?.rejectionReason || '');
        }
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Or a specific modal loading state
        try {
            const response = await adminApiService.updateUserStatusAdminApi(userId, { status: newStatus, reason: statusReason });
            if (response.success) {
                showMessage('User status updated successfully!', UI_STATE.SUCCESS);
                fetchUserDetails(); // Refresh user details
                setIsModalOpen(false);
            } else throw new Error(response.message);
        } catch (err) {
            logger.error("User status update error:", err);
            showMessage(err.response?.data?.message || err.message || 'Failed to update status.', UI_STATE.ERROR, 0); // Keep modal open for error
        } finally { setIsLoading(false); }
    };

    const handleKycUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await adminApiService.updateUserKycStatusAdminApi(userId, { kycStatus: newKycStatus, rejectionReason: kycRejectionReason });
            if (response.success) {
                showMessage('User KYC status updated successfully!', UI_STATE.SUCCESS);
                fetchUserDetails(); // Refresh user details
                setIsModalOpen(false);
            } else throw new Error(response.message);
        } catch (err) {
            logger.error("User KYC update error:", err);
            showMessage(err.response?.data?.message || err.message || 'Failed to update KYC status.', UI_STATE.ERROR, 0);
        } finally { setIsLoading(false); }
    };


    if (isLoading && !selectedUser) return <div className="page-loading"><Spinner size="lg" message="Loading user details..." /></div>;
    if (error) return <div className="page-error">Error: {error} <Button onClick={fetchUserDetails}>Try Again</Button></div>;
    if (!selectedUser) return <div className="page-info">User not found.</div>;

    return (
        <div className="admin-user-details-page">
            <header className="dashboard-page-header">
                <h1>User Profile: {selectedUser.fullName || selectedUser.email}</h1>
                <Link to={ROUTES.ADMIN_USERS}><Button variant="outline" size="sm">← Back to User List</Button></Link>
            </header>

            {actionMessage.text && (
                <p className={`form-global-message ${actionMessage.type === UI_STATE.SUCCESS ? 'success' : 'error'}`}>
                    {actionMessage.text}
                </p>
            )}

            <div className="user-details-grid">
                <Card title="Account Information">
                    <p><strong>Full Name:</strong> {selectedUser.fullName}</p>
                    <p><strong>Email:</strong> {selectedUser.email} ({selectedUser.isEmailVerified ? "Verified" : "Not Verified"})</p>
                    <p><strong>Role:</strong> {selectedUser.role}</p>
                    <p><strong>Status:</strong> <span className={`status-badge status-${selectedUser.status?.toLowerCase()}`}>{selectedUser.status}</span></p>
                    <p><strong>Phone:</strong> {selectedUser.phoneNumber || 'N/A'}</p>
                    <p><strong>Country:</strong> {selectedUser.country || 'N/A'}</p>
                    <p><strong>Joined:</strong> {formatDate(selectedUser.createdAt, 'PPpp')}</p>
                    <p><strong>Last Login:</strong> {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt, 'PPpp') : 'Never'}</p>
                    <p><strong>Registration IP:</strong> {selectedUser.registrationIp || 'N/A'}</p>
                    <p><strong>Last Login IP:</strong> {selectedUser.lastLoginIp || 'N/A'}</p>
                    <p><strong>Preferred Payout Crypto:</strong> {selectedUser.preferredPayoutCrypto || 'None'}</p>
                    {/* Display Payout Wallets */}
                    {selectedUser.payoutWalletAddresses && Object.keys(selectedUser.payoutWalletAddresses).length > 0 && (
                        <div><strong>Payout Wallets:</strong>
                            <ul>
                                {Object.entries(selectedUser.payoutWalletAddresses).map(([key, value]) => (
                                    <li key={key}>{key}: {value}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="actions-section">
                        <Button onClick={() => openActionModal('status')} variant="warning" size="sm">Change Status</Button>
                    </div>
                </Card>

                <Card title="KYC Information">
                    <p><strong>KYC Status:</strong> <span className={`status-badge status-kyc-${selectedUser.kycStatus?.toLowerCase()}`}>{selectedUser.kycStatus || KYC_STATUS.NOT_SUBMITTED}</span></p>
                    {selectedUser.kycDetails && (
                        <>
                            <p><strong>Document Type:</strong> {selectedUser.kycDetails.documentType || 'N/A'}</p>
                            <p><strong>Document Number:</strong> {selectedUser.kycDetails.documentNumber || 'N/A'}</p>
                            {/* Links to view documents if URLs are stored */}
                            {selectedUser.kycDetails.documentFrontImage && <p><a href={selectedUser.kycDetails.documentFrontImage} target="_blank" rel="noopener noreferrer">View Front Doc</a></p>}
                            {selectedUser.kycDetails.rejectionReason && <p><strong>Rejection Reason:</strong> {selectedUser.kycDetails.rejectionReason}</p>}
                            {selectedUser.kycDetails.reviewedAt && <p><strong>Reviewed:</strong> {formatDate(selectedUser.kycDetails.reviewedAt, 'PPpp')} by {selectedUser.kycDetails.reviewedBy?.toString() || 'Admin'}</p>}
                        </>
                    )}
                    <div className="actions-section">
                        <Button onClick={() => openActionModal('kyc')} variant="info" size="sm" disabled={!selectedUser.kycDetails || selectedUser.kycStatus === KYC_STATUS.NOT_SUBMITTED}>
                            Update KYC Status
                        </Button>
                    </div>
                </Card>

                {/* TODO: Add cards for User's Investments, User's Withdrawals, User's Activity Log (fetched separately) */}
            </div>

            {/* Modals for Actions */}
            <Modal isOpen={isModalOpen && modalAction === 'status'} onClose={() => setIsModalOpen(false)} title="Update User Account Status">
                <form onSubmit={handleStatusUpdate}>
                    <div className="input-field-wrapper">
                        <label htmlFor="newStatus" className="input-label">New Status</label>
                        <select id="newStatus" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field">
                            {Object.values(ACCOUNT_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    {(newStatus === ACCOUNT_STATUS.SUSPENDED || newStatus === ACCOUNT_STATUS.DEACTIVATED) && (
                        <InputField label="Reason (Required)" name="statusReason" type="textarea" value={statusReason} onChange={(e) => setStatusReason(e.target.value)} required />
                    )}
                    {actionMessage.text && actionMessage.type === UI_STATE.ERROR && <p className="modal-message error">{actionMessage.text}</p>}
                    <div className="modal-actions">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>Update Status</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isModalOpen && modalAction === 'kyc'} onClose={() => setIsModalOpen(false)} title="Update User KYC Status">
                <form onSubmit={handleKycUpdate}>
                    <div className="input-field-wrapper">
                        <label htmlFor="newKycStatus" className="input-label">New KYC Status</label>
                        <select id="newKycStatus" value={newKycStatus} onChange={(e) => setNewKycStatus(e.target.value)} className="input-field">
                            {Object.values(KYC_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    {newKycStatus === KYC_STATUS.REJECTED && (
                        <InputField label="Rejection Reason (Required)" name="kycRejectionReason" type="textarea" value={kycRejectionReason} onChange={(e) => setKycRejectionReason(e.target.value)} required />
                    )}
                    {actionMessage.text && actionMessage.type === UI_STATE.ERROR && <p className="modal-message error">{actionMessage.text}</p>}
                    <div className="modal-actions">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>Update KYC</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminUserDetailsPage;