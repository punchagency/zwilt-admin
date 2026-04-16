import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    Skeleton,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import { getOrganizations, updateOrganizationStatus } from '@/services/admin';
import type { Organization, OrganizationStatus } from '@/types';
import { showError, showSuccess } from '@/utils/toast';

const statusColors: Record<
    OrganizationStatus,
    'success' | 'error' | 'warning' | 'default'
> = {
    ACTIVE: 'success',
    SUSPENDED: 'error',
    DEACTIVATED: 'default',
    TRIAL: 'warning',
};

const OrganizationsContent: React.FC = () => {
    const router = useRouter();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [totalRows, setTotalRows] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<OrganizationStatus>('ACTIVE');
    const [reason, setReason] = useState('');
    const lastFetchParams = React.useRef<string>('');

    const fetchOrganizations = useCallback(async () => {
        const currentParams = JSON.stringify(paginationModel);
        if (lastFetchParams.current === currentParams) return;
        lastFetchParams.current = currentParams;

        try {
            setLoading(true);
            const response = await getOrganizations(
                paginationModel.page + 1,
                paginationModel.pageSize,
            );
            if (response.success) {
                setOrganizations(response.data.organizations);
                setTotalRows(response.data.pagination.total);
            } else {
                showError('Failed to fetch organizations');
            }
        } catch (error: any) {
            showError(error.message || 'Error fetching organizations');
        } finally {
            setLoading(false);
        }
    }, [paginationModel]);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

    const handleMenuOpen = (
        event: React.MouseEvent<HTMLElement>,
        org: Organization,
    ) => {
        setAnchorEl(event.currentTarget);
        setSelectedOrg(org);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedOrg(null);
    };

    const handleStatusUpdate = () => {
        setStatusDialogOpen(true);
        handleMenuClose();
    };

    const handleStatusChange = (event: SelectChangeEvent) => {
        setNewStatus(event.target.value as OrganizationStatus);
    };

    const handleConfirmStatusUpdate = async () => {
        if (!selectedOrg) return;

        try {
            const response = await updateOrganizationStatus(selectedOrg._id, {
                status: newStatus,
                reason,
            });

            if (response.success) {
                showSuccess('Organization status updated successfully');
                fetchOrganizations();
            } else {
                showError('Failed to update organization status');
            }
        } catch (error: any) {
            showError(error.message || 'Error updating organization status');
        } finally {
            setStatusDialogOpen(false);
            setReason('');
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Organization',
            flex: 1,
            minWidth: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                    }}
                    onClick={() =>
                        router.push(`/organizations/${params.row._id}`)
                    }
                >
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'admin',
            headerName: 'Admin',
            flex: 1,
            minWidth: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2">
                    {params.row?.admin?.name || 'N/A'}
                </Typography>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value}
                    color={statusColors[params.value as OrganizationStatus]}
                    size="small"
                />
            ),
        },
        {
            field: 'activeSeatCount',
            headerName: 'Active Seats',
            width: 130,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2">
                    {params.row?.activeSeatCount || 0}
                </Typography>
            ),
        },
        {
            field: 'userCount',
            headerName: 'Users',
            width: 100,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2">
                    {params.row?.userCount || 0}
                </Typography>
            ),
        },
        {
            field: 'createdAt',
            headerName: 'Created',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2">
                    {new Date(params.row?.createdAt).toLocaleDateString()}
                </Typography>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 80,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, params.row)}
                >
                    <MoreVertIcon />
                </IconButton>
            ),
        },
    ];

    const OrganizationSkeletons = () => (
        <Box sx={{ p: 3 }}>
            {[...Array(5)].map((_, i) => (
                <Box
                    key={i}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        py: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Skeleton variant="text" width={150} />
                    <Skeleton variant="text" width={120} />
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="text" width={60} />
                    <Skeleton variant="text" width={60} />
                    <Skeleton variant="text" width={100} />
                    <Skeleton variant="circular" width={32} height={32} />
                </Box>
            ))}
        </Box>
    );

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    flexShrink: 0,
                }}
            >
                <Typography variant="h5" fontWeight={600}>
                    Organizations
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/organizations/create')}
                    sx={{
                        backgroundColor: 'primary.main',
                        textTransform: 'none',
                        borderRadius: 2,
                    }}
                >
                    Add Organization
                </Button>
            </Box>

            <Card
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                }}
            >
                <CardContent
                    sx={{
                        p: 0,
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {loading ? (
                        <OrganizationSkeletons />
                    ) : (
                        <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
                            <DataGrid
                                rows={organizations}
                                columns={columns}
                                getRowId={(row) => row._id}
                                rowCount={totalRows}
                                paginationModel={paginationModel}
                                paginationMode="server"
                                onPaginationModelChange={setPaginationModel}
                                pageSizeOptions={[10, 25, 50]}
                                disableRowSelectionOnClick
                                sx={{
                                    border: 'none',
                                    '& .MuiDataGrid-cell': {
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: 'background.secondary',
                                        borderBottom: '2px solid',
                                        borderColor: 'divider',
                                    },
                                }}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleStatusUpdate}>Update Status</MenuItem>
                <MenuItem
                    onClick={() => {
                        if (selectedOrg)
                            router.push(`/organizations/${selectedOrg._id}`);
                        handleMenuClose();
                    }}
                >
                    View Details
                </MenuItem>
            </Menu>

            {/* Status Update Dialog */}
            <Dialog
                open={statusDialogOpen}
                onClose={() => setStatusDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Update Organization Status</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                        }}
                    >
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={newStatus}
                                label="Status"
                                onChange={handleStatusChange}
                            >
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="SUSPENDED">Suspended</MenuItem>
                                <MenuItem value="DEACTIVATED">
                                    Deactivated
                                </MenuItem>
                                <MenuItem value="TRIAL">Trial</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Reason"
                            multiline
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            fullWidth
                            placeholder="Enter reason for status update..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setStatusDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmStatusUpdate}
                        sx={{ textTransform: 'none' }}
                    >
                        Update Status
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrganizationsContent;
