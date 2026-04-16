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
    alpha,
} from '@mui/material';

interface ConfirmActionDialogProps {
    open: boolean;
    action: 'suspend' | 'delete' | null;
    organizationName: string;
    reason: string;
    onReasonChange: (reason: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({
    open,
    action,
    organizationName,
    reason,
    onReasonChange,
    onClose,
    onConfirm,
}) => {
    const isDelete = action === 'delete';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle
                sx={{
                    backgroundColor: (theme) =>
                        alpha(
                            isDelete
                                ? theme.palette.error.main
                                : theme.palette.warning.main,
                            0.08,
                        ),
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Typography
                    variant="h6"
                    color={isDelete ? 'error.main' : 'warning.main'}
                >
                    {isDelete ? 'Delete Organization' : 'Suspend Organization'}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    {isDelete ? (
                        <>
                            Are you sure you want to delete{' '}
                            <Typography component="span" fontWeight={700}>
                                {organizationName}
                            </Typography>
                            ? This action cannot be undone.
                        </>
                    ) : (
                        <>
                            This will suspend{' '}
                            <Typography component="span" fontWeight={700}>
                                {organizationName}
                            </Typography>
                            . All users will lose access until reactivated.
                        </>
                    )}
                </Typography>

                <TextField
                    label={
                        isDelete
                            ? 'Reason for deletion'
                            : 'Reason for suspension'
                    }
                    multiline
                    rows={3}
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    fullWidth
                    placeholder={`Enter reason for ${action}...`}
                    required
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    color={isDelete ? 'error' : 'warning'}
                    onClick={onConfirm}
                    disabled={!reason.trim()}
                    sx={{ textTransform: 'none' }}
                >
                    {isDelete ? 'Delete Organization' : 'Confirm Suspension'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmActionDialog;
