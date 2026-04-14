import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    TextField,
    InputAdornment,
    Button,
    IconButton,
    MenuItem,
    Avatar,
    Skeleton,
    Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { showSuccess, showError } from '@/utils/toast';
import {
    getSuperAdmins,
    promoteUserToAdmin,
    updateAdminRole,
    suspendSuperAdmin,
    deleteSuperAdmin,
} from '@/services/admin';
import type { SuperAdminUser, AdminRole, AdminPermission } from '@/types';
import { ADMIN_ROLES_CONFIG } from '@/types';
import PromoteUserDialog from '@/components/admin/PromoteUserDialog';
import RoleChangeDialog from '@/components/admin/RoleChangeDialog';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';

const SuperAdminsPage: React.FC = () => {

    // Data state
    const [admins, setAdmins] = useState<SuperAdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(25);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Dialog state
    const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<SuperAdminUser | null>(null);

    // Form state
    const [promoteRole, setPromoteRole] = useState<AdminRole>('SUPER_ADMIN');
    const [promoteReason, setPromoteReason] = useState('');
    const [roleChangeReason, setRoleChangeReason] = useState('');
    const [confirmReason, setConfirmReason] = useState('');

    // Action state
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [actionType, setActionType] = useState<'suspend' | 'delete'>('suspend');

    // Menu state
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getSuperAdmins(
                page + 1,
                limit,
                search || undefined,
                roleFilter || undefined,
            );
            if (res.success) {
                setAdmins(res.data.admins);
                setTotal(res.data.pagination.total);
            }
        } catch (error: any) {
            showError('Failed to load admin users');
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, roleFilter]);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    const handlePromoteUser = async (userId: string) => {
        setActionLoading(true);
        setActionError('');
        try {
            const res = await promoteUserToAdmin({
                userId,
                role: promoteRole,
                reason: promoteReason,
            });
            if (res.success) {
                showSuccess(`${res.data.name} promoted to ${promoteRole.replace('_', ' ')}`);
                setPromoteDialogOpen(false);
                setPromoteReason('');
                fetchAdmins();
            } else {
                setActionError(res.message || 'Failed to promote user');
            }
        } catch (error: any) {
            setActionError(error.message || 'Failed to promote user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRoleChange = async () => {
        if (!selectedAdmin) return;
        setActionLoading(true);
        setActionError('');
        try {
            const res = await updateAdminRole(selectedAdmin._id, {
                role: promoteRole,
                reason: roleChangeReason,
            });
            if (res.success) {
                showSuccess(`Role changed to ${promoteRole.replace('_', ' ')}`);
                setRoleDialogOpen(false);
                setSelectedAdmin(null);
                setRoleChangeReason('');
                fetchAdmins();
            } else {
                setActionError(res.message || 'Failed to change role');
            }
        } catch (error: any) {
            setActionError(error.message || 'Failed to change role');
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmAction = async () => {
        if (!selectedAdmin) return;
        setActionLoading(true);
        setActionError('');
        try {
            let res;
            if (actionType === 'suspend') {
                res = await suspendSuperAdmin(selectedAdmin._id, confirmReason);
            } else {
                res = await deleteSuperAdmin(selectedAdmin._id, confirmReason);
            }
            if (res?.success) {
                showSuccess(
                    `Admin ${actionType === 'suspend' ? 'suspended' : 'deleted'} successfully`,
                );
                setConfirmDialogOpen(false);
                setSelectedAdmin(null);
                setConfirmReason('');
                fetchAdmins();
            }
        } catch (error: any) {
            setActionError(error.message || `Failed to ${actionType} admin`);
        } finally {
            setActionLoading(false);
        }
    };

    const openMenu = (e: React.MouseEvent<HTMLElement>, admin: SuperAdminUser) => {
        setMenuAnchor(e.currentTarget);
        setSelectedAdmin(admin);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
    };

    const getRoleColor = (role: AdminRole) => {
        const config = ADMIN_ROLES_CONFIG.find((r) => r.role === role);
        return config?.color || '#9E9E9E';
    };

    const getRoleLabel = (role: AdminRole) => {
        const config = ADMIN_ROLES_CONFIG.find((r) => r.role === role);
        return config?.label || role.replace('_', ' ');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return '#4CAF50';
            case 'SUSPENDED':
                return '#FF9800';
            case 'DEACTIVATED':
                return '#9E9E9E';
            default:
                return '#9E9E9E';
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                }}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                        Admin Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage super admins, roles, and permissions
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => setPromoteDialogOpen(true)}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 3,
                    }}
                >
                    Promote to Admin
                </Button>
            </Box>

            {/* Filters */}
            <Paper
                sx={{
                    p: 2,
                    mb: 3,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    border: '1.2px solid',
                    borderColor: '#0000001A',
                }}
            >
                <TextField
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setPage(0);
                            fetchAdmins();
                        }
                    }}
                    sx={{ flex: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    select
                    label="Filter by role"
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setPage(0);
                    }}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">All Roles</MenuItem>
                    {ADMIN_ROLES_CONFIG.map((role) => (
                        <MenuItem key={role.role} value={role.role}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        backgroundColor: role.color,
                                    }}
                                />
                                {role.label}
                            </Box>
                        </MenuItem>
                    ))}
                </TextField>
                <Button
                    variant="outlined"
                    onClick={() => {
                        setSearch('');
                        setRoleFilter('');
                        setPage(0);
                    }}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    Clear Filters
                </Button>
            </Paper>

            {/* Table */}
            <TableContainer
                component={Paper}
                sx={{
                    border: '1.2px solid',
                    borderColor: '#0000001A',
                    borderRadius: 2,
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Admin</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Last Active</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading
                            ? Array.from(new Array(5)).map((_, i) => (
                                  <TableRow key={i}>
                                      <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                              <Skeleton variant="circular" width={36} height={36} />
                                              <Box>
                                                  <Skeleton variant="text" width={120} />
                                                  <Skeleton variant="text" width={150} />
                                              </Box>
                                          </Box>
                                      </TableCell>
                                      <TableCell><Skeleton variant="rounded" width={100} height={24} /></TableCell>
                                      <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                                      <TableCell><Skeleton variant="rounded" width={60} height={24} /></TableCell>
                                  </TableRow>
                              ))
                            : admins.map((admin) => (
                                  <TableRow key={admin._id} hover>
                                      <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                              <Avatar
                                                  src={admin.profile_img}
                                                  sx={{
                                                      width: 36,
                                                      height: 36,
                                                      backgroundColor: '#50589F',
                                                      fontSize: '12px',
                                                      fontWeight: 600,
                                                  }}
                                              >
                                                  {getInitials(admin.name)}
                                              </Avatar>
                                              <Box>
                                                  <Typography variant="body2" fontWeight={600}>
                                                      {admin.name}
                                                  </Typography>
                                                  <Typography variant="caption" color="text.secondary">
                                                      {admin.email}
                                                  </Typography>
                                              </Box>
                                          </Box>
                                      </TableCell>
                                      <TableCell>
                                          <Chip
                                              label={getRoleLabel(admin.accountType)}
                                              size="small"
                                              sx={{
                                                  backgroundColor: `${getRoleColor(admin.accountType)}18`,
                                                  color: getRoleColor(admin.accountType),
                                                  fontWeight: 600,
                                                  fontSize: '0.75rem',
                                              }}
                                          />
                                      </TableCell>
                                      <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Box
                                                  sx={{
                                                      width: 8,
                                                      height: 8,
                                                      borderRadius: '50%',
                                                      backgroundColor: getStatusColor(admin.status),
                                                  }}
                                              />
                                              <Typography variant="body2">
                                                  {admin.status.charAt(0) + admin.status.slice(1).toLowerCase()}
                                              </Typography>
                                          </Box>
                                      </TableCell>
                                      <TableCell>
                                          <Typography variant="body2" color="text.secondary">
                                              {admin.lastActive
                                                  ? new Date(admin.lastActive).toLocaleDateString()
                                                  : 'Never'}
                                          </Typography>
                                      </TableCell>
                                      <TableCell>
                                          <Typography variant="body2" color="text.secondary">
                                              {new Date(admin.createdAt).toLocaleDateString()}
                                          </Typography>
                                      </TableCell>
                                      <TableCell align="right">
                                          <Tooltip title="Actions">
                                              <IconButton
                                                  size="small"
                                                  onClick={(e) => openMenu(e, admin)}
                                              >
                                                  <MoreVertIcon fontSize="small" />
                                              </IconButton>
                                          </Tooltip>
                                      </TableCell>
                                  </TableRow>
                              ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={total}
                    rowsPerPage={limit}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(0);
                    }}
                />
            </TableContainer>

            {/* Actions Menu */}
            {menuAnchor && selectedAdmin && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: menuAnchor.getBoundingClientRect().bottom,
                        right: menuAnchor.getBoundingClientRect().right - 160,
                        backgroundColor: '#fff',
                        border: '1px solid #E0E0E9',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        minWidth: 160,
                        overflow: 'hidden',
                    }}
                    onClick={closeMenu}
                >
                    <MenuItem
                        onClick={() => {
                            setPromoteRole(selectedAdmin.accountType);
                            setRoleChangeReason('');
                            setRoleDialogOpen(true);
                        }}
                        sx={{ gap: 1 }}
                    >
                        <SwapHorizIcon fontSize="small" />
                        Change Role
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setActionType('suspend');
                            setConfirmReason('');
                            setConfirmDialogOpen(true);
                        }}
                        sx={{ gap: 1 }}
                    >
                        <BlockIcon fontSize="small" />
                        {selectedAdmin.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setActionType('delete');
                            setConfirmReason('');
                            setConfirmDialogOpen(true);
                        }}
                        sx={{ gap: 1, color: '#D32F2F' }}
                    >
                        <DeleteIcon fontSize="small" />
                        Delete Admin
                    </MenuItem>
                </Box>
            )}

            {/* Promote User Dialog */}
            <PromoteUserDialog
                open={promoteDialogOpen}
                role={promoteRole}
                reason={promoteReason}
                loading={actionLoading}
                error={actionError}
                onRoleChange={setPromoteRole}
                onReasonChange={setPromoteReason}
                onConfirm={handlePromoteUser}
                onCancel={() => {
                    setPromoteDialogOpen(false);
                    setActionError('');
                }}
            />

            {/* Role Change Dialog */}
            {selectedAdmin && (
                <RoleChangeDialog
                    open={roleDialogOpen}
                    adminName={selectedAdmin.name}
                    currentRole={selectedAdmin.accountType}
                    newRole={promoteRole}
                    reason={roleChangeReason}
                    loading={actionLoading}
                    error={actionError}
                    onNewRoleChange={setPromoteRole}
                    onReasonChange={setRoleChangeReason}
                    onConfirm={handleRoleChange}
                    onCancel={() => {
                        setRoleDialogOpen(false);
                        setActionError('');
                    }}
                />
            )}

            {/* Confirm Action Dialog */}
            {selectedAdmin && (
                <AdminConfirmDialog
                    open={confirmDialogOpen}
                    title={
                        actionType === 'suspend'
                            ? selectedAdmin.status === 'SUSPENDED'
                                ? 'Activate Admin'
                                : 'Suspend Admin'
                            : 'Delete Admin'
                    }
                    description={
                        actionType === 'suspend'
                            ? selectedAdmin.status === 'SUSPENDED'
                                ? 'This will reactivate the admin account and restore their access.'
                                : 'This will suspend the admin account and revoke their access.'
                            : 'This will permanently delete the admin account. This action cannot be undone.'
                    }
                    adminName={selectedAdmin.name}
                    actionType={actionType}
                    reason={confirmReason}
                    loading={actionLoading}
                    error={actionError}
                    onReasonChange={setConfirmReason}
                    onConfirm={handleConfirmAction}
                    onCancel={() => {
                        setConfirmDialogOpen(false);
                        setActionError('');
                    }}
                />
            )}
        </Box>
    );
};

export default SuperAdminsPage;
