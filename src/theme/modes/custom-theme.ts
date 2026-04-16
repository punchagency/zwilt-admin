import { Breakpoints, Theme } from '@mui/material';
import { createTheme, alpha } from '@mui/material/styles';
import breakpoints from '../shared/breakpoints';
import customSpacing, { ICustomSpacing } from '../shared/custom-spacing';
import font from '../shared/font';
import type { IThemeFont } from '../shared/font';
import type { IThemeBreakpoints } from '../shared/breakpoints';

export interface IThemeCustoms {
    drawer: {
        widthOpen: string;
        widthClose: string;
    };
    header: {
        height: string;
    };
    font: IThemeFont;
    spacing: ICustomSpacing;
}

export interface ICustomBreakpoints extends Breakpoints {
    values: IThemeBreakpoints;
}

export interface ICustomTheme extends Theme {
    breakpoints: ICustomBreakpoints;
    customs: IThemeCustoms;
    typography: Theme['typography'];
}

const defaultTheme = createTheme();

const customTheme: ICustomTheme = {
    ...defaultTheme,
    breakpoints: {
        ...defaultTheme.breakpoints,
        values: breakpoints,
    },
    shape: {
        borderRadius: 8,
    },
    typography: {
        ...defaultTheme.typography,
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        h1: {
            ...defaultTheme.typography.h1,
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h2: {
            ...defaultTheme.typography.h2,
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h3: {
            ...defaultTheme.typography.h3,
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        h4: {
            ...defaultTheme.typography.h4,
            fontWeight: 600,
        },
        h5: {
            ...defaultTheme.typography.h5,
            fontWeight: 600,
            fontFamily: 'Inter',
        },
        h6: {
            ...defaultTheme.typography.h6,
            fontWeight: 600,
            fontFamily: 'Inter',
        },
        body1: {
            ...defaultTheme.typography.body1,
            fontFamily: 'Inter',
            lineHeight: 1.6,
        },
        body2: {
            ...defaultTheme.typography.body2,
            fontFamily: 'Inter',
            lineHeight: 1.6,
        },
        button: {
            ...defaultTheme.typography.button,
            fontWeight: 600,
            textTransform: 'none',
            letterSpacing: '0.02em',
        },
    },
    components: {
        ...defaultTheme.components,
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    overflow: 'auto',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                    },
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                },
                outlined: {
                    borderWidth: '2px',
                    '&:hover': {
                        borderWidth: '2px',
                    },
                },
                sizeSmall: {
                    padding: '6px 16px',
                    fontSize: '0.8125rem',
                },
                sizeLarge: {
                    padding: '14px 32px',
                    fontSize: '1rem',
                },
            },
        },
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true,
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow:
                        '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
                    transition: 'box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow:
                            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    },
                },
            },
        },
        MuiPaper: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow:
                        '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
                },
                elevation2: {
                    boxShadow:
                        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
                elevation3: {
                    boxShadow:
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 15,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            borderColor: 'rgba(80, 88, 159, 0.5)',
                        },
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 15,
                },
                input: {
                    padding: '14px 16px',
                },
                notchedOutline: {
                    transition: 'all 0.2s ease-in-out',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                },
                head: {
                    fontWeight: 600,
                    backgroundColor: 'rgba(80, 88, 159, 0.04)',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:last-child td': {
                        borderBottom: 'none',
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(80, 88, 159, 0.02)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    borderRadius: '6px',
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        backgroundColor: 'rgba(80, 88, 159, 0.08)',
                    },
                },
            },
        },
        MuiDialog: {
            defaultProps: {
                PaperProps: {
                    elevation: 3,
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                },
            },
        },
        MuiAppBar: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.08)',
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    minWidth: '40px',
                },
            },
        },
        MuiListItemText: {
            styleOverrides: {
                primary: {
                    fontWeight: 500,
                },
            },
        },
        MuiBadge: {
            styleOverrides: {
                badge: {
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 4px',
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderRadius: '6px',
                    padding: '6px 12px',
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    margin: '16px 0',
                },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    textDecoration: 'none',
                    transition: 'color 0.2s ease-in-out',
                    '&:hover': {
                        textDecoration: 'underline',
                    },
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                root: {
                    padding: '9px 13px 9px 19px',
                },
                switchBase: {
                    '&.Mui-checked': {
                        transform: 'translateX(13px)',
                        color: '#fff',
                        '& + .MuiSwitch-track': {
                            opacity: 1,
                        },
                    },
                },
                thumb: {
                    width: '14px',
                    height: '14px',
                },
                track: {
                    borderRadius: '4px',
                    opacity: 1,
                },
            },
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    height: '6px',
                },
                thumb: {
                    width: '18px',
                    height: '18px',
                },
                track: {
                    border: 'none',
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    height: '3px',
                    borderRadius: '3px 3px 0 0',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    minHeight: '48px',
                    transition: 'all 0.2s ease-in-out',
                },
            },
        },
        MuiSkeleton: {
            defaultProps: {
                animation: 'wave',
            },
            styleOverrides: {
                root: {
                    borderRadius: 4,
                },
                rounded: {
                    borderRadius: 8,
                },
                text: {
                    borderRadius: 4,
                },
                pulse: {
                    opacity: 1,
                },
            },
        },
    },
    customs: {
        drawer: {
            widthOpen: customSpacing.rem(27),
            widthClose: customSpacing.rem(8.1),
        },
        header: {
            height: customSpacing.rem(8),
        },
        spacing: customSpacing,
        font,
    },
};

export default customTheme;
