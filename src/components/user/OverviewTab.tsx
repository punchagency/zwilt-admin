import React from 'react';
import { Box, Typography, Grid, Paper, Chip } from '@mui/material';
import type { SeatUser } from '@/types';

interface OverviewTabProps {
    user: SeatUser;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ user }) => {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleString();
    };

    return (
        <Box>
            <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{ p: 3, backgroundColor: 'background.secondary' }}
                    >
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Personal Information
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Full Name
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                    {user.name ||
                                        `${user.firstName || ''} ${
                                            user.lastName || ''
                                        }`.trim() ||
                                        'N/A'}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Email
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                    {user.email}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Account Type
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip
                                        label={user.accountType}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'primary.main',
                                            color: '#fff',
                                            fontWeight: 600,
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Role
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                    {user.role || 'N/A'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Seat Information */}
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{ p: 3, backgroundColor: 'background.secondary' }}
                    >
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Seat Information
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Seat Status
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip
                                        label={user.seatStatus}
                                        size="small"
                                        color={
                                            user.seatStatus === 'ACTIVE'
                                                ? 'success'
                                                : user.seatStatus ===
                                                  'SUSPENDED'
                                                ? 'error'
                                                : 'warning'
                                        }
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Source
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                    {user.source === 'tracker'
                                        ? 'Tracker'
                                        : user.source === 'core'
                                        ? 'Core'
                                        : 'Recruit'}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    App Access
                                </Typography>
                                <Box
                                    sx={{
                                        mt: 0.5,
                                        display: 'flex',
                                        gap: 0.5,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {user.appAccess &&
                                    user.appAccess.length > 0 ? (
                                        user.appAccess.map((app) => (
                                            <Chip
                                                key={app}
                                                label={app}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))
                                    ) : (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            None
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Organization */}
                {user.organization && (
                    <Grid item xs={12}>
                        <Paper
                            sx={{
                                p: 3,
                                backgroundColor: 'background.secondary',
                            }}
                        >
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                gutterBottom
                            >
                                Organization
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body1" fontWeight={500}>
                                    {user.organization.name}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                )}

                {/* Activity Timestamps */}
                <Grid item xs={12}>
                    <Paper
                        sx={{ p: 3, backgroundColor: 'background.secondary' }}
                    >
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Activity Timestamps
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 4 }}>
                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Last Active
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {formatDate(user.lastActive)}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Created At
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {formatDate(user.createdAt)}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OverviewTab;
