import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { adminApiService } from '../../services';
import { APP_NAME, UI_STATE, SUPPORTED_CRYPTO_SYMBOLS_FRONTEND, USER_ROLES } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import { formatDate, truncateString } from '../../utils/formatters';
import './AdminPlatformSettingsPage.css'; // Ensure this CSS file exists and is styled

const AdminPlatformSettingsPage = () => {
    // --- Supported Cryptos State ---
    const [supportedCryptos, setSupportedCryptos] = useState([]);
    const [isLoadingCryptos, setIsLoadingCryptos] = useState(true);
    const [cryptoModalOpen, setCryptoModalOpen] = useState(false);
    const [currentCrypto, setCurrentCrypto] = useState(null);
    const [cryptoFormData, setCryptoFormData] = useState({
        name: '', symbol: '', platformDepositWalletAddress: '',
        isActiveForInvestment: true, isActiveForPayout: true,
        networkConfirmationThreshold: '', displayOrder: '0', iconUrl: '', notes: ''
    });
    const [cryptoFormUiState, setCryptoFormUiState] = useState(UI_STATE.IDLE);
    const [cryptoFormMessage, setCryptoFormMessage] = useState('');

    // --- Announcements State ---
    const [showBroadcastForm, setShowBroadcastForm] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
    const [announcementData, setAnnouncementData] = useState({ title: '', message: '', targetRoles: [] });
    const [announcementUiState, setAnnouncementUiState] = useState(UI_STATE.IDLE);
    const [announcementFormMessage, setAnnouncementFormMessage] = useState(''); // Specific to broadcast form
    const [generalPageError, setGeneralPageError] = useState(''); // For list loading errors

    // Fetch Supported Cryptos
    const fetchSupportedCryptos = useCallback(async () => {
        setIsLoadingCryptos(true);
        setGeneralPageError('');
        try {
            const response = await adminApiService.getSupportedCryptosAdminApi();
            if (response.success) {
                setSupportedCryptos(response.data || []);
            } else {
                throw new Error(response.message || "Failed to load supported cryptocurrencies.");
            }
        } catch (err) {
            logger.error("Error fetching supported cryptos:", err);
            setGeneralPageError(err.message);
        } finally {
            setIsLoadingCryptos(false);
        }
    }, []);

    // Fetch Announcements
    const fetchAnnouncements = useCallback(async () => {
        setIsLoadingAnnouncements(true);
        setGeneralPageError(''); // Clear previous general errors
        try {
            const response = await adminApiService.getAllAnnouncementsAdminApi(); // Assuming pagination params if needed
            if (response.success) {
                setAnnouncements(response.data || []); // Assuming response.data is the array
            } else {
                throw new Error(response.message || "Failed to load announcements.");
            }
        } catch (err) {
            logger.error("Error fetching announcements:", err);
            setGeneralPageError(err.message);
        } finally {
            setIsLoadingAnnouncements(false);
        }
    }, []);

    useEffect(() => {
        document.title = `Platform Settings - Admin | ${APP_NAME}`;
        fetchSupportedCryptos();
        fetchAnnouncements();
    }, [fetchSupportedCryptos, fetchAnnouncements]);

    // --- Supported Crypto Handlers ---
    const resetCryptoForm = useCallback(() => {
        setCryptoFormData({
            name: '', symbol: '', platformDepositWalletAddress: '',
            isActiveForInvestment: true, isActiveForPayout: true,
            networkConfirmationThreshold: '', displayOrder: '0', iconUrl: '', notes: ''
        });
        setCurrentCrypto(null);
        setCryptoFormMessage('');
        setCryptoFormUiState(UI_STATE.IDLE);
    }, []);

    const openCryptoModal = useCallback((cryptoToEdit = null) => {
        resetCryptoForm();
        if (cryptoToEdit && cryptoToEdit._id) {
            setCurrentCrypto(cryptoToEdit);
            setCryptoFormData({
                name: cryptoToEdit.name || '',
                symbol: cryptoToEdit.symbol || '',
                platformDepositWalletAddress: cryptoToEdit.platformDepositWalletAddress || '',
                isActiveForInvestment: typeof cryptoToEdit.isActiveForInvestment === 'boolean' ? cryptoToEdit.isActiveForInvestment : true,
                isActiveForPayout: typeof cryptoToEdit.isActiveForPayout === 'boolean' ? cryptoToEdit.isActiveForPayout : true,
                networkConfirmationThreshold: cryptoToEdit.networkConfirmationThreshold?.toString() || '',
                displayOrder: cryptoToEdit.displayOrder?.toString() || '0',
                iconUrl: cryptoToEdit.iconUrl || '',
                notes: cryptoToEdit.notes || ''
            });
        }
        setCryptoFormMessage('');
        setCryptoFormUiState(UI_STATE.IDLE);
        setCryptoModalOpen(true);
    }, [resetCryptoForm]);

    const handleCryptoFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCryptoFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleCryptoFormSubmit = async (e) => {
        e.preventDefault();
        setCryptoFormUiState(UI_STATE.LOADING);
        setCryptoFormMessage('');
        try {
            const payload = {
                ...cryptoFormData,
                symbol: cryptoFormData.symbol.toUpperCase().trim(),
                name: cryptoFormData.name.trim(),
                platformDepositWalletAddress: cryptoFormData.platformDepositWalletAddress.trim(),
                networkConfirmationThreshold: cryptoFormData.networkConfirmationThreshold ? parseInt(cryptoFormData.networkConfirmationThreshold, 10) : undefined,
                displayOrder: cryptoFormData.displayOrder ? parseInt(cryptoFormData.displayOrder, 10) : 0,
            };
            let response;
            if (currentCrypto && currentCrypto._id) {
                response = await adminApiService.updateSupportedCryptoAdminApi(currentCrypto._id, payload);
            } else {
                response = await adminApiService.addSupportedCryptoAdminApi(payload);
            }
            if (response.success) {
                setCryptoFormMessage(currentCrypto ? 'Cryptocurrency updated successfully!' : 'Cryptocurrency added successfully!');
                setCryptoFormUiState(UI_STATE.SUCCESS);
                fetchSupportedCryptos();
                setTimeout(() => {
                    setCryptoModalOpen(false);
                    resetCryptoForm(); // Reset form after successful operation and modal close
                }, 1500);
            } else {
                throw new Error(response.message || 'Operation failed.');
            }
        } catch (err) {
            logger.error(`Error ${currentCrypto ? 'updating' : 'adding'} crypto:`, err);
            setCryptoFormMessage(err.response?.data?.message || err.message || 'Operation failed.');
            setCryptoFormUiState(UI_STATE.ERROR);
        }
    };

    // --- Announcement Handlers ---
    const handleAnnouncementChange = (e) => {
        const { name, value, options } = e.target;
        if (name === "targetRoles") {
            // For a standard select (not multi-select)
            setAnnouncementData(prev => ({ ...prev, targetRoles: value ? [value] : [] }));
        } else {
            setAnnouncementData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleBroadcastSubmit = async (e) => {
        e.preventDefault();
        setAnnouncementUiState(UI_STATE.LOADING);
        setAnnouncementFormMessage('');
        setGeneralPageError('');
        try {
            const payload = {
                ...announcementData,
                title: announcementData.title.trim(),
                message: announcementData.message.trim(),
                targetRoles: announcementData.targetRoles[0] === "" || !announcementData.targetRoles[0] ? [] : announcementData.targetRoles,
            };
            if (!payload.title || !payload.message) {
                setAnnouncementFormMessage("Title and Message are required.");
                setAnnouncementUiState(UI_STATE.ERROR);
                return;
            }
            const response = await adminApiService.broadcastAnnouncementAdminApi(payload);
            if (response.success) {
                setAnnouncementFormMessage('Announcement broadcasted successfully!');
                setAnnouncementUiState(UI_STATE.SUCCESS);
                setAnnouncementData({ title: '', message: '', targetRoles: [] });
                fetchAnnouncements();
                setTimeout(() => {
                    setAnnouncementFormMessage('');
                    setAnnouncementUiState(UI_STATE.IDLE);
                    setShowBroadcastForm(false);
                }, 2000);
            } else {
                throw new Error(response.message || "Failed to broadcast announcement.");
            }
        } catch (err) {
            logger.error("Error broadcasting announcement:", err);
            setAnnouncementFormMessage(err.response?.data?.message || err.message || 'Failed to broadcast.');
            setAnnouncementUiState(UI_STATE.ERROR);
        }
    };

    const handleDeleteAnnouncement = useCallback(async (notificationId) => {
        if (!window.confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) {
            return;
        }
        setGeneralPageError(''); // Clear previous page messages
        // No specific row loading state, page will refresh
        try {
            const response = await adminApiService.deleteAnnouncementAdminApi(notificationId);
            if (response.success) {
                // Use NotificationContext for a toast perhaps, or a more subtle message
                logger.info('Announcement deleted successfully!');
                fetchAnnouncements(); // Refresh the list
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            logger.error("Error deleting announcement:", err);
            setGeneralPageError(err.response?.data?.message || err.message || 'Failed to delete announcement.');
        }
    }, [fetchAnnouncements]);

    const cryptoColumns = useMemo(() => [
        { Header: 'Icon', Cell: ({ row }) => row.iconUrl ? <img src={row.iconUrl} alt={row.name || 'icon'} width="24" height="24" style={{ borderRadius: '50%' }} /> : 'N/A' },
        { Header: 'Name', accessor: 'name', Cell: ({ row }) => row.name || 'N/A' },
        { Header: 'Symbol', accessor: 'symbol', Cell: ({ row }) => row.symbol || 'N/A' },
        { Header: 'Invest Active', accessor: 'isActiveForInvestment', Cell: ({ value }) => typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 'N/A' },
        { Header: 'Payout Active', accessor: 'isActiveForPayout', Cell: ({ value }) => typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 'N/A' },
        { Header: 'Deposit Address', accessor: 'platformDepositWalletAddress', Cell: ({ value }) => value ? truncateString(value, 20) : 'N/A' },
        { Header: 'Order', accessor: 'displayOrder', Cell: ({ value }) => (value !== null && value !== undefined) ? value : 'N/A' },
        { Header: 'Actions', Cell: ({ row }) => row._id ? <Button size="xs" onClick={() => openCryptoModal(row)}>Edit</Button> : null },
    ], [openCryptoModal]); 

    const announcementColumns = useMemo(() => [
        { Header: 'Date', accessor: 'createdAt', Cell: ({ row }) => row.createdAt ? formatDate(row.createdAt, 'MMM dd, yyyy HH:mm') : 'N/A' },
        { Header: 'Title', accessor: 'title', Cell: ({ row }) => row.title ? truncateString(row.title, 40) : 'N/A' },
        { Header: 'Message', accessor: 'message', Cell: ({ row }) => row.message ? truncateString(row.message, 60) : 'N/A' },
        {
            Header: 'Target Roles',
            Cell: ({ row }) => { // `row` is the announcement object
                // console.log("Target Roles Cell - row:", JSON.parse(JSON.stringify(row))); // For debugging
                // Safely access targetRoles
                if (row.targetRoles && Array.isArray(row.targetRoles) && row.targetRoles.length > 0) {
                    return row.targetRoles.join(', ');
                }
                return 'All Users'; // Default if targetRoles is empty, null, or undefined
            }
        },
        {
            Header: 'Actions',
            Cell: ({ row }) => { // `row` is the announcement object
                if (!row?._id) return null;
                return (
                    <Button size="xs" variant="danger" onClick={() => handleDeleteAnnouncement(row._id)}>
                        Delete
                    </Button>
                );
            }
        }
    ], [handleDeleteAnnouncement]); 


    return (
        <div className="admin-platform-settings-page">
            <header className="dashboard-page-header"><h1>Platform Settings & Communications</h1></header>

            {generalPageError && (
                <p className="form-global-message error">
                    {generalPageError}
                </p>
            )}

            <Card title="Manage Supported Cryptocurrencies" className="settings-card">
                <div className="card-header-action">
                    <Button variant="primary" size="sm" onClick={() => openCryptoModal()}>Add New Crypto</Button>
                </div>
                {isLoadingCryptos ? <Spinner /> : (
                    supportedCryptos.length > 0 ?
                        <Table columns={cryptoColumns} data={supportedCryptos} />
                        : <p className="no-data-message">No cryptocurrencies configured yet.</p>
                )}
            </Card>

            <Card title="Manage Announcements" className="settings-card announcements-card">
                {!showBroadcastForm && (
                    <div className="card-header-action" style={{ marginBottom: 'var(--space-4)' }}>
                        <Button variant="primary" onClick={() => { setShowBroadcastForm(true); setAnnouncementFormMessage(''); setAnnouncementUiState(UI_STATE.IDLE); }}>
                            Compose New Announcement
                        </Button>
                    </div>
                )}

                {showBroadcastForm && (
                    <div className="broadcast-form-container">
                        <h3>Compose New Announcement</h3>
                        {announcementFormMessage && <p className={`form-message ${announcementUiState === UI_STATE.SUCCESS ? 'success' : 'error'}`}>{announcementFormMessage}</p>}
                        <form onSubmit={handleBroadcastSubmit} className="announcement-form">
                            <InputField label="Title" name="title" value={announcementData.title} onChange={handleAnnouncementChange} required disabled={announcementUiState === UI_STATE.LOADING} />
                            <InputField label="Message" name="message" type="textarea" rows={5} value={announcementData.message} onChange={handleAnnouncementChange} required disabled={announcementUiState === UI_STATE.LOADING} />
                            <div className="input-field-wrapper">
                                <label htmlFor="targetRoles" className="input-label">Target Roles</label>
                                <select id="targetRoles" name="targetRoles" value={announcementData.targetRoles[0] || ""} onChange={handleAnnouncementChange} className="input-field" disabled={announcementUiState === UI_STATE.LOADING}>
                                    <option value="">All Users (Default)</option>
                                    {Object.values(USER_ROLES).map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                                <small>Select one role, or leave blank for all.</small>
                            </div>
                            <div className="form-actions">
                                <Button type="button" variant="ghost" onClick={() => setShowBroadcastForm(false)} disabled={announcementUiState === UI_STATE.LOADING}>Cancel</Button>
                                <Button type="submit" variant="primary" isLoading={announcementUiState === UI_STATE.LOADING} disabled={announcementUiState === UI_STATE.LOADING}>
                                    Send Broadcast
                                </Button>
                            </div>
                        </form>
                        <hr className="section-divider" />
                    </div>
                )}

                <h4>Previously Sent Announcements</h4>
                {isLoadingAnnouncements ? <Spinner /> : (
                    announcements.length > 0 ?
                        <Table columns={announcementColumns} data={announcements} />
                        : <p className="no-data-message">No announcements sent yet.</p>
                )}
            </Card>

            <Modal isOpen={cryptoModalOpen} onClose={() => { setCryptoModalOpen(false); resetCryptoForm();}} title={currentCrypto ? `Edit ${currentCrypto.name}` : 'Add New Supported Cryptocurrency'}>
                <form onSubmit={handleCryptoFormSubmit}>
                    {cryptoFormMessage && <p className={`modal-message ${cryptoFormUiState === UI_STATE.SUCCESS ? 'success' : (cryptoFormUiState === UI_STATE.ERROR ? 'error' : 'info')}`}>{cryptoFormMessage}</p>}
                    <InputField label="Name" name="name" value={cryptoFormData.name} onChange={handleCryptoFormChange} required />
                    <InputField label="Symbol (e.g., BTC)" name="symbol" value={cryptoFormData.symbol} onChange={handleCryptoFormChange} required disabled={!!currentCrypto} />
                    <InputField label="Platform Deposit Wallet Address" name="platformDepositWalletAddress" value={cryptoFormData.platformDepositWalletAddress} onChange={handleCryptoFormChange} required />
                    <InputField label="Icon URL (Optional)" name="iconUrl" value={cryptoFormData.iconUrl} onChange={handleCryptoFormChange} />
                    <div className="form-row">
                        <InputField label="Network Confirmations" name="networkConfirmationThreshold" type="number" value={cryptoFormData.networkConfirmationThreshold} onChange={handleCryptoFormChange} placeholder="e.g., 3" />
                        <InputField label="Display Order" name="displayOrder" type="number" value={cryptoFormData.displayOrder} onChange={handleCryptoFormChange} placeholder="e.g., 1" />
                    </div>
                    <div className="form-checkbox-group">
                        <label><input type="checkbox" name="isActiveForInvestment" checked={cryptoFormData.isActiveForInvestment} onChange={handleCryptoFormChange} /> Active for Investment</label>
                        <label><input type="checkbox" name="isActiveForPayout" checked={cryptoFormData.isActiveForPayout} onChange={handleCryptoFormChange} /> Active for Payout</label>
                    </div>
                    <InputField label="Admin Notes (Optional)" name="notes" type="textarea" value={cryptoFormData.notes} onChange={handleCryptoFormChange} />

                    <div className="modal-actions">
                        <Button type="button" variant="ghost" onClick={() => { setCryptoModalOpen(false); resetCryptoForm(); }} disabled={cryptoFormUiState === UI_STATE.LOADING}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={cryptoFormUiState === UI_STATE.LOADING} disabled={cryptoFormUiState === UI_STATE.LOADING}>
                            {currentCrypto ? 'Update Crypto' : 'Add Crypto'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminPlatformSettingsPage;