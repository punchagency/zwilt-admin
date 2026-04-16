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

interface CreateAdminDialogProps {
    open: boolean;
    name: string;
    email: string;
    role: AdminRole;
    reason: string;
    password: string;
    loading: boolean;
    error?: string;
    onNameChange: (name: string) => void;
    onEmailChange: (email: string) => void;
    onRoleChange: (role: AdminRole) => void;
    onReasonChange: (reason: string) => void;
    onPasswordChange: (password: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

const CreateAdminDialog: React.FC<CreateAdminDialogProps> = ({
    open,
    name,
    email,
    role,
    reason,
    password,
    loading,
    error,
    onNameChange,
    onEmailChange,
    onRoleChange,
    onReasonChange,
    onPasswordChange,
    onConfirm,
    onCancel,
}) => {
    const roleConfig = ADMIN_ROLES_CONFIG.find((r) => r.role === role);

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 600 }}>Create New Admin</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    sx={{ mb: 2 }}
                    required
                    autoComplete="name"
                />

                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    sx={{ mb: 2 }}
                    required
                    autoComplete="email"
                />

                <TextField
                    fullWidth
                    label="Initial Password"
                    type="password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    sx={{ mb: 2 }}
                    required
                    helperText="This will be the admin's initial password"
                />

                <TextField
                    fullWidth
                    select
                    label="Role"
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

                <TextField
                    fullWidth
                    label="Reason for creating this admin"
                    multiline
                    rows={2}
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    placeholder="Why is this admin account needed?"
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
                    onClick={onConfirm}
                    disabled={
                        loading ||
                        !name.trim() ||
                        !email.trim() ||
                        !reason.trim()
                    }
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    {loading ? 'Creating...' : 'Create Admin'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateAdminDialog;
