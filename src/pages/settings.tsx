import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    FormControlLabel,
    Button,
    Divider,
    CircularProgress,
} from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useRecoilState } from 'recoil';
import themeAtom from '@/atoms/theme-atom';
import { useUser } from '@/contexts/UserContext';
import { sendPasswordReset } from '@/services/admin';
import { showSuccess, showError } from '@/utils/toast';

const SettingsPage: React.FC = () => {
    const [themeState, setThemeState] = useRecoilState(themeAtom);
    const { user } = useUser();
    const [resetSending, setResetSending] = useState(false);

    const toggleDarkMode = (enabled: boolean) => {
        setThemeState({ prefersDarkMode: enabled });
        // Mirror AppTheme's persistence key so the choice survives reloads.
        if (typeof window !== 'undefined') {
            localStorage.setItem('zwilt-admin-theme', enabled ? 'dark' : 'light');
        }
    };

    const handleSendReset = async () => {
        setResetSending(true);
        try {
            const res = await sendPasswordReset();
            if (res.success) {
                showSuccess(
                    res.message ||
                        `Password reset link sent to ${user?.email ?? 'your email'}`,
                );
            } else {
                showError(res.message || 'Failed to send reset link');
            }
        } catch (error: any) {
            showError(
                error?.response?.data?.message ||
                    error?.message ||
                    'Failed to send reset link',
            );
        } finally {
            setResetSending(false);
        }
    };

    const sectionSx = {
        p: 3,
        border: '1.2px solid',
        borderColor: 'divider',
        borderRadius: 2,
        mb: 3,
    } as const;

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    Settings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your appearance and account preferences
                </Typography>
            </Box>

            {/* Appearance */}
            <Paper sx={sectionSx}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DarkModeOutlinedIcon fontSize="small" color="action" />
                    <Typography variant="h6" fontWeight={600}>
                        Appearance
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Switch between light and dark theme. Your choice is saved on
                    this device.
                </Typography>
                <FormControlLabel
                    control={
                        <Switch
                            checked={themeState.prefersDarkMode}
                            onChange={(e) => toggleDarkMode(e.target.checked)}
                            disableRipple
                            sx={{
                                // Self-contained iOS-style toggle; overrides the
                                // global square MuiSwitch theme just for this control.
                                width: 44,
                                height: 26,
                                padding: 0,
                                mr: 1,
                                '& .MuiSwitch-switchBase': {
                                    padding: 0,
                                    margin: '3px',
                                    transitionDuration: '200ms',
                                    '&.Mui-checked': {
                                        transform: 'translateX(18px)',
                                        color: '#fff',
                                        '& + .MuiSwitch-track': {
                                            backgroundColor: 'primary.main',
                                            opacity: 1,
                                            border: 0,
                                        },
                                    },
                                },
                                '& .MuiSwitch-thumb': {
                                    boxSizing: 'border-box',
                                    width: 20,
                                    height: 20,
                                    boxShadow:
                                        '0 1px 2px rgba(0,0,0,0.25)',
                                },
                                '& .MuiSwitch-track': {
                                    borderRadius: 13,
                                    backgroundColor: '#C7C9CC',
                                    opacity: 1,
                                },
                            }}
                        />
                    }
                    label={
                        themeState.prefersDarkMode ? 'Dark mode' : 'Light mode'
                    }
                />
            </Paper>

            {/* Security */}
            <Paper sx={sectionSx}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LockResetIcon fontSize="small" color="action" />
                    <Typography variant="h6" fontWeight={600}>
                        Security
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Reset your password. We&apos;ll email a secure reset link to
                    your account address
                    {user?.email ? (
                        <>
                            {' '}
                            (<strong>{user.email}</strong>)
                        </>
                    ) : null}
                    .
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Button
                    variant="outlined"
                    onClick={handleSendReset}
                    disabled={resetSending}
                    startIcon={
                        resetSending ? (
                            <CircularProgress size={16} />
                        ) : (
                            <LockResetIcon />
                        )
                    }
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    {resetSending ? 'Sending...' : 'Send reset link'}
                </Button>
            </Paper>
        </Box>
    );
};

export default SettingsPage;
