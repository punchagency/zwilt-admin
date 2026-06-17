'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    Avatar,
    Skeleton,
    Tooltip,
    useTheme,
    useMediaQuery,
    TablePagination,
    Divider,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import { getUsers } from '@/services/admin';
import type { SeatUser, AccountType, SeatStatus } from '@/types';
import { showError } from '@/utils/toast';

const accountTypeColors: Record<AccountType, string> = {
    CLIENT: '#2196F3',
    GUEST: '#9E9E9E',
    CONTACT: '#FF9800',
    MEMBER: '#4CAF50',
    ADMIN: '#F44336',
    SUPER_ADMIN: '#9C27B0',
    SUPPORT_ADMIN: '#00BCD4',
    AUDIT_ADMIN: '#607D8B',
};

const seatStatusColors: Record<SeatStatus, 'success' | 'error' | 'warning'> = {
    ACTIVE: 'success',
    SUSPENDED: 'error',
    REMOVED: 'warning',
};

const UsersContent: React.FC = () => {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [users, setUsers] = useState<SeatUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 25,
    });
    const [totalRows, setTotalRows] = useState(0);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [accountTypeFilter, setAccountTypeFilter] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<SeatUser | null>(null);

    // Debounce search input — reset to page 0 when search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
        }, 800);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getUsers(
                paginationModel.page + 1,
                paginationModel.pageSize,
                debouncedSearch || undefined,
                accountTypeFilter || undefined,
            );
            if (response.success) {
                setUsers(response.data.users);
                setTotalRows(response.data.pagination.total);
            } else {
                showError('Failed to fetch users');
            }
        } catch (error: any) {
            showError(error.message || 'Error fetching users');
        } finally {
            setLoading(false);
        }
    }, [
        paginationModel.page,
        paginationModel.pageSize,
        debouncedSearch,
        accountTypeFilter,
    ]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleMenuOpen = (
        event: React.MouseEvent<HTMLElement>,
        user: SeatUser,
    ) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const UserSkeletons = () => (
        <Box sx={{ p: isMobile ? 2 : 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isMobile ? (
                [...Array(3)].map((_, i) => (
                    <Card key={i} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, boxShadow: 3 }}>
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                <Skeleton variant="circular" width={40} height={40} />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Skeleton variant="text" width="60%" height={24} />
                                    <Skeleton variant="text" width="40%" height={16} />
                                </Box>
                            </Box>
                            <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="50%" />
                        </CardContent>
                    </Card>
                ))
            ) : (
                [...Array(5)].map((_, i) => (
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
                        <Skeleton variant="circular" width={36} height={36} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width={120} />
                            <Skeleton variant="text" width={150} height={20} />
                        </Box>
                        <Skeleton variant="rounded" width={80} height={24} />
                        <Skeleton variant="text" width={100} />
                        <Skeleton variant="rounded" width={70} height={24} />
                        <Skeleton variant="rounded" width={50} height={24} />
                        <Skeleton variant="text" width={100} />
                        <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                ))
            )}
        </Box>
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    };

    const handleAccountTypeChange = (event: SelectChangeEvent) => {
        setAccountTypeFilter(event.target.value);
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    };

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
                <Chip
                    label={params.value}
                    size="small"
                    sx={{
                        backgroundColor:
                            accountTypeColors[params.value as AccountType] ||
                            'text.disabled',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                    }}
                />
            ),
        },
        {
            field: 'organization',
            headerName: 'Organization',
            flex: 1,
            minWidth: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2">
                    {params.row?.organization?.name || 'N/A'}
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
            field: 'appAccess',
            headerName: 'Apps',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {params.row?.appAccess
                        ?.slice(0, 2)
                        .map((app: string) => (
                            <Chip
                                key={app}
                                label={app}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                        )) || (
                        <Typography variant="caption" color="text.secondary">
                            None
                        </Typography>
                    )}
                </Box>
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
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'stretch' : 'center',
                    gap: 2,
                    mb: 3,
                    flexShrink: 0,
                }}
            >
                <Typography variant="h5" fontWeight={600}>
                    User Management
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                    <TextField
                        placeholder="Search users..."
                        value={search}
                        onChange={handleSearchChange}
                        size="small"
                        sx={{ width: isMobile ? '100%' : 250 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl size="small" sx={{ width: isMobile ? '100%' : 180 }}>
                        <InputLabel>Account Type</InputLabel>
                        <Select
                            value={accountTypeFilter}
                            label="Account Type"
                            onChange={handleAccountTypeChange}
                        >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="CLIENT">Client</MenuItem>
                            <MenuItem value="MEMBER">Member</MenuItem>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                            <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                            <MenuItem value="SUPPORT_ADMIN">
                                Support Admin
                            </MenuItem>
                            <MenuItem value="AUDIT_ADMIN">Audit Admin</MenuItem>
                            <MenuItem value="GUEST">Guest</MenuItem>
                            <MenuItem value="CONTACT">Contact</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
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
                        <UserSkeletons />
                    ) : isMobile ? (
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {users.map((user) => {
                                const initials = user.firstName?.charAt(0) || user.name?.charAt(0) || 'U';
                                return (
                                    <Card
                                        key={user._id}
                                        onClick={() => router.push(`/users/${user._id}`)}
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
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMenuOpen(e, user);
                                                    }}
                                                >
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>
                                            </Box>

                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                                                <Chip
                                                    label={user.accountType}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: accountTypeColors[user.accountType as AccountType] || 'text.disabled',
                                                        color: '#fff',
                                                        fontWeight: 600,
                                                        fontSize: '0.7rem',
                                                        height: 20,
                                                    }}
                                                />
                                                <Chip
                                                    label={user.seatStatus}
                                                    color={seatStatusColors[user.seatStatus] || 'default'}
                                                    size="small"
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                                <Chip
                                                    label={user.source === 'tracker' ? 'Tracker' : 'Recruit'}
                                                    size="small"
                                                    variant="outlined"
                                                    color={user.source === 'tracker' ? 'secondary' : 'primary'}
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                            </Box>

                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="caption" color="text.secondary">Organization</Typography>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {user.organization?.name || 'N/A'}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="caption" color="text.secondary">Apps</Typography>
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        {user.appAccess?.slice(0, 2).map((app: string) => (
                                                            <Chip
                                                                key={app}
                                                                label={app}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ fontSize: '0.65rem', height: 18 }}
                                                            />
                                                        )) || (
                                                            <Typography variant="caption" color="text.secondary">None</Typography>
                                                        )}
                                                    </Box>
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
                                onPageChange={(_, newPage) => {
                                    setPaginationModel(prev => ({ ...prev, page: newPage }));
                                }}
                                rowsPerPage={paginationModel.pageSize}
                                onRowsPerPageChange={(e) => {
                                    setPaginationModel(prev => ({
                                        ...prev,
                                        pageSize: parseInt(e.target.value, 10),
                                        page: 0
                                    }));
                                }}
                                rowsPerPageOptions={[25, 50, 100]}
                            />
                        </Box>
                    ) : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <DataGrid
                                rows={users}
                                columns={columns}
                                getRowId={(row) => row._id}
                                rowCount={totalRows}
                                paginationModel={paginationModel}
                                paginationMode="server"
                                onPaginationModelChange={setPaginationModel}
                                pageSizeOptions={[25, 50, 100]}
                                disableRowSelectionOnClick
                                onRowClick={(params) =>
                                    router.push(`/users/${params.row._id}`)
                                }
                                sx={{
                                    border: 'none',
                                    '& .MuiDataGrid-cell': {
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    },
                                    '& .MuiDataGrid-row': {
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                        },
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
                <MenuItem
                    onClick={() => {
                        if (selectedUser) {
                            router.push(`/users/${selectedUser._id}`);
                        }
                        handleMenuClose();
                    }}
                >
                    View Details
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>Suspend Seat</MenuItem>
                <MenuItem onClick={handleMenuClose}>Reactivate Seat</MenuItem>
            </Menu>
        </Box>
    );
};

export default UsersContent;
