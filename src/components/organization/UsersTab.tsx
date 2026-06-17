import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Avatar,
    Skeleton,
    TablePagination,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    if (isMobile) {
        return (
            <Box>
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[1, 2, 3].map((i) => (
                            <Card key={i} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                    <Skeleton variant="circular" width={40} height={40} />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Skeleton variant="text" width="60%" height={24} />
                                        <Skeleton variant="text" width="40%" height={16} />
                                    </Box>
                                </Box>
                                <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="50%" />
                            </Card>
                        ))}
                    </Box>
                ) : users.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No users found
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {users.map((user) => {
                            const initials = user.firstName?.charAt(0) || user.name?.charAt(0) || 'U';
                            return (
                                <Card
                                    key={user._id}
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                            <Avatar
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    backgroundColor: 'primary.main',
                                                    fontSize: '0.9rem',
                                                }}
                                            >
                                                {initials.toUpperCase()}
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle2" fontWeight={700}>
                                                    {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={user.seatStatus}
                                                color={seatStatusColors[user.seatStatus] || 'default'}
                                                size="small"
                                            />
                                        </Box>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" color="text.secondary">Account Type</Typography>
                                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                    {user.accountType?.toLowerCase() || 'N/A'}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" color="text.secondary">Role</Typography>
                                                <Typography variant="body2">{user.role || 'Member'}</Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" color="text.secondary">Source</Typography>
                                                <Chip
                                                    label={user.source === 'tracker' ? 'Tracker' : 'Recruit'}
                                                    size="small"
                                                    variant="outlined"
                                                    color={user.source === 'tracker' ? 'secondary' : 'primary'}
                                                />
                                            </Box>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" color="text.secondary">Last Active</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        <TablePagination
                            component="div"
                            count={totalRows}
                            page={paginationModel.page}
                            onPageChange={(_, newPage) => setPaginationModel(prev => ({ ...prev, page: newPage }))}
                            rowsPerPage={paginationModel.pageSize}
                            onRowsPerPageChange={(e) => setPaginationModel(prev => ({ ...prev, pageSize: parseInt(e.target.value, 10), page: 0 }))}
                            rowsPerPageOptions={[25, 50, 100]}
                        />
                    </Box>
                )}
            </Box>
        );
    }

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
