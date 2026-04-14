import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Alert,
    Box,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

interface AdminConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    adminName: string;
    actionType: 'suspend' | 'delete';
    reason: string;
    loading: boolean;
    error?: string;
    onReasonChange: (reason: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

const AdminConfirmDialog: React.FC<AdminConfirmDialogProps> = ({
    open,
    title,
    description,
    adminName,
    actionType,
    reason,
    loading,
    error,
    onReasonChange,
    onConfirm,
    onCancel,
}) => {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                {actionType === 'delete' && <WarningIcon color="error" />}
                {title}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    {description}
                </Typography>

                <Box
                    sx={{
                        p: 2,
                        backgroundColor: '#F8F9FA',
                        borderRadius: 2,
                        mb: 2,
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        Target:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                        {adminName}
                    </Typography>
                </Box>

                <TextField
                    fullWidth
                    label={`Reason for ${actionType}`}
                    multiline
                    rows={3}
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    placeholder={`Why is this admin being ${actionType === 'suspend' ? 'suspended' : 'deleted'}?`}
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
                    color={actionType === 'delete' ? 'error' : 'warning'}
                    onClick={onConfirm}
                    disabled={loading || !reason.trim()}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    {loading
                        ? `${actionType === 'suspend' ? 'Suspending' : 'Deleting'}...`
                        : `${actionType === 'suspend' ? 'Suspend' : 'Delete'} Admin`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AdminConfirmDialog;
