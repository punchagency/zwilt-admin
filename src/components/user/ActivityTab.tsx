import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import type { SeatUser } from '@/types';

interface ActivityTabProps {
    user: SeatUser;
}

const ActivityTab: React.FC<ActivityTabProps> = ({ user }) => {
    return (
        <Box>
            <Paper sx={{ p: 3, backgroundColor: 'background.secondary' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    User Activity
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                            Last Active
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                            {user.lastActive
                                ? new Date(user.lastActive).toLocaleString()
                                : 'Never'}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                            Online Status
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                            {user.isOnline ? (
                                <Box
                                    component="span"
                                    sx={{ color: 'success.main' }}
                                >
                                    ● Online
                                </Box>
                            ) : (
                                <Box
                                    component="span"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    ○ Offline
                                </Box>
                            )}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: 'italic' }}
                        >
                            Detailed activity logs will be available here in
                            future updates.
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default ActivityTab;
