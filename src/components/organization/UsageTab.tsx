import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Divider,
    Chip,
    Avatar,
    Tooltip,
    Skeleton,
    TablePagination,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { getUsageReport } from '@/services/admin';
import { showError } from '@/utils/toast';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

interface UsageTabProps {
    organizationId: string;
}

const UsageTab: React.FC<UsageTabProps> = ({ organizationId }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [summary, setSummary] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 20,
    });
    const [totalRows, setTotalRows] = useState(0);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchUsage = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getUsageReport({
                organizationId,
                page: paginationModel.page + 1,
                limit: paginationModel.pageSize,
            });
            if (response.success) {
                setHistory(response.data.history);
                setSummary(response.data.summary);
                setTotalRows(response.data.pagination.total);
            }
        } catch (error: any) {
            showError(error.message || 'Error fetching usage data');
        } finally {
            setLoading(false);
        }
    }, [paginationModel.page, paginationModel.pageSize, organizationId]);

    useEffect(() => {
        fetchUsage();
    }, [fetchUsage]);

    const totalCredits = summary.reduce(
        (acc, curr) => acc + (curr.totalCredits || 0),
        0,
    );

    const columns: GridColDef[] = [
        {
            field: 'operationType',
            headerName: 'Operation',
            flex: 1,
            minWidth: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                        {params.value.replace(/_/g, ' ')}
                    </Typography>
                    {params.row.count > 1 && (
                        <Chip
                            label={`${params.row.count} calls`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.75rem' }}
                        />
                    )}
                </Box>
            ),
        },
        {
            field: 'creditsConsumed',
            headerName: 'Credits',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Typography color="primary.main" fontWeight={700}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'timestamp',
            headerName: 'Time',
            width: 180,
            valueGetter: (params) => new Date(params.value),
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" color="text.secondary">
                    {new Date(params.value).toLocaleString()}
                </Typography>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params: GridRenderCellParams) => {
                const success = params.row.success;
                return (
                    <Chip
                        label={success ? 'Success' : 'Failed'}
                        size="small"
                        color={success ? 'success' : 'error'}
                        variant="outlined"
                    />
                );
            },
        },
        {
            field: 'details',
            headerName: 'Details',
            width: 100,
            renderCell: (params: GridRenderCellParams) =>
                params.row.entityId ? (
                    <Tooltip title={`Entity ID: ${params.row.entityId}`}>
                        <InfoOutlinedIcon fontSize="small" color="action" />
                    </Tooltip>
                ) : null,
        },
    ];

    return (
        <Box>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography
                                color="text.secondary"
                                variant="overline"
                                fontWeight={700}
                            >
                                Total Credits Consumed
                            </Typography>
                            <Typography
                                variant="h4"
                                fontWeight={800}
                                color="primary.main"
                            >
                                {totalCredits.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                {summary.slice(0, 2).map((item) => (
                    <Grid item xs={12} md={4} key={item._id}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography
                                    color="text.secondary"
                                    variant="overline"
                                    fontWeight={700}
                                >
                                    {item._id.replace(/_/g, ' ')}
                                </Typography>
                                <Typography variant="h5" fontWeight={700}>
                                    {item.count}{' '}
                                    <small
                                        style={{
                                            fontSize: '0.9rem',
                                            color: '#666',
                                        }}
                                    >
                                        calls
                                    </small>
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Usage History
            </Typography>

            {isMobile ? (
                loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[1, 2, 3].map((i) => (
                            <Card key={i} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="30%" />
                            </Card>
                        ))}
                    </Box>
                ) : history.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No usage history found
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {history.map((row) => (
                            <Card
                                key={row._id}
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'rgba(0, 0, 0, 0.08)',
                                    borderRadius: 2,
                                    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.12)',
                                    transition: 'box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: '0px 12px 28px rgba(0, 0, 0, 0.18)',
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="subtitle2" fontWeight={700}>
                                                {row.operationType.replace(/_/g, ' ')}
                                            </Typography>
                                            {row.count > 1 && (
                                                <Chip
                                                    label={`${row.count} calls`}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ height: 18, fontSize: '0.7rem' }}
                                                />
                                            )}
                                        </Box>
                                        <Chip
                                            label={row.success ? 'Success' : 'Failed'}
                                            size="small"
                                            color={row.success ? 'success' : 'error'}
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption" color="text.secondary">Credits Consumed</Typography>
                                            <Typography color="primary.main" fontWeight={700} variant="body2">
                                                {row.creditsConsumed}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption" color="text.secondary">Time</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(row.timestamp).toLocaleString()}
                                            </Typography>
                                        </Box>

                                        {row.entityId && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" color="text.secondary">Entity ID</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                    {row.entityId}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                        <TablePagination
                            component="div"
                            count={totalRows}
                            page={paginationModel.page}
                            onPageChange={(_, newPage) => setPaginationModel(prev => ({ ...prev, page: newPage }))}
                            rowsPerPage={paginationModel.pageSize}
                            onRowsPerPageChange={(e) => setPaginationModel(prev => ({ ...prev, pageSize: parseInt(e.target.value, 10), page: 0 }))}
                            rowsPerPageOptions={[20, 50, 100]}
                        />
                    </Box>
                )
            ) : (
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <DataGrid
                        rows={history}
                        columns={columns}
                        getRowId={(row) => row._id}
                        rowCount={totalRows}
                        loading={loading}
                        paginationModel={paginationModel}
                        paginationMode="server"
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[20, 50, 100]}
                        disableRowSelectionOnClick
                        autoHeight
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            },
                        }}
                    />
                </Card>
            )}
        </Box>
    );
};

export default UsageTab;
