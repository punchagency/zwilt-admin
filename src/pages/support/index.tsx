import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    List,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Button,
    TextField,
    MenuItem,
    Chip,
    InputAdornment,
    IconButton,
    Tabs,
    Tab,
    Select,
    FormControl,
    InputLabel,
    Skeleton,
    Badge,
    Tooltip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MessageIcon from '@mui/icons-material/Message';
import GroupIcon from '@mui/icons-material/Group';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ForumIcon from '@mui/icons-material/Forum';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useUser } from '@/contexts/UserContext';
import { hasPermission } from '@/utils/permissions';
import { showSuccess, showError } from '@/utils/toast';
import { getSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import {
    getAdminTickets,
    getTicketDetails,
    updateTicketStatus,
    assignTicket,
    replyToTicket,
    getAdminChatSessions,
    replyToChat,
    closeChatSession,
    assignChatSession,
    getSuperAdmins,
} from '@/services/admin';

// Constants
const CATEGORIES = [
    'Account & Billing',
    'Access & Permissions',
    'Integrations',
    'Bug Report',
    'Feature Request',
    'Other',
];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

interface Ticket {
    _id: string;
    ticketId: string;
    user: {
        _id: string;
        name: string;
        email: string;
        profile_img?: string;
    };
    category: string;
    subject: string;
    message: string;
    status: string;
    priority: string;
    assignedTo?:
        | {
              _id: string;
              name: string;
              email: string;
          }
        | any;
    messages: Array<{
        senderId: string;
        senderType: 'USER' | 'ADMIN';
        message: string;
        timestamp: string;
        sender?: {
            name: string;
            email: string;
        };
    }>;
    createdAt: string;
}

interface ChatSession {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
        profile_img?: string;
        profileImg?: string;
    };
    status: string;
    assignedTo?:
        | {
              _id: string;
              name: string;
              email: string;
          }
        | any;
    messages: Array<{
        senderId: string;
        senderType: 'USER' | 'ADMIN';
        message: string;
        timestamp: string;
        sender?: {
            name: string;
            email: string;
        };
    }>;
    createdAt: string;
    updatedAt: string;
}

const SupportPage: React.FC = () => {
    const theme = useTheme() as any;
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useUser();

    // Tab switching: 0 = Tickets, 1 = Live Chats
    const [currentTab, setCurrentTab] = useState(0);

    // List of admins for assignments
    const [admins, setAdmins] = useState<any[]>([]);

    // Ticket states
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [ticketSearch, setTicketSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [ticketReplyText, setTicketReplyText] = useState('');
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Live chat states
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
    const [chatReplyText, setChatReplyText] = useState('');
    const [loadingChats, setLoadingChats] = useState(false);
    const chatSocketRef = useRef<Socket | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const ticketEndRef = useRef<HTMLDivElement>(null);

    // Fetch lists
    const fetchAdminsList = useCallback(async () => {
        try {
            const res = await getSuperAdmins(1, 100);
            if (res.success) {
                setAdmins(res.data.admins);
            }
        } catch (e) {
            console.error('Failed to load admins list', e);
        }
    }, []);

    const fetchTicketsList = useCallback(async () => {
        setLoadingTickets(true);
        try {
            const res = await getAdminTickets({
                search: ticketSearch || undefined,
                status: statusFilter || undefined,
                category: categoryFilter || undefined,
            });
            if (res.success) {
                setTickets(res.data.tickets || []);
            }
        } catch (error) {
            showError('Failed to fetch tickets');
        } finally {
            setLoadingTickets(false);
        }
    }, [ticketSearch, statusFilter, categoryFilter]);

    const fetchChatsList = useCallback(async () => {
        setLoadingChats(true);
        try {
            const res = await getAdminChatSessions({
                status: 'ACTIVE',
            });
            if (res.success) {
                setChats(res.data || []);
            }
        } catch (error) {
            showError('Failed to fetch chat sessions');
        } finally {
            setLoadingChats(false);
        }
    }, []);

    // Load initial data
    useEffect(() => {
        if (!user || !hasPermission(user, 'view_support')) return;
        fetchAdminsList();
        fetchTicketsList();
        fetchChatsList();
    }, [user, fetchAdminsList, fetchTicketsList, fetchChatsList]);

    // Handle ticket detail selection
    const handleSelectTicket = async (ticketId: string) => {
        setLoadingDetails(true);
        try {
            const res = await getTicketDetails(ticketId);
            if (res.success) {
                // Setting directly from res.data as the ticket payload is not nested inside a ticket field
                setSelectedTicket(res.data);
            }
        } catch (error) {
            showError('Failed to fetch ticket details');
        } finally {
            setLoadingDetails(false);
        }
    };

    // Update ticket fields
    const handleUpdateTicketStatus = async (status: string) => {
        if (!selectedTicket) return;
        try {
            const res = await updateTicketStatus(selectedTicket._id, {
                status,
            });
            if (res.success) {
                showSuccess(`Ticket status updated to ${status}`);
                setSelectedTicket((prev) =>
                    prev ? { ...prev, status } : null,
                );
                fetchTicketsList();
            }
        } catch (error: any) {
            showError(error.message || 'Failed to update ticket status');
        }
    };

    const handleUpdateTicketPriority = async (priority: string) => {
        if (!selectedTicket) return;
        try {
            const res = await updateTicketStatus(selectedTicket._id, {
                priority,
            });
            if (res.success) {
                showSuccess(`Ticket priority updated to ${priority}`);
                setSelectedTicket((prev) =>
                    prev ? { ...prev, priority } : null,
                );
                fetchTicketsList();
            }
        } catch (error: any) {
            showError(error.message || 'Failed to update ticket priority');
        }
    };

    const handleAssignTicket = async (assignedTo: string | null) => {
        if (!selectedTicket) return;
        try {
            const res = await assignTicket(selectedTicket._id, { assignedTo });
            if (res.success) {
                showSuccess(
                    assignedTo
                        ? 'Ticket assigned successfully'
                        : 'Ticket unassigned',
                );
                const selectedAdmin = admins.find((a) => a._id === assignedTo);
                setSelectedTicket((prev) =>
                    prev
                        ? { ...prev, assignedTo: selectedAdmin || null }
                        : null,
                );
                fetchTicketsList();
            }
        } catch (error: any) {
            showError(error.message || 'Failed to assign ticket');
        }
    };

    const handleSendTicketReply = async () => {
        if (!selectedTicket || !ticketReplyText.trim()) return;
        try {
            const res = await replyToTicket(selectedTicket._id, {
                message: ticketReplyText.trim(),
            });
            if (res.success) {
                showSuccess('Reply sent successfully');
                setTicketReplyText('');
                // Reload ticket details to show the new message
                handleSelectTicket(selectedTicket._id);
            }
        } catch (error: any) {
            showError(error.message || 'Failed to send reply');
        }
    };

    // Chat socket setup
    useEffect(() => {
        if (currentTab !== 1 || !selectedChat?._id) {
            if (chatSocketRef.current) {
                chatSocketRef.current.disconnect();
                chatSocketRef.current = null;
            }
            return;
        }

        const socket = getSocket();
        chatSocketRef.current = socket;

        const joinRoom = () => {
            socket.emit('joinSupportChat', { sessionId: selectedChat._id });
        };

        if (socket.connected) {
            joinRoom();
        }

        socket.on('connect', joinRoom);

        socket.on('supportMessageReceived', (msg: any) => {
            setSelectedChat((prev) => {
                if (prev && prev._id === selectedChat._id) {
                    if (prev.messages?.some((m: any) => m.timestamp === msg.timestamp && m.message === msg.message)) {
                        return prev;
                    }
                    return {
                        ...prev,
                        messages: [...(prev.messages || []), msg],
                    };
                }
                return prev;
            });
        });

        socket.on('supportChatUpdated', ({ sessionId, lastMessage }) => {
            setChats((prev) =>
                prev.map((c) => {
                    if (c._id === sessionId) {
                        if (c.messages?.some((m: any) => m.timestamp === lastMessage.timestamp && m.message === lastMessage.message)) {
                            return c;
                        }
                        return {
                            ...c,
                            messages: [...(c.messages || []), lastMessage],
                        };
                    }
                    return c;
                }),
            );
        });

        return () => {
            socket.disconnect();
            chatSocketRef.current = null;
        };
    }, [currentTab, selectedChat?._id]);

    // Scroll feeds to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat?.messages]);

    useEffect(() => {
        ticketEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedTicket?.messages]);

    const handleSendChatMessage = () => {
        if (!selectedChat || !chatReplyText.trim() || !chatSocketRef.current)
            return;
        chatSocketRef.current.emit('sendSupportMessage', {
            sessionId: selectedChat._id,
            message: chatReplyText.trim(),
            senderId: user?._id,
            senderType: 'ADMIN',
        });
        setChatReplyText('');
    };

    const handleCloseChat = async (chatId: string) => {
        try {
            const res = await closeChatSession(chatId);
            if (res.success) {
                showSuccess('Chat session closed successfully');
                setSelectedChat(null);
                fetchChatsList();
            }
        } catch (error: any) {
            showError(error.message || 'Failed to close chat session');
        }
    };

    const handleAssignChat = async (
        chatId: string,
        assignedTo: string | null,
    ) => {
        try {
            const res = await assignChatSession(chatId, { assignedTo });
            if (res.success) {
                showSuccess(
                    assignedTo
                        ? 'Chat assigned successfully'
                        : 'Chat unassigned',
                );
                const selectedAdmin = admins.find((a) => a._id === assignedTo);
                setSelectedChat((prev) =>
                    prev
                        ? { ...prev, assignedTo: selectedAdmin || null }
                        : null,
                );
                fetchChatsList();
            }
        } catch (error: any) {
            showError(error.message || 'Failed to assign chat session');
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'OPEN':
                return {
                    bg: alpha(theme.palette.error.main, 0.08),
                    color: theme.palette.error.main,
                    label: 'Open',
                };
            case 'IN_PROGRESS':
                return {
                    bg: alpha(theme.palette.warning.main, 0.08),
                    color: theme.palette.warning.main,
                    label: 'In Progress',
                };
            case 'RESOLVED':
                return {
                    bg: alpha(theme.palette.success.main, 0.08),
                    color: theme.palette.success.main,
                    label: 'Resolved',
                };
            case 'CLOSED':
                return {
                    bg: alpha(theme.palette.text.secondary, 0.08),
                    color: theme.palette.text.secondary,
                    label: 'Closed',
                };
            default:
                return {
                    bg: alpha(theme.palette.text.secondary, 0.08),
                    color: theme.palette.text.secondary,
                    label: status,
                };
        }
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'LOW':
                return {
                    bg: alpha(theme.palette.text.secondary, 0.1),
                    color: theme.palette.text.secondary,
                };
            case 'MEDIUM':
                return {
                    bg: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                };
            case 'HIGH':
                return {
                    bg: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main,
                };
            case 'URGENT':
                return {
                    bg: alpha(theme.palette.error.main, 0.15),
                    color: theme.palette.error.main,
                };
            default:
                return {
                    bg: alpha(theme.palette.text.secondary, 0.1),
                    color: theme.palette.text.secondary,
                };
        }
    };

    if (!user || !hasPermission(user, 'view_support')) {
        return (
            <Box
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 2,
                }}
            >
                <Paper
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '12px',
                        maxWidth: 400,
                    }}
                >
                    <Typography
                        variant="h5"
                        color="error"
                        fontWeight={700}
                        gutterBottom
                    >
                        Access Denied
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        You do not have the required permissions to view or
                        manage the Support Desk.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    const canManage = hasPermission(user, 'manage_support');

    return (
        <Box
            sx={{
                p: isMobile ? 2 : 4,
                boxSizing: 'border-box',
                height: 'calc(100vh - 100px)',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme.palette.background.default,
            }}
        >
            {/* Header section matching established style */}
            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Box>
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        fontWeight={700}
                        sx={{ color: theme.palette.text.primary, mb: 0.5 }}
                    >
                        Support Desk
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        Manage customer support tickets and real-time live chat
                        operator queue.
                    </Typography>
                </Box>
                <IconButton
                    onClick={() =>
                        currentTab === 0 ? fetchTicketsList() : fetchChatsList()
                    }
                    sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                        },
                    }}
                >
                    <RefreshIcon
                        sx={{
                            fontSize: 20,
                            color: theme.palette.text.secondary,
                        }}
                    />
                </IconButton>
            </Box>

            {/* Navigation Tabs with established indicator style */}
            <Tabs
                value={currentTab}
                onChange={(_, val) => {
                    setCurrentTab(val);
                    setSelectedTicket(null);
                    setSelectedChat(null);
                    if (val === 0) fetchTicketsList();
                    else fetchChatsList();
                }}
                sx={{
                    mb: 3,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '& .MuiTabs-indicator': {
                        height: 3,
                        backgroundColor: theme.palette.primary.main,
                    },
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: theme.palette.text.secondary,
                        '&.Mui-selected': {
                            color: theme.palette.primary.main,
                        },
                    },
                }}
            >
                <Tab
                    label="Support Tickets"
                    icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                />
                <Tab
                    label="Live Chat Queue"
                    icon={<MessageIcon sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                />
            </Tabs>

            {/* Support Tickets Tab */}
            {currentTab === 0 && (
                <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 0 }}>
                    {/* Left Panel: Search, Filter & List */}
                    <Grid
                        item
                        xs={12}
                        md={4}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            minHeight: 0,
                        }}
                    >
                        {/* Search and Filters box */}
                        <Paper
                            sx={{
                                p: 2,
                                mb: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                backgroundColor: theme.palette.background.paper,
                            }}
                        >
                            <TextField
                                size="small"
                                fullWidth
                                placeholder="Search tickets..."
                                value={ticketSearch}
                                onChange={(e) =>
                                    setTicketSearch(e.target.value)
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon
                                                sx={{
                                                    color: theme.palette.text
                                                        .secondary,
                                                    fontSize: 20,
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        Status
                                    </InputLabel>
                                    <Select
                                        value={statusFilter}
                                        label="Status"
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                    >
                                        <MenuItem value="">
                                            All Statuses
                                        </MenuItem>
                                        {STATUSES.map((s) => (
                                            <MenuItem key={s} value={s}>
                                                {s}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" fullWidth>
                                    <InputLabel
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        Category
                                    </InputLabel>
                                    <Select
                                        value={categoryFilter}
                                        label="Category"
                                        onChange={(e) =>
                                            setCategoryFilter(e.target.value)
                                        }
                                    >
                                        <MenuItem value="">
                                            All Categories
                                        </MenuItem>
                                        {CATEGORIES.map((c) => (
                                            <MenuItem key={c} value={c}>
                                                {c}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            {(ticketSearch ||
                                statusFilter ||
                                categoryFilter) && (
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={() => {
                                        setTicketSearch('');
                                        setStatusFilter('');
                                        setCategoryFilter('');
                                    }}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        color: theme.palette.primary.main,
                                        alignSelf: 'flex-end',
                                        p: 0,
                                        '&:hover': {
                                            backgroundColor: 'transparent',
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </Paper>

                        {/* Scrollable Tickets List */}
                        <Paper
                            sx={{
                                flexGrow: 1,
                                overflowY: 'auto',
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: '12px',
                                backgroundColor: theme.palette.background.paper,
                            }}
                        >
                            {loadingTickets ? (
                                <Box
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                    }}
                                >
                                    {[...Array(5)].map((_, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                p: 1,
                                            }}
                                        >
                                            <Skeleton
                                                variant="circular"
                                                width={40}
                                                height={40}
                                            />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Skeleton
                                                    variant="text"
                                                    width="60%"
                                                    height={20}
                                                />
                                                <Skeleton
                                                    variant="text"
                                                    width="40%"
                                                    height={15}
                                                />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            ) : tickets.length === 0 ? (
                                <Box sx={{ p: 6, textAlign: 'center' }}>
                                    <ForumIcon
                                        sx={{
                                            fontSize: 44,
                                            color: theme.palette.text.disabled,
                                            mb: 1.5,
                                        }}
                                    />
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: theme.palette.text.primary,
                                            fontWeight: 600,
                                        }}
                                    >
                                        No tickets found
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                        }}
                                    >
                                        Try adjusting your filters or search
                                        query.
                                    </Typography>
                                </Box>
                            ) : (
                                <List disablePadding>
                                    {tickets.map((t) => {
                                        const statusStyle = getStatusStyles(
                                            t.status,
                                        );
                                        const isSelected =
                                            selectedTicket?._id === t._id;
                                        return (
                                            <ListItemButton
                                                key={t._id}
                                                selected={isSelected}
                                                onClick={() =>
                                                    handleSelectTicket(t._id)
                                                }
                                                sx={{
                                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                                    p: 2,
                                                    transition: 'all 0.2s ease',
                                                    position: 'relative',
                                                    '&.Mui-selected': {
                                                        backgroundColor: alpha(
                                                            theme.palette
                                                                .primary.main,
                                                            0.06,
                                                        ),
                                                        '&::before': {
                                                            content: '""',
                                                            position:
                                                                'absolute',
                                                            left: 0,
                                                            top: 0,
                                                            bottom: 0,
                                                            width: '4px',
                                                            backgroundColor:
                                                                theme.palette
                                                                    .primary
                                                                    .main,
                                                            borderRadius:
                                                                '0 4px 4px 0',
                                                        },
                                                    },
                                                    '&:hover': {
                                                        backgroundColor:
                                                            theme.palette.action
                                                                .hover,
                                                    },
                                                }}
                                            >
                                                <ListItemAvatar
                                                    sx={{ minWidth: 50 }}
                                                >
                                                    <Avatar
                                                        src={
                                                            t.user?.profile_img
                                                        }
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            fontSize: '1rem',
                                                            backgroundColor:
                                                                theme.palette
                                                                    .primary
                                                                    .main,
                                                            color: theme.palette
                                                                .text.primary,
                                                        }}
                                                    >
                                                        {t.user?.name?.[0]?.toUpperCase()}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent:
                                                                    'space-between',
                                                                alignItems:
                                                                    'flex-start',
                                                                mb: 0.5,
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="subtitle2"
                                                                noWrap
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    color: theme
                                                                        .palette
                                                                        .text
                                                                        .primary,
                                                                    maxWidth:
                                                                        '160px',
                                                                }}
                                                            >
                                                                {t.subject}
                                                            </Typography>
                                                            <Chip
                                                                label={
                                                                    statusStyle.label
                                                                }
                                                                size="small"
                                                                sx={{
                                                                    height: 20,
                                                                    fontSize:
                                                                        '0.7rem',
                                                                    fontWeight: 600,
                                                                    backgroundColor:
                                                                        statusStyle.bg,
                                                                    color: statusStyle.color,
                                                                    borderRadius:
                                                                        '4px',
                                                                }}
                                                            />
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection:
                                                                    'column',
                                                                gap: 0.5,
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: theme
                                                                        .palette
                                                                        .text
                                                                        .secondary,
                                                                }}
                                                            >
                                                                {t.category} • #
                                                                {t.ticketId}
                                                            </Typography>
                                                            <Box
                                                                sx={{
                                                                    display:
                                                                        'flex',
                                                                    justifyContent:
                                                                        'space-between',
                                                                    alignItems:
                                                                        'center',
                                                                    mt: 0.5,
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        px: 1,
                                                                        py: 0.25,
                                                                        borderRadius:
                                                                            '4px',
                                                                        backgroundColor:
                                                                            getPriorityStyles(
                                                                                t.priority,
                                                                            )
                                                                                .bg,
                                                                        color: getPriorityStyles(
                                                                            t.priority,
                                                                        ).color,
                                                                        fontSize:
                                                                            '0.65rem',
                                                                    }}
                                                                >
                                                                    {t.priority}
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: theme
                                                                            .palette
                                                                            .text
                                                                            .light,
                                                                    }}
                                                                >
                                                                    {new Date(
                                                                        t.createdAt,
                                                                    ).toLocaleDateString(
                                                                        undefined,
                                                                        {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                        },
                                                                    )}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    }
                                                />
                                            </ListItemButton>
                                        );
                                    })}
                                </List>
                            )}
                        </Paper>
                    </Grid>

                    {/* Right Panel: Selected Ticket Console */}
                    <Grid
                        item
                        xs={12}
                        md={8}
                        sx={{
                            height: '100%',
                            minHeight: 0,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {loadingDetails ? (
                            <Paper
                                sx={{
                                    p: 3,
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: '12px',
                                    backgroundColor:
                                        theme.palette.background.paper,
                                }}
                            >
                                <Box sx={{ mb: 3 }}>
                                    <Skeleton
                                        variant="text"
                                        width="40%"
                                        height={32}
                                    />
                                    <Skeleton
                                        variant="text"
                                        width="20%"
                                        height={20}
                                    />
                                </Box>
                                <Skeleton
                                    variant="rectangular"
                                    height={60}
                                    sx={{ borderRadius: '8px', mb: 3 }}
                                />
                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        mb: 3,
                                    }}
                                >
                                    <Skeleton
                                        variant="rectangular"
                                        width="70%"
                                        height={80}
                                        sx={{
                                            borderRadius: '0px 12px 12px 12px',
                                        }}
                                    />
                                    <Skeleton
                                        variant="rectangular"
                                        width="50%"
                                        height={60}
                                        sx={{
                                            borderRadius: '0px 12px 12px 12px',
                                        }}
                                    />
                                    <Skeleton
                                        variant="rectangular"
                                        width="60%"
                                        height={70}
                                        sx={{
                                            alignSelf: 'flex-end',
                                            borderRadius: '12px 0px 12px 12px',
                                        }}
                                    />
                                </Box>
                                <Skeleton
                                    variant="rectangular"
                                    height={52}
                                    sx={{ borderRadius: '8px' }}
                                />
                            </Paper>
                        ) : selectedTicket ? (
                            <Paper
                                sx={{
                                    p: 3,
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: '12px',
                                    minHeight: 0,
                                    backgroundColor:
                                        theme.palette.background.paper,
                                }}
                            >
                                {/* Header / Controls Area */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        flexWrap: 'wrap',
                                        gap: 2,
                                        pb: 2,
                                        borderBottom: `1px solid ${theme.palette.divider}`,
                                        mb: 2,
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: theme.palette.text
                                                    .primary,
                                                mb: 0.5,
                                            }}
                                        >
                                            {selectedTicket.subject}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: theme.palette.text
                                                    .secondary,
                                            }}
                                        >
                                            Ticket ID: #
                                            {selectedTicket.ticketId} •
                                            Submitted:{' '}
                                            {new Date(
                                                selectedTicket.createdAt,
                                            ).toLocaleString()}
                                        </Typography>
                                    </Box>

                                    {/* Action dropdowns (gated by manage_support) */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 1.5,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <FormControl
                                            size="small"
                                            sx={{ minWidth: 120 }}
                                        >
                                            <InputLabel
                                                sx={{ fontSize: '0.8rem' }}
                                            >
                                                Status
                                            </InputLabel>
                                            <Select
                                                value={selectedTicket.status}
                                                label="Status"
                                                disabled={!canManage}
                                                onChange={(e) =>
                                                    handleUpdateTicketStatus(
                                                        e.target.value,
                                                    )
                                                }
                                                sx={{
                                                    borderRadius: '8px',
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                {STATUSES.map((s) => (
                                                    <MenuItem key={s} value={s}>
                                                        {s}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl
                                            size="small"
                                            sx={{ minWidth: 120 }}
                                        >
                                            <InputLabel
                                                sx={{ fontSize: '0.8rem' }}
                                            >
                                                Priority
                                            </InputLabel>
                                            <Select
                                                value={selectedTicket.priority}
                                                label="Priority"
                                                disabled={!canManage}
                                                onChange={(e) =>
                                                    handleUpdateTicketPriority(
                                                        e.target.value,
                                                    )
                                                }
                                                sx={{
                                                    borderRadius: '8px',
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                {PRIORITIES.map((p) => (
                                                    <MenuItem key={p} value={p}>
                                                        {p}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl
                                            size="small"
                                            sx={{ minWidth: 145 }}
                                        >
                                            <InputLabel
                                                sx={{ fontSize: '0.8rem' }}
                                            >
                                                Assignee
                                            </InputLabel>
                                            <Select
                                                value={
                                                    selectedTicket.assignedTo
                                                        ?._id || ''
                                                }
                                                label="Assignee"
                                                disabled={!canManage}
                                                onChange={(e) =>
                                                    handleAssignTicket(
                                                        e.target.value || null,
                                                    )
                                                }
                                                sx={{
                                                    borderRadius: '8px',
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                <MenuItem value="">
                                                    Unassigned
                                                </MenuItem>
                                                {admins.map((a) => (
                                                    <MenuItem
                                                        key={a._id}
                                                        value={a._id}
                                                    >
                                                        {a.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>

                                {/* User profile strip */}
                                <Paper
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        backgroundColor:
                                            theme.palette.background.default,
                                        borderRadius: '8px',
                                        border: `1px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    <Avatar
                                        src={selectedTicket.user?.profile_img}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            backgroundColor:
                                                theme.palette.primary.main,
                                            color: theme.palette.text.primary,
                                        }}
                                    >
                                        {selectedTicket.user?.name?.[0]?.toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 600,
                                                color: theme.palette.text
                                                    .primary,
                                            }}
                                        >
                                            {selectedTicket.user?.name}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: theme.palette.text
                                                    .secondary,
                                                display: 'block',
                                            }}
                                        >
                                            {selectedTicket.user?.email}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ ml: 'auto' }}>
                                        <Chip
                                            label={selectedTicket.category}
                                            size="small"
                                            sx={{
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                backgroundColor:
                                                    theme.palette.primary.main,
                                                color: theme.palette.text
                                                    .primary,
                                                borderRadius: '4px',
                                            }}
                                        />
                                    </Box>
                                </Paper>

                                {/* Conversation History Feed */}
                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        overflowY: 'auto',
                                        '&::-webkit-scrollbar': {
                                            display: 'none',
                                        },
                                        msOverflowStyle: 'none',
                                        scrollbarWidth: 'none',
                                        mb: 3,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        p: 2,
                                        backgroundColor:
                                            theme.palette.background.default,
                                        borderRadius: '8px',
                                        border: `1px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    {/* Original message */}
                                    <Box
                                        sx={{
                                            alignSelf: 'flex-start',
                                            maxWidth: '85%',
                                        }}
                                    >
                                        <Box sx={{ mb: 0.5, pl: 1 }}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: theme.palette.text
                                                        .secondary,
                                                }}
                                            >
                                                {selectedTicket.user?.name}
                                            </Typography>
                                        </Box>
                                        <Paper
                                            sx={{
                                                p: 2,
                                                backgroundColor:
                                                    theme.palette.background
                                                        .paper,
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius:
                                                    '0px 12px 12px 12px',
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: theme.palette.text
                                                        .primary,
                                                    lineHeight: 1.5,
                                                    whiteSpace: 'pre-wrap',
                                                }}
                                            >
                                                {selectedTicket.message}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: 'block',
                                                    mt: 1,
                                                    textAlign: 'right',
                                                    color: theme.palette.text
                                                        .light,
                                                    fontSize: '0.7rem',
                                                }}
                                            >
                                                {new Date(
                                                    selectedTicket.createdAt,
                                                ).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </Typography>
                                        </Paper>
                                    </Box>

                                    {/* Replies list */}
                                    {(selectedTicket.messages || []).map(
                                        (m, idx) => {
                                            const isAdmin =
                                                m.senderType === 'ADMIN';
                                            return (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        alignSelf: isAdmin
                                                            ? 'flex-end'
                                                            : 'flex-start',
                                                        maxWidth: '85%',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            mb: 0.5,
                                                            pl: 1,
                                                            pr: 1,
                                                            textAlign: isAdmin
                                                                ? 'right'
                                                                : 'left',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: theme
                                                                    .palette
                                                                    .text
                                                                    .secondary,
                                                            }}
                                                        >
                                                            {isAdmin
                                                                ? `Agent: ${
                                                                      m.sender
                                                                          ?.name ||
                                                                      'Support Desk'
                                                                  }`
                                                                : selectedTicket
                                                                      .user
                                                                      ?.name}
                                                        </Typography>
                                                    </Box>
                                                    <Paper
                                                        sx={{
                                                            p: 2,
                                                            background: isAdmin
                                                                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                                                                : theme.palette
                                                                      .background
                                                                      .paper,
                                                            color: isAdmin
                                                                ? theme.palette
                                                                      .primary
                                                                      .contrastText
                                                                : theme.palette
                                                                      .text
                                                                      .primary,
                                                            border: isAdmin
                                                                ? 'none'
                                                                : `1px solid ${theme.palette.divider}`,
                                                            borderRadius:
                                                                isAdmin
                                                                    ? '12px 0px 12px 12px'
                                                                    : '0px 12px 12px 12px',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                lineHeight: 1.5,
                                                                whiteSpace:
                                                                    'pre-wrap',
                                                            }}
                                                        >
                                                            {m.message}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                display:
                                                                    'block',
                                                                mt: 1,
                                                                textAlign:
                                                                    'right',
                                                                color: isAdmin
                                                                    ? 'rgba(255, 255, 255, 0.75)'
                                                                    : theme
                                                                          .palette
                                                                          .text
                                                                          .light,
                                                                fontSize:
                                                                    '0.7rem',
                                                            }}
                                                        >
                                                            {new Date(
                                                                m.timestamp,
                                                            ).toLocaleTimeString(
                                                                [],
                                                                {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                },
                                                            )}
                                                        </Typography>
                                                    </Paper>
                                                </Box>
                                            );
                                        },
                                    )}
                                    <div ref={ticketEndRef} />
                                </Box>

                                {/* Ticket Composer */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 1.5,
                                        alignItems: 'flex-end',
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        multiline
                                        maxRows={4}
                                        rows={2}
                                        placeholder="Type your reply here..."
                                        value={ticketReplyText}
                                        onChange={(e) =>
                                            setTicketReplyText(e.target.value)
                                        }
                                        disabled={!canManage}
                                    />
                                    <Button
                                        variant="contained"
                                        disabled={
                                            !canManage ||
                                            !ticketReplyText.trim()
                                        }
                                        onClick={handleSendTicketReply}
                                        sx={{
                                            height: 48,
                                            borderRadius: '8px',
                                            px: 3,
                                            fontWeight: 600,
                                            backgroundColor:
                                                theme.palette.primary.dark,
                                            color: theme.palette.primary
                                                .contrastText,
                                            '&:hover': {
                                                backgroundColor:
                                                    theme.palette.primary.main,
                                            },
                                            '&.Mui-disabled': {
                                                backgroundColor:
                                                    theme.palette.action
                                                        .disabledBackground,
                                                color: theme.palette.action
                                                    .disabled,
                                            },
                                        }}
                                    >
                                        <SendIcon sx={{ fontSize: 20 }} />
                                    </Button>
                                </Box>
                            </Paper>
                        ) : (
                            <Paper
                                sx={{
                                    p: 4,
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: '12px',
                                    backgroundColor:
                                        theme.palette.background.paper,
                                    textAlign: 'center',
                                }}
                            >
                                <ForumIcon
                                    sx={{
                                        fontSize: 60,
                                        color: theme.palette.text.disabled,
                                        mb: 2,
                                    }}
                                />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: theme.palette.text.primary,
                                        mb: 0.5,
                                    }}
                                >
                                    No Ticket Selected
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        maxWidth: 320,
                                    }}
                                >
                                    Select a ticket from the left sidebar to
                                    view customer profile, ticket details, and
                                    history.
                                </Typography>
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            )}

            {/* Live Chats Tab */}
            {currentTab === 1 && (
                <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 0 }}>
                    {/* Left Panel: Active Sessions */}
                    <Grid
                        item
                        xs={12}
                        md={4}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            minHeight: 0,
                        }}
                    >
                        <Paper
                            sx={{
                                p: 2,
                                mb: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: '8px',
                                backgroundColor: theme.palette.background.paper,
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Badge
                                    color="success"
                                    variant="dot"
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            height: 8,
                                            width: 8,
                                            minWidth: 'auto',
                                            borderRadius: '50%',
                                        },
                                    }}
                                />
                                Active Live Chats ({chats.length})
                            </Typography>
                        </Paper>

                        {/* Chats list */}
                        <Paper
                            sx={{
                                flexGrow: 1,
                                overflowY: 'auto',
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: '12px',
                                backgroundColor: theme.palette.background.paper,
                            }}
                        >
                            {loadingChats ? (
                                <Box
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                    }}
                                >
                                    {[...Array(4)].map((_, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                p: 1,
                                            }}
                                        >
                                            <Skeleton
                                                variant="circular"
                                                width={40}
                                                height={40}
                                            />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Skeleton
                                                    variant="text"
                                                    width="50%"
                                                    height={20}
                                                />
                                                <Skeleton
                                                    variant="text"
                                                    width="30%"
                                                    height={15}
                                                />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            ) : chats.length === 0 ? (
                                <Box sx={{ p: 6, textAlign: 'center' }}>
                                    <MessageIcon
                                        sx={{
                                            fontSize: 44,
                                            color: theme.palette.text.disabled,
                                            mb: 1.5,
                                        }}
                                    />
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: theme.palette.text.primary,
                                            fontWeight: 600,
                                        }}
                                    >
                                        No active chats
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                        }}
                                    >
                                        Clients will appear here in real-time
                                        when they start a live support session.
                                    </Typography>
                                </Box>
                            ) : (
                                <List disablePadding>
                                    {chats.map((c) => {
                                        const isSelected =
                                            selectedChat?._id === c._id;
                                        return (
                                            <ListItemButton
                                                key={c._id}
                                                selected={isSelected}
                                                onClick={() =>
                                                    setSelectedChat(c)
                                                }
                                                sx={{
                                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                                    p: 2,
                                                    position: 'relative',
                                                    '&.Mui-selected': {
                                                        backgroundColor: alpha(
                                                            theme.palette
                                                                .primary.main,
                                                            0.06,
                                                        ),
                                                        '&::before': {
                                                            content: '""',
                                                            position:
                                                                'absolute',
                                                            left: 0,
                                                            top: 0,
                                                            bottom: 0,
                                                            width: '4px',
                                                            backgroundColor:
                                                                theme.palette
                                                                    .primary
                                                                    .main,
                                                            borderRadius:
                                                                '0 4px 4px 0',
                                                        },
                                                    },
                                                }}
                                            >
                                                <ListItemAvatar
                                                    sx={{ minWidth: 50 }}
                                                >
                                                    <Avatar
                                                        src={
                                                            c.user?.profileImg || c.user?.profile_img
                                                        }
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            backgroundColor:
                                                                theme.palette
                                                                    .primary
                                                                    .main,
                                                            color: theme.palette
                                                                .text.primary,
                                                        }}
                                                    >
                                                        {c.user?.name?.[0]?.toUpperCase()}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent:
                                                                    'space-between',
                                                                alignItems:
                                                                    'center',
                                                                mb: 0.5,
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    color: theme
                                                                        .palette
                                                                        .text
                                                                        .primary,
                                                                }}
                                                            >
                                                                {c.user?.name}
                                                            </Typography>
                                                            <Chip
                                                                label="Live"
                                                                size="small"
                                                                color="success"
                                                                sx={{
                                                                    height: 16,
                                                                    fontSize:
                                                                        '0.6rem',
                                                                    fontWeight: 600,
                                                                }}
                                                            />
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                noWrap
                                                                sx={{
                                                                    color: theme
                                                                        .palette
                                                                        .text
                                                                        .secondary,
                                                                    display:
                                                                        'block',
                                                                    textOverflow:
                                                                        'ellipsis',
                                                                    overflow:
                                                                        'hidden',
                                                                    maxWidth:
                                                                        '180px',
                                                                }}
                                                            >
                                                                {c.messages?.[
                                                                    c.messages
                                                                        .length -
                                                                        1
                                                                ]?.message ||
                                                                    'No messages yet'}
                                                            </Typography>
                                                            {c.assignedTo && (
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: theme
                                                                            .palette
                                                                            .primary
                                                                            .main,
                                                                        fontWeight: 600,
                                                                        display:
                                                                            'block',
                                                                        mt: 0.5,
                                                                    }}
                                                                >
                                                                    Agent:{' '}
                                                                    {
                                                                        c
                                                                            .assignedTo
                                                                            .name
                                                                    }
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                            </ListItemButton>
                                        );
                                    })}
                                </List>
                            )}
                        </Paper>
                    </Grid>

                    {/* Right Panel: Chat console */}
                    <Grid
                        item
                        xs={12}
                        md={8}
                        sx={{
                            height: '100%',
                            minHeight: 0,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {selectedChat ? (
                            <Paper
                                sx={{
                                    p: 3,
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: '12px',
                                    minHeight: 0,
                                    backgroundColor:
                                        theme.palette.background.paper,
                                }}
                            >
                                {/* Chat Header / controls */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: 2,
                                        pb: 2,
                                        borderBottom: `1px solid ${theme.palette.divider}`,
                                        mb: 2,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                        }}
                                    >
                                        <Avatar
                                            src={selectedChat.user?.profileImg || selectedChat.user?.profile_img}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                backgroundColor:
                                                    theme.palette.primary.main,
                                                color: theme.palette.text
                                                    .primary,
                                            }}
                                        >
                                            {selectedChat.user?.name?.[0]?.toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: theme.palette.text
                                                        .primary,
                                                }}
                                            >
                                                {selectedChat.user?.name}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: theme.palette.text
                                                        .secondary,
                                                }}
                                            >
                                                {selectedChat.user?.email}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Actions */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 1.5,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <FormControl
                                            size="small"
                                            sx={{ minWidth: 140 }}
                                        >
                                            <InputLabel
                                                sx={{ fontSize: '0.8rem' }}
                                            >
                                                Assignee
                                            </InputLabel>
                                            <Select
                                                value={
                                                    selectedChat.assignedTo
                                                        ?._id || ''
                                                }
                                                label="Assignee"
                                                disabled={!canManage}
                                                onChange={(e) =>
                                                    handleAssignChat(
                                                        selectedChat._id,
                                                        e.target.value || null,
                                                    )
                                                }
                                                sx={{
                                                    borderRadius: '8px',
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                <MenuItem value="">
                                                    Unassigned
                                                </MenuItem>
                                                {admins.map((a) => (
                                                    <MenuItem
                                                        key={a._id}
                                                        value={a._id}
                                                    >
                                                        {a.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <Button
                                            variant="contained"
                                            size="small"
                                            disabled={!canManage}
                                            onClick={() =>
                                                handleCloseChat(
                                                    selectedChat._id,
                                                )
                                            }
                                            sx={{
                                                borderRadius: '8px',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                height: 38,
                                                backgroundColor:
                                                    theme.palette.error.dark,
                                                color: theme.palette.error
                                                    .contrastText,
                                                '&:hover': {
                                                    backgroundColor:
                                                        theme.palette.error
                                                            .main,
                                                },
                                                '&.Mui-disabled': {
                                                    backgroundColor:
                                                        theme.palette.action
                                                            .disabledBackground,
                                                    color: theme.palette.action
                                                        .disabled,
                                                },
                                            }}
                                        >
                                            Close Session
                                        </Button>
                                    </Box>
                                </Box>

                                {/* Chat Feed */}
                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        overflowY: 'auto',
                                        '&::-webkit-scrollbar': {
                                            display: 'none',
                                        },
                                        msOverflowStyle: 'none',
                                        scrollbarWidth: 'none',
                                        mb: 2.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        p: 2,
                                        backgroundColor:
                                            theme.palette.background.default,
                                        borderRadius: '8px',
                                        border: `1px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    {selectedChat.messages?.map((m, idx) => {
                                        const isAdmin =
                                            m.senderType === 'ADMIN';
                                        return (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    alignSelf: isAdmin
                                                        ? 'flex-end'
                                                        : 'flex-start',
                                                    maxWidth: '80%',
                                                }}
                                            >
                                                <Paper
                                                    sx={{
                                                        p: 2,
                                                        background: isAdmin
                                                            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                                                            : theme.palette
                                                                  .background
                                                                  .paper,
                                                        color: isAdmin
                                                            ? theme.palette
                                                                  .primary
                                                                  .contrastText
                                                            : theme.palette.text
                                                                  .primary,
                                                        borderRadius: isAdmin
                                                            ? '12px 12px 0px 12px'
                                                            : '12px 12px 12px 0px',
                                                        border: isAdmin
                                                            ? 'none'
                                                            : `1px solid ${theme.palette.divider}`,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            lineHeight: 1.45,
                                                        }}
                                                    >
                                                        {m.message}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            display: 'block',
                                                            mt: 0.75,
                                                            textAlign: 'right',
                                                            color: isAdmin
                                                                ? 'rgba(255,255,255,0.7)'
                                                                : theme.palette
                                                                      .text
                                                                      .light,
                                                            fontSize: '0.65rem',
                                                        }}
                                                    >
                                                        {new Date(
                                                            m.timestamp,
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}
                                                    </Typography>
                                                </Paper>
                                            </Box>
                                        );
                                    })}
                                    <div ref={chatEndRef} />
                                </Box>

                                {/* Chat composer */}
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <TextField
                                        fullWidth
                                        placeholder="Type a real-time message..."
                                        value={chatReplyText}
                                        onChange={(e) =>
                                            setChatReplyText(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' &&
                                            handleSendChatMessage()
                                        }
                                        disabled={!canManage}
                                    />
                                    <Button
                                        variant="contained"
                                        disabled={
                                            !canManage || !chatReplyText.trim()
                                        }
                                        onClick={handleSendChatMessage}
                                        sx={{
                                            borderRadius: '8px',
                                            px: 3,
                                            fontWeight: 600,
                                            backgroundColor:
                                                theme.palette.primary.dark,
                                            color: theme.palette.primary
                                                .contrastText,
                                            '&:hover': {
                                                backgroundColor:
                                                    theme.palette.primary.main,
                                            },
                                            '&.Mui-disabled': {
                                                backgroundColor:
                                                    theme.palette.action
                                                        .disabledBackground,
                                                color: theme.palette.action
                                                    .disabled,
                                            },
                                        }}
                                    >
                                        <SendIcon sx={{ fontSize: 20 }} />
                                    </Button>
                                </Box>
                            </Paper>
                        ) : (
                            <Paper
                                sx={{
                                    p: 4,
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: '12px',
                                    backgroundColor:
                                        theme.palette.background.paper,
                                    textAlign: 'center',
                                }}
                            >
                                <MessageIcon
                                    sx={{
                                        fontSize: 60,
                                        color: theme.palette.text.disabled,
                                        mb: 2,
                                    }}
                                />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: theme.palette.text.primary,
                                        mb: 0.5,
                                    }}
                                >
                                    No Chat Session Selected
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        maxWidth: 320,
                                    }}
                                >
                                    Select an active live chat from the left
                                    sidebar to chat in real time.
                                </Typography>
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default SupportPage;
