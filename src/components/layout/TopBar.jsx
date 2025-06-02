// src/components/layout/Topbar.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Link } from 'react-router-dom'; // Added useNavigate
import PropTypes from 'prop-types';
import useAuth from '../../hooks/useAuth';
import { APP_NAME, ROUTES } from '../../utils/constants';
import { Menu, Bell, UserCircle, Sun, Moon } from 'lucide-react'; // Assuming you use these icons
import { useTheme } from '../../hooks/useTheme'; // Assuming this hook exists
import { userApiService } from '../../services'; // For fetching unread count
import logger from '../../utils/logger.util.js';
import LogoutButton from '../common/LogoutButton.jsx';


const Topbar = ({ toggleSidebar }) => {
    const { user, isAuthenticated } = useAuth(); // Added isAuthenticated
    const { theme, toggleTheme } = useTheme();

    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [isLoadingCount, setIsLoadingCount] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        if (isAuthenticated && user?._id) { // Only fetch if authenticated
            setIsLoadingCount(true);
            try {
                // This API call needs to be efficient for just getting the count.
                // We'll use the existing getMyNotificationsApi and tell it we only need the count.
                const response = await userApiService.getMyNotificationsApi({ onlyUnreadCount: true });
                if (response.success && typeof response.data.unreadCount === 'number') {
                    setUnreadNotifications(response.data.unreadCount);
                } else {
                    logger.warn("Topbar: Failed to parse unread count from API response", response);
                    setUnreadNotifications(0); // Default to 0 on failure to parse
                }
            } catch (error) {
                logger.error("Topbar: Failed to fetch unread notification count", error);
                setUnreadNotifications(0); // Default to 0 on error
            } finally {
                setIsLoadingCount(false);
            }
        } else {
            setUnreadNotifications(0); // Reset if not authenticated
        }
    }, [isAuthenticated, user?._id]); // Depend on isAuthenticated and user._id

    useEffect(() => {
        fetchUnreadCount(); // Fetch on mount and when user changes

        // Poll for new notifications periodically
        const intervalId = setInterval(fetchUnreadCount, 60000); // Poll every 60 seconds

        return () => {
            clearInterval(intervalId); // Clear interval on component unmount
        };
    }, [fetchUnreadCount]); // fetchUnreadCount is memoized with useCallback

    // const handleLogout = async () => {
    //     await logout();
    //     // Navigation to login is handled by AuthContext's logout
    // };

    const userDisplayName = user?.fullName || user?.email || 'User';

    return (
        <header className="topbar">
            <div className="topbar-left">
                <button className="topbar-menu-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
                    <Menu size={24} />
                </button>
                {/* Page title can be added here later if needed */}
            </div>
            <div className="topbar-right">
                <button onClick={toggleTheme} className="topbar-action-btn" aria-label="Toggle theme">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <Link to={ROUTES.USER_NOTIFICATIONS} className="topbar-action-btn notification-link" aria-label="Notifications">
                    <Bell size={20} />
                    {!isLoadingCount && unreadNotifications > 0 && ( // Show badge if not loading and count > 0
                        <span className="notification-badge">
                            {unreadNotifications > 99 ? '99+' : unreadNotifications} {/* Limit display for very high counts */}
                        </span>
                    )}
                </Link>
                <div className="topbar-user-menu">
                    <UserCircle size={28} className="user-avatar" />
                    <span className="user-name">{userDisplayName}</span>
                    <div className="user-dropdown-content">
                        <Link to={ROUTES.USER_PROFILE}>Profile</Link>
                        {/* <button onClick={handleLogout} className="logout-dropdown-btn">
                            Logout
                        </button> */}
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </header>
    );
};

Topbar.propTypes = {
    toggleSidebar: PropTypes.func.isRequired,
};

export default Topbar;