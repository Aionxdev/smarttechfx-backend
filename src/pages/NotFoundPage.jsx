// src/pages/NotFoundPage.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME, ROUTES } from '../utils/constants';
import Button from '../components/common/Button';
import './NotFoundPage.css'; // Specific styles for this page
import { Frown } from 'lucide-react'; // Assuming you are using lucide-react for icons

const NotFoundPage = () => {
    useEffect(() => {
        document.title = `404 Not Found - ${APP_NAME}`;
    }, []);

    return (
        <div className="not-found-page">
            <div className="not-found-content">
                {/* You can add a 404 graphic or icon here */}
                <Frown size={64} className="not-found-icon" />
                <h1 className="not-found-title">404</h1>
                <h2 className="not-found-subtitle">Oops! Page Not Found.</h2>
                <p className="not-found-message">
                    The page you are looking for might have been removed, had its name changed,
                    or is temporarily unavailable.
                </p>
                <Link to={ROUTES.HOME}>
                    <Button variant="primary" size="lg">
                        Go to Homepage
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;