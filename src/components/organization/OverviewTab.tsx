import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Divider,
} from '@mui/material';
import type { Organization } from '@/types';

interface OverviewTabProps {
    organization: Organization;
}

const StatItem: React.FC<{ label: string; value: string | number | React.ReactNode }> = ({ label, value }) => (
    <Box sx={{ py: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block">
            {label}
        </Typography>
        <Typography variant="body1" fontWeight={600}>
            {value}
        </Typography>
    </Box>
);

const OverviewTab: React.FC<OverviewTabProps> = ({ organization }) => {
    const statusColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
        ACTIVE: 'success',
        SUSPENDED: 'error',
        DEACTIVATED: 'default',
        TRIAL: 'warning',
    };

    return (
        <Grid container spacing={3}>
            {/* Organization Info */}
            <Grid item xs={12} md={6}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            Organization Details
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <StatItem label="Name" value={organization.name} />
                        <StatItem label="Status" value={
                            <Chip
                                label={organization.status}
                                color={statusColors[organization.status] || 'default'}
                                size="small"
                            />
                        } />
                        <StatItem label="Industry" value={organization.industry || 'N/A'} />
                        <StatItem label="Created" value={
                            new Date(organization.createdAt).toLocaleDateString()
                        } />
                        <StatItem label="Last Updated" value={
                            new Date(organization.updatedAt).toLocaleDateString()
                        } />
                        {organization.description && (
                            <Box sx={{ py: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Description
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{ mt: 0.5 }}
                                    dangerouslySetInnerHTML={{ __html: organization.description }}
                                />
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* Key Metrics */}
            <Grid item xs={12} md={6}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            Key Metrics
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <StatItem label="Total Users" value={organization.userCount || 0} />
                            </Grid>
                            <Grid item xs={6}>
                                <StatItem label="Active Seats" value={organization.activeSeatCount || 0} />
                            </Grid>
                            <Grid item xs={6}>
                                <StatItem label="Recruit Seats" value={organization.coreSeats || 0} />
                            </Grid>
                            <Grid item xs={6}>
                                <StatItem label="Tracker Seats" value={organization.trackerSeats || 0} />
                            </Grid>
                            <Grid item xs={6}>
                                <StatItem label="Projects" value={organization.projectCount || 0} />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Admin Info */}
                {organization.admin && (
                    <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mt: 2 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                Admin
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <StatItem label="Name" value={organization.admin.name || 'N/A'} />
                            <StatItem label="Email" value={organization.admin.email || 'N/A'} />
                            <StatItem label="Account Type" value={organization.admin.accountType || 'N/A'} />
                        </CardContent>
                    </Card>
                )}
            </Grid>
        </Grid>
    );
};

export default OverviewTab;
