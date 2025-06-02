// src/pages/user/UserNotificationsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { userApiService } from '../../services'; // Using the actual service
import useAuth from '../../hooks/useAuth';
import { APP_NAME, UI_STATE, LOCAL_STORAGE_KEYS } from '../../utils/constants'; // For localStorage key
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { formatDate, formatTimeAgo } from '../../utils/formatters';
import useLocalStorage from '../../hooks/useLocalStorage'; // To track seen broadcasts
import './UserNotificationsPage.css';
const INITIAL_SEEN_BROADCASTS = []; // Define outside as a constant

const UserNotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);
    const limit = 15; // Notifications per page
    
    const [seenBroadcastIds, setSeenBroadcastIds] = useLocalStorage(
        user ? `${LOCAL_STORAGE_KEYS.CHAT_HISTORY_PREFIX}seenBroadcasts_${user._id}` : 'stfx_seen_broadcasts_guest',
        INITIAL_SEEN_BROADCASTS // <<< Use the stable constant reference
    );

    const fetchNotifications = useCallback(async (page = 1) => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await userApiService.getMyNotificationsApi({ page, limit, sortBy: 'createdAt', sortOrder: 'desc' });
            if (response.success && response.data) {
                // Filter out client-side "seen" broadcasts before setting state
                const fetchedNotifications = response.data.notifications.map(n => ({
                    ...n,
                    // If it's a broadcast and user-specific isRead isn't set true, check local storage
                    isEffectivelyRead: n.isBroadcast ? (n.isRead || seenBroadcastIds.includes(n._id)) : n.isRead
                }));

                setNotifications(fetchedNotifications);
                setTotalPages(response.data.totalPages || 1);
                setCurrentPage(response.data.currentPage || 1);
                // Use unreadCount from API for user-specific, then adjust for broadcasts if needed
                // For simplicity, we'll count unread based on isEffectivelyRead
                setUnreadCount(fetchedNotifications.filter(n => !n.isEffectivelyRead).length);

            } else {
                setError(response.message || 'Failed to load notifications.');
            }
        } catch (err) {
            logger.error("Error fetching notifications:", err);
            setError(err.response?.data?.message || err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [user, limit, seenBroadcastIds]); // Add seenBroadcastIds as dependency

    useEffect(() => {
        document.title = `My Notifications - ${APP_NAME}`;
        fetchNotifications(currentPage);
    }, [fetchNotifications, currentPage]);

    const handleMarkAsRead = async (notification) => {
        if (notification.isEffectivelyRead) return;

        if (notification.isBroadcast) {
            setSeenBroadcastIds(prev => [...new Set([...prev, notification._id])]); // Add to seen list
            // No API call needed for broadcast "read" based on current backend logic
            // Re-calculate unread count locally
            setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isEffectivelyRead: true } : n));
            setUnreadCount(prev => prev - 1);
        } else {
            // User-specific notification
            try {
                const response = await userApiService.markNotificationAsReadApi(notification._id);
                if (response.success) {
                    setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true, isEffectivelyRead: true } : n));
                    setUnreadCount(prev => prev - 1);
                } else {
                    logger.warn(`Failed to mark notification ${notification._id} as read: ${response.message}`);
                }
            } catch (err) {
                logger.error(`Error marking notification ${notification._id} as read:`, err);
            }
        }
    };

    const handleMarkAllAsRead = async () => {
        // This will mark all *user-specific* notifications as read on the backend.
        // For broadcasts, it will add all currently displayed ones to the client-side seen list.
        const unreadUserSpecificIds = notifications.filter(n => !n.isBroadcast && !n.isRead).map(n => n._id);
        const unreadBroadcastIds = notifications.filter(n => n.isBroadcast && !seenBroadcastIds.includes(n._id)).map(n => n._id);

        try {
            if (unreadUserSpecificIds.length > 0) {
                await userApiService.markAllNotificationsAsReadApi();
            }
            if (unreadBroadcastIds.length > 0) {
                setSeenBroadcastIds(prev => [...new Set([...prev, ...unreadBroadcastIds])]);
            }
            // Refetch or update UI locally
            fetchNotifications(currentPage); // Simplest way to refresh all states
        } catch (err) {
            logger.error(`Error marking all notifications as read:`, err);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
        }
    };

    if (isLoading && notifications.length === 0) return <div className="page-loading"><Spinner size="lg" message="Loading notifications..." /></div>;
    if (error) return <div className="page-error">Error: {error} <Button onClick={() => fetchNotifications(1)}>Try Again</Button></div>;

    const currentUnreadCount = notifications.filter(n => !n.isEffectivelyRead).length;


    return (
        <div className="user-notifications-page">
            <header className="dashboard-page-header notifications-header">
                <h1>My Notifications</h1>
                {notifications.length > 0 && currentUnreadCount > 0 && (
                    <Button onClick={handleMarkAllAsRead} variant="outline" size="sm" disabled={isLoading}>Mark All as Read</Button>
                )}
            </header>

            {notifications.length === 0 && !isLoading ? (
                <p className="no-notifications-message">You have no notifications.</p>
            ) : (
                <div className="notifications-list">
                    {notifications.map(notification => (
                        <Card key={notification._id} className={`notification-item ${notification.isEffectivelyRead ? 'read' : 'unread'}`}>
                            <div className="notification-item-header">
                                {/* You can add an icon based on notification.type if desired */}
                                <h3 className="notification-title">{notification.title}</h3>
                                <span className="notification-time" title={formatDate(notification.createdAt, 'PPpp')}>
                                    {formatTimeAgo(notification.createdAt)}
                                </span>
                            </div>
                            <p className="notification-message" dangerouslySetInnerHTML={{ __html: notification.message.replace(/\n/g, '<br />') }} />
                            {!notification.isEffectivelyRead && (
                                <div className="notification-actions">
                                    <Button variant="link" size="sm" onClick={() => handleMarkAsRead(notification)}>
                                        Mark as Read
                                    </Button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
            {totalPages > 1 && (
                <div className="pagination-controls">
                    <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading}>
                        Previous
                    </Button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages || isLoading}>
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default UserNotificationsPage;