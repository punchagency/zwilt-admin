import React, { useState } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Avatar,
    IconButton,
    Collapse,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HistoryIcon from '@mui/icons-material/History';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import { useUser } from '@/contexts/UserContext';

const DRAWER_WIDTH = 260;

interface MenuItem {
    text: string;
    path: string;
    icon: React.ReactNode;
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    {
        text: 'Overview',
        path: '/',
        icon: <DashboardIcon />,
    },
    {
        text: 'Organizations',
        path: '/organizations',
        icon: <BusinessIcon />,
    },
    {
        text: 'Users',
        path: '/users',
        icon: <PeopleIcon />,
    },
    {
        text: 'Admin Management',
        path: '/super-admins',
        icon: <AdminPanelSettingsIcon />,
    },
    {
        text: 'Earnings',
        path: '/earnings',
        icon: <AttachMoneyIcon />,
    },
    {
        text: 'Audit Trails',
        path: '/audit-trails',
        icon: <HistoryIcon />,
    },
    {
        text: 'Settings',
        path: '/settings',
        icon: <SettingsIcon />,
    },
];

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const { user } = useUser();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const handleMenuClick = (menuText: string) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menuText]: !prev[menuText],
        }));
    };

    const userInitials = user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'A';
    const userName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Admin User';
    const userEmail = user?.email || 'admin@zwilt.com';

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: '#FAFAFA',
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '24px 16px',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <svg width="34" height="23" viewBox="0 0 34 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.235 11.5224C18.235 16.5141 14.1852 20.5607 9.18952 20.5607C4.19384 20.5607 0.144043 16.5141 0.144043 11.5224C0.144043 6.53061 4.19384 2.484 9.18952 2.484C14.1852 2.484 18.235 6.53061 18.235 11.5224Z" fill="#FFBE2E"/>
                        <path d="M15.909 22.1101V0.93457L34 11.5224L15.909 22.1101Z" fill="#FFBE2E"/>
                    </svg>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: '#292933',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        zwilt
                    </Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                    <ChevronLeftIcon />
                </IconButton>
            </Box>

            <Divider />

            <List sx={{ padding: '16px 0' }}>
                {menuItems.map((item) => (
                    <React.Fragment key={item.text}>
                        <ListItem disablePadding sx={{ mb: 0.5, px: 2 }}>
                            <Link
                                href={item.path}
                                passHref
                                style={{
                                    width: '100%',
                                    textDecoration: 'none',
                                }}
                            >
                                <ListItemButton
                                    selected={pathname === item.path}
                                    sx={{
                                        borderRadius: 2,
                                        '&.Mui-selected': {
                                            backgroundColor: '#E8EAFF',
                                            '&:hover': {
                                                backgroundColor: '#E8EAFF',
                                            },
                                        },
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color:
                                                pathname === item.path
                                                    ? 'primary.main'
                                                    : 'text.secondary',
                                            minWidth: 40,
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontSize: '0.9rem',
                                            fontWeight:
                                                pathname === item.path
                                                    ? 600
                                                    : 400,
                                            color:
                                                pathname === item.path
                                                    ? 'primary.main'
                                                    : 'text.primary',
                                        }}
                                    />
                                    {item.children &&
                                        (openMenus[item.text] ? (
                                            <ExpandLess
                                                sx={{
                                                    color: 'text.secondary',
                                                }}
                                            />
                                        ) : (
                                            <ExpandMore
                                                sx={{
                                                    color: 'text.secondary',
                                                }}
                                            />
                                        ))}
                                </ListItemButton>
                            </Link>
                        </ListItem>
                        {item.children && (
                            <Collapse
                                in={openMenus[item.text]}
                                timeout="auto"
                                unmountOnExit
                            >
                                <List component="div" disablePadding>
                                    {item.children.map((child) => (
                                        <ListItem
                                            key={child.text}
                                            disablePadding
                                            sx={{ pl: 6, mb: 0.5 }}
                                        >
                                            <Link
                                                href={child.path}
                                                passHref
                                                style={{
                                                    width: '100%',
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                <ListItemButton
                                                    selected={
                                                        pathname === child.path
                                                    }
                                                    sx={{
                                                        borderRadius: 2,
                                                        '&.Mui-selected': {
                                                            backgroundColor:
                                                                '#E8EAFF',
                                                        },
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={child.text}
                                                        primaryTypographyProps={{
                                                            fontSize: '0.85rem',
                                                        }}
                                                    />
                                                </ListItemButton>
                                            </Link>
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        )}
                    </React.Fragment>
                ))}
            </List>

            <Box sx={{ mt: 'auto', padding: '16px', borderTop: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: 'primary.main',
                        }}
                    >
                        {userInitials.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                            {userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {userEmail}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
