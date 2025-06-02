// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../hooks/useAuth'; // Your custom hook for AuthContext
import { ROUTES } from '../utils/constants';
import Spinner from '../components/common/Spinner'; // A simple loading spinner component
import logger from '../utils/logger.util.js'; // Assuming you have a logger utility 

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        // Show a loading spinner while auth state is being determined
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spinner size="lg" /></div>;
    }

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    // Check for role-based access if allowedRoles are provided
    if (allowedRoles && allowedRoles.length > 0) {
        const hasRequiredRole = user && allowedRoles.includes(user.role);
        if (!hasRequiredRole) {
            // User is authenticated but does not have the required role
            // Redirect to a "Forbidden" page or back to their dashboard
            // For now, let's redirect to their default dashboard or home
            // A dedicated /forbidden page would be better.
            logger.warn(`User ${user?.email} with role ${user?.role} tried to access a route requiring roles: ${allowedRoles.join(', ')}`);
            // Redirect to user dashboard if they are not admin/support trying to access restricted area
            if (user.role === 'Investor') {
                return <Navigate to={ROUTES.USER_DASHBOARD} replace />;
            }
            // If an admin/support tries to access a route they don't have more specific access to,
            // it implies a misconfiguration or they shouldn't be there.
            // Defaulting to home or their specific dashboard.
            return <Navigate to={ROUTES.HOME} replace />; // Or a specific "Access Denied" page
        }
    }

    if (!isAuthenticated) {
        logger.debug(`ProtectedRoute: Not authenticated. isLoading: ${isLoading}. Redirecting to login from ${location.pathname}`);
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    return <Outlet />; // Render the child route component
};

ProtectedRoute.propTypes = {
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;