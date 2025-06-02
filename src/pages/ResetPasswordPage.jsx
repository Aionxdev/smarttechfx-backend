// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import { authApiService } from '../services';
import { APP_NAME, ROUTES, UI_STATE } from '../utils/constants';
import logger from '../utils/logger.util.js';
import './AuthPage.css'; // Shared styles

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [uiState, setUiState] = useState(UI_STATE.IDLE);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = `Reset Password - ${APP_NAME}`;
        if (!token) {
            setMessage('Invalid or missing password reset token. Please request a new reset link.');
            setUiState(UI_STATE.ERROR);
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUiState(UI_STATE.LOADING);
        setMessage('');

        if (!token) {
            setMessage('Invalid or missing password reset token.');
            setUiState(UI_STATE.ERROR);
            return;
        }
        if (!password || !confirmPassword) {
            setMessage('Both password fields are required.');
            setUiState(UI_STATE.ERROR);
            return;
        }
        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            setUiState(UI_STATE.ERROR);
            return;
        }
        if (password.length < 6) {
            setMessage('Password must be at least 6 characters long.');
            setUiState(UI_STATE.ERROR);
            return;
        }

        try {
            const response = await authApiService.resetPasswordApi(token, password);
            if (response.success) {
                setMessage(response.message || 'Your password has been reset successfully! You can now login.');
                setUiState(UI_STATE.SUCCESS);
                setTimeout(() => navigate(ROUTES.LOGIN), 3000); // Redirect to login after success
            } else {
                throw new Error(response.message || 'Failed to reset password.');
            }
        } catch (err) {
            logger.error("Reset Password error:", err);
            const displayError = err.response?.data?.message || err.message || 'An error occurred. The token might be invalid or expired.';
            setMessage(displayError);
            setUiState(UI_STATE.ERROR);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-form-card">
                <h2 className="auth-page-title">Reset Your Password</h2>
                <p className="auth-page-subtitle">
                    Enter and confirm your new password below.
                </p>

                {message && (
                    <p className={`auth-form-${uiState === UI_STATE.SUCCESS ? 'success' : 'error'}-message`} role={uiState === UI_STATE.ERROR ? "alert" : "status"}>
                        {message}
                    </p>
                )}

                {uiState !== UI_STATE.SUCCESS && token && ( // Only show form if token exists and not yet successful
                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        <InputField
                            label="New Password"
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            disabled={uiState === UI_STATE.LOADING}
                        />
                        <InputField
                            label="Confirm New Password"
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            disabled={uiState === UI_STATE.LOADING}
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={uiState === UI_STATE.LOADING}
                            disabled={uiState === UI_STATE.LOADING}
                            className="auth-submit-button"
                        >
                            {uiState === UI_STATE.LOADING ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>
                )}
                {uiState === UI_STATE.SUCCESS && (
                    <Link to={ROUTES.LOGIN} className="auth-switch-link">
                        Proceed to Login
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;