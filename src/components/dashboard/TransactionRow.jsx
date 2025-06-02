// src/components/dashboard/TransactionRow.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { TRANSACTION_TYPES, TRANSACTION_STATUS } from '../../utils/constants'; // Frontend constants
import { ArrowRightLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import './TransactionRow.css';

const TransactionRow = ({ transaction }) => {
    if (!transaction) return null;

    const { type, amountUSD, cryptocurrency, amountCrypto, status, createdAt, description, platformTxid, userTxid } = transaction;

    const getStatusIndicator = () => {
        // Basic indicator, can be enhanced with icons/colors
        switch (status) {
            case TRANSACTION_STATUS.COMPLETED:
            case TRANSACTION_STATUS.VERIFIED:
                return <span className="status-indicator success"><CheckCircle size={16}/>{status}</span>;
            case TRANSACTION_STATUS.PENDING:
                return <span className="status-indicator pending"><Clock size={16}/>{status}</span>;
            case TRANSACTION_STATUS.FAILED:
            case TRANSACTION_STATUS.REJECTED:
            case TRANSACTION_STATUS.CANCELLED:
                return <span className="status-indicator error"><XCircle size={16}/>{status}</span>;
            default:
                return <span className="status-indicator">{status}</span>;
        }
    };

    const isCredit = type === TRANSACTION_TYPES.DEPOSIT || type === TRANSACTION_TYPES.ROI_PAYOUT;
    const amountDisplay = `${isCredit ? '+' : '-'}${formatCurrency(amountUSD)}`;

    return (
        <tr className="transaction-row">
            <td>{formatDate(createdAt, 'MMM dd, yyyy HH:mm')}</td>
            <td>
                <ArrowRightLeft size={16} className={`type-icon ${type.toLowerCase()}`} />
                {type.replace(/([A-Z])/g, ' $1').trim()}
            </td>
            <td>{description || type}</td>
            <td className={isCredit ? 'amount-credit' : 'amount-debit'}>{amountDisplay}</td>
            <td>{amountCrypto ? `${amountCrypto} ${cryptocurrency}` : '-'}</td>
            <td>{getStatusIndicator()}</td>
            <td>{platformTxid || userTxid || '-'}</td>
        </tr>
    );
};

TransactionRow.propTypes = {
    transaction: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        amountUSD: PropTypes.number.isRequired,
        cryptocurrency: PropTypes.string,
        amountCrypto: PropTypes.number,
        status: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        description: PropTypes.string,
        platformTxid: PropTypes.string,
        userTxid: PropTypes.string,
    }).isRequired,
};

export default TransactionRow;