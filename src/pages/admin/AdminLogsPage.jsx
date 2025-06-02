// src/pages/admin/AdminLogsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Card from '../../components/common/Card';
import { adminApiService } from '../../services';
import { APP_NAME, UI_STATE, LOG_LEVELS, LOG_EVENT_TYPES } from '../../utils/constants'; // For filter dropdowns
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import { formatDate, truncateString } from '../../utils/formatters';
import './AdminLogsPage.css';

const AdminLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        level: '', eventType: '', userId: '',
        page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc'
    });
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const activeFilters = { ...filters };
            Object.keys(activeFilters).forEach(key => {
                if (activeFilters[key] === '' || activeFilters[key] === null) delete activeFilters[key];
            });
            const response = await adminApiService.viewSystemLogsAdminApi(activeFilters);
            if (response.success) {
                setLogs(response.data.logs || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalLogs(response.data.totalLogs || 0);
            } else setError(response.message || 'Failed to load system logs.');
        } catch (err) {
            logger.error("Error fetching system logs for admin:", err);
            setError(err.response?.data?.message || err.message || 'An error occurred.');
        } finally { setIsLoading(false); }
    }, [filters]);

    useEffect(() => {
        document.title = `System Logs - Admin | ${APP_NAME}`;
        fetchLogs();
    }, [fetchLogs]);

    const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
    const handleSearch = (e) => { e.preventDefault(); fetchLogs(); };
    const handlePageChange = (newPage) => setFilters(prev => ({ ...prev, page: newPage }));

    const columns = React.useMemo(() => [
        { Header: 'Timestamp', accessor: 'createdAt', Cell: ({ value }) => value ? formatDate(value, 'MMM dd, yy HH:mm:ss') : 'N/A' },
        {
            Header: 'Level',
            accessor: 'level',
            Cell: ({ value }) => value ? <span className={`log-level log-${value.toLowerCase()}`}>{value}</span> : 'N/A'
        },
        { Header: 'Event Type', accessor: 'eventType', Cell: ({ value }) => value ? value.replace(/([A-Z])/g, ' $1').trim() : 'N/A' },
        { Header: 'Message', accessor: 'message', Cell: ({ value }) => value ? truncateString(value, 80) : 'N/A' },
        {
            Header: 'User',
            Cell: ({ row }) => { // `row` is the log object
                // The backend Log model populates 'user' and 'adminUser' with 'email fullName'
                return row.user?.email || (row.userId || 'N/A'); // Access directly from row
            }
        },
        { Header: 'IP', accessor: 'ipAddress', Cell: ({ value }) => value || 'N/A' },
        {
            Header: 'Details',
            Cell: ({ row }) => ( // `row` is the log object
                row.details && Object.keys(row.details).length > 0 ? (
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={() => alert(JSON.stringify(row.details, null, 2))}
                    >
                        View
                    </Button>
                ) : 'N/A'
            )
        },
    ], []);


    return (
        <div className="admin-logs-page">
            <header className="dashboard-page-header">
                <h1>System Logs</h1>
                <p>Monitor platform activities and troubleshoot issues. Total Logs: {totalLogs}</p>
            </header>

            <Card title="Filter Logs" className="filter-card">
                <form onSubmit={handleSearch} className="filter-form-grid logs-filter-form">
                    <InputField name="userId" placeholder="Filter by User ID or Email..." value={filters.userId} onChange={handleFilterChange} />
                    <select name="level" value={filters.level} onChange={handleFilterChange} className="input-field">
                        <option value="">All Levels</option>
                        {Object.values(LOG_LEVELS).map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                    <select name="eventType" value={filters.eventType} onChange={handleFilterChange} className="input-field">
                        <option value="">All Event Types</option>
                        {Object.values(LOG_EVENT_TYPES).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <Button type="submit" variant="primary">Filter Logs</Button>
                </form>
            </Card>

            {isLoading && logs.length === 0 ? (
                <div className="page-loading"><Spinner size="lg" message="Loading logs..." /></div>
            ) : error ? (
                <div className="page-error">Error: {error} <Button onClick={fetchLogs}>Try Again</Button></div>
            ) : (
                <Card className="table-card">
                    <Table columns={columns} data={logs} isLoading={isLoading} emptyMessage="No logs found matching criteria." />
                </Card>
            )}

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <Button onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page <= 1 || isLoading}>Previous</Button>
                    <span>Page {filters.page} of {totalPages}</span>
                    <Button onClick={() => handlePageChange(filters.page + 1)} disabled={filters.page >= totalPages || isLoading}>Next</Button>
                </div>
            )}
        </div>
    );
};

export default AdminLogsPage;