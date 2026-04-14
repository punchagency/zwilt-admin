import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button,
    Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { Organization } from '@/types';

interface OrganizationOverviewProps {
    organizations?: Organization[];
    loading?: boolean;
}

const OrganizationSkeletons = () => (
    <Box sx={{ p: 2 }}>
        {[...Array(4)].map((_, i) => (
            <Box
                key={i}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width={120} />
                    <Skeleton variant="text" width={80} height={20} />
                </Box>
            </Box>
        ))}
    </Box>
);

const OrganizationOverview: React.FC<OrganizationOverviewProps> = ({
    organizations = [],
    loading = false,
}) => {
    const topOrgs = organizations.slice(0, 5);

    return (
        <Card
            sx={{
                height: '100%',
                border: '1.2px solid',
                borderColor: '#0000001A',
                borderRadius: 2,
                backgroundColor: '#fff',
            }}
        >
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                    }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        Organization Overview
                    </Typography>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        sx={{
                            backgroundColor: 'primary.main',
                            textTransform: 'none',
                            borderRadius: 2,
                        }}
                    >
                        Create
                    </Button>
                </Box>

                {loading ? (
                    <OrganizationSkeletons />
                ) : topOrgs.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                        No organizations found
                    </Typography>
                ) : (
                    <List sx={{ padding: 0 }}>
                        {topOrgs.map((org, index) => (
                            <React.Fragment key={org._id}>
                                <ListItem
                                    sx={{
                                        px: 0,
                                        py: 1.5,
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                            borderRadius: 1,
                                        },
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                                color="text.primary"
                                            >
                                                {org.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 0.5 }}
                                            >
                                                {org.projectCount || 0} Projects •{' '}
                                                {org.userCount || 0} Users
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                {index < topOrgs.length - 1 && (
                                    <Divider sx={{ my: 1 }} />
                                )}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
};

export default OrganizationOverview;
