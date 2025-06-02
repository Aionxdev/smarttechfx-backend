// src/components/layout/AuthLayout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { APP_NAME, ROUTES } from '../../utils/constants';
import './AuthLayout.css'; // Assuming AuthLayout.css for styles
// import { useTheme } from '../../hooks/useTheme'; // If needed for logo variations

const AuthLayout = () => {
    // const { theme } = useTheme();
    // const logoSrc = theme === 'dark' ? '/path/to/logo-dark.png' : '/path/to/logo-light.png';

    return (
        <div className="auth-layout">
            <header className="auth-layout-header">
                <Link to={ROUTES.HOME} className="auth-layout-logo">
                    {/* <img src={logoSrc} alt={`${APP_NAME} Logo`} /> */}
                    <h1>{APP_NAME}</h1>
                </Link>
            </header>
            <main className="auth-layout-main">
                <Outlet /> {/* This is where Login, Register forms will be rendered */}
            </main>
            <footer className="auth-layout-footer">
                <p>© {new Date().getFullYear()} {APP_NAME}. Investment Redefined.</p>
                <nav>
                    <Link to={ROUTES.TERMS_OF_SERVICE}>Terms</Link> | <Link to={ROUTES.PRIVACY_POLICY}>Privacy</Link>
                </nav>
            </footer>
        </div>
    );
};

// No children prop directly, Outlet handles that.
// AuthLayout.propTypes = {};

export default AuthLayout;