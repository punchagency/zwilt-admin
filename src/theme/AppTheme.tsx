import React, { useMemo } from 'react';
import {
    createTheme,
    ThemeProvider,
    responsiveFontSizes,
} from '@mui/material/styles';
import { useRecoilState } from 'recoil';
import themeAtom from '@/atoms/theme-atom';
import { CssBaseline } from '@mui/material';
import customTheme, { ICustomTheme } from './modes/custom-theme';
import lightMode from './modes/light-mode';
import darkMode from './modes/dark-mode';

const AppTheme: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [themeState, setThemeState] = useRecoilState(themeAtom);

    // PERSISTENCE EFFECT
    React.useEffect(() => {
        const savedTheme = localStorage.getItem('zwilt-admin-theme');
        if (savedTheme === 'dark') {
            setThemeState({ prefersDarkMode: true });
        } else if (savedTheme === 'light') {
            setThemeState({ prefersDarkMode: false });
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setThemeState({ prefersDarkMode: true });
        }
    }, [setThemeState]);

    const theme = useMemo(() => {
        const baseTheme = createTheme(customTheme) as unknown as ICustomTheme;
        const modeTheme = themeState.prefersDarkMode
            ? darkMode(baseTheme)
            : lightMode(baseTheme);
        return createTheme(baseTheme, modeTheme);
    }, [themeState.prefersDarkMode]);

    return (
        <ThemeProvider theme={responsiveFontSizes(theme)}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};

export default AppTheme;
