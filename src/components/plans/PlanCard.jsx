// src/components/plans/PlanCard.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import Card from '../common/Card'; // Using our common Card component
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, Zap, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react'; // Example icons
import './PlanCard.css'; // Assuming PlanCard.css for styles

const PlanCard = ({ plan, onInvestNowClick }) => {
    const [showDetails, setShowDetails] = useState(false); // For toggling illustrative examples

    if (!plan) return null;

    const {
        planName,
        description,
        investmentRange,
        dailyROIPercentage,
        durationDays,
        illustrativeExamples, // Renamed from 'illustrations' in previous service response
        tags,
    } = plan;

    const handleToggleDetails = () => {
        setShowDetails(!showDetails);
    };

    return (
        <Card className="plan-card" title={planName}>
            {/* Optional: Use headerActions prop of Card for a tag or icon */}
            {tags && tags.length > 0 && <span className="plan-card-tag">{tags[0]}</span>}

            <div className="plan-card-summary">
                <p className="plan-card-description">{description || "A promising investment opportunity."}</p>
                <div className="plan-card-metrics">
                    <div className="metric-item">
                        <span className="metric-label">Daily ROI:</span>
                        <span className="metric-value primary-metric">{dailyROIPercentage}%</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Duration:</span>
                        <span className="metric-value">{durationDays} Days</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Investment:</span>
                        <span className="metric-value">
                            {formatCurrency(investmentRange.minUSD)} - {formatCurrency(investmentRange.maxUSD)}
                        </span>
                    </div>
                </div>
                {tags && tags.length > 0 && (
                    <div className="plan-card-tags">
                        {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                )}
            </div>

            {illustrativeExamples && illustrativeExamples.length > 0 && (
                <div className="plan-card-illustrations">
                    <button onClick={handleToggleDetails} className="details-toggle-button">
                        {/* {showDetails ? 'Hide' : 'Show'} Example Returns */}
                        {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        <span>{showDetails ? '▲' : '▼'}</span>
                    </button>
                    {showDetails && (
                        <table className="illustrations-table">
                            <thead>
                                <tr>
                                    <th>Invested (USD)</th>
                                    <th>Daily Profit (USD)</th>
                                    <th>Total Profit (USD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {illustrativeExamples.map((example, index) => (
                                    <tr key={index}>
                                        <td>{formatCurrency(example.capitalUSD)}</td>
                                        <td>{formatCurrency(example.dailyProfitUSD)}</td>
                                        <td>{formatCurrency(example.totalProfitUSD)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            <div className="plan-card-actions">
                <Button
                    variant="primary"
                    onClick={() => onInvestNowClick(plan)} // Pass the whole plan object
                    fullWidth
                >
                    {/* <Zap size={16} style={{marginRight: '8px'}} /> */}
                    Invest Now in {planName}
                </Button>
            </div>
        </Card>
    );
};

PlanCard.propTypes = {
    plan: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        planName: PropTypes.string.isRequired,
        description: PropTypes.string,
        investmentRange: PropTypes.shape({
            minUSD: PropTypes.number.isRequired,
            maxUSD: PropTypes.number.isRequired,
        }).isRequired,
        dailyROIPercentage: PropTypes.number.isRequired,
        durationDays: PropTypes.number.isRequired,
        illustrativeExamples: PropTypes.arrayOf(
            PropTypes.shape({
                capitalUSD: PropTypes.number.isRequired,
                dailyProfitUSD: PropTypes.number.isRequired,
                totalProfitUSD: PropTypes.number.isRequired,
            })
        ),
        tags: PropTypes.arrayOf(PropTypes.string),
        reinvestmentOptionAvailable: PropTypes.bool,
        isActive: PropTypes.bool,
    }).isRequired,
    onInvestNowClick: PropTypes.func.isRequired,
};

export default PlanCard;