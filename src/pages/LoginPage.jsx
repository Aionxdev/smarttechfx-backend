// src/pages/LoginPage.jsx
import React, { useEffect } from 'react';
import LoginForm from '../components/auth/LoginForm';
import { APP_NAME } from '../utils/constants';
import './AuthPage.css'; // Shared styles for auth pages

const LoginPage = () => {
    useEffect(() => {
        document.title = `Login - ${APP_NAME}`;
    }, []);

    return (
        <div className="auth-page-container">
            <div className="auth-form-card">
                <LoginForm />
            </div>
        </div>
    );
};

export default LoginPage;