import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    InputAdornment,
    Button,
    MenuItem,
    Stack,
    Skeleton,
    Chip,
    TablePagination,
    Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { showError } from '@/utils/toast';
import { getAuditLogs } from '@/services/admin';
import AuditLogCard from '@/components/admin/AuditLogCard';
import type {
    AuditLog,
    AuditAction,
    AuditSeverity,
    AuditFilters,
} from '@/types';
import { ACTION_SEVERITY_MAP } from '@/types';

const actionOptions: { value: AuditAction; label: string; category: string }[] = [
    { value: 'LOGIN', label: 'Login', category: 'Auth' },
    { value: 'LOGOUT', label: 'Logout', category: 'Auth' },
    { value: 'CREATE_ORGANIZATION', label: 'Created Organization', category: 'Organization' },
    { value: 'UPDATE_ORGANIZATION', label: 'Updated Organization', category: 'Organization' },
    { value: 'DELETE_ORGANIZATION', label: 'Deleted Organization', category: 'Organization' },
    { value: 'SUSPEND_ORGANIZATION', label: 'Suspended Organization', category: 'Organization' },
    { value: 'ACTIVATE_ORGANIZATION', label: 'Activated Organization', category: 'Organization' },
    { value: 'CREATE_USER', label: 'Created User', category: 'User' },
    { value: 'UPDATE_USER', label: 'Updated User', category: 'User' },
    { value: 'DELETE_USER', label: 'Deleted User', category: 'User' },
    { value: 'SUSPEND_USER', label: 'Suspended User', category: 'User' },
    { value: 'ACTIVATE_USER', label: 'Activated User', category: 'User' },
    { value: 'CHANGE_USER_ROLE', label: 'Changed User Role', category: 'User' },
    { value: 'CHANGE_ADMIN_ROLE', label: 'Changed Admin Role', category: 'Admin' },
    { value: 'IMPERSONATE_USER', label: 'Impersonated User', category: 'User' },
    { value: 'UPDATE_BILLING', label: 'Updated Billing', category: 'Billing' },
    { value: 'UPDATE_SETTINGS', label: 'Updated Settings', category: 'System' },
    { value: 'CREATE_SUPER_ADMIN', label: 'Created Super Admin', category: 'Admin' },
    { value: 'DELETE_SUPER_ADMIN', label: 'Deleted Super Admin', category: 'Admin' },
    { value: 'SYSTEM_UPDATE', label: 'System Update', category: 'System' },
];

const severityOptions: { value: AuditSeverity; label: string }[] = [
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'critical', label: 'Critical' },
];

const targetOptions = [
    { value: 'user', label: 'User' },
    { value: 'organization', label: 'Organization' },
    { value: 'project', label: 'Project' },
    { value: 'system', label: 'System' },
    { value: 'admin', label: 'Admin' },
];

const quickDateRanges = [
    { value: 'today', label: 'Today' },
    { value: '24h', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'custom', label: 'Custom range' },
];

const AuditTrailsPage: React.FC = () => {

    // Data state
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(50);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [targetFilter, setTargetFilter] = useState('');
    const [dateRange, setDateRange] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const activeFilterCount = [actionFilter, severityFilter, targetFilter, dateRange]
        .filter(Boolean).length;

    const getDateFromRange = (range: string): { from: string; to: string } => {
        const now = new Date();
        let from = new Date();

        switch (range) {
            case 'today':
                from.setHours(0, 0, 0, 0);
                break;
            case '24h':
                from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        return {
            from: from.toISOString(),
            to: now.toISOString(),
        };
    };

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const filters: AuditFilters = {};

            if (actionFilter) filters.action = actionFilter as AuditAction;
            if (severityFilter) filters.severity = severityFilter as AuditSeverity;
            if (targetFilter) filters.targetType = targetFilter as any;
            if (search) filters.search = search;

            if (dateRange === 'custom') {
                if (dateFrom) filters.dateFrom = dateFrom;
                if (dateTo) filters.dateTo = dateTo;
            } else if (dateRange) {
                const range = getDateFromRange(dateRange);
                filters.dateFrom = range.from;
                filters.dateTo = range.to;
            }

            const res = await getAuditLogs(page + 1, limit, filters);
            if (res.success) {
                setLogs(res.data.logs);
                setTotal(res.data.pagination.total);
            }
        } catch (error: any) {
            showError('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [page, limit, actionFilter, severityFilter, targetFilter, dateRange, dateFrom, dateTo, search]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleDateRangeChange = (range: string) => {
        setDateRange(range);
        if (range !== 'custom') {
            const { from, to } = getDateFromRange(range);
            setDateFrom(from);
            setDateTo(to);
        }
        setPage(0);
    };

    const clearAllFilters = () => {
        setSearch('');
        setActionFilter('');
        setSeverityFilter('');
        setTargetFilter('');
        setDateRange('');
        setDateFrom('');
        setDateTo('');
        setPage(0);
    };

    // Group logs by date for timeline view
    const groupLogsByDate = (logs: AuditLog[]): Map<string, AuditLog[]> => {
        const grouped = new Map<string, AuditLog[]>();
        logs.forEach((log) => {
            const date = new Date(log.timestamp).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
            if (!grouped.has(date)) {
                grouped.set(date, []);
            }
            grouped.get(date)!.push(log);
        });
        return grouped;
    };

    // Severity summary
    const severitySummary = () => {
        const counts: Record<string, number> = { info: 0, warning: 0, error: 0, critical: 0 };
        logs.forEach((log) => {
            counts[log.severity] = (counts[log.severity] || 0) + 1;
        });
        return counts;
    };

    const counts = severitySummary();

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    Audit Trails
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Track all admin actions and system events
                </Typography>
            </Box>

            {/* Severity Summary */}
            <Paper
                sx={{
                    p: 2,
                    mb: 3,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    border: '1.2px solid',
                    borderColor: '#0000001A',
                }}
            >
                <Typography variant="body2" fontWeight={600} sx={{ mr: 1 }}>
                    Summary:
                </Typography>
                <Chip
                    label={`${counts.info} Info`}
                    size="small"
                    sx={{ backgroundColor: '#E3F2FD', color: '#1976D2', fontWeight: 600 }}
                />
                <Chip
                    label={`${counts.warning} Warning`}
                    size="small"
                    sx={{ backgroundColor: '#FFF3E0', color: '#ED6C02', fontWeight: 600 }}
                />
                <Chip
                    label={`${counts.error} Error`}
                    size="small"
                    sx={{ backgroundColor: '#FFEBEE', color: '#D32F2F', fontWeight: 600 }}
                />
                <Chip
                    label={`${counts.critical} Critical`}
                    size="small"
                    sx={{ backgroundColor: '#FFCDD2', color: '#B71C1C', fontWeight: 600 }}
                />
                <Box sx={{ flex: 1 }} />
                <Typography variant="body2" color="text.secondary">
                    Showing {logs.length} of {total} logs
                </Typography>
            </Paper>

            {/* Search Bar */}
            <Paper
                sx={{
                    p: 2,
                    mb: 2,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    border: '1.2px solid',
                    borderColor: '#0000001A',
                }}
            >
                <TextField
                    placeholder="Search audit logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setPage(0);
                            fetchLogs();
                        }
                    }}
                    sx={{ flex: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant={showFilters ? 'contained' : 'outlined'}
                    startIcon={<FilterListIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
                {activeFilterCount > 0 && (
                    <Button
                        variant="text"
                        startIcon={<ClearIcon />}
                        onClick={clearAllFilters}
                        sx={{ textTransform: 'none', color: '#D32F2F' }}
                    >
                        Clear All
                    </Button>
                )}
            </Paper>

            {/* Filters Panel */}
            {showFilters && (
                <Paper
                    sx={{
                        p: 3,
                        mb: 3,
                        border: '1.2px solid',
                        borderColor: '#0000001A',
                        borderRadius: 2,
                    }}
                >
                    <Stack spacing={2}>
                        {/* Quick Date Range */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                Date Range
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {quickDateRanges.map((range) => (
                                    <Chip
                                        key={range.value}
                                        label={range.label}
                                        size="small"
                                        onClick={() => handleDateRangeChange(range.value)}
                                        variant={dateRange === range.value ? 'filled' : 'outlined'}
                                        sx={{ textTransform: 'none' }}
                                    />
                                ))}
                            </Stack>
                        </Box>

                        {dateRange === 'custom' && (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="From"
                                    type="datetime-local"
                                    value={dateFrom ? new Date(dateFrom).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => setDateFrom(new Date(e.target.value).toISOString())}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    sx={{ flex: 1 }}
                                />
                                <TextField
                                    label="To"
                                    type="datetime-local"
                                    value={dateTo ? new Date(dateTo).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => setDateTo(new Date(e.target.value).toISOString())}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    sx={{ flex: 1 }}
                                />
                            </Box>
                        )}

                        <Divider />

                        {/* Action, Severity, Target filters */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                select
                                label="Action"
                                value={actionFilter}
                                onChange={(e) => {
                                    setActionFilter(e.target.value);
                                    setPage(0);
                                }}
                                sx={{ flex: 1 }}
                                size="small"
                            >
                                <MenuItem value="">All Actions</MenuItem>
                                {['Auth', 'Organization', 'User', 'Admin', 'Billing', 'System'].map(
                                    (category) => {
                                        const actions = actionOptions.filter(
                                            (a) => a.category === category,
                                        );
                                        if (actions.length === 0) return null;
                                        return [
                                            <MenuItem
                                                key={category}
                                                disabled
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    color: 'text.secondary',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {category}
                                            </MenuItem>,
                                            ...actions.map((action) => (
                                                <MenuItem key={action.value} value={action.value}>
                                                    {action.label}
                                                </MenuItem>
                                            )),
                                        ];
                                    },
                                ).flat()}
                            </TextField>

                            <TextField
                                select
                                label="Severity"
                                value={severityFilter}
                                onChange={(e) => {
                                    setSeverityFilter(e.target.value);
                                    setPage(0);
                                }}
                                sx={{ flex: 1 }}
                                size="small"
                            >
                                <MenuItem value="">All Severities</MenuItem>
                                {severityOptions.map((sev) => (
                                    <MenuItem key={sev.value} value={sev.value}>
                                        {sev.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Target Type"
                                value={targetFilter}
                                onChange={(e) => {
                                    setTargetFilter(e.target.value);
                                    setPage(0);
                                }}
                                sx={{ flex: 1 }}
                                size="small"
                            >
                                <MenuItem value="">All Types</MenuItem>
                                {targetOptions.map((target) => (
                                    <MenuItem key={target.value} value={target.value}>
                                        {target.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </Stack>
                </Paper>
            )}

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {actionFilter && (
                        <Chip
                            label={`Action: ${actionOptions.find((a) => a.value === actionFilter)?.label || actionFilter}`}
                            size="small"
                            onDelete={() => setActionFilter('')}
                            sx={{ backgroundColor: '#F0F0F5' }}
                        />
                    )}
                    {severityFilter && (
                        <Chip
                            label={`Severity: ${severityOptions.find((s) => s.value === severityFilter)?.label || severityFilter}`}
                            size="small"
                            onDelete={() => setSeverityFilter('')}
                            sx={{ backgroundColor: '#F0F0F5' }}
                        />
                    )}
                    {targetFilter && (
                        <Chip
                            label={`Target: ${targetOptions.find((t) => t.value === targetFilter)?.label || targetFilter}`}
                            size="small"
                            onDelete={() => setTargetFilter('')}
                            sx={{ backgroundColor: '#F0F0F5' }}
                        />
                    )}
                    {dateRange && (
                        <Chip
                            label={`Date: ${quickDateRanges.find((r) => r.value === dateRange)?.label || dateRange}`}
                            size="small"
                            onDelete={() => setDateRange('')}
                            sx={{ backgroundColor: '#F0F0F5' }}
                        />
                    )}
                </Box>
            )}

            {/* Audit Logs Timeline */}
            <Box>
                {loading
                    ? Array.from(new Array(5)).map((_, i) => (
                          <Paper
                              key={i}
                              sx={{
                                  p: 2,
                                  mb: 2,
                                  border: '1px solid',
                                  borderColor: '#E0E0E9',
                                  borderRadius: 2,
                              }}
                          >
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                  <Skeleton variant="circular" width={36} height={36} />
                                  <Box sx={{ flex: 1 }}>
                                      <Skeleton variant="text" width={200} />
                                      <Skeleton variant="text" width={300} />
                                      <Skeleton variant="text" width={150} />
                                  </Box>
                              </Box>
                          </Paper>
                      ))
                    : logs.length === 0 ? (
                          <Paper
                              sx={{
                                  p: 6,
                                  textAlign: 'center',
                                  border: '1.2px solid',
                                  borderColor: '#0000001A',
                              }}
                          >
                              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                  No audit logs found
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                  Try adjusting your filters or date range
                              </Typography>
                          </Paper>
                      ) : (
                          Array.from(groupLogsByDate(logs)).map(([date, dateLogs]) => (
                              <Box key={date} sx={{ mb: 3 }}>
                                  <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      color="text.secondary"
                                      sx={{
                                          mb: 1.5,
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                      }}
                                  >
                                      <CalendarTodayIcon fontSize="small" />
                                      {date}
                                  </Typography>
                                  <Stack spacing={1.5}>
                                      {dateLogs.map((log) => (
                                          <AuditLogCard key={log._id} log={log} />
                                      ))}
                                  </Stack>
                              </Box>
                          ))
                      )}
            </Box>

            {/* Pagination */}
            {!loading && logs.length > 0 && (
                <Paper
                    sx={{
                        mt: 3,
                        border: '1.2px solid',
                        borderColor: '#0000001A',
                    }}
                >
                    <TablePagination
                        rowsPerPageOptions={[25, 50, 100]}
                        component="div"
                        count={total}
                        rowsPerPage={limit}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setLimit(Number(e.target.value));
                            setPage(0);
                        }}
                    />
                </Paper>
            )}
        </Box>
    );
};

export default AuditTrailsPage;
