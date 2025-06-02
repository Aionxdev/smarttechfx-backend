// src/components/common/Table.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './Table.css';
import Spinner from './Spinner';

const Table = ({ columns, data, isLoading, emptyMessage = "No data available.", className = '', onRowClick }) => {
    if (isLoading) {
        // You might want a more integrated loading state, like a spinner overlay or skeleton rows
        return (
            <div className="table-loading-placeholder">
                <Spinner /> {/* Replace with Spinner component if desired */}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return <p className="table-empty-message">{emptyMessage}</p>;
    }

    return (
        <div className={`table-responsive-wrapper ${className}`}>
            <table className="table-main">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.accessor || col.Header} style={{ width: col.width }}>
                                {col.Header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={row.id || rowIndex}
                            onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                            className={onRowClick ? 'table-row-clickable' : ''}
                        >
                            {columns.map((col) => (
                                <td key={`${col.accessor || col.Header}-${rowIndex}`} data-label={col.Header}>
                                    {/* {col.Cell ? col.Cell({ row }) : row[col.accessor]} */}
                                    {col.Cell ? col.Cell({ value: row[col.accessor], row }) : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

Table.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            Header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired, // Column header text/element
            accessor: PropTypes.string, // Key to access data in the row object (if not using custom Cell)
            Cell: PropTypes.func,       // Optional custom render function for the cell: ({ row }) => <JSX />
            width: PropTypes.string,    // Optional: e.g., '150px', '20%'
        })
    ).isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    isLoading: PropTypes.bool,
    emptyMessage: PropTypes.string,
    className: PropTypes.string,
    onRowClick: PropTypes.func, // Callback when a row is clicked: (row, rowIndex) => void
};

export default Table;