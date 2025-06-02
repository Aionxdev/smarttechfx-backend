// src/components/common/Button.jsx
import React from 'react';
import PropTypes from 'prop-types';
// If using CSS Modules: import styles from './Button.module.css';
import './Button.css'; // Assuming Button.css for styles

const Button = ({
    children,
    onClick,
    type = 'button', // 'button', 'submit', 'reset'
    variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger'
    size = 'md', // 'sm', 'md', 'lg'
    disabled = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '', // Allow additional custom classes
    fullWidth = false,
    ...props // Other native button props
}) => {
    const baseClasses = 'btn';
    const variantClasses = `btn-${variant}`; // e.g., btn-primary
    const sizeClasses = `btn-${size}`; // e.g., btn-md
    const widthClass = fullWidth ? 'btn-full-width' : '';
    const loadingClass = isLoading ? 'btn-loading' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${loadingClass} ${className}`}
            {...props}
        >
            {isLoading && (
                <span className="btn-spinner" role="status" aria-hidden="true"></span>
            )}
            {leftIcon && !isLoading && <span className="btn-icon btn-icon-left">{leftIcon}</span>}
            <span className={isLoading ? 'btn-text-loading' : 'btn-text'}>
                {children}
            </span>
            {rightIcon && !isLoading && <span className="btn-icon btn-icon-right">{rightIcon}</span>}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'warning', 'info']),
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xs']),
    disabled: PropTypes.bool,
    isLoading: PropTypes.bool,
    leftIcon: PropTypes.node,
    rightIcon: PropTypes.node,
    className: PropTypes.string,
    fullWidth: PropTypes.bool,
};

export default Button;