// src/components/auth/RegisterForm.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { ROUTES, UI_STATE, SUPPORTED_CRYPTO_SYMBOLS_FRONTEND } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import './AuthForm.css'; // Assuming shared auth form styles

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        country: '',
        preferredCrypto: ''
    });
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [uiState, setUiState] = useState(UI_STATE.IDLE);

    const { register, error: authContextError, setError: setAuthContextError } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formError) setFormError('');
        if (successMessage) setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUiState(UI_STATE.LOADING);
        setFormError('');
        setSuccessMessage('');
        if (authContextError) setAuthContextError(null);
        logger.info('RegisterForm submitted with data:', formData);

        if (formData.password !== formData.confirmPassword) {
            setFormError('Passwords do not match.');
            setUiState(UI_STATE.ERROR);
            return;
        }
        if (formData.password.length < 6) {
            setFormError('Password must be at least 6 characters long.');
            setUiState(UI_STATE.ERROR);
            return;
        }

        const { confirmPassword: _confirmPassword, ...apiData } = formData;

        try {
            const response = await register(apiData); // register from useAuth
            if (response.success) {
                // The backend's registerUser service now sends an OTP automatically.
                setSuccessMessage(
                    response.message || `Registration successful! An OTP has been sent to ${apiData.email} for verification.`
                );
                setUiState(UI_STATE.SUCCESS);

                // Navigate to the Verify Email page, passing the email as a query parameter
                setTimeout(() => {
                    navigate(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(apiData.email)}`); // <<< MODIFIED NAVIGATION
                }, 2000); // Shorter delay or make it immediate after message display
            }
            // No 'else' needed here if 'register' service throws on failure, which it should.
        } catch (err) {
            logger.error('Registration attempt failed:', err);
            const displayError = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
            if (err.response?.data?.errors && err.response.data.errors.length > 0) {
                setFormError(err.response.data.errors.map(e => e.message).join(' '));
            } else {
                setFormError(displayError);
            }
            setUiState(UI_STATE.ERROR);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {formError && <p className="auth-form-error-message" role="alert">{formError}</p>}
            {successMessage && <p className="auth-form-success-message" role="status">{successMessage}</p>}

            {/* Only show the form if not yet successfully registered */}
            {uiState !== UI_STATE.SUCCESS && (
                <>
                    <InputField
                        label="Full Name"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        disabled={uiState === UI_STATE.LOADING}
                    />
                    <InputField
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        disabled={uiState === UI_STATE.LOADING}
                    />
                    <InputField
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        required
                        disabled={uiState === UI_STATE.LOADING}
                    />
                    <InputField
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                        required
                        disabled={uiState === UI_STATE.LOADING}
                    />
                    <InputField
                        label="Phone Number (Optional)"
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="e.g., +1234567890"
                        disabled={uiState === UI_STATE.LOADING}
                    />
                    <InputField
                        label="Country (Optional)"
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Your country of residence"
                        disabled={uiState === UI_STATE.LOADING}
                    />
                    <div className="input-field-wrapper">
                        <label htmlFor="preferredCrypto" className="input-label">Preferred Payout Crypto (Optional)</label>
                        <select
                            id="preferredCrypto"
                            name="preferredCrypto"
                            value={formData.preferredCrypto}
                            onChange={handleChange}
                            className="input-field"
                            disabled={uiState === UI_STATE.LOADING}
                        >
                            <option value="">-- Select a Crypto --</option>
                            {SUPPORTED_CRYPTO_SYMBOLS_FRONTEND.map(symbol => (
                                <option key={symbol} value={symbol}>{symbol}</option>
                            ))}
                        </select>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        isLoading={uiState === UI_STATE.LOADING}
                        disabled={uiState === UI_STATE.LOADING}
                        className="auth-submit-button"
                    >
                        {uiState === UI_STATE.LOADING ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </>
            )}

            {/* Show appropriate link based on state */}
            {uiState === UI_STATE.SUCCESS ? (
                <p className="auth-form-switch">
                    Email sent! <Link to={`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(formData.email)}`} className="auth-switch-link">Proceed to Verify</Link>
                </p>
            ) : (
                <p className="auth-form-switch">
                    Already have an account?{' '}
                    <Link to={ROUTES.LOGIN} className="auth-switch-link">
                        Login
                    </Link>
                </p>
            )}
        </form>
    );
};

export default RegisterForm;