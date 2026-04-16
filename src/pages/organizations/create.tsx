import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Box,
    Typography,
    Button,
    TextField,
    Grid,
    Paper,
    Autocomplete,
    CircularProgress,
    MenuItem,
    Divider,
    IconButton,
    FormControlLabel,
    Switch,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    createOrganization,
    getUsers,
    getUploadUrl,
    createUser,
} from '@/services/admin';
import type { SeatUser } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import axios from 'axios';

const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Real Estate',
    'Retail',
    'Manufacturing',
    'Energy',
    'Other',
];

const teamSizeOptions = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+',
];

const IOSSwitch = styled(Switch)(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: theme.palette.primary.main,
                opacity: 1,
                border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
            },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#33cf4d',
            border: `6px solid ${theme.palette.background.paper}`,
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
            color:
                theme.palette.mode === 'light'
                    ? theme.palette.grey[100]
                    : theme.palette.grey[600],
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 22,
        height: 22,
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}));

const CreateOrganization: React.FC = () => {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        organizationName: '',
        organizationIndustry: '',
        organizationWebsite: '',
        organizationProfileImg: '',
        teamSize: ['1-10'],
        minTeamSize: 1,
        maxTeamSize: 10,
        organizationOwner: '',
        invitedManagerEmail: '',
    });

    // Logo Upload State
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Owner Search State
    const [users, setUsers] = useState<SeatUser[]>([]);
    const [userLoading, setUserLoading] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    // New Owner Mode State
    const [isNewOwner, setIsNewOwner] = useState(false);
    const [newOwnerData, setNewOwnerData] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setUserLoading(true);
                // Fetch first 25 users if no search, otherwise search
                const response = await getUsers(1, 25, userSearch || undefined);
                if (response.success) {
                    setUsers(response.data.users);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setUserLoading(false);
            }
        };

        const timer = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timer);
    }, [userSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                showError('File size exceeds 10MB limit');
                return;
            }
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setFormData((prev) => ({ ...prev, organizationProfileImg: '' }));
    };

    const handleTeamSizeChange = (value: string) => {
        const [min, max] = value.replace('+', '').split('-').map(Number);
        setFormData((prev) => ({
            ...prev,
            teamSize: [value],
            minTeamSize: min || 1000,
            maxTeamSize: max || 9999,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isNewOwner && !formData.organizationOwner) {
            showError('Please select an organization owner');
            return;
        }

        if (isNewOwner && (!newOwnerData.firstName || !newOwnerData.email)) {
            showError('Please enter the new owner details');
            return;
        }

        try {
            setSubmitting(true);

            let ownerId = formData.organizationOwner;

            // Handle New User Creation if needed
            if (isNewOwner) {
                try {
                    const userResponse = await createUser({
                        ...newOwnerData,
                        name: `${newOwnerData.firstName} ${newOwnerData.lastName}`,
                    });
                    if (userResponse.success) {
                        ownerId = userResponse.data._id;
                    } else {
                        throw new Error(
                            userResponse.message ||
                                'Failed to create owner user',
                        );
                    }
                } catch (error: any) {
                    showError(
                        error.response?.data?.message ||
                            error.message ||
                            'Failed to create user',
                    );
                    setSubmitting(false);
                    return;
                }
            }

            let finalLogoUrl = formData.organizationProfileImg;

            // Handle Logo Upload if file selected
            if (logoFile) {
                setUploadingImage(true);
                try {
                    const uploadData = await getUploadUrl({
                        fileName: logoFile.name,
                        fileType: logoFile.type,
                        fileSize: logoFile.size,
                    });

                    if (uploadData.success) {
                        const { presignedUrl, url } = uploadData.data;
                        await axios.put(presignedUrl, logoFile, {
                            headers: { 'Content-Type': logoFile.type },
                        });
                        finalLogoUrl = url;
                    }
                } catch (error: any) {
                    const errorMsg =
                        error.response?.data?.message || error.message;
                    console.error('Logo upload failed:', errorMsg);
                    showError(
                        `Logo upload failed: ${errorMsg}. Proceeding without it.`,
                    );
                } finally {
                    setUploadingImage(false);
                }
            }

            const response = await createOrganization({
                ...formData,
                organizationOwner: ownerId,
                organizationProfileImg: finalLogoUrl,
            });
            if (response.success) {
                showSuccess('Organization created successfully');
                router.push('/organizations');
            } else {
                showError(response.message || 'Failed to create organization');
            }
        } catch (error: any) {
            showError(
                error.response?.data?.message ||
                    error.message ||
                    'An error occurred',
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'start', gap: 2 }}>
                <IconButton onClick={() => router.push('/')} size="small">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight={700}>
                    Create New Organization
                </Typography>
            </Box>

            <Paper
                sx={{
                    p: 4,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    maxWidth: '800px',
                }}
                elevation={0}
            >
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Organization Section */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{ mb: 1 }}
                            >
                                Organization Details
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Organization Name"
                                name="organizationName"
                                value={formData.organizationName}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Acme Corp"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Industry"
                                name="organizationIndustry"
                                value={formData.organizationIndustry}
                                onChange={handleChange}
                                required
                            >
                                {industries.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Website"
                                name="organizationWebsite"
                                value={formData.organizationWebsite}
                                onChange={handleChange}
                                placeholder="https://example.com"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Team Size"
                                value={formData.teamSize[0]}
                                onChange={(e) =>
                                    handleTeamSizeChange(e.target.value)
                                }
                                required
                            >
                                {teamSizeOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    mb: 2,
                                }}
                            >
                                {logoPreview ? (
                                    <Box sx={{ position: 'relative' }}>
                                        <Box
                                            component="img"
                                            src={logoPreview}
                                            alt="Logo Preview"
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                objectFit: 'cover',
                                                borderRadius: 8,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={removeLogo}
                                            sx={{
                                                position: 'absolute',
                                                top: -10,
                                                right: -10,
                                                backgroundColor:
                                                    'background.paper',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                '&:hover': {
                                                    backgroundColor:
                                                        'action.hover',
                                                },
                                            }}
                                        >
                                            <DeleteIcon
                                                fontSize="small"
                                                color="error"
                                            />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: 2,
                                            border: '2px dashed',
                                            borderColor: 'divider',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor:
                                                'background.secondary',
                                        }}
                                    >
                                        <CloudUploadIcon
                                            sx={{ color: 'text.disabled' }}
                                        />
                                    </Box>
                                )}
                                <Box>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={<CloudUploadIcon />}
                                        sx={{ textTransform: 'none', mb: 1 }}
                                    >
                                        {logoPreview
                                            ? 'Change Logo'
                                            : 'Upload Logo'}
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                        />
                                    </Button>
                                    <Typography
                                        variant="caption"
                                        display="block"
                                        color="text.secondary"
                                    >
                                        Recommended: Square SVG, PNG or JPG (Max
                                        10MB)
                                    </Typography>
                                </Box>
                            </Box>
                            <TextField
                                fullWidth
                                label="Logo URL (Manual Override)"
                                name="organizationProfileImg"
                                value={formData.organizationProfileImg}
                                onChange={handleChange}
                                placeholder="https://example.com/logo.png"
                                helperText="Leave empty if you uploaded a file above"
                            />
                        </Grid>

                        {/* People Section */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{ mb: 1 }}
                            >
                                Roles & Access
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                        </Grid>

                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    bgcolor: 'background.secondary',
                                    borderRadius: 2,
                                    mb: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={600}
                                    >
                                        Organization Owner
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {isNewOwner
                                            ? 'Enter details for a new user to be created as owner'
                                            : 'Select an existing user to assign as the organization owner'}
                                    </Typography>
                                </Box>
                                <FormControlLabel
                                    control={
                                        <IOSSwitch
                                            checked={isNewOwner}
                                            onChange={(e) =>
                                                setIsNewOwner(e.target.checked)
                                            }
                                            sx={{ ml: 2 }}
                                        />
                                    }
                                    label={
                                        <Typography
                                            variant="body2"
                                            fontWeight={500}
                                        >
                                            Create New User?
                                        </Typography>
                                    }
                                    labelPlacement="start"
                                />
                            </Box>
                        </Grid>

                        {isNewOwner ? (
                            <>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Owner First Name"
                                        required
                                        value={newOwnerData.firstName}
                                        onChange={(e) =>
                                            setNewOwnerData((prev) => ({
                                                ...prev,
                                                firstName: e.target.value,
                                            }))
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Owner Last Name"
                                        required
                                        value={newOwnerData.lastName}
                                        onChange={(e) =>
                                            setNewOwnerData((prev) => ({
                                                ...prev,
                                                lastName: e.target.value,
                                            }))
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Owner Email"
                                        type="email"
                                        required
                                        value={newOwnerData.email}
                                        onChange={(e) =>
                                            setNewOwnerData((prev) => ({
                                                ...prev,
                                                email: e.target.value,
                                            }))
                                        }
                                    />
                                </Grid>
                            </>
                        ) : (
                            <Grid item xs={12}>
                                <Autocomplete
                                    options={users}
                                    loading={userLoading}
                                    getOptionLabel={(option) =>
                                        `${
                                            option.name ||
                                            `${option.firstName} ${option.lastName}`
                                        } (${option.email})`
                                    }
                                    onInputChange={(_, value) =>
                                        setUserSearch(value)
                                    }
                                    onChange={(_, value) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            organizationOwner: value?._id || '',
                                        }))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Owner"
                                            required
                                            placeholder="Search by name or email"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <React.Fragment>
                                                        {userLoading ? (
                                                            <CircularProgress
                                                                color="inherit"
                                                                size={20}
                                                            />
                                                        ) : null}
                                                        {
                                                            params.InputProps
                                                                .endAdornment
                                                        }
                                                    </React.Fragment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Invited Manager Email"
                                name="invitedManagerEmail"
                                type="email"
                                value={formData.invitedManagerEmail}
                                onChange={handleChange}
                                required
                                placeholder="manager@example.com"
                                helperText="This person will be sent an invitation with Management role"
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ mt: 4 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={() => router.push('/')}
                                    sx={{ textTransform: 'none', px: 4 }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={submitting}
                                    sx={{
                                        textTransform: 'none',
                                        px: 6,
                                        backgroundColor: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        },
                                    }}
                                >
                                    {submitting ? (
                                        <CircularProgress
                                            size={24}
                                            color="inherit"
                                        />
                                    ) : (
                                        'Create Organization'
                                    )}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default CreateOrganization;
