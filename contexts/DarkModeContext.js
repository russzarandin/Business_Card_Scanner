import React, { createContext, useState, useEffect, useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { Colors } from '@/constants/Colors';
import { CurrentRenderContext } from '@react-navigation/native';

const DarkModeContext = createContext();

export const useDarkMode = () => useContext(DarkModeContext);

export const DarkModeProvider = ({ children }) => {
    const systemTheme = useRNColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');
    const [useSystemTheme, setUseSystemTheme] = useState(true);

    useEffect(() => {
        const loadPreference = async () => {
            const storedUseSystem = await AsyncStorage.getItem('useSystemTheme');
            const storedDarkMode = await AsyncStorage.getItem('darkMode');
            if (storedUseSystem !== null) {
                setUseSystemTheme(JSON.parse(storedUseSystem));
            }
            if (storedDarkMode !== null && JSON.parse(storedUseSystem) === false) {
                setIsDarkMode(JSON.parse(storedDarkMode));
            } else {
                setIsDarkMode(systemTheme === 'dark');
            }
        };
        loadPreference();
    }, [systemTheme]);

    const toggleDarkMode = async () => {
        // When toggling, disable system override
        if (useSystemTheme) {
            setUseSystemTheme(false);
            await AsyncStorage.setItem('useSystemTheme', JSON.stringify(false));
        }
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        await AsyncStorage.setItem('darkMode', JSON.stringify(newMode));
    };

    const toggleSystemTheme = async () => {
        const newUseSystem = !useSystemTheme;
        setUseSystemTheme(newUseSystem);
        await AsyncStorage.setItem('useSystemTheme', JSON.stringify(newUseSystem));
        if (newUseSystem) {
            setIsDarkMode(systemTheme === 'dark');
        }
    };

    const currentColors = isDarkMode ? Colors.dark : Colors.light;

    const themeColors = {
        backgroundPrimary: currentColors.backgroundPrimary,
        backgroundSecondary: currentColors.backgroundSecondary,
        surface: currentColors.surface,

        textPrimary: currentColors.textPrimary,
        textSecondary: currentColors.textSecondary,

        primary: currentColors.primary,
        primaryButtonBackground: currentColors.primaryButtonBackground,
        primaryButtonText: currentColors.primaryButtonText,

        red: currentColors.red,
        yellow: currentColors.yellow,
        green: currentColors.green,

        border: currentColors.border,
        divider: currentColors.divider
    };

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, themeColors, useSystemTheme, toggleSystemTheme }}>
            {children}
        </DarkModeContext.Provider>
    );
};

export default DarkModeContext;