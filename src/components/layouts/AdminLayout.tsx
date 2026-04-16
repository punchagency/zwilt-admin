import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import { useRecoilValue } from 'recoil';
import sidebarAtom from '@/atoms/sidebar-atom';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumbs?: { label: string; href?: string }[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
    children,
    title,
    breadcrumbs,
}) => {
    const sidebarState = useRecoilValue(sidebarAtom);
    const isOpen = sidebarState.isOpen;
    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                backgroundColor: 'background.default',
                overflow: 'hidden',
            }}
        >
            <Sidebar />
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    overflow: 'hidden',
                    transition: (theme) =>
                        theme.transitions.create('margin', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                }}
            >
                <Header title={title || 'Admin'} breadcrumbs={breadcrumbs} />
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        padding: '32px',
                        overflow: 'auto',
                        minWidth: 0,
                        width: '100%',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default AdminLayout;
