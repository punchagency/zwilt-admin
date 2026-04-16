import React, { useState } from 'react';
import {
    Box,
    Typography,
    Chip,
    IconButton,
    Collapse,
    Paper,
    Stack,
    Avatar,
    alpha,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { AuditLog, AuditSeverity } from '@/types';

interface AuditLogCardProps {
    log: AuditLog;
}

const severityConfig: Record<
    AuditSeverity,
    { color: string; bg: string; label: string }
> = {
    info: { color: 'info.main', bg: 'info.light', label: 'Info' },
    warning: { color: 'warning.main', bg: 'warning.light', label: 'Warning' },
    error: { color: 'error.main', bg: 'error.light', label: 'Error' },
    critical: { color: 'error.main', bg: 'error.light', label: 'Critical' },
};

const actionLabels: Record<string, string> = {
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    CREATE_ORGANIZATION: 'Created Organization',
    UPDATE_ORGANIZATION: 'Updated Organization',
    DELETE_ORGANIZATION: 'Deleted Organization',
    SUSPEND_ORGANIZATION: 'Suspended Organization',
    ACTIVATE_ORGANIZATION: 'Activated Organization',
    CREATE_USER: 'Created User',
    UPDATE_USER: 'Updated User',
    DELETE_USER: 'Deleted User',
    SUSPEND_USER: 'Suspended User',
    ACTIVATE_USER: 'Activated User',
    CHANGE_USER_ROLE: 'Changed User Role',
    CHANGE_ADMIN_ROLE: 'Changed Admin Role',
    IMPERSONATE_USER: 'Impersonated User',
    UPDATE_BILLING: 'Updated Billing',
    UPDATE_SETTINGS: 'Updated Settings',
    CREATE_SUPER_ADMIN: 'Created Super Admin',
    DELETE_SUPER_ADMIN: 'Deleted Super Admin',
    SYSTEM_UPDATE: 'System Update',
};

const AuditLogCard: React.FC<AuditLogCardProps> = ({ log }) => {
    const [expanded, setExpanded] = useState(false);
    const sev = severityConfig[log.severity];
    const initials = log.performedBy.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year:
                date.getFullYear() !== now.getFullYear()
                    ? 'numeric'
                    : undefined,
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Paper
            sx={{
                p: 2,
                border: '1px solid',
                borderColor:
                    log.severity === 'critical' ? 'error.light' : 'divider',
                borderRadius: 2,
                transition: 'box-shadow 0.2s',
                '&:hover': {
                    boxShadow: 1,
                },
            }}
        >
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar
                    sx={{
                        width: 36,
                        height: 36,
                        backgroundColor: 'primary.main',
                        fontSize: '12px',
                        fontWeight: 600,
                        flexShrink: 0,
                    }}
                >
                    {initials}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 1,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Box>
                            <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{ mb: 0.5 }}
                            >
                                <strong>{log.performedBy.name}</strong>{' '}
                                <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    ({log.performedBy.email})
                                </Typography>
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                                {actionLabels[log.action] || log.action}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                            }}
                        >
                            <Chip
                                label={sev.label}
                                size="small"
                                sx={{
                                    backgroundColor: (theme) =>
                                        alpha(
                                            theme.palette[
                                                sev.color.split('.')[0] as
                                                    | 'info'
                                                    | 'warning'
                                                    | 'error'
                                            ].main,
                                            0.1,
                                        ),
                                    color: sev.color,
                                    fontWeight: 600,
                                    fontSize: '0.6875rem',
                                    height: 20,
                                }}
                            />
                            {log.target && (
                                <Chip
                                    label={`${log.target.type}: ${
                                        log.target.name ||
                                        log.target.id.slice(0, 8)
                                    }`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.6875rem', height: 20 }}
                                />
                            )}
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ whiteSpace: 'nowrap' }}
                            >
                                {formatTime(log.timestamp)}
                            </Typography>
                        </Box>
                    </Box>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5, mb: 1 }}
                    >
                        {log.details.summary}
                    </Typography>

                    {(log.details.changes || log.details.ipAddress) && (
                        <>
                            <IconButton
                                size="small"
                                onClick={() => setExpanded(!expanded)}
                                sx={{ p: 0 }}
                            >
                                {expanded ? (
                                    <ExpandLessIcon fontSize="small" />
                                ) : (
                                    <ExpandMoreIcon fontSize="small" />
                                )}
                            </IconButton>
                            <Collapse in={expanded}>
                                <Box
                                    sx={{
                                        mt: 1,
                                        p: 1.5,
                                        backgroundColor: 'background.secondary',
                                        borderRadius: 1,
                                    }}
                                >
                                    {log.details.changes &&
                                        Object.entries(log.details.changes).map(
                                            ([key, value]) => (
                                                <Box
                                                    key={key}
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 2,
                                                        py: 0.5,
                                                        fontSize: '0.8125rem',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ minWidth: 80 }}
                                                    >
                                                        {key}:
                                                    </Typography>
                                                    <Box>
                                                        <Typography
                                                            component="span"
                                                            variant="caption"
                                                            sx={{
                                                                color: 'error.main',
                                                                textDecoration:
                                                                    'line-through',
                                                                mr: 1,
                                                            }}
                                                        >
                                                            {String(value.old)}
                                                        </Typography>
                                                        <Typography
                                                            component="span"
                                                            variant="caption"
                                                            sx={{
                                                                color: 'success.main',
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {String(value.new)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ),
                                        )}
                                    {log.details.ipAddress && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ mt: 1, display: 'block' }}
                                        >
                                            IP: {log.details.ipAddress}
                                        </Typography>
                                    )}
                                    {log.details.userAgent && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ display: 'block' }}
                                        >
                                            UA: {log.details.userAgent}
                                        </Typography>
                                    )}
                                </Box>
                            </Collapse>
                        </>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

export default AuditLogCard;
