// src/pages/admin/AdminUserManagementPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField'; // For search/filter inputs
import { adminApiService } from '../../services';
import { APP_NAME, ROUTES, UI_STATE, USER_ROLES, ACCOUNT_STATUS } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import './AdminUserManagementPage.css';

const AdminUserManagementPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        email: '',
        fullName: '',
        role: '',
        status: '',
        page: 1,
        limit: 15,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const activeFilters = { ...filters };
            // Remove empty filter values before sending to API
            Object.keys(activeFilters).forEach(key => {
                if (activeFilters[key] === '' || activeFilters[key] === null) {
                    delete activeFilters[key];
                }
            });

            const response = await adminApiService.getAllUsersAdminApi(activeFilters);
            if (response.success) {
                console.log("RAW USERS FROM API:", JSON.stringify(response.data.users, null, 2));
                setUsers(response.data.users || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalUsers(response.data.totalUsers || 0);
            } else {
                setError(response.message || 'Failed to load users.');
            }
        } catch (err) {
            logger.error("Error fetching users for admin:", err);
            setError(err.response?.data?.message || err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        document.title = `User Management - Admin | ${APP_NAME}`;
        fetchUsers();
    }, [fetchUsers]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(); // Trigger fetch with current filters
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const columns = React.useMemo(() => [
        { Header: 'Full Name', accessor: 'fullName' },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Role', accessor: 'role' },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => { // 'value' here is row.status
                if (value && typeof value === 'string') {
                    return <span className={`status-badge status-${value.toLowerCase()}`}>{value}</span>;
                }
                return <span className="status-badge status-unknown">Unknown</span>;
            }
        },

        { Header: 'KYC', accessor: 'kycStatus' },
        {
            Header: 'Joined',
            accessor: 'createdAt',
            Cell: ({ value, row }) => { // Destructure both value and row for logging
                console.log(`AdminUserManagementPage - Rendering 'Joined' Cell:`,
                    `value (row.createdAt):`, value,
                    `typeof value:`, typeof value,
                    `entire row object:`, JSON.parse(JSON.stringify(row)) // Deep copy for logging complex objects
                );
                if (value) { // Check if value is truthy (not null, undefined, '', 0, false)
                    return formatDate(value, 'MMM dd, yyyy');
                }
                return 'N/A';
            }
        },

        {
            Header: 'Actions',
            Cell: ({ row }) => (
                row?._id ? ( // Ensure row and row._id exist
                    <Button size="xs" onClick={() => navigate(ROUTES.ADMIN_USER_DETAILS.replace(':userId', row._id))}>
                        View/Manage
                    </Button>
                ) : null
            )
        },

    ], [navigate]);

    return (
        <div className="admin-user-management-page">
            <header className="dashboard-page-header">
                <h1>User Management</h1>
                <p>View, search, and manage platform users. Total Users: {totalUsers}</p>
            </header>

            <Card title="Filter Users" className="filter-card">
                <form onSubmit={handleSearch} className="filter-form-grid">
                    <InputField name="fullName" placeholder="Search by name..." value={filters.fullName} onChange={handleFilterChange} />
                    <InputField name="email" type="email" placeholder="Search by email..." value={filters.email} onChange={handleFilterChange} />
                    <select name="role" value={filters.role} onChange={handleFilterChange} className="input-field">
                        <option value="">All Roles</option>
                        {Object.values(USER_ROLES).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="input-field">
                        <option value="">All Statuses</option>
                        {Object.values(ACCOUNT_STATUS).map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <Button type="submit" variant="primary">Search</Button>
                </form>
            </Card>

            {isLoading && users.length === 0 ? (
                <div className="page-loading"><Spinner size="lg" message="Loading users..." /></div>
            ) : error ? (
                <div className="page-error">Error: {error} <Button onClick={fetchUsers}>Try Again</Button></div>
            ) : (
                <Card className="table-card users-table-card">
                    <Table columns={columns} data={users} isLoading={isLoading} emptyMessage="No users found matching your criteria." />
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

export default AdminUserManagementPage;