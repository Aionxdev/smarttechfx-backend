// src/pages/user/UserProfilePage.jsx
import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { userApiService } from '../../services';
import { APP_NAME, UI_STATE, SUPPORTED_CRYPTO_SYMBOLS_FRONTEND } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Modal from '../../components/common/Modal';
import './UserProfilePage.css';
import useApi from '../../hooks/useApi'; // Import useApi hook

// Define Tabs
const TABS = {
    PROFILE: 'profile',
    SECURITY: 'security',
    PAYOUT_WALLETS: 'payout_wallets',
};

const UserProfilePage = () => {
    const { fetchAndUpdateUser } = useAuth();
    const [activeTab, setActiveTab] = useState(TABS.PROFILE);
    const [message, setMessage] = useState({ text: '', type: UI_STATE.IDLE });
    const [isLoading, setIsLoading] = useState(false); // Add this line

    // Profile Information - useApi Hook
    const { data: profileData, isLoading: isProfileLoading, fetchData: fetchProfile } = useApi({ initialData: null });
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [editProfileData, setEditProfileData] = useState({ fullName: '', phoneNumber: '', country: '' });

    // Preferred Crypto - useApi Hook
    const [isPreferredCryptoModalOpen, setIsPreferredCryptoModalOpen] = useState(false);
    const [preferredPayoutCrypto, setPreferredPayoutCrypto] = useState('');

    // Security: Change Password State
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState(null);

    // PIN Management State
    const [pinAction, setPinAction] = useState(null);
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [pinOtp, setPinOtp] = useState('');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [isRequestingPinOtp, setIsRequestingPinOtp] = useState(false); // New state for OTP request

    // Payout Wallet Management State
    const [payoutWallets, setPayoutWallets] = useState({});
    const [selectedCryptoForWallet, setSelectedCryptoForWallet] = useState('');
    const [newWalletAddress, setNewWalletAddress] = useState('');
    const [walletActionPin, setWalletActionPin] = useState('');
    const [walletOtp, setWalletOtp] = useState('');
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [walletModalAction, setWalletModalAction] = useState('add');
    const [isRequestingWalletOtp, setIsRequestingWalletOtp] = useState(false);


    useEffect(() => {
        document.title = `My Profile - ${APP_NAME}`;
        // Load Profile Data
        fetchProfile({ method: 'get', url: '/users/profile' })
            .then(response => {
                if (response.success) {
                    setPayoutWallets(response.data.payoutWalletAddresses || {});
                    setPreferredPayoutCrypto(response.data.preferredPayoutCrypto || '');
                }
            })
            .catch(error => {
                logger.error("Error fetching profile:", error);
                showMessage(error.message || 'Failed to load profile.', UI_STATE.ERROR);
            });
    }, [fetchProfile]);

    useEffect(() => {
        if (profileData) {
            setEditProfileData({
                fullName: profileData.fullName || '',
                phoneNumber: profileData.phoneNumber || '',
                country: profileData.country || '',
            });
        }
    }, [profileData]);

    const showMessage = (text, type, duration = 4000) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: UI_STATE.IDLE }), duration);
    };

    // --- Profile Information ---
    const openProfileModal = () => {
        setIsProfileModalOpen(true);
    };

    const closeProfileModal = () => {
        setIsProfileModalOpen(false);
    };

    const handleEditProfileChange = (e) => {
        setEditProfileData({ ...editProfileData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await userApiService.updateUserProfileApi(editProfileData);
            if (response.success) {
                await fetchAndUpdateUser(); // OPTIONAL if /profile endpoint is updated on backend
                // After fetchAndUpdateUser, you may need to refetch profile for it to reflect in component
                await fetchProfile({ method: 'get', url: '/users/profile' }); // Force refetch profile after update
                showMessage('Profile updated successfully!', UI_STATE.SUCCESS);
                closeProfileModal();
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            logger.error('Profile update error:', err);
            showMessage(err.response?.data?.message || err.message || 'Failed to update profile.', UI_STATE.ERROR);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Preferred Crypto Modal ---
    const openPreferredCryptoModal = () => {
        setIsPreferredCryptoModalOpen(true);
    };

    const closePreferredCryptoModal = () => {
        setIsPreferredCryptoModalOpen(false);
    };

    const handlePreferredCryptoChange = (e) => {
        setPreferredPayoutCrypto(e.target.value);
    };

    const handlePreferredCryptoUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await userApiService.updatePreferredCryptoApi({ preferredPayoutCrypto });
            if (response.success) {
                await fetchAndUpdateUser(); // OPTIONAL - depends on your /auth/me implementation
                await fetchProfile({ method: 'get', url: '/users/profile' }); // Force refetch profile

                showMessage('Preferred crypto updated successfully!', UI_STATE.SUCCESS);
                closePreferredCryptoModal();
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            logger.error('Preferred crypto update error:', err);
            showMessage(err.response?.data?.message || err.message || 'Failed to update preferred crypto.', UI_STATE.ERROR);
        } finally {
            setIsLoading(false);
        }
    };


    // --- Security: Change Password ---
    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            return showMessage('New passwords do not match.', UI_STATE.ERROR);
        }
        setIsPasswordLoading(true); // Local loading state for password
        setPasswordError(null);

        try {
            const response = await userApiService.changeMyPasswordApi({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmNewPassword: passwordData.confirmNewPassword
            });
            if (response.success) {
                showMessage('Password changed successfully!', UI_STATE.SUCCESS);
                setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            logger.error('Password change error:', err);
            showMessage(err.response?.data?.message || err.message || 'Failed to change password.', UI_STATE.ERROR);
            setPasswordError(err.response?.data?.message || err.message || 'Failed to change password.');
        } finally {
            setIsPasswordLoading(false);
        }
    };

    // --- Security: PIN Management ---
    const openPinModal = (action) => {
        setPinAction(action);
        setNewPin('');
        setConfirmNewPin('');
        setPinOtp('');
        setIsPinModalOpen(true);
    };

    const closePinModal = () => {
        setIsPinModalOpen(false);
    };

    const handlePinModalSubmit = async (e) => {
        e.preventDefault();
        if (newPin !== confirmNewPin) {
            return showMessage('New PINs do not match.', UI_STATE.ERROR, 0);
        }
        setIsLoading(true);
        try {
            let response;
            if (pinAction === 'set') {
                response = await userApiService.setMyWalletPinApi({ pin: newPin });
            } else if (pinAction === 'change') {
                response = await userApiService.changeMyWalletPinApi({ otp: pinOtp, newPin });
            }
            if (response.success) {
                showMessage(
                    `Wallet PIN ${pinAction === 'set' ? 'set' : 'changed'} successfully!`,
                    UI_STATE.SUCCESS
                );
                await fetchAndUpdateUser();
                closePinModal();
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            logger.error(`PIN ${pinAction} error:`, err);
            showMessage(
                err.response?.data?.message || err.message || `Failed to ${pinAction} PIN.`,
                UI_STATE.ERROR,
                0
            );
        } finally {
            setIsLoading(false);
        }
    };

    const requestPinChangeOtpFlow = async () => {
        setIsRequestingPinOtp(true); // Start OTP request loading
        try {
            const response = await userApiService.requestPinChangeOtpApi();
            if (response.success) {
                showMessage('OTP for PIN change sent to your email.', UI_STATE.INFO, 0);
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            showMessage(err.response?.data?.message || err.message || 'Failed to send OTP.', UI_STATE.ERROR, 0);
        } finally {
            setIsRequestingPinOtp(false); // Stop OTP request loading regardless of result
        }
    };

    // --- Payout Wallet Management ---
    const openWalletModal = (action, cryptoSymbol = '') => {
        setWalletModalAction(action);
        setSelectedCryptoForWallet(cryptoSymbol || SUPPORTED_CRYPTO_SYMBOLS_FRONTEND[0]);
        setNewWalletAddress(action === 'change' ? payoutWallets[cryptoSymbol] || '' : '');
        setWalletActionPin('');
        setWalletOtp('');
        setIsWalletModalOpen(true);
    };

    const closeWalletModal = () => {
        setIsWalletModalOpen(false);
    };

    const handleWalletModalSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let response;
            if (walletModalAction === 'add') {
                response = await userApiService.setMyPayoutWalletAddressApi({
                    cryptoSymbol: selectedCryptoForWallet,
                    address: newWalletAddress,
                    pin: walletActionPin,
                });
            } else if (walletModalAction === 'change') {
                response = await userApiService.changeMyPayoutWalletAddressApi({
                    cryptoSymbol: selectedCryptoForWallet,
                    address: newWalletAddress,
                    otp: walletOtp,
                });
            }
            if (response.success) {
                showMessage(
                    `Payout wallet for ${selectedCryptoForWallet} ${walletModalAction === 'add' ? 'added' : 'updated'} successfully!`,
                    UI_STATE.SUCCESS
                );
                await fetchAndUpdateUser(); // OPTIONAL - depends on your /auth/me or global state
                fetchProfile({ method: 'get', url: '/users/profile' }); // Refetch and update UI
                closeWalletModal();
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            logger.error(`Payout wallet ${walletModalAction} error:`, err);
            showMessage(
                err.response?.data?.message || err.message || 'Failed to update payout wallet.',
                UI_STATE.ERROR,
                0
            );
        } finally {
            setIsLoading(false);
        }
    };

    const requestWalletChangeOtpFlow = async () => {
        setIsRequestingWalletOtp(true); // Start OTP request loading
        try {
            const response = await userApiService.requestWalletChangeOtpApi();
            if (response.success) {
                showMessage('OTP for changing wallet address sent to your email.', UI_STATE.INFO, 0);
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            showMessage(err.response?.data?.message || err.message || 'Failed to send OTP.', UI_STATE.ERROR, 0);
        } finally {
            setIsRequestingWalletOtp(false); // Stop OTP request loading
        }
    };

    if (isProfileLoading || !profileData) {
        return (
            <div className="page-loading">
                <Spinner message="Loading profile..." />
            </div>
        );
    }

    return (
        <div className="user-profile-page">
            <header className="dashboard-page-header">
                <h1>My Profile & Settings</h1>
            </header>

            {message.text && (
                <p
                    className={`form-global-message ${message.type === UI_STATE.SUCCESS ? 'success' : message.type === UI_STATE.ERROR ? 'error' : 'info'
                        }`}
                >
                    {message.text}
                </p>
            )}

            <div className="profile-tabs">
                <Button
                    onClick={() => setActiveTab(TABS.PROFILE)}
                    variant={activeTab === TABS.PROFILE ? 'primary' : 'ghost'}
                >
                    Profile
                </Button>
                <Button
                    onClick={() => setActiveTab(TABS.SECURITY)}
                    variant={activeTab === TABS.SECURITY ? 'primary' : 'ghost'}
                >
                    Security
                </Button>
                <Button
                    onClick={() => setActiveTab(TABS.PAYOUT_WALLETS)}
                    variant={activeTab === TABS.PAYOUT_WALLETS ? 'primary' : 'ghost'}
                >
                    Payout Wallets
                </Button>
            </div>

            <div className="profile-tab-content">
                {activeTab === TABS.PROFILE && (
                    <Card title="Personal Information">
                        <div className="profile-info">
                            <p>
                                <strong>Full Name:</strong> {profileData.fullName}
                            </p>
                            <p>
                                <strong>Email:</strong> {profileData.email}
                            </p>
                            <p>
                                <strong>Phone Number:</strong> {profileData.phoneNumber}
                            </p>
                            <p>
                                <strong>Country:</strong> {profileData.country}
                            </p>
                            <Button onClick={openProfileModal}>Edit Profile</Button>
                        </div>

                        <div className="preferred-crypto-info">
                            <p>
                                <strong>Preferred Payout Crypto:</strong> {preferredPayoutCrypto || 'Not Set'}
                            </p>
                            <Button onClick={openPreferredCryptoModal}>
                                {preferredPayoutCrypto ? 'Edit Preferred Crypto' : 'Set Preferred Crypto'}
                            </Button>
                        </div>
                    </Card>
                )}

                {activeTab === TABS.SECURITY && (
                    <>
                        <Card title="Change Password">
                            <form onSubmit={handlePasswordUpdate}>
                                <InputField
                                    label="Current Password"
                                    name="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                />
                                <InputField
                                    label="New Password"
                                    name="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                />
                                <InputField
                                    label="Confirm New Password"
                                    name="confirmNewPassword"
                                    type="password"
                                    value={passwordData.confirmNewPassword}
                                    onChange={handlePasswordChange}
                                />
                                <Button type="submit" isLoading={isPasswordLoading} disabled={isPasswordLoading}>
                                    Change Password
                                </Button>

                                {passwordError && <p className="form-error">{passwordError}</p>}
                            </form>
                        </Card>

                        <Card title="Wallet PIN Management" className="mt-6">
                            {profileData.hasWalletPin ? (
                                <>
                                    <Button onClick={() => openPinModal('change')}>Change Wallet PIN</Button>
                                    {isRequestingPinOtp && <Spinner message="Requesting OTP..." />}
                                </>
                            ) : (
                                <Button onClick={() => openPinModal('set')}>Set Wallet PIN</Button>
                            )}
                        </Card>
                    </>
                )}

                {activeTab === TABS.PAYOUT_WALLETS && (
                    <Card title="Payout Wallet Addresses">
                        <p>Manage your cryptocurrency addresses for receiving withdrawals.</p>
                        <div className="payout-wallets-list">
                            {SUPPORTED_CRYPTO_SYMBOLS_FRONTEND.map((symbol) => (
                                <div key={symbol} className="payout-wallet-item">
                                    <strong>{symbol}:</strong>
                                    <span>{payoutWallets[symbol] || 'Not Set'}</span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            openWalletModal(payoutWallets[symbol] ? 'change' : 'add', symbol)
                                        }
                                    >
                                        {payoutWallets[symbol] ? 'Change' : 'Add'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>

            {/* --- Modals --- */}

            {/* Profile Modal */}
            <Modal
                isOpen={isProfileModalOpen}
                onClose={closeProfileModal}
                title="Edit Profile"
            >
                <form onSubmit={handleProfileUpdate}>
                    <InputField
                        label="Full Name"
                        name="fullName"
                        value={editProfileData.fullName}
                        onChange={handleEditProfileChange}
                    />
                    <InputField
                        label="Phone Number"
                        name="phoneNumber"
                        type="tel"
                        value={editProfileData.phoneNumber}
                        onChange={handleEditProfileChange}
                    />
                    <InputField
                        label="Country"
                        name="country"
                        value={editProfileData.country}
                        onChange={handleEditProfileChange}
                    />
                    <div className="modal-actions">
                        <Button type="button" variant="ghost" onClick={closeProfileModal} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
                            Update Profile
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Preferred Crypto Modal */}
            <Modal
                isOpen={isPreferredCryptoModalOpen}
                onClose={closePreferredCryptoModal}
                title="Edit Preferred Crypto"
            >
                <form onSubmit={handlePreferredCryptoUpdate}>
                    <div className="input-field-wrapper">
                        <label htmlFor="preferredCryptoModal" className="input-label">
                            Default Payout Crypto
                        </label>
                        <select
                            id="preferredCryptoModal"
                            name="preferredPayoutCrypto"
                            value={preferredPayoutCrypto}
                            onChange={handlePreferredCryptoChange}
                            className="input-field"
                        >
                            <option value="">-- None --</option>
                            {SUPPORTED_CRYPTO_SYMBOLS_FRONTEND.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="modal-actions">
                        <Button type="button" variant="ghost" onClick={closePreferredCryptoModal} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
                            Update Preferred Crypto
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* PIN Management Modal */}
            <Modal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                title={`${pinAction === 'set' ? 'Set' : 'Change'} Your Wallet PIN`}
            >
                <form onSubmit={handlePinModalSubmit}>
                    {pinAction === 'change' && (
                        <>
                            <Button
                                type="button"
                                variant="link"
                                onClick={requestPinChangeOtpFlow}
                                disabled={isLoading || isRequestingPinOtp}
                                style={{ marginBottom: '1rem' }}
                            >
                                Request OTP for PIN Change
                            </Button>
                            <p><i>Click and check you mail box!</i></p>
                            <InputField
                                label="OTP"
                                name="pinOtp"
                                value={pinOtp}
                                onChange={(e) => setPinOtp(e.target.value)}
                                placeholder="Enter OTP from email"
                                disabled={isLoading || isRequestingPinOtp}
                            />
                        </>
                    )}
                    <InputField
                        label="New PIN"
                        name="newPin"
                        type="password"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        maxLength={6}
                        placeholder="4-6 digits"
                        disabled={isLoading}
                    />
                    <InputField
                        label="Confirm New PIN"
                        name="confirmNewPin"
                        type="password"
                        value={confirmNewPin}
                        onChange={(e) => setConfirmNewPin(e.target.value)}
                        maxLength={6}
                        placeholder="Re-enter new PIN"
                        disabled={isLoading}
                    />
                    {message.text && message.type !== UI_STATE.SUCCESS && (
                        <p className={`modal-message ${message.type === UI_STATE.ERROR ? 'error' : 'info'}`}>
                            {message.text}
                        </p>
                    )}
                    <div className="modal-actions">
                        <Button type="button" variant="ghost" onClick={() => setIsPinModalOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
                            {pinAction === 'set' ? 'Set PIN' : 'Change PIN'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Payout Wallet Address Modal */}
            <Modal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
                title={`${walletModalAction === 'add' ? 'Add' : 'Change'} Payout Wallet for ${selectedCryptoForWallet
                    }`}
            >
                <form onSubmit={handleWalletModalSubmit}>
                    <InputField
                        label={`New ${selectedCryptoForWallet} Address`}
                        name="newWalletAddress"
                        value={newWalletAddress}
                        onChange={(e) => setNewWalletAddress(e.target.value)}
                        placeholder={`Enter your ${selectedCryptoForWallet} wallet address`}
                        disabled={isLoading}
                    />

                    {walletModalAction === 'change' && (
                        <div>
                            <Button
                                type="button"
                                variant="link"
                                onClick={requestWalletChangeOtpFlow}
                                disabled={isLoading || isRequestingWalletOtp}
                                style={{ margin: '0.5rem 0' }}
                            >
                                Request OTP to Authorize Change
                            </Button>
                            <p><i>Click and check you mail box!</i></p>
                        </div>
                    )}

                    {walletModalAction === 'change' && (
                        <InputField
                            label="OTP"
                            name="walletOtp"
                            value={walletOtp}
                            onChange={(e) => setWalletOtp(e.target.value)}
                            placeholder="Enter OTP from email"
                            disabled={isLoading || isRequestingWalletOtp}
                        />
                    )}

                    {(walletModalAction === 'add') && (
                        <InputField
                            label="Your Wallet PIN for Authorization"
                            name="walletActionPin"
                            type="password"
                            value={walletActionPin}
                            onChange={(e) => setWalletActionPin(e.target.value)}
                            maxLength={6}
                            placeholder="Enter your PIN"
                            disabled={isLoading}
                        />
                    )}

                    {message.text && message.type !== UI_STATE.SUCCESS && (
                        <p className={`modal-message ${message.type === UI_STATE.ERROR ? 'error' : 'info'}`}>
                            {message.text}
                        </p>
                    )}
                    <div className="modal-actions">
                        <Button type="button" variant="ghost" onClick={() => setIsWalletModalOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
                            {walletModalAction === 'add' ? 'Add Address' : 'Update Address'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};

export default UserProfilePage;