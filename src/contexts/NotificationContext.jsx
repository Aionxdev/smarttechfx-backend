// src/contexts/NotificationContext.jsx
import React, { createContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { generateClientSideId } from '../utils/helpers'; // Assuming this helper exists

export const NotificationContext = createContext(undefined);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]); // Array of notification objects

    const addNotification = useCallback((message, type = 'info', duration = 5000) => {
        // type can be 'info', 'success', 'error', 'warning'
        const id = generateClientSideId(); // Simple unique ID for the notification
        setNotifications(prevNotifications => [
            ...prevNotifications,
            { id, message, type, duration }
        ]);

        // Auto-remove notification after duration
        if (duration) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
        return id; // Return ID if manual removal is needed
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prevNotifications =>
            prevNotifications.filter(notification => notification.id !== id)
        );
    }, []);

    // This is where you would render your actual notification components (toasts)
    // It's common to have a <NotificationDisplay /> component that consumes this context
    // and renders the `notifications` array. Or, this provider can render them directly.
    const renderNotifications = () => (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000, // High z-index
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    onClick={() => removeNotification(notif.id)}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: notif.type === 'error' ? '#f8d7da' : (notif.type === 'success' ? '#d4edda' : '#cfe2ff'),
                        color: notif.type === 'error' ? '#721c24' : (notif.type === 'success' ? '#155724' : '#0c5460'),
                        border: `1px solid ${notif.type === 'error' ? '#f5c6cb' : (notif.type === 'success' ? '#c3e6cb' : '#b8daff')}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        // Add animation for enter/exit later
                    }}
                >
                    {notif.message}
                </div>
            ))}
        </div>
    );


    const contextValue = useMemo(() => ({
        addNotification,
        removeNotification,
        notifications // Exposing this if a dedicated display component needs it
    }), [addNotification, removeNotification, notifications]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            {renderNotifications()} {/* Render notifications here or in a separate component */}
        </NotificationContext.Provider>
    );
};

NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired,
};