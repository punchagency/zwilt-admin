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
    alpha,
    useTheme,
    Tooltip,
} from '@mui/material';
import { useRecoilState } from 'recoil';
import sidebarAtom from '@/atoms/sidebar-atom';
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
const DRAWER_COLLAPSED_WIDTH = 80;

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
    const theme = useTheme();
    const pathname = usePathname();
    const { user } = useUser();
    const [sidebarState, setSidebarState] = useRecoilState(sidebarAtom);
    const isOpen = sidebarState.isOpen;
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const handleToggleSidebar = () => {
        setSidebarState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
    };

    const handleMenuClick = (menuText: string) => {
        if (!isOpen) {
            setSidebarState({ isOpen: true });
            setOpenMenus({ [menuText]: true });
            return;
        }
        setOpenMenus((prev) => ({
            ...prev,
            [menuText]: !prev[menuText],
        }));
    };

    const userInitials =
        user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'A';
    const userName =
        user?.name ||
        `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
        'Admin User';
    const userEmail = user?.email || 'admin@zwilt.com';

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: isOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED_WIDTH,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                [`& .MuiDrawer-paper`]: {
                    width: isOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED_WIDTH,
                    boxSizing: 'border-box',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.default',
                    overflowX: 'hidden',
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: isOpen ? '24px 16px' : '24px 0',
                    justifyContent: isOpen ? 'space-between' : 'center',
                    minHeight: 80,
                }}
            >
                {isOpen && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            pl: 1,
                        }}
                    >
                        <svg
                            width="34"
                            height="23"
                            viewBox="0 0 34 23"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M18.235 11.5224C18.235 16.5141 14.1852 20.5607 9.18952 20.5607C4.19384 20.5607 0.144043 16.5141 0.144043 11.5224C0.144043 6.53061 4.19384 2.484 9.18952 2.484C14.1852 2.484 18.235 6.53061 18.235 11.5224Z"
                                fill="#FFBE2E"
                            />
                            <path
                                d="M15.909 22.1101V0.93457L34 11.5224L15.909 22.1101Z"
                                fill="#FFBE2E"
                            />
                        </svg>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                letterSpacing: '-0.5px',
                            }}
                        >
                            zwilt
                        </Typography>
                    </Box>
                )}
                {!isOpen && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: DRAWER_COLLAPSED_WIDTH,
                        }}
                    >
                        <svg
                            width="34"
                            height="23"
                            viewBox="0 0 34 23"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M18.235 11.5224C18.235 16.5141 14.1852 20.5607 9.18952 20.5607C4.19384 20.5607 0.144043 16.5141 0.144043 11.5224C0.144043 6.53061 4.19384 2.484 9.18952 2.484C14.1852 2.484 18.235 6.53061 18.235 11.5224Z"
                                fill="#FFBE2E"
                            />
                            <path
                                d="M15.909 22.1101V0.93457L34 11.5224L15.909 22.1101Z"
                                fill="#FFBE2E"
                            />
                        </svg>
                    </Box>
                )}
                {isOpen && (
                    <IconButton
                        size="small"
                        onClick={handleToggleSidebar}
                        sx={{ color: 'text.secondary' }}
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                )}
            </Box>
            {!isOpen && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        pb: 2,
                    }}
                >
                    <IconButton
                        size="small"
                        onClick={handleToggleSidebar}
                        sx={{ color: 'text.secondary' }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>
            )}

            <Divider />

            <List sx={{ padding: '16px 0' }}>
                {menuItems.map((item) => (
                    <React.Fragment key={item.text}>
                        <ListItem
                            disablePadding
                            sx={{ mb: 0.5, px: isOpen ? 2 : 1 }}
                        >
                            <Tooltip
                                title={item.text}
                                placement="right"
                                disableHoverListener={isOpen}
                            >
                                <Box sx={{ width: '100%' }}>
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
                                                justifyContent: isOpen
                                                    ? 'initial'
                                                    : 'center',
                                                px: isOpen ? 2.5 : 2.5,
                                                '&.Mui-selected': {
                                                    backgroundColor: alpha(
                                                        theme.palette.primary
                                                            .main,
                                                        0.1,
                                                    ),
                                                    '&:hover': {
                                                        backgroundColor: alpha(
                                                            theme.palette
                                                                .primary.main,
                                                            0.15,
                                                        ),
                                                    },
                                                },
                                                '&:hover': {
                                                    backgroundColor:
                                                        'action.hover',
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    color:
                                                        pathname === item.path
                                                            ? 'primary.main'
                                                            : 'text.secondary',
                                                    minWidth: isOpen ? 40 : 0,
                                                    mr: isOpen ? 1 : 0,
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.text}
                                                sx={{ opacity: isOpen ? 1 : 0 }}
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
                                            {isOpen &&
                                                item.children &&
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
                                </Box>
                            </Tooltip>
                        </ListItem>
                        {isOpen && item.children && (
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
                                                                alpha(
                                                                    theme
                                                                        .palette
                                                                        .primary
                                                                        .main,
                                                                    0.1,
                                                                ),
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

            <Box
                sx={{
                    mt: 'auto',
                    padding: isOpen ? '16px' : '16px 0',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isOpen ? 2 : 0,
                    }}
                >
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: 'primary.main',
                        }}
                    >
                        {userInitials.toUpperCase()}
                    </Avatar>
                    {isOpen && (
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                                {userName}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                                sx={{ display: 'block' }}
                            >
                                {userEmail}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
