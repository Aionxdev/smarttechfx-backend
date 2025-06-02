// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { ROUTES, UI_STATE } from '../../utils/constants';
import logger from '../../utils/logger.util';
import { Mail, LockKeyhole } from 'lucide-react'; // Example icons

import './AuthForm.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState(''); // For displaying form-level errors
    const [uiState, setUiState] = useState(UI_STATE.IDLE);

    const { login, error: authContextError, setError: setAuthContextError, clearAuthError } = useAuth();
    // const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || ROUTES.USER_DASHBOARD; // Redirect to intended page or dashboard

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUiState(UI_STATE.LOADING);
        setFormError('');
        // if (authContextError) setAuthContextError(null); // Clear previous context errors
        if (authContextError) clearAuthError(); // Clear previous global auth errors

        if (!email || !password) {
            setFormError('Email and password are required.');
            setUiState(UI_STATE.ERROR);
            return;
        }

        try {
            await login(email, password);
            // Navigation is handled within the login function of AuthContext on success
            // navigate(from, { replace: true }); // Already handled by login hook
            setUiState(UI_STATE.SUCCESS);
        } catch (err) {
            logger.error('Login attempt failed:', err);
            const displayError = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
            setFormError(displayError);
            setUiState(UI_STATE.ERROR);
        }
    };

    // Clear form error when auth context error changes (e.g. if it was set by another component)
    // Or when email/password changes, clear formError
    React.useEffect(() => {
        if (email || password) setFormError('');
    }, [email, password]);


    return (
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <h2 className="auth-form-title">Welcome Back!</h2>
            <p className="auth-form-subtitle">Login to access your SmartTechFX account.</p>

            {formError && <p className="auth-form-error-message" role="alert">{formError}</p>}

            <InputField
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                leftIcon={<Mail size={18} />}
                error={uiState === UI_STATE.ERROR && formError.toLowerCase().includes('email') ? formError : ''} // Basic error highlighting
            />
            <InputField
                label="Password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                leftIcon={<LockKeyhole size={18} />}
                error={uiState === UI_STATE.ERROR && formError.toLowerCase().includes('password') ? formError : ''}
            />
            <div className="auth-form-options">
                <label htmlFor="rememberMe" className="remember-me-label">
                    <input type="checkbox" id="rememberMe" name="rememberMe" />
                    Remember me
                </label>
                <Link to={ROUTES.FORGOT_PASSWORD} className="forgot-password-link">
                    Forgot Password?
                </Link>
            </div>
            <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={uiState === UI_STATE.LOADING}
                disabled={uiState === UI_STATE.LOADING}
                className="auth-submit-button"
            >
                {uiState === UI_STATE.LOADING ? 'Logging in...' : 'Login'}
            </Button>
            <p className="auth-form-switch">
                Don't have an account?{' '}
                <Link to={ROUTES.REGISTER} className="auth-switch-link">
                    Sign Up
                </Link>
            </p>
        </form>
    );
};

export default LoginForm;