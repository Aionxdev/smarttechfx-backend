// src/components/common/Modal.jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './Modal.css'; // Assuming Modal.css for styles
import { X } from 'lucide-react'; // Example icon for close button

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footerContent,
    size = 'md', // 'sm', 'md', 'lg', 'xl'
    closeOnOverlayClick = true,
    showCloseButton = true,
    className = ''
}) => {
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden'; // Prevent background scroll
            window.addEventListener('keydown', handleEsc);
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return ReactDOM.createPortal(
        <div className={`modal-overlay ${className}`} onClick={handleOverlayClick} role="dialog" aria-modal="true">
            <div className={`modal-content modal-size-${size}`} role="document">
                {(title || showCloseButton) && (
                    <div className="modal-header">
                        {title && <h3 className="modal-title">{title}</h3>}
                        {showCloseButton && (
                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={onClose}
                                aria-label="Close modal"
                            >
                                <X size={24} />
                                {/* × Simple times icon */}
                            </button>
                        )}
                    </div>
                )}
                <div className="modal-body">
                    {children}
                </div>
                {footerContent && (
                    <div className="modal-footer">
                        {footerContent}
                    </div>
                )}
            </div>
        </div>,
        document.getElementById('modal-root') || document.body // Prefer a dedicated #modal-root div in index.html
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
    footerContent: PropTypes.node,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
    closeOnOverlayClick: PropTypes.bool,
    showCloseButton: PropTypes.bool,
    className: PropTypes.string,
};

export default Modal;