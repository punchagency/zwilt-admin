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
} from '@mui/material';
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
        </Box>
    );
};

export default UsageTab;
