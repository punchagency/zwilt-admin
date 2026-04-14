import { Palette, TypeText, PaletteColor } from '@mui/material';
import type { ICustomTheme } from './custom-theme';

interface IThemeText extends TypeText {
    secondary: string;
    light: string;
}

interface IThemePaletteColor extends PaletteColor {
    text: string;
}

export interface IThemePalette extends Palette {
    background: {
        default: string;
        paper: string;
        secondary: string;
    };
    text: IThemeText;
    primary: IThemePaletteColor;
    secondary: IThemePaletteColor;
    tertiary: {
        main: string;
        dark: string;
        text: string;
    };
}

const lightMode = (theme: ICustomTheme) => ({
    ...theme,
    palette: {
        ...theme.palette,
        mode: 'light',
        background: {
            ...theme.palette.background,
            default: '#F8F9FA',
            paper: '#FFFFFF',
            secondary: '#F5F5F5',
        },
        text: {
            ...theme.palette.text,
            primary: '#2B2A2F',
            secondary: '#6B7280',
            light: '#7A7F8F',
            disabled: 'rgba(43, 42, 47, 0.38)',
        },
        primary: {
            ...theme.palette.primary,
            main: '#50589F',
            light: '#92A7E9',
            dark: '#3D4378',
            contrastText: '#FFFFFF',
            text: '#FFFFFF',
        },
        secondary: {
            ...theme.palette.secondary,
            main: '#FFBE2E',
            light: '#F9D77A',
            dark: '#D49A1F',
            contrastText: '#2B2A2F',
            text: '#2B2A2F',
        },
        tertiary: {
            main: '#DEE1EB',
            dark: '#292B34',
            text: '#2B2A2F',
        },
        error: {
            main: '#EF4444',
            light: '#F87171',
            dark: '#DC2626',
            contrastText: '#FFFFFF',
        },
        warning: {
            main: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706',
            contrastText: '#FFFFFF',
        },
        info: {
            main: '#3B82F6',
            light: '#60A5FA',
            dark: '#2563EB',
            contrastText: '#FFFFFF',
        },
        success: {
            main: '#10B981',
            light: '#34D399',
            dark: '#059669',
            contrastText: '#FFFFFF',
        },
        divider: 'rgba(43, 42, 47, 0.08)',
        action: {
            ...theme.palette.action,
            active: 'rgba(43, 42, 47, 0.54)',
            hover: 'rgba(43, 42, 47, 0.04)',
            selected: 'rgba(43, 42, 47, 0.08)',
            disabled: 'rgba(43, 42, 47, 0.38)',
            disabledBackground: 'rgba(43, 42, 47, 0.25)',
            focus: 'rgba(43, 42, 47, 0.12)',
        },
        skeleton: {
            bg: 'rgba(43, 42, 47, 0.22)',
            bgGradient: 'linear-gradient(90deg, rgba(255, 255, 255, 0.0), rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.0))',
        },
    },
    shadows: [
        'none',
        '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        ...Array(19).fill('none'),
    ],
});

export default lightMode;
