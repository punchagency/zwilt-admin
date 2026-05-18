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
import type {
    SeatPricing,
    ManagedApplication,
    SeatPricingResponse,
} from '@/types';

const SettingsPage: React.FC = () => {
    const [pricing, setPricing] = useState<SeatPricing>({});
    const [apps, setApps] = useState<ManagedApplication[]>([]);
    const [pricingLoading, setPricingLoading] = useState(true);
    const [pricingSaving, setPricingSaving] = useState(false);
    const [pricingSuccess, setPricingSuccess] = useState(false);
    const [pricingError, setPricingError] = useState('');

    const fetchPricing = useCallback(async () => {
        setPricingLoading(true);
        try {
            const res = await getSeatPricing();
            if (res.success) {
                setPricing(res.data.pricing);
                setApps(res.data.apps);
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

    const updatePrice = (
        appId: string,
        type: 'Standard' | 'Premium',
        value: number,
    ) => {
        const key = `${appId}${type}`;
        setPricing((prev) => ({ ...prev, [key]: value }));
        setPricingSuccess(false);
        setPricingError('');
    };

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
                    {pricingLoading
                        ? [1, 2, 3, 4].map((i) => (
                              <Grid item xs={12} sm={6} md={3} key={i}>
                                  <Skeleton
                                      variant="rectangular"
                                      height={100}
                                      sx={{ borderRadius: 1 }}
                                  />
                              </Grid>
                          ))
                        : apps.map((app) => (
                              <React.Fragment key={app._id}>
                                  {/* Standard Tier */}
                                  <Grid item xs={12} sm={6} md={3}>
                                      <Box
                                          sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 0.5,
                                              mb: 0.5,
                                          }}
                                      >
                                          <Typography
                                              variant="body2"
                                              fontWeight={600}
                                          >
                                              {app.name} Standard
                                          </Typography>
                                      </Box>
                                      <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          display="block"
                                          sx={{ mb: 2 }}
                                      >
                                          Base subscription for {app.name}
                                      </Typography>
                                      <TextField
                                          fullWidth
                                          type="number"
                                          value={
                                              pricing[`${app.appId}Standard`] ||
                                              0
                                          }
                                          onChange={(e) =>
                                              updatePrice(
                                                  app.appId,
                                                  'Standard',
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
                                  </Grid>

                                  {/* Premium Tier */}
                                  <Grid item xs={12} sm={6} md={3}>
                                      <Box
                                          sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 0.5,
                                              mb: 0.5,
                                          }}
                                      >
                                          <Typography
                                              variant="body2"
                                              fontWeight={600}
                                          >
                                              {app.name} Premium
                                          </Typography>
                                          <Tooltip
                                              title={
                                                  <Typography variant="caption">
                                                      Premium features for{' '}
                                                      {app.name}
                                                  </Typography>
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
                                      </Box>
                                      <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          display="block"
                                          sx={{ mb: 2 }}
                                      >
                                          Full features for {app.name}
                                      </Typography>
                                      <TextField
                                          fullWidth
                                          type="number"
                                          value={
                                              pricing[`${app.appId}Premium`] ||
                                              0
                                          }
                                          onChange={(e) =>
                                              updatePrice(
                                                  app.appId,
                                                  'Premium',
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
                                  </Grid>
                              </React.Fragment>
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
                    {!pricingLoading && Object.keys(pricing).length > 0 && (
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ color: 'text.primary' }}
                        >
                            $
                            {Math.round(
                                Object.values(pricing).reduce(
                                    (acc, current) => acc + current,
                                    0,
                                ) / Object.values(pricing).length,
                            )}
                            <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                sx={{ ml: 0.5 }}
                            >
                                /seat/mo (Avg)
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
