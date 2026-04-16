import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    InputAdornment,
    Button,
    Alert,
    Skeleton,
    Tooltip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { showSuccess, showError } from '@/utils/toast';
import { getSeatPricing, updateSeatPricing } from '@/services/admin';
import type { SeatPricing } from '@/types';

const SettingsPage: React.FC = () => {
    const [pricing, setPricing] = useState<SeatPricing>({
        recruitStandard: 9,
        recruitPremium: 99.99,
        trackerStandard: 9,
        trackerPremium: 99.99,
    });
    const [pricingLoading, setPricingLoading] = useState(true);
    const [pricingSaving, setPricingSaving] = useState(false);
    const [pricingSuccess, setPricingSuccess] = useState(false);
    const [pricingError, setPricingError] = useState('');

    const fetchPricing = useCallback(async () => {
        setPricingLoading(true);
        try {
            const res = await getSeatPricing();
            if (res.success) {
                setPricing(res.data);
            }
        } catch (error: any) {
            showError('Failed to load pricing data');
        } finally {
            setPricingLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPricing();
    }, [fetchPricing]);

    const handleSavePricing = async () => {
        setPricingSaving(true);
        setPricingSuccess(false);
        setPricingError('');
        try {
            const res = await updateSeatPricing(pricing);
            if (res.success) {
                setPricingSuccess(true);
                showSuccess('Seat pricing updated successfully');
                setTimeout(() => setPricingSuccess(false), 5000);
            } else {
                setPricingError(res.message || 'Failed to update pricing');
            }
        } catch (error: any) {
            setPricingError(error.message || 'Failed to update pricing');
            showError('Failed to update pricing');
        } finally {
            setPricingSaving(false);
        }
    };

    const updatePrice = (key: keyof SeatPricing, value: number) => {
        setPricing((prev) => ({ ...prev, [key]: value }));
        setPricingSuccess(false);
        setPricingError('');
    };

    const tierConfigs: Array<{
        key: keyof SeatPricing;
        label: string;
        description: string;
        premium?: boolean;
    }> = [
        {
            key: 'recruitStandard',
            label: 'Recruit Standard',
            description: 'Standard features for Recruit',
        },
        {
            key: 'recruitPremium',
            label: 'Recruit Premium',
            description: 'Premium features for Recruit',
            premium: true,
        },
        {
            key: 'trackerStandard',
            label: 'Tracker Standard',
            description: 'Standard features for Tracker',
        },
        {
            key: 'trackerPremium',
            label: 'Tracker Premium',
            description: 'Premium features for Tracker',
            premium: true,
        },
    ];

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    Settings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Configure seat pricing and system preferences
                </Typography>
            </Box>

            <Paper
                sx={{
                    p: 3,
                    border: '1.2px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                }}
            >
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    Seat Pricing
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    Monthly price per seat for each subscription tier. Changes
                    apply to new subscriptions immediately.
                </Typography>

                {pricingSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Seat pricing updated successfully
                    </Alert>
                )}
                {pricingError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {pricingError}
                    </Alert>
                )}

                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {tierConfigs.map((tier) => (
                        <Grid item xs={12} sm={6} md={3} key={tier.key}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    mb: 0.5,
                                }}
                            >
                                <Typography variant="body2" fontWeight={600}>
                                    {tier.label}
                                </Typography>
                                {tier.premium && (
                                    <Tooltip
                                        title={
                                            <Box sx={{ fontSize: '0.75rem' }}>
                                                <Typography
                                                    variant="caption"
                                                    fontWeight={600}
                                                    display="block"
                                                    sx={{ mb: 0.5 }}
                                                >
                                                    Premium seats are assigned
                                                    to users with:
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    component="span"
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                    }}
                                                >
                                                    Recruit: ADMIN, MANAGER,
                                                    OWNER
                                                </Typography>
                                                <br />
                                                <Typography
                                                    variant="caption"
                                                    component="span"
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                    }}
                                                >
                                                    Tracker: ORGANIZATION_OWNER,
                                                    ORGANIZATION_MANAGER
                                                </Typography>
                                            </Box>
                                        }
                                        arrow
                                        placement="top"
                                    >
                                        <InfoOutlinedIcon
                                            sx={{
                                                fontSize: 14,
                                                color: 'text.secondary',
                                            }}
                                        />
                                    </Tooltip>
                                )}
                            </Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ mb: 2 }}
                            >
                                {tier.description}
                            </Typography>
                            {pricingLoading ? (
                                <Skeleton
                                    variant="text"
                                    width={80}
                                    height={40}
                                />
                            ) : (
                                <TextField
                                    fullWidth
                                    type="number"
                                    value={pricing[tier.key]}
                                    onChange={(e) =>
                                        updatePrice(
                                            tier.key,
                                            Number(e.target.value),
                                        )
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                $
                                            </InputAdornment>
                                        ),
                                    }}
                                    size="small"
                                />
                            )}
                        </Grid>
                    ))}
                </Grid>

                <Box
                    sx={{
                        p: 2,
                        backgroundColor: 'background.secondary',
                        borderRadius: 1,
                        mb: 3,
                    }}
                >
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mb: 0.5 }}
                    >
                        Estimated Revenue Per Org (Average)
                    </Typography>
                    {!pricingLoading && (
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ color: 'text.primary' }}
                        >
                            $
                            {Math.round(
                                (pricing.recruitStandard +
                                    pricing.recruitPremium +
                                    pricing.trackerStandard +
                                    pricing.trackerPremium) /
                                    4,
                            )}
                            <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                sx={{ ml: 0.5 }}
                            >
                                /seat/mo
                            </Typography>
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleSavePricing}
                        disabled={pricingSaving || pricingLoading}
                        startIcon={<SaveIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2, px: 4 }}
                    >
                        {pricingSaving ? 'Saving...' : 'Save Pricing'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default SettingsPage;
