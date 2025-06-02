// src/pages/VerifyEmailPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import { authApiService } from '../services';
import { APP_NAME, ROUTES, UI_STATE, OTP_PURPOSES } from '../utils/constants';
import logger from '../utils/logger.util.js';
import './AuthPage.css'; // Shared styles

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const emailFromQuery = searchParams.get('email'); // If email is passed in query for pre-fill
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState(emailFromQuery || '');
    const [message, setMessage] = useState('');
    const [uiState, setUiState] = useState(UI_STATE.IDLE);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = `Verify Email - ${APP_NAME}`;
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUiState(UI_STATE.LOADING);
        setMessage('');

        if (!otp || !email) {
            setMessage('Email and OTP are required.');
            setUiState(UI_STATE.ERROR);
            return;
        }

        try {
            // The verifyOtpController now calls userService.verifyEmailWithOtp for this purpose
            const response = await authApiService.verifyOtpApi(email, otp, OTP_PURPOSES.EMAIL_VERIFICATION);
            if (response.success) {
                setMessage(response.message || 'Email verified successfully! You can now login.');
                setUiState(UI_STATE.SUCCESS);
                setTimeout(() => navigate(ROUTES.LOGIN), 3000);
            } else {
                throw new Error(response.message || 'Failed to verify email.');
            }
        } catch (err) {
            logger.error("Email Verification error:", err);
            const displayError = err.response?.data?.message || err.message || 'An error occurred. The OTP might be invalid or expired.';
            setMessage(displayError);
            setUiState(UI_STATE.ERROR);
        }
    };

    const handleResendOtp = async () => {
        if (!email) {
            setMessage('Please enter your email address to resend OTP.');
            setUiState(UI_STATE.ERROR);
            return;
        }
        setUiState(UI_STATE.LOADING);
        setMessage('');
        try {
            await authApiService.sendOtpApi(email, OTP_PURPOSES.EMAIL_VERIFICATION);
            setMessage('A new OTP has been sent to your email address.');
            setUiState(UI_STATE.IDLE); // Back to idle to allow OTP input
        } catch (err) {
            logger.error("Resend OTP error:", err);
            const displayError = err.response?.data?.message || err.message || 'Failed to resend OTP.';
            setMessage(displayError);
            setUiState(UI_STATE.ERROR);
        }
    };


    return (
        <div className="auth-page-container">
            <div className="auth-form-card">
                <h2 className="auth-page-title">Verify Your Email</h2>
                <p className="auth-page-subtitle">
                    An OTP has been sent to your email address. Please enter it below to verify your account.
                </p>

                {message && (
                    <p className={`auth-form-${uiState === UI_STATE.SUCCESS ? 'success' : (uiState === UI_STATE.ERROR ? 'error' : 'info')}-message`} role={uiState === UI_STATE.ERROR ? "alert" : "status"}>
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
                        <InputField
                            label="One-Time Password (OTP)"
                            type="text" // Can be "number" but text is often safer for leading zeros if any
                            name="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            required
                            maxLength={6} // Assuming 6-digit OTP
                            disabled={uiState === UI_STATE.LOADING}
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={uiState === UI_STATE.LOADING && !message.includes('new OTP')} // Don't show loading on resend button
                            disabled={uiState === UI_STATE.LOADING}
                            className="auth-submit-button"
                        >
                            {uiState === UI_STATE.LOADING && !message.includes('new OTP') ? 'Verifying...' : 'Verify Email'}
                        </Button>
                    </form>
                )}
                {uiState !== UI_STATE.SUCCESS && (
                    <div className="resend-otp-container">
                        <Button
                            variant="link"
                            onClick={handleResendOtp}
                            disabled={uiState === UI_STATE.LOADING}
                        >
                            Didn't receive OTP? Resend
                        </Button>
                    </div>
                )}

                {uiState === UI_STATE.SUCCESS && (
                    <p className="auth-form-switch">
                        <Link to={ROUTES.LOGIN} className="auth-switch-link">
                            Proceed to Login
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;