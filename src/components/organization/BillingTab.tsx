import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Divider,
    Chip,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import { getOrganizationBilling } from '@/services/admin';
import type { OrganizationBillingData, Organization } from '@/types';
import { showError } from '@/utils/toast';

interface BillingTabProps {
    organization: Organization;
}

const BillingTab: React.FC<BillingTabProps> = ({ organization }) => {
    const [billing, setBilling] = useState<OrganizationBillingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBilling = async () => {
            try {
                setLoading(true);
                const response = await getOrganizationBilling(organization._id);
                if (response.success) {
                    setBilling(response.data);
                } else {
                    showError('Failed to load billing data');
                }
            } catch (error: any) {
                showError(error.message || 'Error fetching billing');
            } finally {
                setLoading(false);
            }
        };

        fetchBilling();
    }, [organization._id]);

    if (loading) {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Skeleton variant="rectangular" height={250} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Skeleton variant="rectangular" height={250} />
                </Grid>
            </Grid>
        );
    }

    if (!billing) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No billing data available
            </Typography>
        );
    }

    const { seatBilling, aiCredits } = billing;

    const statusColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
        ACTIVE: 'success',
        SUSPENDED: 'error',
        PAST_DUE: 'warning',
        CANCELED: 'default',
        UNKNOWN: 'default',
    };

    const formatCurrency = (amount: number) =>
        `$${amount.toFixed(2)}`;

    return (
        <Grid container spacing={3}>
            {/* Seat Billing Summary */}
            <Grid item xs={12} md={6}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={600}>
                                Seat Billing
                            </Typography>
                            <Chip
                                label={seatBilling.billingStatus || 'N/A'}
                                color={statusColors[seatBilling.billingStatus] || 'default'}
                                size="small"
                            />
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {/* Billing Tiers */}
                        {seatBilling.tiers.recruitPremium.seats > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                <Typography variant="body2">Recruit Premium</Typography>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2" fontWeight={600}>
                                        {seatBilling.tiers.recruitPremium.seats} × {formatCurrency(seatBilling.tiers.recruitPremium.pricePerSeat)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatCurrency(seatBilling.tiers.recruitPremium.total)}/mo
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        {seatBilling.tiers.recruitStandard.seats > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                <Typography variant="body2">Recruit Standard</Typography>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2" fontWeight={600}>
                                        {seatBilling.tiers.recruitStandard.seats} × {formatCurrency(seatBilling.tiers.recruitStandard.pricePerSeat)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatCurrency(seatBilling.tiers.recruitStandard.total)}/mo
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        {seatBilling.tiers.trackerPremium.seats > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                <Typography variant="body2">Tracker Premium</Typography>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2" fontWeight={600}>
                                        {seatBilling.tiers.trackerPremium.seats} × {formatCurrency(seatBilling.tiers.trackerPremium.pricePerSeat)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatCurrency(seatBilling.tiers.trackerPremium.total)}/mo
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        {seatBilling.tiers.trackerStandard.seats > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                <Typography variant="body2">Tracker Standard</Typography>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2" fontWeight={600}>
                                        {seatBilling.tiers.trackerStandard.seats} × {formatCurrency(seatBilling.tiers.trackerStandard.pricePerSeat)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatCurrency(seatBilling.tiers.trackerStandard.total)}/mo
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1" fontWeight={600}>
                                Total Monthly
                            </Typography>
                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                {formatCurrency(seatBilling.totalMonthly)}
                            </Typography>
                        </Box>

                        {seatBilling.subscriptionId && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Stripe Subscription
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                                    {seatBilling.subscriptionId}
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* AI Credits Billing */}
            <Grid item xs={12} md={6}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            AI Credits
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {aiCredits ? (
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Plan
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                                        {aiCredits.subscriptionTier || 'N/A'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Available Credits
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {aiCredits.availableCredits.toLocaleString()}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Used Credits
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {aiCredits.usedCredits.toLocaleString()}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Purchased Credits
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {aiCredits.purchasedCredits.toLocaleString()}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Rollover Credits
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {aiCredits.rolloverCredits.toLocaleString()}
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Usage Bar */}
                                <Box sx={{ py: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Usage
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {aiCredits.totalCredits > 0
                                                ? `${Math.round((aiCredits.usedCredits / aiCredits.totalCredits) * 100)}%`
                                                : '0%'}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: 8,
                                            backgroundColor: '#E5E7EB',
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${aiCredits.totalCredits > 0 ? (aiCredits.usedCredits / aiCredits.totalCredits) * 100 : 0}%`,
                                                height: '100%',
                                                backgroundColor: '#2196F3',
                                                borderRadius: 4,
                                            }}
                                        />
                                    </Box>
                                </Box>

                                {aiCredits.stripeSubscriptionId && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Stripe Subscription
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                                            {aiCredits.stripeSubscriptionId}
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                                No AI Credits configured for this organization
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* Invoice History */}
            <Grid item xs={12}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            Billing History
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {billing.invoiceHistory.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                                No billing history available
                            </Typography>
                        ) : (
                            <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Payment Intent</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {billing.invoiceHistory.map((invoice) => (
                                            <TableRow key={invoice.id} hover>
                                                <TableCell>
                                                    {new Date(invoice.date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>{invoice.description}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                        {invoice.paymentIntentId || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={invoice.status}
                                                        size="small"
                                                        color={
                                                            invoice.status === 'succeeded'
                                                                ? 'success'
                                                                : invoice.status === 'pending'
                                                                ? 'warning'
                                                                : 'default'
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600}>
                                                        ${invoice.amount.toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default BillingTab;
