// src/components/common/Card.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './Card.css'; // Assuming Card.css for styles

const Card = ({ children, className = '', title, headerActions, footerContent, ...props }) => {
    return (
        <div className={`card ${className}`} {...props}>
            {title || headerActions ? (
                <div className="card-header">
                    {title && <h3 className="card-title">{title}</h3>}
                    {headerActions && <div className="card-header-actions">{headerActions}</div>}
                </div>
            ) : null}
            <div className="card-body">
                {children}
            </div>
            {footerContent && (
                <div className="card-footer">
                    {footerContent}
                </div>
            )}
        </div>
    );
};

Card.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    headerActions: PropTypes.node, // e.g., buttons or dropdowns for the card header
    footerContent: PropTypes.node,
};

export default Card;