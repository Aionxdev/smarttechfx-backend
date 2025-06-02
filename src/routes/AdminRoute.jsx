// src/routes/AdminRoute.jsx
import React from 'react';
import ProtectedRoute from './ProtectedRoute';
import { USER_ROLES } from '../utils/constants'; // Assuming USER_ROLES are defined in frontend constants

const AdminRoute = () => {
    return <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />;
};

export default AdminRoute;