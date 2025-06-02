// src/pages/user/UserActivityLogPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Table from '../../components/common/Table'; // Reusing the common Table component
import Button from '../../components/common/Button';
import { userApiService } from '../../services'; // Service to fetch activity logs
import useAuth from '../../hooks/useAuth';
import { APP_NAME, UI_STATE } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import Card from '../../components/common/Card';
import { formatDate, truncateString } from '../../utils/formatters';
import './UserActivityLogPage.css'; // Create this for page-specific styles

const UserActivityLogPage = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(15); // Logs per page

    const fetchActivityLogs = useCallback(async (page = 1) => {
        if (!user?._id) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await userApiService.getMyActivityLogApi({ page, limit, sortBy: 'createdAt', sortOrder: 'desc' });
            if (response.success) {
                setLogs(response.data.logs || []);
                console.log("[UserActivityLogPage] Fetched logs state:", response.data.logs);
                console.log("[UserActivityLogPage] Fetched logs state:", response.data);
                setTotalPages(response.data.totalPages || 1);
                setCurrentPage(response.data.currentPage || 1);
            } else {
                setError(response.message || 'Failed to load activity log.');
            }
        } catch (err) {
            logger.error("Error fetching user activity log:", err);
            setError(err.response?.data?.message || err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [user, limit]);

    useEffect(() => {
        document.title = `Activity Log - ${APP_NAME}`;
        fetchActivityLogs(currentPage);
    }, [fetchActivityLogs, currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const columns = React.useMemo(() => [
        { 
            Header: 'Date & Time', 
            accessor: 'createdAt', 
            // Cell: ({ value }) => value ? formatDate(value, 'MMM dd, yyyy HH:mm:ss') : 'N/A' ,
            Cell: ({ value }) => {
                // <<< ADD A LOG HERE TO SEE WHAT 'value' IS >>>
                console.log("[UserActivityLogPage] Cell 'createdAt' value:", value, "Type:", typeof value);
                return value ? formatDate(value, 'MMM dd, yyyy HH:mm:ss') : 'N/A';
            }
        }, // Format date
        
        { Header: 'Event', accessor: 'eventType', Cell: ({ value }) => value ? value.replace(/([A-Z])/g, ' $1').trim() : 'N/A' }, // Add spaces
        { Header: 'Description', accessor: 'message', Cell: ({ value }) => truncateString(value, 100) },
        { Header: 'IP Address', accessor: 'ipAddress' },
        // { Header: 'Details', Cell: ({row}) => row.original.details ? <Button size="xs" variant="outline" onClick={() => alert(JSON.stringify(row.original.details, null, 2))}>View</Button> : 'N/A' },
    ], []);


    if (isLoading && logs.length === 0) return <div className="page-loading"><Spinner size="lg" message="Loading activity log..." /></div>;
    if (error) return <div className="page-error">Error: {error} <Button onClick={() => fetchActivityLogs(1)}>Try Again</Button></div>;

    return (
        <div className="user-activity-log-page">
            <header className="dashboard-page-header">
                <h1>My Activity Log</h1>
                <p>Review your recent activities and security events on the platform.</p>
            </header>

            <Card className="table-card">
                {logs.length > 0 ? (
                    <Table columns={columns} data={logs} isLoading={isLoading} />
                ) : (
                    <p className="no-data-message">No activity recorded yet.</p>
                )}
            </Card>

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading}>
                        Previous
                    </Button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages || isLoading}>
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default UserActivityLogPage;