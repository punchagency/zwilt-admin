import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    MenuItem,
    Alert,
    InputAdornment,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    CircularProgress,
    alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AdminRole, ADMIN_ROLES_CONFIG, SeatUser } from '@/types';
import { getUsers } from '@/services/admin';

interface PromoteUserDialogProps {
    open: boolean;
    role: AdminRole;
    reason: string;
    loading: boolean;
    error?: string;
    onRoleChange: (role: AdminRole) => void;
    onReasonChange: (reason: string) => void;
    onConfirm: (userId: string) => void;
    onCancel: () => void;
}

const PromoteUserDialog: React.FC<PromoteUserDialogProps> = ({
    open,
    role,
    reason,
    loading,
    error,
    onRoleChange,
    onReasonChange,
    onConfirm,
    onCancel,
}) => {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<SeatUser[]>([]);
    const [userLoading, setUserLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<SeatUser | null>(null);

    const roleConfig = ADMIN_ROLES_CONFIG.find((r) => r.role === role);

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setSearch('');
            setUsers([]);
            setSelectedUser(null);
        }
    }, [open]);

    // Debounced search
    useEffect(() => {
        if (!open || !search.trim()) {
            setUsers([]);
            return;
        }

        const timer = setTimeout(async () => {
            setUserLoading(true);
            try {
                const res = await getUsers(1, 25, search.trim());
                if (res.success) {
                    setUsers(res.data.users);
                }
            } catch {
                // silently fail
            } finally {
                setUserLoading(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [search, open]);

    const filteredUsers = users;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 600 }}>
                Promote User to Admin
            </DialogTitle>
            <DialogContent sx={{ pt: 3.5 }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    Select an existing user to promote to an admin role.
                </Typography>

                {/* Search */}
                <TextField
                    fullWidth
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* User List */}
                <Box
                    sx={{
                        maxHeight: 250,
                        overflowY: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 2,
                    }}
                >
                    {userLoading ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : filteredUsers.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                {search
                                    ? 'No users match your search'
                                    : 'Type a name or email to search users'}
                            </Typography>
                        </Box>
                    ) : (
                        <List>
                            {filteredUsers.map((user) => (
                                <ListItem
                                    key={user._id}
                                    onClick={() => setSelectedUser(user)}
                                    sx={{
                                        cursor: 'pointer',
                                        backgroundColor:
                                            selectedUser?._id === user._id
                                                ? 'action.selected'
                                                : 'transparent',
                                        '&:hover': {
                                            backgroundColor:
                                                selectedUser?._id === user._id
                                                    ? 'action.selected'
                                                    : 'action.hover',
                                        },
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={user.profile_img}
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                backgroundColor: 'primary.main',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {getInitials(user.name)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                {user.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {user.email}
                                            </Typography>
                                        }
                                    />
                                    {selectedUser?._id === user._id && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'primary.main',
                                                fontWeight: 600,
                                            }}
                                        >
                                            Selected
                                        </Typography>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                {selectedUser && (
                    <Box
                        sx={{
                            p: 2,
                            backgroundColor: (theme) =>
                                alpha(theme.palette.primary.main, 0.08),
                            borderRadius: 2,
                            mb: 2,
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                        >
                            Selected User:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {selectedUser.name} ({selectedUser.email})
                        </Typography>
                    </Box>
                )}

                {/* Role Selection */}
                <TextField
                    fullWidth
                    select
                    label="Admin Role"
                    value={role}
                    onChange={(e) => onRoleChange(e.target.value as AdminRole)}
                    sx={{ mb: 2 }}
                    required
                >
                    {ADMIN_ROLES_CONFIG.map((r) => (
                        <MenuItem key={r.role} value={r.role}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: r.color,
                                    }}
                                />
                                {r.label}
                            </Box>
                        </MenuItem>
                    ))}
                </TextField>

                {roleConfig && (
                    <Box
                        sx={{
                            p: 2,
                            backgroundColor: 'background.secondary',
                            borderRadius: 2,
                            mb: 2,
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                        >
                            {roleConfig.description}
                        </Typography>
                    </Box>
                )}

                {/* Reason */}
                <TextField
                    fullWidth
                    label="Reason for promotion"
                    multiline
                    rows={2}
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    placeholder="Why is this user being promoted?"
                    required
                    error={!reason.trim() && loading}
                    helperText={
                        !reason.trim() && loading ? 'Reason is required' : ''
                    }
                />

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={() => selectedUser && onConfirm(selectedUser._id)}
                    disabled={loading || !selectedUser || !reason.trim()}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    {loading ? 'Promoting...' : 'Promote to Admin'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PromoteUserDialog;
