// // src/components/dashboard/InvestmentItem.jsx
// import React from 'react';
// import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
// import Card from '../common/Card';
// import Button from '../common/Button';
// import { formatDate, formatCurrency } from '../../utils/formatters';
// import { ROUTES, INVESTMENT_STATUS } from '../../utils/constants'; // Assuming INVESTMENT_STATUS also in frontend constants
// import { DollarSign, CalendarDays, Percent, RefreshCw, Send } from 'lucide-react';
// import './InvestmentItem.css';

// const InvestmentItem = ({ investment, onActionClick }) => {
//     if (!investment) return null;

//     const {
//         _id,
//         planNameSnapshot,
//         investedAmountUSD,
//         status,
//         activationDate,
//         maturityDate,
//         dailyROIPercentageSnapshot,
//         expectedTotalProfitUSD,
//         currentProfitUSD, // Assuming this is populated for active investments
//         transactionId, // For pending verification to allow TXID submission
//     } = investment;

//     const getStatusColorClass = (currentStatus) => {
//         switch (currentStatus) {
//             case INVESTMENT_STATUS.ACTIVE: return 'status-active';
//             case INVESTMENT_STATUS.MATURED: return 'status-matured';
//             case INVESTMENT_STATUS.PENDING_VERIFICATION: return 'status-pending';
//             case INVESTMENT_STATUS.WITHDRAWN: return 'status-withdrawn';
//             case INVESTMENT_STATUS.CANCELLED: return 'status-cancelled';
//             default: return 'status-default';
//         }
//     };

//     const calculateProgress = () => {
//         if (status === INVESTMENT_STATUS.ACTIVE && activationDate && maturityDate) {
//             const totalDuration = new Date(maturityDate).getTime() - new Date(activationDate).getTime();
//             const elapsed = Date.now() - new Date(activationDate).getTime();
//             return totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 0;
//         } else if (status === INVESTMENT_STATUS.MATURED || status === INVESTMENT_STATUS.WITHDRAWN) {
//             return 100;
//         }
//         return 0; // For pending or cancelled
//     };
//     const progress = calculateProgress();

//     return (
//         <Card className="investment-item">
//             <div className="investment-item-header">
//                 <h4 className="investment-item-plan-name">{planNameSnapshot}</h4>
//                 <span className={`investment-item-status ${getStatusColorClass(status)}`}>
//                     {status.replace(/([A-Z])/g, ' $1').trim()} {/* Add spaces before caps */}
//                 </span>
//             </div>

//             <div className="investment-item-details">
//                 <p><strong>Invested:</strong> {formatCurrency(investedAmountUSD)}</p>
//                 <p><strong>Daily ROI:</strong> {dailyROIPercentageSnapshot}%</p>
//                 {status === INVESTMENT_STATUS.ACTIVE && activationDate && (
//                     <p><strong>Activated:</strong> {formatDate(activationDate, 'MMM dd, yyyy')}</p>
//                 )}
//                 {maturityDate && (status === INVESTMENT_STATUS.ACTIVE || status === INVESTMENT_STATUS.MATURED) && (
//                     <p><strong>Matures:</strong> {formatDate(maturityDate, 'MMM dd, yyyy')}</p>
//                 )}
//                 {(status === INVESTMENT_STATUS.ACTIVE) && (
//                     <p><strong>Accrued Profit:</strong> {formatCurrency(currentProfitUSD || 0)}</p>
//                 )}
//                 {(status === INVESTMENT_STATUS.MATURED || status === INVESTMENT_STATUS.WITHDRAWN) && (
//                     <p><strong>Total Profit Earned:</strong> {formatCurrency(expectedTotalProfitUSD || 0)}</p>
//                 )}
//             </div>

//             {(status === INVESTMENT_STATUS.ACTIVE || status === INVESTMENT_STATUS.MATURED) && (
//                 <div className="investment-item-progress">
//                     <div className="progress-bar-container">
//                         <div className="progress-bar" style={{ width: `${progress}%` }}>
//                             {progress.toFixed(0)}%
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <div className="investment-item-actions">
//                 <Link to={ROUTES.USER_INVESTMENT_DETAILS.replace(':investmentId', _id)}>
//                     <Button variant="outline" size="sm">View Details</Button>
//                 </Link>
//                 {status === INVESTMENT_STATUS.PENDING_VERIFICATION && !transactionId && onActionClick && (
//                     <Button
//                         variant="primary"
//                         size="sm"
//                         onClick={() => onActionClick('submit_txid', investment)}
//                     >
//                         <Send size={14} />
//                         Submit TXID
//                     </Button>
//                 )}
//                 {status === INVESTMENT_STATUS.MATURED && onActionClick && (
//                     <Button
//                         variant="success" // Assuming you have a success variant
//                         size="sm"
//                         onClick={() => onActionClick('withdraw_roi', investment)}
//                     >
//                         <DollarSign size={14} />
//                         Withdraw Profit
//                     </Button>
//                 )}
//             </div>
//         </Card>
//     );
// };

// InvestmentItem.propTypes = {
//     investment: PropTypes.shape({
//         _id: PropTypes.string.isRequired,
//         planNameSnapshot: PropTypes.string.isRequired,
//         investedAmountUSD: PropTypes.number.isRequired,
//         status: PropTypes.string.isRequired,
//         activationDate: PropTypes.string,
//         maturityDate: PropTypes.string,
//         dailyROIPercentageSnapshot: PropTypes.number,
//         expectedTotalProfitUSD: PropTypes.number,
//         currentProfitUSD: PropTypes.number,
//         transactionId: PropTypes.string,
//     }).isRequired,
//     onActionClick: PropTypes.func, // (actionType: string, investment: object) => void
// };

// export default InvestmentItem;

// src/components/dashboard/InvestmentItem.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { ROUTES, INVESTMENT_STATUS } from '../../utils/constants';
import { DollarSign, Send } from 'lucide-react';
import './InvestmentItem.css';

const InvestmentItem = ({ investment, onActionClick }) => {
    if (!investment) return null;

    const {
        _id,
        planNameSnapshot,
        investedAmountUSD,
        status,
        activationDate,
        maturityDate,
        dailyROIPercentageSnapshot,
        expectedTotalProfitUSD,
        // calculatedCurrentProfitUSD, // ← virtual from backend
        transactionId,              // for pending-verification step
    } = investment;

    /* ---------- helpers ---------- */
    const getStatusColorClass = (currentStatus) => {
        switch (currentStatus) {
            case INVESTMENT_STATUS.ACTIVE:
                return 'status-active';
            case INVESTMENT_STATUS.MATURED:
                return 'status-matured';
            case INVESTMENT_STATUS.PENDING_VERIFICATION:
                return 'status-pending';
            case INVESTMENT_STATUS.WITHDRAWN:
                return 'status-withdrawn';
            case INVESTMENT_STATUS.CANCELLED:
                return 'status-cancelled';
            default:
                return 'status-default';
        }
    };

    const calculateProgress = () => {
        if (status === INVESTMENT_STATUS.ACTIVE && activationDate && maturityDate) {
            const totalDuration =
                new Date(maturityDate).getTime() - new Date(activationDate).getTime();
            const elapsed = Date.now() - new Date(activationDate).getTime();
            return totalDuration > 0
                ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
                : 0;
        }
        if (
            status === INVESTMENT_STATUS.MATURED ||
            status === INVESTMENT_STATUS.WITHDRAWN
        ) {
            return 100;
        }
        return 0; // pending or cancelled
    };

    const progress = calculateProgress();

    /* ---------- render ---------- */
    return (
        <Card className="investment-item">
            {/* header */}
            <div className="investment-item-header">
                <h4 className="investment-item-plan-name">{planNameSnapshot}</h4>
                <span
                    className={`investment-item-status ${getStatusColorClass(status)}`}
                >
                    {status.replace(/([A-Z])/g, ' $1').trim()}
                </span>
            </div>

            {/* core details */}
            <div className="investment-item-details">
                <p>
                    <strong>Invested:</strong> {formatCurrency(investedAmountUSD)}
                </p>
                <p>
                    <strong>Daily&nbsp;ROI:</strong> {dailyROIPercentageSnapshot}%
                </p>

                {status === INVESTMENT_STATUS.ACTIVE && activationDate && (
                    <p>
                        <strong>Activated:</strong>{' '}
                        {formatDate(activationDate, 'MMM dd, yyyy')}
                    </p>
                )}

                {maturityDate &&
                    (status === INVESTMENT_STATUS.ACTIVE ||
                        status === INVESTMENT_STATUS.MATURED) && (
                        <p>
                            <strong>Matures:</strong>{' '}
                            {formatDate(maturityDate, 'MMM dd, yyyy')}
                        </p>
                    )}
{/* 
                {status === INVESTMENT_STATUS.ACTIVE && (
                    <p>
                        <strong>Accrued&nbsp;Profit:</strong>{' '}
                        {formatCurrency(calculatedCurrentProfitUSD || 0)}
                    </p>
                )} */}

                {(status === INVESTMENT_STATUS.MATURED ||
                    status === INVESTMENT_STATUS.WITHDRAWN) && (
                        <p>
                            <strong>Total&nbsp;Profit&nbsp;Earned:</strong>{' '}
                            {formatCurrency(expectedTotalProfitUSD || 0)}
                        </p>
                    )}
            </div>

            {/* progress bar */}
            {(status === INVESTMENT_STATUS.ACTIVE ||
                status === INVESTMENT_STATUS.MATURED) && (
                    <div className="investment-item-progress">
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${progress}%` }}>
                                {progress.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                )}

            {/* actions */}
            <div className="investment-item-actions">
                <Link
                    to={ROUTES.USER_INVESTMENT_DETAILS.replace(':investmentId', _id)}
                >
                    <Button variant="outline" size="sm">
                        View Details
                    </Button>
                </Link>

                {status === INVESTMENT_STATUS.PENDING_VERIFICATION &&
                    !transactionId &&
                    onActionClick && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onActionClick('submit_txid', investment)}
                        >
                            <Send size={14} className="mr-1" />
                            Submit&nbsp;TXID
                        </Button>
                    )}

                {status === INVESTMENT_STATUS.MATURED && onActionClick && (
                    <Button
                        variant="success"
                        size="sm"
                        onClick={() => onActionClick('withdraw_roi', investment)}
                    >
                        <DollarSign size={14} className="mr-1" />
                        Withdraw&nbsp;Profit
                    </Button>
                )}
            </div>
        </Card>
    );
};

/* ---------- prop-types ---------- */
InvestmentItem.propTypes = {
    investment: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        planNameSnapshot: PropTypes.string.isRequired,
        investedAmountUSD: PropTypes.number.isRequired,
        status: PropTypes.string.isRequired,
        activationDate: PropTypes.string,
        maturityDate: PropTypes.string,
        dailyROIPercentageSnapshot: PropTypes.number,
        expectedTotalProfitUSD: PropTypes.number,
        calculatedCurrentProfitUSD: PropTypes.number, // virtual
        transactionId: PropTypes.string,
    }).isRequired,
    onActionClick: PropTypes.func, // (actionType, investment) => void
};

export default InvestmentItem;
