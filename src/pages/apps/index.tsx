import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Skeleton,
    Grid,
    Switch,
    FormControlLabel,
    styled,
    alpha,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import {
    getSeatPricing,
    createManagedApp,
    updateManagedApp,
} from '@/services/admin';
import type { ManagedApplication } from '@/types';
import { showError, showSuccess } from '@/utils/toast';

const IOSSwitch = styled(Switch)(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor:
                    theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
                opacity: 1,
                border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
            },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#33cf4d',
            border: '6px solid #fff',
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
            color:
                theme.palette.mode === 'light'
                    ? theme.palette.grey[100]
                    : theme.palette.grey[600],
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 22,
        height: 22,
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}));

const AppRegistryPage: React.FC = () => {
    const [apps, setApps] = useState<ManagedApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<ManagedApplication | null>(
        null,
    );
    const [formData, setFormData] = useState({
        appId: '',
        name: '',
        description: '',
        baseUrl: '',
        basePrice: 0,
        premiumPrice: 0,
        maxSeats: 0,
        isActive: true,
    });

    const fetchApps = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getSeatPricing();
            if (response.success) {
                setApps(response.data.apps);
            } else {
                showError('Failed to fetch application registry');
            }
        } catch (error: any) {
            showError(error.message || 'Error fetching application registry');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApps();
    }, [fetchApps]);

    const handleOpenModal = (app: ManagedApplication | null = null) => {
        if (app) {
            setSelectedApp(app);
            setFormData({
                appId: app.appId,
                name: app.name,
                description: app.description || '',
                baseUrl: app.baseUrl || '',
                basePrice: app.basePrice,
                premiumPrice: app.premiumPrice,
                maxSeats: app.maxSeats || 0,
                isActive: app.isActive,
            });
        } else {
            setSelectedApp(null);
            setFormData({
                appId: '',
                name: '',
                description: '',
                baseUrl: '',
                basePrice: 0,
                premiumPrice: 0,
                maxSeats: 0,
                isActive: true,
            });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedApp(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === 'checkbox'
                    ? checked
                    : type === 'number'
                    ? Number(value)
                    : value,
        }));
    };

    const handleSubmit = async () => {
        try {
            let response;
            if (selectedApp) {
                response = await updateManagedApp(selectedApp._id, formData);
            } else {
                response = await createManagedApp(formData);
            }

            if (response.success) {
                showSuccess(
                    `Application ${
                        selectedApp ? 'updated' : 'created'
                    } successfully`,
                );
                fetchApps();
                handleCloseModal();
            } else {
                showError(response.message || 'Failed to save application');
            }
        } catch (error: any) {
            showError(error.message || 'Error saving application');
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            minWidth: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <Typography variant="body2" fontWeight={600}>
                        {params.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.appId}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'basePrice',
            headerName: 'Base Price',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2">${params.value}/mo</Typography>
            ),
        },
        {
            field: 'premiumPrice',
            headerName: 'Premium Price',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2">${params.value}/mo</Typography>
            ),
        },
        {
            field: 'maxSeats',
            headerName: 'Max Seats',
            width: 100,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2">
                    {params.value || 'Unlimited'}
                </Typography>
            ),
        },
        {
            field: 'isActive',
            headerName: 'Status',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value ? 'Active' : 'Inactive'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                />
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
                    onClick={() => handleOpenModal(params.row)}
                >
                    <EditIcon />
                </IconButton>
            ),
        },
    ];

    const AppSkeletons = () => (
        <Box sx={{ p: 3 }}>
            {[...Array(3)].map((_, i) => (
                <Box
                    key={i}
                    sx={{
                        display: 'flex',
                        gap: 2,
                        py: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Skeleton variant="text" width={200} />
                    <Skeleton variant="text" width={100} />
                    <Skeleton variant="text" width={100} />
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="circular" width={32} height={32} />
                </Box>
            ))}
        </Box>
    );

    return (
        <Box
            sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                }}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        App Registry
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage available applications, pricing, and resource
                        limits.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal(null)}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1.2,
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                >
                    Add New App
                </Button>
            </Box>

            <Card
                sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <CardContent
                    sx={{
                        p: 0,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {loading ? (
                        <AppSkeletons />
                    ) : (
                        <DataGrid
                            rows={apps}
                            columns={columns}
                            getRowId={(row) => row._id}
                            autoHeight={false}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: 'background.default',
                                },
                                '& .MuiDataGrid-row': { cursor: 'pointer' },
                            }}
                            onRowClick={(params) => handleOpenModal(params.row)}
                            disableRowSelectionOnClick
                        />
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {selectedApp
                        ? 'Edit Application'
                        : 'Register New Application'}
                </DialogTitle>
                <DialogContent sx={{ pt: 1.5, pb: 2 }}>
                    <Grid
                        container
                        spacing={3}
                        sx={{
                            marginTop: 3,
                        }}
                    >
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="App ID"
                                name="appId"
                                value={formData.appId}
                                onChange={handleInputChange}
                                fullWidth
                                disabled={!!selectedApp}
                                placeholder="e.g. recruit"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="App Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                fullWidth
                                placeholder="e.g. Zwilt Recruit"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                fullWidth
                                multiline
                                rows={2}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Base URL"
                                name="baseUrl"
                                value={formData.baseUrl}
                                onChange={handleInputChange}
                                fullWidth
                                placeholder="https://app.zwilt.com"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Base Price ($)"
                                name="basePrice"
                                type="number"
                                value={formData.basePrice}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Premium Price ($)"
                                name="premiumPrice"
                                type="number"
                                value={formData.premiumPrice}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Max Seats"
                                name="maxSeats"
                                type="number"
                                value={formData.maxSeats}
                                onChange={handleInputChange}
                                fullWidth
                                helperText="0 for unlimited"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    p: 2.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: (theme) =>
                                        alpha(theme.palette.primary.main, 0.04),
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: (theme) =>
                                        alpha(theme.palette.primary.main, 0.1),
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight={700}
                                    >
                                        Application Active
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Toggle whether this application is
                                        available for selection and billing.
                                    </Typography>
                                </Box>
                                <FormControlLabel
                                    control={
                                        <IOSSwitch
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            sx={{ ml: 1 }}
                                        />
                                    }
                                    label=""
                                    sx={{ m: 0 }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{ borderRadius: 2, px: 4 }}
                    >
                        {selectedApp ? 'Update App' : 'Register App'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AppRegistryPage;
