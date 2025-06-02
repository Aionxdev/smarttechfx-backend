// src/components/auth/LogoutButton.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useAuth from '../../hooks/useAuth';
import Modal from '../common/Modal'; // Use your common Modal component
import Button from '../common/Button'; // Use your common Button component
import './LogoutButton.css'; // Specific styles for this component wrapper if needed

// Import APP_NAME 
import { APP_NAME } from '../../utils/constants';

const LogoutButton = ({
    className = '',
    variant = "ghost", // Default variant for the trigger button
    size = "md",      // Default size
    children,         // To allow custom text or icon for the button
    fullWidth = false
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { logout, isLoading: authIsLoading } = useAuth(); // Get isLoading from AuthContext

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleConfirmLogout = async () => {
        await logout(); // AuthContext logout will handle navigation
        // Modal will close if component unmounts due to navigation, or explicitly:
        setIsModalOpen(false); // Explicitly close modal
    };

    return (
        <>
            <Button
                onClick={handleOpenModal}
                className={`logout-trigger-button ${className}`}
                variant={variant}
                size={size}
                disabled={authIsLoading} // Disable if an auth operation is already in progress
                title="Logout"
                fullWidth={fullWidth}
            >
                {children ? (
                    children
                ) : (
                    <>
                        <span className="logout-text">Logout</span>
                    </>
                )}
            </Button>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Confirm Logout"
                size="sm" // Smaller modal for confirmation
            >
                <div className="logout-confirmation-content">
                    <p>Are you sure you want to logout from {APP_NAME}?</p>
                </div>
                <div className="logout-modal-actions">
                    <Button variant="ghost" onClick={handleCloseModal} disabled={authIsLoading}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmLogout} isLoading={authIsLoading} disabled={authIsLoading}>
                        Confirm Logout
                    </Button>
                </div>
            </Modal>
        </>
    );
};

LogoutButton.propTypes = {
    className: PropTypes.string,
    variant: PropTypes.string,
    size: PropTypes.string,
    children: PropTypes.node, // If you want to pass custom content for the button
    showIcon: PropTypes.bool,
    fullWidth: PropTypes.bool,
};


export default LogoutButton;