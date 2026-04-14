import React from 'react';
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
} from '@mui/material';
import { AdminRole, ADMIN_ROLES_CONFIG } from '@/types';

interface RoleChangeDialogProps {
    open: boolean;
    adminName: string;
    currentRole: AdminRole;
    newRole: AdminRole;
    reason: string;
    loading: boolean;
    error?: string;
    onNewRoleChange: (role: AdminRole) => void;
    onReasonChange: (reason: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

const RoleChangeDialog: React.FC<RoleChangeDialogProps> = ({
    open,
    adminName,
    currentRole,
    newRole,
    reason,
    loading,
    error,
    onNewRoleChange,
    onReasonChange,
    onConfirm,
    onCancel,
}) => {
    const roleConfig = ADMIN_ROLES_CONFIG.find((r) => r.role === newRole);

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 600 }}>
                Change Admin Role
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Changing role for <strong>{adminName}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Current role: <strong>{currentRole.replace('_', ' ')}</strong>
                    </Typography>
                </Box>

                <TextField
                    fullWidth
                    select
                    label="New Role"
                    value={newRole}
                    onChange={(e) => onNewRoleChange(e.target.value as AdminRole)}
                    sx={{ mb: 3 }}
                    required
                >
                    {ADMIN_ROLES_CONFIG.map((role) => (
                        <MenuItem key={role.role} value={role.role}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: role.color,
                                    }}
                                />
                                {role.label}
                            </Box>
                        </MenuItem>
                    ))}
                </TextField>

                {roleConfig && (
                    <Box
                        sx={{
                            p: 2,
                            backgroundColor: '#F8F9FA',
                            borderRadius: 2,
                            mb: 2,
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Role Description
                        </Typography>
                        <Typography variant="body2">{roleConfig.description}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, mb: 0.5 }}>
                            Permissions ({roleConfig.permissions.length}):
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {roleConfig.permissions.map((perm) => (
                                <Typography
                                    key={perm}
                                    variant="caption"
                                    sx={{
                                        backgroundColor: '#fff',
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: 1,
                                        border: '1px solid #E0E0E9',
                                    }}
                                >
                                    {perm.replace(/_/g, ' ')}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                )}

                <TextField
                    fullWidth
                    label="Reason for role change"
                    multiline
                    rows={3}
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    placeholder="Explain why this role change is necessary..."
                    required
                    error={!reason.trim() && loading}
                    helperText={!reason.trim() && loading ? 'Reason is required' : ''}
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
                    onClick={onConfirm}
                    disabled={loading || !reason.trim()}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    {loading ? 'Changing Role...' : 'Change Role'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RoleChangeDialog;
