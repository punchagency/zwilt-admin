import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
    Box,
    Typography,
    Chip,
    IconButton,
    Tabs,
    Tab,
    Button,
    Skeleton,
    Avatar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getUserDetails, updateUserSeatStatus, deleteUser } from '@/services/admin';
import type { SeatUser, SeatStatus } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import OverviewTab from '@/components/user/OverviewTab';
import ActivityTab from '@/components/user/ActivityTab';
import ConfirmActionDialog from '@/components/user/ConfirmActionDialog';

const statusColors: Record<SeatStatus, 'success' | 'error' | 'warning'> = {
    ACTIVE: 'success',
    SUSPENDED: 'error',
    REMOVED: 'warning',
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`user-tabpanel-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const UserDetails: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [user, setUser] = useState<SeatUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        action: 'suspend' | 'delete' | null;
        reason: string;
    }>({ open: false, action: null, reason: '' });

    const fetchUser = useCallback(async () => {
        if (!id || typeof id !== 'string') return;
        try {
            setLoading(true);
            const response = await getUserDetails(id);
            if (response.success) {
                setUser(response.data);
            } else {
                showError('Failed to load user');
            }
        } catch (error: any) {
            showError(error.message || 'Error loading user');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleStatusChange = async () => {
        if (!user || !confirmDialog.action) return;

        try {
            if (confirmDialog.action === 'suspend') {
                const newStatus = user.seatStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
                const response = await updateUserSeatStatus(user._id, {
                    status: newStatus,
                    reason: confirmDialog.reason,
                });
                if (response.success) {
                    setUser((prev) => (prev ? { ...prev, seatStatus: newStatus } : null));
                    showSuccess(`User ${newStatus === 'SUSPENDED' ? 'suspended' : 'reactivated'}`);
                }
            } else if (confirmDialog.action === 'delete') {
                const response = await deleteUser(user._id, confirmDialog.reason);
                if (response.success) {
                    showSuccess('User deleted');
                    router.push('/users');
                }
            }
        } catch (error: any) {
            showError(error.message || 'Action failed');
        } finally {
            setConfirmDialog({ open: false, action: null, reason: '' });
        }
    };

    if (loading) {
        return (
            <Box>
                <Skeleton variant="text" width={200} sx={{ mb: 2 }} />
                <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={150} sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" width="100%" height={300} />
            </Box>
        );
    }

    if (!user) {
        return (
            <Box>
                <Typography variant="h6" color="text.secondary">
                    User not found
                </Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/users')} sx={{ mt: 2 }}>
                    Back to Users
                </Button>
            </Box>
        );
    }

    const initials = user.firstName?.charAt(0) || user.name?.charAt(0) || 'U';

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/users')}
                    sx={{ mb: 2, textTransform: 'none' }}
                >
                    Back to Users
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Avatar
                        src={user.profile_img || undefined}
                        sx={{ width: 56, height: 56, backgroundColor: 'primary.main' }}
                    >
                        {initials.toUpperCase()}
                    </Avatar>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h4" fontWeight={700}>
                                {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                            </Typography>
                            <Chip
                                label={user.seatStatus}
                                color={statusColors[user.seatStatus]}
                                size="medium"
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            {user.email}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    <Chip
                        label={user.accountType}
                        sx={{
                            backgroundColor: '#2196F3',
                            color: '#fff',
                            fontWeight: 600,
                        }}
                    />
                    {user.source && (
                        <Chip
                            label={user.source === 'tracker' ? 'Tracker' : 'Recruit'}
                            variant="outlined"
                            color={user.source === 'tracker' ? 'secondary' : 'primary'}
                        />
                    )}
                    {user.organization && (
                        <Chip
                            label={user.organization.name}
                            variant="outlined"
                            onClick={() => router.push(`/organizations/${user.organization?._id}`)}
                            sx={{ cursor: 'pointer' }}
                        />
                    )}
                    <Button
                        variant="outlined"
                        color={user.seatStatus === 'SUSPENDED' ? 'success' : 'warning'}
                        size="small"
                        onClick={() =>
                            setConfirmDialog({
                                open: true,
                                action: 'suspend',
                                reason: '',
                            })
                        }
                        sx={{ textTransform: 'none' }}
                    >
                        {user.seatStatus === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() =>
                            setConfirmDialog({
                                open: true,
                                action: 'delete',
                                reason: '',
                            })
                        }
                        sx={{ textTransform: 'none' }}
                    >
                        Delete
                    </Button>
                </Box>
            </Box>

            {/* Tabs */}
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                <Tab label="Overview" />
                <Tab label="Activity" />
            </Tabs>

            {/* Tab Content */}
            <TabPanel value={activeTab} index={0}>
                <OverviewTab user={user} />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
                <ActivityTab user={user} />
            </TabPanel>

            {/* Confirm Action Dialog */}
            <ConfirmActionDialog
                open={confirmDialog.open}
                action={confirmDialog.action}
                userName={user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                reason={confirmDialog.reason}
                onReasonChange={(reason) => setConfirmDialog((prev) => ({ ...prev, reason }))}
                onClose={() => setConfirmDialog({ open: false, action: null, reason: '' })}
                onConfirm={handleStatusChange}
            />
        </Box>
    );
};

export default UserDetails;
