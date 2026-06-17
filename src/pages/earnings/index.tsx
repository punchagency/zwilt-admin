import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    TextField,
    InputAdornment,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Skeleton,
    Link,
    useTheme,
    useMediaQuery,
    Card,
    CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { showError } from '@/utils/toast';
import {
    getEarningsOverview,
    getEarningsTrend,
    getPayments,
    getPlanDistribution,
    getTopOrgs,
    getSeatPricing,
} from '@/services/admin';
import type {
    EarningsOverview,
    EarningsTrendPoint,
    PaymentRecord,
    PlanDistribution,
    TopOrg,
    PaymentStatus,
    SeatPricing,
} from '@/types';

const quickDateRanges = [
    { value: '6m', label: 'Last 6 months' },
    { value: '1y', label: 'Last year' },
    { value: 'all', label: 'All time' },
];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const statusColors = {
    paid: '#10B981', // green - success
    pending: '#F59E0B', // amber/yellow - warning
    failed: '#EF4444', // red - error
    overdue: '#EF4444', // red - error
    unknown: '#6B7280', // gray - default
};

const EarningsPage: React.FC = () => {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [overview, setOverview] = useState<EarningsOverview | null>(null);
    const [trend, setTrend] = useState<EarningsTrendPoint[]>([]);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [planDist, setPlanDist] = useState<PlanDistribution | null>(null);
    const [topOrgs, setTopOrgs] = useState<TopOrg[]>([]);
    const [pricing, setPricing] = useState<SeatPricing | null>(null);
    const [loading, setLoading] = useState(true);

    const [range, setRange] = useState('6m');
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(25);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [totalPayments, setTotalPayments] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [
                overviewRes,
                trendRes,
                paymentsRes,
                planRes,
                topRes,
                pricingRes,
            ] = await Promise.all([
                getEarningsOverview(range as any),
                getEarningsTrend(range as any),
                getPayments(
                    page + 1,
                    limit,
                    statusFilter || undefined,
                    search || undefined,
                ),
                getPlanDistribution(),
                getTopOrgs(),
                getSeatPricing(),
            ]);

            if (overviewRes.success) setOverview(overviewRes.data);
            if (trendRes.success) setTrend(trendRes.data);
            if (paymentsRes.success) {
                setPayments(paymentsRes.data.payments);
                setTotalPayments(paymentsRes.data.pagination.total);
            }
            if (planRes.success) setPlanDist(planRes.data);
            if (topRes.success) setTopOrgs(topRes.data);
            if (pricingRes.success) setPricing(pricingRes.data.pricing);
        } catch (error: any) {
            showError('Failed to load earnings data');
        } finally {
            setLoading(false);
        }
    }, [range, page, limit, search, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRangeChange = (newRange: string) => {
        setRange(newRange);
        setPage(0);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        fetchData();
    };

    return (
        <Box sx={{ p: isMobile ? 2 : 4, boxSizing: 'border-box' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} sx={{ mb: 1 }}>
                    Earnings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Track revenue, subscriptions, and payment activity
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {quickDateRanges.map((r) => (
                    <Chip
                        key={r.value}
                        label={r.label}
                        onClick={() => handleRangeChange(r.value)}
                        variant={range === r.value ? 'filled' : 'outlined'}
                        sx={{ textTransform: 'none' }}
                    />
                ))}
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            p: 3,
                            border: '1.2px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            boxShadow: isMobile ? '0px 6px 20px rgba(0, 0, 0, 0.10)' : 'none',
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mb: 1, fontWeight: 500 }}
                        >
                            Monthly Recurring Revenue
                        </Typography>
                        {loading ? (
                            <Skeleton variant="text" width={120} height={40} />
                        ) : (
                            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700}>
                                {formatCurrency(overview?.mrr || 0)}
                            </Typography>
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            p: 3,
                            border: '1.2px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            boxShadow: isMobile ? '0px 6px 20px rgba(0, 0, 0, 0.10)' : 'none',
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mb: 1, fontWeight: 500 }}
                        >
                            Total Collected
                        </Typography>
                        {loading ? (
                            <Skeleton variant="text" width={120} height={40} />
                        ) : (
                            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700}>
                                {formatCurrency(overview?.totalCollected || 0)}
                            </Typography>
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            p: 3,
                            border: '1.2px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            boxShadow: isMobile ? '0px 6px 20px rgba(0, 0, 0, 0.10)' : 'none',
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mb: 1, fontWeight: 500 }}
                        >
                            Pending Payments
                        </Typography>
                        {loading ? (
                            <Skeleton variant="text" width={120} height={40} />
                        ) : (
                            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700}>
                                {formatCurrency(overview?.pending || 0)}
                            </Typography>
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            p: 3,
                            border: '1.2px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            boxShadow: isMobile ? '0px 6px 20px rgba(0, 0, 0, 0.10)' : 'none',
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mb: 1, fontWeight: 500 }}
                        >
                            Overdue Invoices
                        </Typography>
                        {loading ? (
                            <Skeleton variant="text" width={120} height={40} />
                        ) : (
                            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700}>
                                {formatCurrency(overview?.overdue || 0)}
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Paper
                sx={{
                    p: isMobile ? 2 : 3,
                    border: '1.2px solid',
                    borderColor: '#0000001A',
                    borderRadius: 2,
                    mb: 3,
                }}
            >
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Organization Growth & Expected Revenue
                </Typography>
                {loading ? (
                    <Skeleton variant="rectangular" width="100%" height={isMobile ? 220 : 300} />
                ) : trend.length === 0 ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: 'center', py: 4 }}
                    >
                        No trend data available
                    </Typography>
                ) : (
                    <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                        <LineChart data={trend}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={
                                    theme.palette.mode === 'dark'
                                        ? '#333'
                                        : '#E0E0E9'
                                }
                            />
                            <XAxis dataKey="month" tick={{ fontSize: isMobile ? 10 : 12 }} />
                            <YAxis yAxisId="left" tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 32 : 40} />
                            {!isMobile && (
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(v) => `$${v}`}
                                />
                            )}
                            <RechartsTooltip
                                formatter={(value: number, name: string) => {
                                    if (name === 'expectedRevenue')
                                        return formatCurrency(value);
                                    return value;
                                }}
                            />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="orgsCreated"
                                name="New Orgs"
                                stroke={
                                    theme.palette.mode === 'dark'
                                        ? '#fff'
                                        : '#2B2A2F'
                                }
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="expectedRevenue"
                                name="Expected Revenue"
                                stroke="#6B7280"
                                strokeWidth={2}
                                dot={{ r: isMobile ? 3 : 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper
                        sx={{
                            border: '1.2px solid',
                            borderColor: '#0000001A',
                            borderRadius: 2,
                        }}
                    >
                        <Box
                            sx={{
                                p: 3,
                                pb: 2,
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: 2,
                                alignItems: isMobile ? 'stretch' : 'center',
                            }}
                        >
                            <Typography variant="h6" fontWeight={600}>
                                Organizations & Subscriptions
                            </Typography>
                            {!isMobile && <Box sx={{ flex: 1 }} />}
                            <form
                                onSubmit={handleSearch}
                                style={{ display: 'flex', width: isMobile ? '100%' : 'auto' }}
                            >
                                <TextField
                                    placeholder="Search organizations..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    size="small"
                                    sx={{ width: '100%' }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon
                                                    fontSize="small"
                                                    color="action"
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </form>
                        </Box>

                        {isMobile ? (
                            loading ? (
                                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {[...Array(3)].map((_, i) => (
                                        <Card key={i} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                            <CardContent sx={{ p: 2 }}>
                                                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                                                <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
                                                <Skeleton variant="text" width="30%" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            ) : (
                                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {payments.map((payment) => (
                                        <Card
                                            key={payment._id}
                                            onClick={() => router.push(`/organizations/${payment.organization._id}`)}
                                            sx={{
                                                border: '1px solid',
                                                borderColor: 'rgba(0, 0, 0, 0.08)',
                                                borderRadius: 2,
                                                boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.12)',
                                                transition: 'box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    boxShadow: '0px 12px 28px rgba(0, 0, 0, 0.18)',
                                                },
                                            }}
                                        >
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                                    <Box>
                                                        <Link
                                                            href={`/organizations/${payment.organization._id}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            sx={{
                                                                fontWeight: 600,
                                                                textDecoration: 'none',
                                                                fontSize: '1rem',
                                                                '&:hover': {
                                                                    textDecoration: 'underline',
                                                                },
                                                            }}
                                                        >
                                                            {payment.organization.name}
                                                        </Link>
                                                    </Box>
                                                    <Chip
                                                        label={
                                                            payment.status.charAt(0).toUpperCase() +
                                                            payment.status.slice(1)
                                                        }
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: `${statusColors[payment.status as keyof typeof statusColors] || '#6B7280'}18`,
                                                            color: statusColors[payment.status as keyof typeof statusColors] || '#6B7280',
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem',
                                                        }}
                                                    />
                                                </Box>

                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">Active Seats</Typography>
                                                    <Typography variant="body2" fontWeight={500}>{payment.activeSeats}</Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">Expected Earnings</Typography>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {formatCurrency(
                                                            payment.expectedEarnings ||
                                                                payment.activeSeats * (pricing?.recruitStandard || 9),
                                                        )}
                                                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                                            /mo
                                                        </Typography>
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider', pt: 1, mt: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">Updated</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(payment.date).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            )
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                Organization
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                Active Seats
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                Expected Earnings
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                Status
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                Updated
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading
                                            ? Array.from(new Array(5)).map(
                                                  (_, i) => (
                                                      <TableRow key={i}>
                                                          <TableCell>
                                                              <Skeleton
                                                                  variant="text"
                                                                  width={150}
                                                              />
                                                          </TableCell>
                                                          <TableCell>
                                                              <Skeleton
                                                                  variant="text"
                                                                  width={60}
                                                              />
                                                          </TableCell>
                                                          <TableCell>
                                                              <Skeleton
                                                                  variant="text"
                                                                  width={80}
                                                              />
                                                          </TableCell>
                                                          <TableCell>
                                                              <Skeleton
                                                                  variant="rounded"
                                                                  width={70}
                                                                  height={24}
                                                              />
                                                          </TableCell>
                                                          <TableCell>
                                                              <Skeleton
                                                                  variant="text"
                                                                  width={80}
                                                              />
                                                          </TableCell>
                                                      </TableRow>
                                                  ),
                                              )
                                            : payments.map((payment) => (
                                                  <TableRow
                                                      key={payment._id}
                                                      hover
                                                      onClick={() =>
                                                          router.push(
                                                              `/organizations/${payment.organization._id}`,
                                                          )
                                                      }
                                                      sx={{
                                                          cursor: 'pointer',
                                                      }}
                                                  >
                                                      <TableCell>
                                                          <Link
                                                              href={`/organizations/${payment.organization._id}`}
                                                              sx={{
                                                                  fontWeight: 600,
                                                                  textDecoration:
                                                                      'none',
                                                                  '&:hover': {
                                                                      textDecoration:
                                                                          'underline',
                                                                  },
                                                              }}
                                                          >
                                                              {
                                                                  payment
                                                                      .organization
                                                                      .name
                                                              }
                                                          </Link>
                                                      </TableCell>
                                                      <TableCell>
                                                          <Typography
                                                              variant="body2"
                                                              fontWeight={500}
                                                          >
                                                              {payment.activeSeats}
                                                          </Typography>
                                                      </TableCell>
                                                      <TableCell>
                                                          <Typography
                                                              variant="body2"
                                                              fontWeight={600}
                                                          >
                                                              {formatCurrency(
                                                                  payment.expectedEarnings ||
                                                                      payment.activeSeats *
                                                                          (pricing?.recruitStandard ||
                                                                              9),
                                                              )}
                                                              <Typography
                                                                  component="span"
                                                                  variant="caption"
                                                                  color="text.secondary"
                                                                  sx={{ ml: 0.5 }}
                                                              >
                                                                  /mo
                                                              </Typography>
                                                          </Typography>
                                                      </TableCell>
                                                      <TableCell>
                                                          <Chip
                                                              label={
                                                                  payment.status
                                                                      .charAt(0)
                                                                      .toUpperCase() +
                                                                  payment.status.slice(
                                                                      1,
                                                                  )
                                                              }
                                                              size="small"
                                                              sx={{
                                                                  backgroundColor: `${
                                                                      statusColors[
                                                                          payment
                                                                              .status as keyof typeof statusColors
                                                                      ] || '#6B7280'
                                                                  }18`,
                                                                  color: statusColors[
                                                                      payment.status as keyof typeof statusColors
                                                                  ] || '#6B7280',
                                                                  fontWeight: 600,
                                                                  fontSize:
                                                                      '0.75rem',
                                                              }}
                                                          />
                                                      </TableCell>
                                                      <TableCell>
                                                          <Typography
                                                              variant="body2"
                                                              color="text.secondary"
                                                          >
                                                              {new Date(
                                                                  payment.date,
                                                              ).toLocaleDateString()}
                                                          </Typography>
                                                      </TableCell>
                                                  </TableRow>
                                              ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={totalPayments}
                            rowsPerPage={limit}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(0);
                            }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper
                        sx={{
                            p: 3,
                            border: '1.2px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            mb: 3,
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{ mb: 3 }}
                        >
                            Platform Distribution
                        </Typography>
                        {loading ? (
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={120}
                            />
                        ) : planDist ? (
                            <Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <Box
                                            sx={{
                                                textAlign: 'center',
                                                p: 1.5,
                                                backgroundColor: 'action.hover',
                                                borderRadius: 2,
                                            }}
                                        >
                                            <BusinessIcon
                                                sx={{
                                                    fontSize: 28,
                                                    color: 'text.primary',
                                                    mb: 0.5,
                                                }}
                                            />
                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                            >
                                                {planDist.recruitOnly}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Recruit Only
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box
                                            sx={{
                                                textAlign: 'center',
                                                p: 1.5,
                                                backgroundColor: 'action.hover',
                                                borderRadius: 2,
                                            }}
                                        >
                                            <BusinessIcon
                                                sx={{
                                                    fontSize: 28,
                                                    color: 'text.primary',
                                                    mb: 0.5,
                                                }}
                                            />
                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                            >
                                                {planDist.trackerOnly}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Tracker Only
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box
                                            sx={{
                                                textAlign: 'center',
                                                p: 1.5,
                                                backgroundColor: 'action.hover',
                                                borderRadius: 2,
                                            }}
                                        >
                                            <BusinessIcon
                                                sx={{
                                                    fontSize: 28,
                                                    color: 'text.primary',
                                                    mb: 0.5,
                                                }}
                                            />
                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                            >
                                                {planDist.both}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Both
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        mt: 2,
                                        display: 'block',
                                        textAlign: 'center',
                                    }}
                                >
                                    {planDist.totalOrgsWithSeats} organizations
                                    with active seats
                                </Typography>
                            </Box>
                        ) : null}
                    </Paper>

                    <Paper
                        sx={{
                            p: 3,
                            border: '1.2px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{ mb: 2 }}
                        >
                            Top Organizations by Revenue
                        </Typography>
                        {loading ? (
                            Array.from(new Array(5)).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    variant="text"
                                    width="100%"
                                    sx={{ mb: 1 }}
                                />
                            ))
                        ) : topOrgs.length === 0 ? (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ textAlign: 'center', py: 2 }}
                            >
                                No organizations with seats yet
                            </Typography>
                        ) : (
                            <Box>
                                {topOrgs.map((org, index) => (
                                    <Box
                                        key={org.organization._id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            py: 1.5,
                                            borderBottom:
                                                index < topOrgs.length - 1
                                                    ? '1px solid #F0F0F5'
                                                    : 'none',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                                color="text.secondary"
                                                sx={{ minWidth: 20 }}
                                            >
                                                {index + 1}
                                            </Typography>
                                            <Link
                                                href={`/organizations/${org.organization._id}`}
                                                sx={{
                                                    fontWeight: 600,
                                                    textDecoration: 'none',
                                                    '&:hover': {
                                                        textDecoration:
                                                            'underline',
                                                    },
                                                }}
                                            >
                                                {org.organization.name}
                                            </Link>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                {formatCurrency(
                                                    org.expectedEarnings ||
                                                        org.activeSeats *
                                                            (pricing?.recruitStandard ||
                                                                9),
                                                )}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {org.activeSeats} seats
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default EarningsPage;
