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
    Alert,
    styled,
    alpha,
    useTheme,
    useMediaQuery,
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        viewerPrice: 0,
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
                viewerPrice: app.viewerPrice ?? 0,
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
                viewerPrice: 0,
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
            field: 'viewerPrice',
            headerName: 'Viewer Price',
            width: 120,
            renderCell: (params: GridRenderCellParams) =>
                params.row.appId === 'tracker' ? (
                    <Typography variant="body2">${params.value ?? 0}/mo</Typography>
                ) : (
                    <Typography variant="body2" color="text.disabled">—</Typography>
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
        <Box sx={{ p: isMobile ? 2 : 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isMobile ? (
                [...Array(2)].map((_, i) => (
                    <Card key={i} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, boxShadow: 3 }}>
                        <CardContent sx={{ p: 2 }}>
                            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="30%" />
                        </CardContent>
                    </Card>
                ))
            ) : (
                [...Array(3)].map((_, i) => (
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
                ))
            )}
        </Box>
    );

    return (
        <Box
            sx={{
                p: isMobile ? 2 : 4,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                boxSizing: 'border-box',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'stretch' : 'center',
                    gap: 2,
                    mb: 4,
                }}
            >
                <Box>
                    <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
                        App Registry
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage available applications, pricing, and resource limits.
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
                        width: isMobile ? '100%' : 'auto',
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
                    ) : isMobile ? (
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {apps.map((app) => (
                                <Card
                                    key={app._id}
                                    onClick={() => handleOpenModal(app)}
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'rgba(0, 0, 0, 0.08)',
                                        borderRadius: 2,
                                        boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.12)',
                                        transition: 'box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            boxShadow: '0px 12px 28px rgba(0, 0, 0, 0.18)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>
                                                    {app.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {app.appId}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <Chip
                                                    label={app.isActive ? 'Active' : 'Inactive'}
                                                    color={app.isActive ? 'success' : 'default'}
                                                    size="small"
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenModal(app);
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        {app.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                                                {app.description}
                                            </Typography>
                                        )}

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" color="text.secondary">Base Price</Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    ${app.basePrice}/mo
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" color="text.secondary">Premium Price</Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    ${app.premiumPrice}/mo
                                                </Typography>
                                            </Box>

                                            {app.appId === 'tracker' && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="caption" color="text.secondary">Viewer Price</Typography>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        ${app.viewerPrice ?? 0}/mo
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" color="text.secondary">Max Seats</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {app.maxSeats || 'Unlimited'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
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
                        {formData.appId === 'tracker' && (
                            <>
                                <Grid item xs={12}>
                                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                                        <Typography variant="body2">
                                            <strong>Tracker Viewer Seats</strong> — The first VIEW-role user per org gets a free lifetime seat (tied to that specific user permanently). Additional VIEW-role users are billed at the price below.
                                        </Typography>
                                    </Alert>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Viewer Price ($)"
                                        name="viewerPrice"
                                        type="number"
                                        value={formData.viewerPrice}
                                        onChange={handleInputChange}
                                        fullWidth
                                        helperText="Price per additional viewer seat/mo"
                                    />
                                </Grid>
                            </>
                        )}
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
