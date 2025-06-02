// src/routes/index.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

// Layouts
import AuthLayout from '../components/layout/AuthLayout.jsx';
import DashboardLayout from '../components/layout/DashboardLayout.jsx'; // Main dashboard layout
import PublicLayout from '../components/layout/PublicLayout.jsx'; // Assuming a layout for public pages like landing, terms

// Protected Route Components
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Common Components
import Spinner from '../components/common/Spinner.jsx'; // For Suspense fallback

// --- Page Components (Lazy Loaded for better performance) ---

// Public Pages
const LandingPage = lazy(() => import('../pages/LandingPage.jsx'));
const LoginPage = lazy(() => import('../pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('../pages/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage.jsx'));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage.jsx')); // If you have one
const TermsOfServicePage = lazy(() => import('../pages/TermsOfServicePage.jsx')); // Example
const PrivacyPolicyPage = lazy(() => import('../pages/PrivacyPolicyPage.jsx')); // Example
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));
const FaqPage = lazy(() => import('../pages/FaqPage.jsx')); // FAQ Page

// User Dashboard Pages
const UserDashboardPage = lazy(() => import('../pages/user/UserDashboardPage.jsx'));
const MyPlansPage = lazy(() => import('../pages/user/MyPlansPage.jsx'));
const InvestmentDetailsPage = lazy(() => import('../pages/user/InvestmentDetailsPage.jsx'));
const WithdrawPage = lazy(() => import('../pages/user/WithdrawPage.jsx'));
const UserProfilePage = lazy(() => import('../pages/user/UserProfilePage.jsx'));
const UserActivityLogPage = lazy(() => import('../pages/user/UserActivityLogPage.jsx'));
const UserNotificationsPage = lazy(() => import('../pages/user/UserNotificationsPage.jsx'));
const HelpSupportPage = lazy(() => import('../pages/user/HelpSupportPage.jsx')); // Help & Support Page

// Admin Panel Pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage.jsx'));
const AdminUserManagementPage = lazy(() => import('../pages/admin/AdminUserManagementPage.jsx'));
const AdminUserDetailsPage = lazy(() => import('../pages/admin/AdminUserDetailsPage.jsx'));
const AdminPlanManagementPage = lazy(() => import('../pages/admin/AdminPlanManagementPage.jsx'));
const AdminInvestmentManagementPage = lazy(() => import('../pages/admin/AdminInvestmentManagementPage.jsx'));
const AdminWithdrawalManagementPage = lazy(() => import('../pages/admin/AdminWithdrawalManagementPage.jsx'));
const AdminPlatformSettingsPage = lazy(() => import('../pages/admin/AdminPlatformSettingsPage.jsx'));
const AdminLogsPage = lazy(() => import('../pages/admin/AdminLogsPage.jsx'));

// Fallback UI for lazy loading
const RouteSuspenseFallback = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="xl" />
    </div>
);

const AppRoutes = () => {
    return (
        <Suspense fallback={<RouteSuspenseFallback />}>
            <Routes>
                {/* --- Public Routes & Authentication --- */}
                <Route element={<PublicLayout />}> {/* Layout for public pages */}
                    <Route path={ROUTES.HOME} element={<LandingPage />} />
                    <Route path={ROUTES.TERMS_OF_SERVICE} element={<TermsOfServicePage />} />
                    <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicyPage />} />
                    <Route path={ROUTES.FAQ} element={<FaqPage />} />
                </Route>

                <Route element={<AuthLayout />}> {/* Layout for auth pages */}
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                    <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                    <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} /> {/* e.g. /reset-password?token=XYZ */}
                    <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} /> {/* e.g. /verify-email?token=ABC */}
                </Route>

                {/* --- User Authenticated Routes --- */}
                <Route element={<ProtectedRoute />}> {/* General protection, specific role checks below if needed */}
                    <Route element={<DashboardLayout />}> {/* Main dashboard layout for authenticated users */}
                        <Route path={ROUTES.USER_DASHBOARD} element={<UserDashboardPage />} />
                        <Route path={ROUTES.USER_PLANS} element={<MyPlansPage />} />
                        <Route path={ROUTES.USER_INVESTMENT_DETAILS} element={<InvestmentDetailsPage />} />
                        <Route path={ROUTES.USER_WITHDRAW} element={<WithdrawPage />} />
                        <Route path={ROUTES.USER_PROFILE} element={<UserProfilePage />} />
                        <Route path={ROUTES.USER_ACTIVITY} element={<UserActivityLogPage />} />
                        <Route path={ROUTES.USER_NOTIFICATIONS} element={<UserNotificationsPage />} />
                        <Route path={ROUTES.USER_HELP_SUPPORT} element={<HelpSupportPage />} />
                        {/* Add more user-specific routes here */}
                    </Route>
                </Route>

                {/* --- Admin Routes --- */}
                <Route element={<AdminRoute />}> {/* Protects all nested routes with Admin role check */}
                    <Route element={<DashboardLayout isAdmin />}> {/* Admin uses DashboardLayout, maybe with isAdmin prop for variations */}
                        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
                        <Route path={ROUTES.ADMIN_USERS} element={<AdminUserManagementPage />} />
                        <Route path={ROUTES.ADMIN_USER_DETAILS} element={<AdminUserDetailsPage />} />
                        <Route path={ROUTES.ADMIN_PLANS} element={<AdminPlanManagementPage />} />
                        <Route path={ROUTES.ADMIN_INVESTMENTS} element={<AdminInvestmentManagementPage />} />
                        <Route path={ROUTES.ADMIN_WITHDRAWALS} element={<AdminWithdrawalManagementPage />} />
                        <Route path={ROUTES.ADMIN_SETTINGS} element={<AdminPlatformSettingsPage />} />
                        <Route path={ROUTES.ADMIN_LOGS} element={<AdminLogsPage />} />
                        {/* Add more admin-specific routes here */}
                    </Route>
                </Route>

                {/* --- Not Found Route --- */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;