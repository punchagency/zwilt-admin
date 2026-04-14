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

const darkMode = (theme: ICustomTheme) => ({
    ...theme,
    palette: {
        ...theme.palette,
        mode: 'dark',
        background: {
            ...theme.palette.background,
            default: '#1A1A1A',
            paper: '#2B2A2F',
            secondary: '#343434',
        },
        text: {
            ...theme.palette.text,
            primary: '#FFFFFF',
            secondary: '#B0B0B0',
            light: '#909090',
            disabled: 'rgba(255, 255, 255, 0.38)',
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
            dark: '#E8E8E8',
            text: '#FFFFFF',
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
        divider: 'rgba(255, 255, 255, 0.08)',
        action: {
            ...theme.palette.action,
            active: 'rgba(255, 255, 255, 0.54)',
            hover: 'rgba(255, 255, 255, 0.04)',
            selected: 'rgba(255, 255, 255, 0.08)',
            disabled: 'rgba(255, 255, 255, 0.38)',
            disabledBackground: 'rgba(255, 255, 255, 0.22)',
            focus: 'rgba(255, 255, 255, 0.12)',
        },
        skeleton: {
            bg: 'rgba(255, 255, 255, 0.18)',
            bgGradient: 'linear-gradient(90deg, rgba(255, 255, 255, 0.0), rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.0))',
        },
    },
    shadows: [
        'none',
        '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        ...Array(19).fill('none'),
    ],
});

export default darkMode;
