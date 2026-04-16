import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Avatar,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { getUsers } from '@/services/admin';
import type { SeatUser, SeatStatus, AccountType } from '@/types';
import { showError } from '@/utils/toast';

interface UsersTabProps {
    organizationId: string;
}

const seatStatusColors: Record<SeatStatus, 'success' | 'error' | 'warning'> = {
    ACTIVE: 'success',
    SUSPENDED: 'error',
    REMOVED: 'warning',
};

const UsersTab: React.FC<UsersTabProps> = ({ organizationId }) => {
    const [users, setUsers] = useState<SeatUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 25,
    });
    const [totalRows, setTotalRows] = useState(0);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getUsers(
                paginationModel.page + 1,
                paginationModel.pageSize,
                undefined,
                undefined,
                organizationId,
            );
            if (response.success) {
                setUsers(response.data.users);
                setTotalRows(response.data.pagination.total);
            }
        } catch (error: any) {
            showError(error.message || 'Error fetching users');
        } finally {
            setLoading(false);
        }
    }, [paginationModel.page, paginationModel.pageSize, organizationId]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const columns: GridColDef[] = [
        {
            field: 'user',
            headerName: 'User',
            flex: 1,
            minWidth: 250,
            renderCell: (params: GridRenderCellParams) => {
                const user = params.row as SeatUser;
                const initials =
                    user.firstName?.charAt(0) || user.name?.charAt(0) || 'U';
                return (
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                    >
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                backgroundColor: 'primary.main',
                                fontSize: '0.875rem',
                            }}
                        >
                            {initials.toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={600}>
                                {user.name ||
                                    `${user.firstName || ''} ${
                                        user.lastName || ''
                                    }`.trim()}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {user.email}
                            </Typography>
                        </Box>
                    </Box>
                );
            },
        },
        {
            field: 'accountType',
            headerName: 'Account Type',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Typography
                    variant="body2"
                    sx={{ textTransform: 'capitalize' }}
                >
                    {params.value?.toLowerCase() || 'N/A'}
                </Typography>
            ),
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2">
                    {params.value || 'Member'}
                </Typography>
            ),
        },
        {
            field: 'seatStatus',
            headerName: 'Seat Status',
            width: 130,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value}
                    color={
                        seatStatusColors[params.value as SeatStatus] ||
                        'default'
                    }
                    size="small"
                />
            ),
        },
        {
            field: 'source',
            headerName: 'Source',
            width: 110,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value === 'tracker' ? 'Tracker' : 'Recruit'}
                    size="small"
                    variant="outlined"
                    color={params.value === 'tracker' ? 'secondary' : 'primary'}
                />
            ),
        },
        {
            field: 'lastActive',
            headerName: 'Last Active',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" color="text.secondary">
                    {params.row?.lastActive
                        ? new Date(params.row.lastActive).toLocaleDateString()
                        : 'Never'}
                </Typography>
            ),
        },
    ];

    return (
        <Card
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
            }}
        >
            <CardContent sx={{ p: 0 }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    getRowId={(row) => row._id}
                    rowCount={totalRows}
                    loading={loading}
                    paginationModel={paginationModel}
                    paginationMode="server"
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[25, 50, 100]}
                    disableRowSelectionOnClick
                    autoHeight
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
            </CardContent>
        </Card>
    );
};

export default UsersTab;
