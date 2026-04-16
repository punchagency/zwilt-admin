import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Skeleton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    useTheme,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { getProjectTrend } from '@/services/admin';

interface ChartDataPoint {
    date: string;
    projectsCreated: number;
    projectsArchived: number;
}

interface ProjectTrendProps {
    data?: ChartDataPoint[];
}

const ChartSkeleton = () => (
    <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="rounded" width={120} height={40} />
        </Box>
        <Skeleton variant="text" width={200} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={300} />
    </Box>
);

const ProjectTrend: React.FC<ProjectTrendProps> = ({ data: propData }) => {
    const theme = useTheme();
    const [data, setData] = useState<ChartDataPoint[]>(propData || []);
    const [loading, setLoading] = useState(!propData);
    const [timeRange, setTimeRange] = useState<'6m' | '1y' | 'all'>('all');

    useEffect(() => {
        if (propData) {
            setData(propData);
            return;
        }

        const fetchTrend = async () => {
            try {
                setLoading(true);
                const response = await getProjectTrend(timeRange);
                if (response.success && response.data) {
                    const validData = response.data.map((item) => ({
                        date: item.date || 'Unknown',
                        projectsCreated: Number(item.projectsCreated) || 0,
                        projectsArchived: Number(item.projectsArchived) || 0,
                    }));
                    setData(validData);
                }
            } catch (error) {
                console.warn('Failed to fetch project trend:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrend();
    }, [propData, timeRange]);

    const handleTimeRangeChange = (event: SelectChangeEvent) => {
        setTimeRange(event.target.value as '6m' | '1y' | 'all');
    };

    if (loading) {
        return (
            <Card
                sx={{
                    height: '100%',
                    border: '1.2px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                }}
            >
                <ChartSkeleton />
            </Card>
        );
    }

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1.2px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.paper',
            }}
        >
            <CardContent
                sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        Project Trend
                    </Typography>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Time Range</InputLabel>
                        <Select
                            value={timeRange}
                            label="Time Range"
                            onChange={handleTimeRangeChange}
                        >
                            <MenuItem value="6m">Last 6 Months</MenuItem>
                            <MenuItem value="1y">Last Year</MenuItem>
                            <MenuItem value="all">All Time</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ mb: 2, display: 'flex', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                backgroundColor: 'primary.main',
                                borderRadius: '2px',
                            }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            Projects Created
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                backgroundColor: 'warning.main',
                                borderRadius: '2px',
                            }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            Projects Archived
                        </Typography>
                    </Box>
                </Box>

                {data.length === 0 ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ py: 8, textAlign: 'center' }}
                    ></Typography>
                ) : (
                    <Box sx={{ flex: 1, minHeight: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke={theme.palette.divider}
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{
                                        fontSize: 12,
                                        fill: theme.palette.text.secondary,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{
                                        fontSize: 12,
                                        fill: theme.palette.text.secondary,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor:
                                            theme.palette.background.paper,
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 8,
                                        boxShadow: theme.shadows[1],
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="projectsCreated"
                                    stroke={theme.palette.primary.main}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="projectsArchived"
                                    stroke={theme.palette.warning.main}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default ProjectTrend;
