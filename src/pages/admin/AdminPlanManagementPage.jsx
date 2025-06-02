// src/pages/admin/AdminPlanManagementPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import InputField from '../../components/common/InputField';
import Card from '../../components/common/Card';
import { adminApiService } from '../../services'; // Using functions from admin.service.js that call plan controller
import { APP_NAME, UI_STATE } from '../../utils/constants';
import logger from '../../utils/logger.util.js';
import Spinner from '../../components/common/Spinner';
import { formatDate, formatCurrency } from '../../utils/formatters';
import './AdminPlanManagementPage.css';

const AdminPlanManagementPage = () => {
    // const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10); // Plans per page

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null); // For editing or null for new
    const [planFormData, setPlanFormData] = useState({
        planName: '',
        description: '',
        minUSD: '',
        maxUSD: '',
        dailyROIPercentage: '',
        durationDays: '',
        isActive: true,
        reinvestmentOptionAvailable: true,
        illustrativeCapitalTiers: '', // Comma-separated string
        tags: '' // Comma-separated string
    });
    const [modalUiState, setModalUiState] = useState(UI_STATE.IDLE);
    const [modalMessage, setModalMessage] = useState('');

    const fetchPlans = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await adminApiService.getAllPlansAdminApi({ page, limit, sortBy: 'createdAt', sortOrder: 'desc' });
            if (response.success) {
                console.log("RAW PLANS FROM API:", JSON.stringify(response.data.plans, null, 2)); // <<< ADD THIS LOG
                setPlans(response.data.plans || []);
                setTotalPages(response.data.totalPages || 1);
                setCurrentPage(response.data.currentPage || 1);
            } else {
                setError(response.message || 'Failed to load investment plans.');
            }
        } catch (err) {
            logger.error("Error fetching plans for admin:", err);
            setError(err.response?.data?.message || err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        document.title = `Manage Plans - Admin | ${APP_NAME}`;
        fetchPlans(currentPage);
    }, [fetchPlans, currentPage]);

    const handleOpenModal = useCallback((planToEdit = null) => {
        // Reset form logic moved here to avoid extra dependency
        setPlanFormData({
            planName: '', description: '', minUSD: '', maxUSD: '',
            dailyROIPercentage: '', durationDays: '', isActive: true,
            reinvestmentOptionAvailable: true, illustrativeCapitalTiers: '', tags: ''
        });
        setCurrentPlan(null);
        setModalMessage('');
        setModalUiState(UI_STATE.IDLE);

        if (planToEdit) {
            setCurrentPlan(planToEdit);
            setPlanFormData({
                planName: planToEdit.planName,
                description: planToEdit.description || '',
                minUSD: planToEdit.investmentRange.minUSD.toString(),
                maxUSD: planToEdit.investmentRange.maxUSD.toString(),
                dailyROIPercentage: planToEdit.dailyROIPercentage.toString(),
                durationDays: planToEdit.durationDays.toString(),
                isActive: planToEdit.isActive,
                reinvestmentOptionAvailable: planToEdit.reinvestmentOptionAvailable,
                illustrativeCapitalTiers: (planToEdit.illustrativeCapitalTiers || []).join(', '),
                tags: (planToEdit.tags || []).join(', ')
            });
        }
        setIsModalOpen(true);
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPlanFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setModalUiState(UI_STATE.LOADING);
        setModalMessage('');
        try {
            const payload = {
                ...planFormData,
                investmentRange: {
                    minUSD: parseFloat(planFormData.minUSD),
                    maxUSD: parseFloat(planFormData.maxUSD)
                },
                dailyROIPercentage: parseFloat(planFormData.dailyROIPercentage),
                durationDays: parseInt(planFormData.durationDays, 10),
                illustrativeCapitalTiers: planFormData.illustrativeCapitalTiers.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0),
                tags: planFormData.tags.split(',').map(s => s.trim()).filter(s => s)
            };
            // Remove individual minUSD/maxUSD as they are in investmentRange
            delete payload.minUSD;
            delete payload.maxUSD;

            let response;
            if (currentPlan && currentPlan._id) {
                response = await adminApiService.updatePlanAdminApi(currentPlan._id, payload);
            } else {
                response = await adminApiService.createPlanAdminApi(payload);
            }

            if (response.success) {
                setModalMessage(currentPlan ? 'Plan updated successfully!' : 'Plan created successfully!');
                setModalUiState(UI_STATE.SUCCESS);
                fetchPlans(currentPlan ? currentPage : 1); // Refresh list, go to page 1 for new plan
                setTimeout(() => setIsModalOpen(false), 1500);
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            logger.error(`Error ${currentPlan ? 'updating' : 'creating'} plan:`, err);
            setModalMessage(err.response?.data?.message || err.message || `Failed to ${currentPlan ? 'update' : 'create'} plan.`);
            setModalUiState(UI_STATE.ERROR);
        }
    };

    const handleToggleStatus = useCallback(async (planId, currentStatus) => {
        // Simple confirm, can be improved with a nicer modal
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this plan?`)) return;

        setIsLoading(true); // Indicate general page loading for this action
        try {
            const response = await adminApiService.togglePlanStatusAdminApi(planId, { isActive: !currentStatus });
            if (response.success) {
                // alert(`Plan ${currentStatus ? 'deactivated' : 'activated'} successfully.`);
                fetchPlans(currentPage);
            } else throw new Error(response.message);
        } catch (err) {
            logger.error("Error toggling plan status:", err);
            setError(err.response?.data?.message || err.message || "Failed to toggle plan status.");
        } finally {
            setIsLoading(false);
        }
    }, [adminApiService, fetchPlans, currentPage]);


    // const columns = React.useMemo(() => [
    //     { Header: 'Plan Name', accessor: 'planName', Cell: ({ value }) => value || 'N/A' },
    //     {
    //         Header: 'Min USD',
    //         accessor: 'investmentRange.minUSD', // Using dot notation in accessor can simplify
    //         Cell: ({ row }) => {
    //             // Safely access the nested property
    //             const minUSD = row.original?.investmentRange?.minUSD;
    //             return typeof minUSD === 'number' ? formatCurrency(minUSD) : 'N/A';
    //         }
    //     },
    //     {
    //         Header: 'Max USD',
    //         accessor: 'investmentRange.maxUSD',
    //         Cell: ({ row }) => {
    //             const maxUSD = row.original?.investmentRange?.maxUSD;
    //             return typeof maxUSD === 'number' ? formatCurrency(maxUSD) : 'N/A';
    //         }
    //     },
    //     { Header: 'Daily ROI %', accessor: 'dailyROIPercentage', Cell: ({ value }) => value !== undefined ? `${value}%` : 'N/A' },
    //     { Header: 'Duration', accessor: 'durationDays', Cell: ({ value }) => value !== undefined ? `${value} days` : 'N/A' },
    //     {
    //         Header: 'Status',
    //         accessor: 'isActive',
    //         Cell: ({ value }) => value === true ? <span className="status-active">Active</span> : (value === false ? <span className="status-inactive">Inactive</span> : 'N/A')
    //     },
    //     {
    //         Header: 'Created',
    //         accessor: 'createdAt',
    //         Cell: ({ value }) => value ? formatDate(value, 'MMM dd, yyyy') : 'N/A'
    //     },
    //     {
    //         Header: 'Actions',
    //         Cell: ({ row }) => (
    //             row.original?._id ? ( // Ensure row.original and _id exist
    //                 <div className="table-actions">
    //                     <Button size="xs" onClick={() => handleOpenModal(row.original)}>Edit</Button>
    //                     <Button
    //                         size="xs"
    //                         variant={row.original.isActive ? "warning" : "success"}
    //                         onClick={() => handleToggleStatus(row.original._id, row.original.isActive)}
    //                     >
    //                         {row.original.isActive ? 'Deactivate' : 'Activate'}
    //                     </Button>
    //                 </div>
    //             ) : null
    //         )
    //     },
    // ], [handleOpenModal, handleToggleStatus]); // Add handleOpenModal and handleToggleStatus if they are stable or memoized

    const columns = React.useMemo(() => [
        {
            Header: 'Plan Name',
            accessor: 'planName', // Simple accessor, `value` prop in Cell will be row.planName
            Cell: ({ value }) => value || 'N/A'
        },
        {
            Header: 'Min USD',
            // No accessor needed if Cell uses `row` directly for complex data
            Cell: ({ row }) => { // `row` is the plan object here
                const minUSD = row?.investmentRange?.minUSD;
                return (typeof minUSD === 'number') ? formatCurrency(minUSD) : 'N/A';
            }
        },
        {
            Header: 'Max USD',
            Cell: ({ row }) => { // `row` is the plan object here
                const maxUSD = row?.investmentRange?.maxUSD;
                return (typeof maxUSD === 'number') ? formatCurrency(maxUSD) : 'N/A';
            }
        },
        {
            Header: 'Daily ROI %',
            accessor: 'dailyROIPercentage',
            Cell: ({ value }) => (value !== undefined && value !== null) ? `${value}%` : 'N/A'
        },
        {
            Header: 'Duration',
            accessor: 'durationDays',
            Cell: ({ value }) => (value !== undefined && value !== null) ? `${value} days` : 'N/A'
        },
        {
            Header: 'Status',
            accessor: 'isActive',
            Cell: ({ value }) => { // `value` is plan.isActive
                if (typeof value === 'boolean') {
                    return value ? <span className="status-active">Active</span> : <span className="status-inactive">Inactive</span>;
                }
                return 'N/A';
            }
        },
        {
            Header: 'Created',
            accessor: 'createdAt',
            Cell: ({ value }) => value ? formatDate(value, 'MMM dd, yyyy') : 'N/A'
        },
        {
            Header: 'Actions',
            Cell: ({ row }) => { // `row` is the plan object here
                if (!row?._id) { // Safety check
                    return null;
                }
                return (
                    <div className="table-actions">
                        <Button size="xs" onClick={() => handleOpenModal(row)}>Edit</Button>
                        <Button
                            size="xs"
                            variant={row.isActive ? "warning" : "success"}
                            onClick={() => handleToggleStatus(row._id, row.isActive)}
                        >
                            {row.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                    </div>
                );
            }
        },
    ], [handleOpenModal, handleToggleStatus]); // Dependencies for useMemo

    
    return (
        <div className="admin-plan-management-page">
            <header className="dashboard-page-header">
                <h1>Manage Investment Plans</h1>
                <Button variant="primary" onClick={() => handleOpenModal()}>Create New Plan</Button>
            </header>

            {isLoading && plans.length === 0 ? (
                <div className="page-loading"><Spinner size="lg" message="Loading plans..." /></div>
            ) : error ? (
                <div className="page-error">Error: {error} <Button onClick={() => fetchPlans(1)}>Try Again</Button></div>
            ) : (
                <Card className="table-card">
                    <Table columns={columns} data={plans} isLoading={isLoading} emptyMessage="No investment plans found." />
                </Card>
            )}

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <Button onClick={() => fetchPlans(currentPage - 1)} disabled={currentPage <= 1 || isLoading}>Previous</Button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <Button onClick={() => fetchPlans(currentPage + 1)} disabled={currentPage >= totalPages || isLoading}>Next</Button>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentPlan ? 'Edit Investment Plan' : 'Create New Investment Plan'}>
                <form onSubmit={handleFormSubmit}>
                    {modalMessage && <p className={`modal-message ${modalUiState === UI_STATE.SUCCESS ? 'success' : (modalUiState === UI_STATE.ERROR ? 'error' : 'info')}`}>{modalMessage}</p>}
                    <InputField label="Plan Name" name="planName" value={planFormData.planName} onChange={handleFormChange} required />
                    <InputField label="Description" name="description" type="textarea" value={planFormData.description} onChange={handleFormChange} rows={3} />
                    <div className="form-row">
                        <InputField label="Min Investment (USD)" name="minUSD" type="number" value={planFormData.minUSD} onChange={handleFormChange} required />
                        <InputField label="Max Investment (USD)" name="maxUSD" type="number" value={planFormData.maxUSD} onChange={handleFormChange} required />
                    </div>
                    <div className="form-row">
                        <InputField label="Daily ROI (%)" name="dailyROIPercentage" type="number" step="0.01" value={planFormData.dailyROIPercentage} onChange={handleFormChange} required />
                        <InputField label="Duration (Days)" name="durationDays" type="number" value={planFormData.durationDays} onChange={handleFormChange} required />
                    </div>
                    <InputField label="Illustrative Capital Tiers (comma-separated USD amounts)" name="illustrativeCapitalTiers" value={planFormData.illustrativeCapitalTiers} onChange={handleFormChange} placeholder="e.g., 200, 500, 1000" />
                    <InputField label="Tags (comma-separated)" name="tags" value={planFormData.tags} onChange={handleFormChange} placeholder="e.g., Short-term, High-yield" />
                    <div className="form-checkbox-group">
                        <label><input type="checkbox" name="isActive" checked={planFormData.isActive} onChange={handleFormChange} /> Active</label>
                        <label><input type="checkbox" name="reinvestmentOptionAvailable" checked={planFormData.reinvestmentOptionAvailable} onChange={handleFormChange} /> Reinvestment Option</label>
                    </div>
                    <div className="modal-actions">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={modalUiState === UI_STATE.LOADING}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={modalUiState === UI_STATE.LOADING} disabled={modalUiState === UI_STATE.LOADING}>
                            {currentPlan ? 'Update Plan' : 'Create Plan'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminPlanManagementPage;