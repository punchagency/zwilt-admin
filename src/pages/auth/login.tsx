import React, { useState } from 'react';
import {
    Box,
    Stack,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Alert,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMutation } from '@apollo/client';
import { LOGIN } from '@/graphql/auth';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';
import themeAtom from '@/atoms/theme-atom';
import AppTheme from '@/theme/AppTheme';

type LoginStep = 'email' | 'password';

const Login: React.FC = () => {
    const router = useRouter();
    const themeState = useRecoilValue(themeAtom);
    const [step, setStep] = useState<LoginStep>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [debugLogs, setDebugLogs] = useState<string>('');
    const [backHovered, setBackHovered] = useState(false);

    // Show debug logs from localStorage (survives redirects)
    React.useEffect(() => {
        const logs = localStorage.getItem('auth-debug-logs');
        if (logs) {
            try {
                const parsed = JSON.parse(logs);
                const formatted = parsed
                    .map(
                        (l: any) =>
                            `${new Date(l.time).toLocaleTimeString()} - ${
                                l.msg
                            } ${l.data ? JSON.stringify(l.data) : ''}`,
                    )
                    .join('\n');
                setDebugLogs(formatted);
            } catch (e) {
                setDebugLogs(logs);
            }
        }
    }, []);

    const [loginMutation, { loading }] = useMutation(LOGIN, {
        onCompleted: (data: any) => {
            console.log('[Login] Mutation completed:', data);

            if (!data.login?.success) {
                console.log('[Login] Login failed:', data.login?.message);
                setError(data.login?.message || 'Login failed');
                return;
            }

            console.log(
                '[Login] ✅ Login successful, redirecting with window.location.href',
            );
            console.log(
                '[Login] Cookies should be set. Current cookies:',
                document.cookie,
            );

            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        },
        onError: (err: Error) => {
            console.error('[Login] Mutation error:', err);
            setError(err.message || 'Login failed');
        },
    });

    const handleEmailContinue = async () => {
        setError('');
        if (email.trim()) {
            setEmail(email.toLowerCase());
            setStep('password');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        await loginMutation({
            variables: {
                loginInput: {
                    email,
                    password,
                    rememberMe,
                },
            },
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (step === 'email') {
                handleEmailContinue();
            }
        }
    };

    const ZwiltLogo = () => (
        <svg
            width="100"
            height="24"
            viewBox="0 0 100 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100px', height: '24px' }}
        >
            <path
                d="M0.877563 21.6416V18.7327L5.14744 13.4969H1.20813V8.84278H12.3098V11.7516L8.03994 16.9875H12.6404V21.6416H0.877563Z"
                fill="currentColor"
            />
            <path
                d="M17.3058 21.6416L12.5676 8.84278H19.2893L20.7217 14.4568L22.6776 8.84278H25.1844L27.1403 14.4568L28.5728 8.84278H35.2944L30.5562 21.6416H25.3497L23.9448 17.7147L22.5123 21.6416H17.3058Z"
                fill="currentColor"
            />
            <path
                d="M41.603 5.32312C40.9786 5.88549 40.1797 6.16668 39.2064 6.16668C38.233 6.16668 37.4342 5.88549 36.8097 5.32312C36.1853 4.74136 35.8731 3.99477 35.8731 3.08334C35.8731 2.17191 36.1853 1.43501 36.8097 0.872642C37.4342 0.290881 38.233 0 39.2064 0C40.1797 0 40.9786 0.290881 41.603 0.872642C42.2274 1.43501 42.5396 2.17191 42.5396 3.08334C42.5396 3.99477 42.2274 4.74136 41.603 5.32312ZM36.1211 21.6416V8.84278H42.3193V21.6416H36.1211Z"
                fill="currentColor"
            />
            <path
                d="M49.7203 21.6416C47.9756 21.6416 46.5982 21.1083 45.5882 20.0417C44.5965 18.9751 44.1006 17.511 44.1006 15.6494V0.116353H50.2988V15.4749C50.2988 15.9791 50.3998 16.3766 50.6018 16.6675C50.8222 16.939 51.1069 17.0747 51.4558 17.0747H51.9792L51.5936 21.6416H49.7203Z"
                fill="currentColor"
            />
            <path
                d="M62.6673 17.0456L63.7967 20.7398C62.5662 21.6706 61.2623 22.136 59.8849 22.136C57.9199 22.136 56.368 21.564 55.2294 20.4198C54.1091 19.2757 53.549 17.705 53.549 15.7076V13.4969H52.0063V8.84278H54.0449L54.2652 4.36321H59.7472V8.84278H62.8601V13.4969H59.7472V15.7076C59.7472 16.2699 59.8574 16.716 60.0778 17.0456C60.3165 17.3559 60.6379 17.511 61.0419 17.511C61.4827 17.511 62.0245 17.3559 62.6673 17.0456Z"
                fill="currentColor"
            />
            <path
                d="M85.1685 14.6296C85.1685 19.0481 81.584 22.6299 77.1621 22.6299C72.7403 22.6299 69.1558 19.0481 69.1558 14.6296C69.1558 10.2112 72.7403 6.62929 77.1621 6.62929C81.584 6.62929 85.1685 10.2112 85.1685 14.6296Z"
                fill="#FFBE2E"
            />
            <path
                d="M83.1097 24.0014V5.25781L99.1225 14.6296L83.1097 24.0014Z"
                fill="#FFBE2E"
            />
        </svg>
    );

    const EmailStep = () => (
        <Stack
            sx={{
                gap: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
            }}
        >
            <Stack
                sx={{
                    gap: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                }}
            >
                <Typography
                    sx={{
                        fontSize: { xs: '28px', md: '34px', lg: '42px' },
                        fontWeight: 600,
                        lineHeight: { xs: '34px', md: '40px', lg: '50.4px' },
                        color: 'text.primary',
                    }}
                >
                    Welcome Back!
                </Typography>
                <Typography
                    sx={{
                        fontSize: { xs: '14px', md: '15px', lg: '16px' },
                        fontWeight: 500,
                        lineHeight: { xs: '20px', md: '22px', lg: '24px' },
                        color: 'text.secondary',
                        maxWidth: '400px',
                    }}
                >
                    Sign in with Zwilt to access all Zwilt apps seamlessly.
                </Typography>
            </Stack>

            <Stack
                sx={{
                    gap: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '580px',
                }}
            >
                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter email here"
                    required
                    autoComplete="email"
                />
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleEmailContinue}
                    disabled={!email.trim()}
                    sx={{
                        textTransform: 'none',
                        borderRadius: '15px',
                        py: 1.75,
                        fontSize: '16px',
                        fontWeight: 600,
                        backgroundColor: 'primary.main',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        },
                        '&:disabled': {
                            backgroundColor: '#C0C4D6',
                        },
                    }}
                >
                    Continue
                </Button>
            </Stack>
        </Stack>
    );

    const PasswordStep = () => (
        <Stack
            sx={{
                gap: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
            }}
        >
            <Stack
                sx={{
                    gap: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                }}
            >
                <Typography
                    sx={{
                        fontSize: { xs: '28px', md: '34px', lg: '42px' },
                        fontWeight: 600,
                        lineHeight: { xs: '34px', md: '40px', lg: '50.4px' },
                        color: 'text.primary',
                    }}
                >
                    Welcome Back!
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 3,
                        py: 1.5,
                        backgroundColor: 'background.secondary',
                        borderRadius: '12px',
                    }}
                >
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: '#50589F',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#fff',
                            }}
                        >
                            {email.charAt(0).toUpperCase()}
                        </Typography>
                    </Box>
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'text.primary',
                        }}
                    >
                        {email}
                    </Typography>
                </Box>
            </Stack>

            <Stack
                sx={{
                    gap: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '580px',
                }}
            >
                <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && password.trim()) {
                            handleSubmit(e);
                        }
                    }}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    edge="end"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    {showPassword ? (
                                        <VisibilityOff />
                                    ) : (
                                        <Visibility />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                    sx={{ gap: { xs: 2, sm: 3 } }}
                >
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={rememberMe}
                                onChange={(e) =>
                                    setRememberMe(e.target.checked)
                                }
                                sx={{
                                    color: themeState.prefersDarkMode
                                        ? 'primary.light'
                                        : 'primary.main',
                                    '&.Mui-checked': {
                                        color: themeState.prefersDarkMode
                                            ? 'primary.light'
                                            : 'primary.main',
                                    },
                                    '& .MuiSvgIcon-root': {
                                        fontSize: '1.2rem',
                                    },
                                }}
                            />
                        }
                        label={
                            <Typography
                                sx={{
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    lineHeight: '40.1px',
                                    color: 'text.secondary',
                                }}
                            >
                                Remember me
                            </Typography>
                        }
                    />
                    <Typography
                        sx={{
                            fontSize: '16px',
                            fontWeight: 600,
                            lineHeight: '36.1px',
                            color: 'primary.main',
                            cursor: 'pointer',
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        }}
                        onClick={() => router.push('/auth/forgot-password')}
                    >
                        Forgot password?
                    </Typography>
                </Stack>

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit as any}
                    disabled={loading || !password.trim()}
                    sx={{
                        textTransform: 'none',
                        borderRadius: '15px',
                        py: 1.75,
                        fontSize: '16px',
                        fontWeight: 600,
                        backgroundColor: '#50589F',
                        '&:hover': {
                            backgroundColor: '#3D4378',
                        },
                        '&:disabled': {
                            backgroundColor: '#C0C4D6',
                        },
                    }}
                >
                    {loading ? 'Loading....' : 'Login'}
                </Button>
            </Stack>
        </Stack>
    );

    return (
        <AppTheme>
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'background.default',
                    padding: 2,
                    fontFamily:
                        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        backgroundColor: 'background.paper',
                        borderRadius: { xs: '20px', md: '24px', lg: '30px' },
                        pt: { xs: '40px', md: '50px' },
                        px: { xs: '20px', md: '60px', lg: '114px' },
                        height: { xs: '600px', md: '680px', lg: '700px' },
                        width: { xs: '90%', md: '700px', lg: '808px' },
                        maxWidth: { xs: '90%', md: '80%', lg: '80%' },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Stack
                        sx={{
                            gap: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                        }}
                    >
                        <ZwiltLogo />

                        {error && (
                            <Alert
                                severity="error"
                                sx={{ width: '100%', maxWidth: '580px' }}
                            >
                                {error}
                            </Alert>
                        )}

                        {step === 'email' ? <EmailStep /> : <PasswordStep />}
                    </Stack>

                    {step === 'password' && (
                        <Stack
                            onMouseEnter={() => setBackHovered(true)}
                            onMouseLeave={() => setBackHovered(false)}
                            direction="row"
                            sx={{
                                position: 'absolute',
                                bottom: '2rem',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                '&:hover': {
                                    color: '#282833',
                                },
                            }}
                            onClick={() => {
                                setStep('email');
                                setPassword('');
                                setError('');
                            }}
                        >
                            <ArrowBackIcon
                                sx={{
                                    fontSize: '18px',
                                    color: backHovered ? '#282833' : '#6F6F76',
                                    transition: 'color 0.2s',
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    lineHeight: '19.2px',
                                    color: backHovered
                                        ? 'text.primary'
                                        : 'text.secondary',
                                    transition: 'color 0.2s',
                                }}
                            >
                                Go Back
                            </Typography>
                        </Stack>
                    )}
                </Box>
            </Box>
        </AppTheme>
    );
};

(Login as any).requireAuth = false;
(Login as any).getLayout = (page: React.ReactElement) => page;

export default Login;
