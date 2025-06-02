// src/pages/RegisterPage.jsx
import React, { useEffect } from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import { APP_NAME } from '../utils/constants';
import './AuthPage.css'; // Shared styles for auth pages

const RegisterPage = () => {
    useEffect(() => {
        document.title = `Sign Up - ${APP_NAME}`;
    }, []);

    return (
        <div className="auth-page-container">
            <div className="auth-form-card">
                <h2 className="auth-page-title">Create Your Account</h2>
                <p className="auth-page-subtitle">Join SmartTechFX and start investing today.</p>
                <RegisterForm />
            </div>
        </div>
    );
};

export default RegisterPage;