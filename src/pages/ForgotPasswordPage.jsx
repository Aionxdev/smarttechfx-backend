// src/pages/ForgotPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import { authApiService } from '../services'; // Your auth API service
import { APP_NAME, ROUTES, UI_STATE } from '../utils/constants';
import logger from '../utils/logger.util.js';
import './AuthPage.css'; // Using shared styles with LoginPage and RegisterPage

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(''); // For success or error messages
    const [uiState, setUiState] = useState(UI_STATE.IDLE);

    useEffect(() => {
        document.title = `Forgot Password - ${APP_NAME}`;
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUiState(UI_STATE.LOADING);
        setMessage('');

        if (!email) {
            setMessage('Please enter your email address.');
            setUiState(UI_STATE.ERROR);
            return;
        }

        try {
            const response = await authApiService.requestPasswordResetApi(email);
            if (response.success) {
                setMessage(response.message || 'If your email is registered, a password reset link has been sent.');
                setUiState(UI_STATE.SUCCESS);
                setEmail(''); // Clear the input field
            } else {
                throw new Error(response.message || 'Failed to send password reset email.');
            }
        } catch (err) {
            logger.error("Forgot Password error:", err);
            const displayError = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
            setMessage(displayError);
            setUiState(UI_STATE.ERROR);
        }
    };

    return (
        <div className="auth-page-container"> {/* Uses AuthLayout via router */}
            <div className="auth-form-card"> {/* Optional inner card for styling */}
                <h2 className="auth-page-title">Forgot Your Password?</h2>
                <p className="auth-page-subtitle">
                    No worries! Enter your email address below, and we'll send you a link to reset your password.
                </p>

                {message && (
                    <p className={`auth-form-${uiState === UI_STATE.SUCCESS ? 'success' : 'error'}-message`} role={uiState === UI_STATE.ERROR ? "alert" : "status"}>
                        {message}
                    </p>
                )}

                {uiState !== UI_STATE.SUCCESS && (
                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        <InputField
                            label="Email Address"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
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
                            {uiState === UI_STATE.LOADING ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>
                )}

                <p className="auth-form-switch">
                    Remember your password?{' '}
                    <Link to={ROUTES.LOGIN} className="auth-switch-link">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;