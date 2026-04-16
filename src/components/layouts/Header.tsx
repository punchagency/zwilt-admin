import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Breadcrumbs,
    Link as MuiLink,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useUser } from '@/contexts/UserContext';
import { useRecoilState } from 'recoil';
import themeAtom from '@/atoms/theme-atom';

interface HeaderProps {
    title: string;
    breadcrumbs?: { label: string; href?: string }[];
}

const Header: React.FC<HeaderProps> = ({ title, breadcrumbs }) => {
    const { user } = useUser();
    const [themeState, setThemeState] = useRecoilState(themeAtom);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const toggleTheme = () => {
        const newMode = !themeState.prefersDarkMode;
        setThemeState({ prefersDarkMode: newMode });
        localStorage.setItem('zwilt-admin-theme', newMode ? 'dark' : 'light');
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const userInitials =
        user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'A';
    const userName =
        user?.name ||
        `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
        'Admin User';

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Toolbar
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Box>
                    {breadcrumbs && breadcrumbs.length > 0 ? (
                        <Breadcrumbs
                            separator={<NavigateNextIcon fontSize="small" />}
                            aria-label="breadcrumb"
                            sx={{ mb: 1 }}
                        >
                            {breadcrumbs.map((crumb, index) => (
                                <Typography
                                    key={crumb.label}
                                    variant="body2"
                                    color={
                                        index === breadcrumbs.length - 1
                                            ? 'text.primary'
                                            : 'text.secondary'
                                    }
                                >
                                    {crumb.href ? (
                                        <MuiLink
                                            href={crumb.href}
                                            underline="none"
                                            color="inherit"
                                        >
                                            {crumb.label}
                                        </MuiLink>
                                    ) : (
                                        crumb.label
                                    )}
                                </Typography>
                            ))}
                        </Breadcrumbs>
                    ) : null}
                    <Typography
                        variant="h5"
                        fontWeight={600}
                        color="text.primary"
                    >
                        {title}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                        size="large"
                        onClick={toggleTheme}
                        sx={{ color: 'text.secondary' }}
                    >
                        {themeState.prefersDarkMode ? (
                            <LightModeIcon />
                        ) : (
                            <DarkModeIcon />
                        )}
                    </IconButton>

                    <IconButton
                        size="large"
                        color="inherit"
                        sx={{ color: 'text.secondary' }}
                    >
                        <NotificationsIcon />
                    </IconButton>

                    <IconButton
                        onClick={handleMenuOpen}
                        size="large"
                        sx={{ ml: 1 }}
                    >
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                backgroundColor: 'primary.main',
                            }}
                        >
                            {userInitials.toUpperCase()}
                        </Avatar>
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem disabled sx={{ fontWeight: 600 }}>
                            {userName}
                        </MenuItem>
                        <MenuItem
                            disabled
                            sx={{ fontSize: '0.8rem', color: 'text.secondary' }}
                        >
                            {user?.email}
                        </MenuItem>
                        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                        <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
