import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Button, Skeleton, Card, CardContent } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import StatCard from '@/components/cards/StatCard';
import ProjectTrend from '@/components/charts/ProjectTrend';
import OrganizationOverview from '@/components/cards/OrganizationOverview';
import { getAdminStats, getOrganizations } from '@/services/admin';
import type { AdminStats, Organization } from '@/types';
import { showError } from '@/utils/toast';

const StatCardSkeleton = () => (
    <Card
        sx={{
            height: '100%',
            border: '1.2px solid',
            borderColor: '#0000001A',
            borderRadius: 2,
        }}
    >
        <CardContent>
            <Skeleton variant="text" width={100} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={60} height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={80} />
            <Skeleton variant="text" width={80} />
        </CardContent>
    </Card>
);

const OverviewContent: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsRes, orgsRes] = await Promise.all([
                    getAdminStats(),
                    getOrganizations(1, 5),
                ]);

                if (statsRes.success) {
                    setStats(statsRes.data);
                }

                if (orgsRes.success) {
                    setOrganizations(orgsRes.data.organizations);
                }
            } catch (error: any) {
                console.warn('Dashboard fetch error:', error.message);
                showError('Some data could not be loaded');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <Box>
            {/* Welcome Section */}
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
                        Welcome, Admin
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Here&apos;s what&apos;s happening
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    sx={{
                        backgroundColor: 'primary.main',
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 3,
                    }}
                >
                    Create Organization
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    {loading ? (
                        <StatCardSkeleton />
                    ) : (
                        <StatCard
                            title="Total Organizations"
                            mainValue={stats?.organizations.total || 0}
                            items={[
                                {
                                    label: 'Active',
                                    value: stats?.organizations.active || 0,
                                    color: '#4CAF50',
                                },
                                {
                                    label: 'Inactive',
                                    value: (stats?.organizations.total || 0) -
                                          (stats?.organizations.active || 0),
                                    color: '#9E9E9E',
                                },
                            ]}
                            icon={<BusinessIcon />}
                        />
                    )}
                </Grid>
                <Grid item xs={12} md={4}>
                    {loading ? (
                        <StatCardSkeleton />
                    ) : (
                        <StatCard
                            title="Total Projects"
                            mainValue={stats?.projects?.total ?? 0}
                            items={[
                                {
                                    label: 'Active',
                                    value: stats?.projects?.active ?? 0,
                                    color: '#4CAF50',
                                },
                                {
                                    label: 'Archived',
                                    value: stats?.projects?.archived ?? 0,
                                    color: '#FF9800',
                                },
                                {
                                    label: 'Deleted',
                                    value: stats?.projects?.deleted ?? 0,
                                    color: '#F44336',
                                },
                            ]}
                            icon={<AssignmentIcon />}
                        />
                    )}
                </Grid>
                <Grid item xs={12} md={4}>
                    {loading ? (
                        <StatCardSkeleton />
                    ) : (
                        <StatCard
                            title="Total Users"
                            mainValue={stats?.users.total || 0}
                            items={[
                                {
                                    label: 'Admins',
                                    value: stats?.users.admins || 0,
                                    color: '#50589F',
                                },
                                {
                                    label: 'Regular Users',
                                    value: (stats?.users.total || 0) -
                                          (stats?.users.admins || 0),
                                    color: '#9E9E9E',
                                },
                            ]}
                            icon={<PeopleIcon />}
                        />
                    )}
                </Grid>
            </Grid>

            {/* Charts and Overview */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <ProjectTrend />
                </Grid>
                <Grid item xs={12} lg={4}>
                    <OrganizationOverview organizations={organizations} loading={loading} />
                </Grid>
            </Grid>
        </Box>
    );
};

const Overview: React.FC = () => {
    return <OverviewContent />;
};

export default Overview;
