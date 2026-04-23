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
    Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LinkIcon from '@mui/icons-material/Link';
import {
    getOrganizationDetails,
    updateOrganizationStatus,
    deleteOrganization,
} from '@/services/admin';
import type { Organization, OrganizationStatus } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import OverviewTab from '@/components/organization/OverviewTab';
import UsersTab from '@/components/organization/UsersTab';
import BillingTab from '@/components/organization/BillingTab';
import UsageTab from '@/components/organization/UsageTab';
import ConfirmActionDialog from '@/components/organization/ConfirmActionDialog';

const statusColors: Record<
    OrganizationStatus,
    'success' | 'error' | 'warning' | 'default'
> = {
    ACTIVE: 'success',
    SUSPENDED: 'error',
    DEACTIVATED: 'default',
    TRIAL: 'warning',
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
            id={`org-tabpanel-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const OrganizationDetail: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [org, setOrg] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        action: 'suspend' | 'delete' | null;
        reason: string;
    }>({ open: false, action: null, reason: '' });

    const fetchOrg = useCallback(async () => {
        if (!id || typeof id !== 'string') return;
        if (id === 'new') {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await getOrganizationDetails(id);
            if (response.success) {
                setOrg(response.data);
            } else {
                showError('Failed to load organization');
            }
        } catch (error: any) {
            showError(error.message || 'Error loading organization');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrg();
    }, [fetchOrg]);

    const handleStatusChange = async () => {
        if (!org || !confirmDialog.action) return;

        try {
            if (confirmDialog.action === 'suspend') {
                const newStatus =
                    org.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
                const response = await updateOrganizationStatus(org._id, {
                    status: newStatus,
                    reason: confirmDialog.reason,
                });
                if (response.success) {
                    setOrg((prev) =>
                        prev ? { ...prev, status: newStatus } : null,
                    );
                    showSuccess(
                        `Organization ${
                            newStatus === 'SUSPENDED'
                                ? 'suspended'
                                : 'reactivated'
                        }`,
                    );
                }
            } else if (confirmDialog.action === 'delete') {
                const response = await deleteOrganization(
                    org._id,
                    confirmDialog.reason,
                );
                if (response.success) {
                    showSuccess('Organization deleted');
                    router.push('/organizations');
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
                <Skeleton
                    variant="text"
                    width={300}
                    height={40}
                    sx={{ mb: 1 }}
                />
                <Skeleton variant="text" width={150} sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" width="100%" height={300} />
            </Box>
        );
    }

    if (!org) {
        return (
            <Box>
                <Typography variant="h6" color="text.secondary">
                    Organization not found
                </Typography>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/organizations')}
                    sx={{ mt: 2 }}
                >
                    Back to Organizations
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/organizations')}
                    sx={{ mb: 2, textTransform: 'none' }}
                >
                    Back to Organizations
                </Button>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 1,
                    }}
                >
                    <Avatar
                        src={org.logo || undefined}
                        sx={{
                            width: 56,
                            height: 56,
                            backgroundColor: 'primary.main',
                        }}
                    >
                        {org.name?.charAt(0) || 'O'}
                    </Avatar>
                    <Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <Typography variant="h4" fontWeight={700}>
                                {org.name}
                            </Typography>
                            <Chip
                                label={org.status}
                                color={statusColors[org.status]}
                                size="medium"
                            />
                        </Box>
                        {org.admin && (
                            <Typography variant="body2" color="text.secondary">
                                Admin: {org.admin.name} ({org.admin.email})
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    {org.companyWebsite && (
                        <Link
                            href={org.companyWebsite}
                            target="_blank"
                            rel="noopener"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            <LinkIcon fontSize="small" />
                            Website
                        </Link>
                    )}
                    <Button
                        variant="outlined"
                        color={
                            org.status === 'SUSPENDED' ? 'success' : 'warning'
                        }
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
                        {org.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
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
            <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{ mb: 2 }}
            >
                <Tab label="Overview" />
                <Tab label={`Users (${org.userCount || 0})`} />
                <Tab label="Billing" />
                <Tab label="Usage" />
            </Tabs>

            {/* Tab Content */}
            <TabPanel value={activeTab} index={0}>
                <OverviewTab organization={org} />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
                <UsersTab organizationId={org._id} />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
                <BillingTab organization={org} />
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
                <UsageTab organizationId={org._id} />
            </TabPanel>

            {/* Confirm Action Dialog */}
            <ConfirmActionDialog
                open={confirmDialog.open}
                action={confirmDialog.action}
                organizationName={org.name}
                reason={confirmDialog.reason}
                onReasonChange={(reason) =>
                    setConfirmDialog((prev) => ({ ...prev, reason }))
                }
                onClose={() =>
                    setConfirmDialog({ open: false, action: null, reason: '' })
                }
                onConfirm={handleStatusChange}
            />
        </Box>
    );
};

export default OrganizationDetail;
