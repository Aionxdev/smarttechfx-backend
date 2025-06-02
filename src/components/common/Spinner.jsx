// src/components/common/Spinner.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './Spinner.css'; // Assuming Spinner.css for styles

const Spinner = ({ size = 'md', color = 'primary', className = '', message }) => {
    const sizeClasses = {
        xs: 'spinner-xs',
        sm: 'spinner-sm',
        md: 'spinner-md',
        lg: 'spinner-lg',
        xl: 'spinner-xl',
    };
    const colorClasses = {
        primary: 'spinner-color-primary',
        accent: 'spinner-color-accent', // Example, define in CSS
        white: 'spinner-color-white',
    };

    return (
        <div className={`spinner-container ${className}`}>
            <div
                className={`spinner ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.primary}`}
                role="status"
                aria-busy="true"
            >
                <span className="sr-only">Loading...</span> {/* For accessibility */}
            </div>
            {message && <p className="spinner-message">{message}</p>}
        </div>
    );
};

Spinner.propTypes = {
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    color: PropTypes.oneOf(['primary', 'accent', 'white']),
    className: PropTypes.string,
    message: PropTypes.string,
};

export default Spinner;