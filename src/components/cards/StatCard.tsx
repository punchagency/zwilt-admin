import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
} from '@mui/material';

interface StatItem {
    label: string;
    value: number | string;
    color?: string;
}

interface StatCardProps {
    title: string;
    mainValue: number | string;
    items?: StatItem[];
    icon?: React.ReactNode;
    color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    mainValue,
    items = [],
    icon,
    color = 'primary.main',
}) => {
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
                        alignItems: 'flex-start',
                        mb: 2,
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                    >
                        {title}
                    </Typography>
                    {icon && (
                        <Box sx={{ color: color, opacity: 0.6 }}>{icon}</Box>
                    )}
                </Box>

                <Typography
                    variant="h3"
                    fontWeight={700}
                    color="text.primary"
                    sx={{ mb: 2 }}
                >
                    {mainValue}
                </Typography>

                {items.length > 0 && (
                    <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                        {items.map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '2px',
                                        backgroundColor: item.color || color,
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {item.label}{' '}
                                    <Typography
                                        component="span"
                                        fontWeight={600}
                                        color="text.primary"
                                    >
                                        {item.value}
                                    </Typography>
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
};

export default StatCard;
