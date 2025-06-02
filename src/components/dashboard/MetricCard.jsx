// src/components/dashboard/MetricCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card'; // Using our common Card component
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react'; // Example icons
import './MetricCard.css'; // Assuming MetricCard.css for styles

const MetricCard = ({
    title,
    value,
    unit = '', // e.g., '$', '%', or empty for counts
    icon,
    changePercentage, // e.g., +2.5 or -1.0
    changePeriod = 'vs last month', // Description for the change
    infoTooltip, // Text for an info tooltip
    isLoading = false,
    className = '',
    onClick, // Make the card clickable
    variant, // 'success', 'danger', 'warning', 'info' or null/undefined
}) => {
    const valuePrefix = unit === '' ? '' : '';
    const valueSuffix = unit === '%' ? '%' : (unit && unit !== '$' ? ` ${unit}` : '');
    const variantClass = variant ? `metric-card-${variant}` : ''; // e.g., metric-card-success

    // In the return statement for the main card div:
    // <Card className={`metric-card ${variantClass} ${clickableClass} ${className}`} ...>

    // Or apply to specific elements like the value:
    // <p className={`metric-value ${variant ? `text-${variant}` : ''}`}>
    // ...
    // For simplicity, let's assume you'll style based on .metric-card-success or .metric-card-danger
    // Or more directly for the value:
    const valueClass = variant === 'success' ? 'text-success' : (variant === 'danger' ? 'text-danger' : '');


    const renderChange = () => {
        if (typeof changePercentage !== 'number') return null;
        const isPositive = changePercentage >= 0;
        return (
            <span className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {/* {isPositive ? '▲' : '▼'} {Math.abs(changePercentage)}% */}
                {changePeriod && <span className="metric-change-period"> {changePeriod}</span>}
            </span>
        );
    };

    const cardContent = (
        <>
            <div className="metric-card-header">
                <h4 className="metric-title">{title}</h4>
                {icon && <div className="metric-icon">{icon}</div>}
                {infoTooltip && (
                    <div className="metric-info-tooltip" title={infoTooltip}>
                        <Info size={16} />
                        {/* ℹ️ */}
                    </div>
                )}
            </div>
            {isLoading ? (
                <div className="metric-value-loading"></div> /* Skeleton loader */
            ) : (
                <p className={`metric-value ${valueClass}`}> {/* Apply class to value */}
                    {valuePrefix}{value}{valueSuffix}
                </p>
            )}
            {/* ) : (
                <p className="metric-value">
                    {valuePrefix}{value}{valueSuffix}
                </p>
            )} */}
            {!isLoading && renderChange()}
        </>
    );

    if (onClick) {
        return (
            // <Card className={`metric-card clickable ${className}`} onClick={onClick}>
            //     {cardContent}
            // </Card>
            <Card className={`metric-card ${onClick ? 'clickable' : ''} ${variantClass} ${className}`} onClick={onClick}>
                {cardContent}
            </Card>
        );
    }

    return (
        <Card className={`metric-card ${className}`}>
            {cardContent}
        </Card>
    );
};

MetricCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    unit: PropTypes.string,
    icon: PropTypes.node,
    changePercentage: PropTypes.number,
    changePeriod: PropTypes.string,
    infoTooltip: PropTypes.string,
    isLoading: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(['success', 'danger', 'warning', 'info', '']),
};

export default MetricCard;