// src/components/layout/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Sidebar from './Sidebar';
import Topbar from './TopBar'; 
import useAuth from '../../hooks/useAuth';
import { ROUTES, APP_NAME } from '../../utils/constants';
import { LayoutDashboard, DollarSign, Users, BriefcaseMedical, ArrowRightLeft, Settings, BarChart3, MessageCircleWarning, FileText, ShieldAlert, LifeBuoy } from 'lucide-react';

import './DashboardLayout.css';

const DashboardLayout = ({ isAdmin = false }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 992); // Open by default on larger screens
    const { user } = useAuth();
    const location = useLocation();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 992) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false); 
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar on route change on mobile
    useEffect(() => {
        if (window.innerWidth <= 992) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);


    // Define navigation items based on role
    let navItems = [];
    if (isAdmin) {
        navItems = [
            { to: ROUTES.ADMIN_DASHBOARD, label: "Overview", icon: "📈" /* <BarChart3 /> */ },
            { to: ROUTES.ADMIN_USERS, label: "User Management", icon: "👥" /* <Users /> */ },
            { to: ROUTES.ADMIN_PLANS, label: "Investment Plans", icon: "📋" /* <FileText /> */ },
            { to: ROUTES.ADMIN_INVESTMENTS, label: "All Investments", icon: "💼" /* <BriefcaseMedical /> */ },
            { to: ROUTES.ADMIN_WITHDRAWALS, label: "Withdrawals", icon: "💸" /* <ArrowRightLeft /> */ },
            { to: ROUTES.ADMIN_SETTINGS, label: "Platform Settings", icon: "⚙️" /* <Settings /> */ },
            { to: ROUTES.ADMIN_LOGS, label: "System Logs", icon: "📜" /* <FileText /> */ },
        ];
    }  else { // Regular User
        navItems = [
            { to: ROUTES.USER_DASHBOARD, label: "Dashboard", icon: <LayoutDashboard /> },
            { to: ROUTES.USER_PLANS, label: "Investment Plans", icon: <BarChart3 /> },
            { to: ROUTES.USER_WITHDRAW, label: "Withdraw Funds", icon: <DollarSign /> },
            { to: ROUTES.USER_ACTIVITY, label: "Activity Log", icon: <FileText /> },
            { to: ROUTES.USER_PROFILE, label: "My Profile", icon: <Users /> }, // Assuming Users icon or a Profile icon
            { to: ROUTES.USER_NOTIFICATIONS, label: "Notifications", icon: "🔔" /* Example */ },
            { to: ROUTES.USER_HELP_SUPPORT, label: "Help & Support", icon: <LifeBuoy /> }, // Link to FAQ or support page
        ];
    }


    return (
        <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <Sidebar navItems={navItems} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="dashboard-main-content">
                <Topbar toggleSidebar={toggleSidebar} user={user} />
                <main className="dashboard-page-content">
                    <Outlet />
                </main>
                <footer className="dashboard-footer-slim">
                    &copy; 2019 - {new Date().getFullYear()} {APP_NAME}.
                </footer>
            </div>
        </div>
    );
};

DashboardLayout.propTypes = {
    isAdmin: PropTypes.bool,
    isSupport: PropTypes.bool,
};

export default DashboardLayout;