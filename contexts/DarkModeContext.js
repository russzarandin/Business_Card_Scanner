import React, { createContext, useState, useEffect, useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { Colors } from '@/constants/Colors';

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

    const themeColors = {
        background: isDarkMode ? Colors.dark.background : Colors.light.background,
        text: isDarkMode ? Colors.dark.text : Colors.light.text,
        accent: isDarkMode ? Colors.dark.accent: Colors.light.accent,
        border: isDarkMode ? Colors.dark.border : Colors.light.border,
        red: isDarkMode ? Colors.dark.red : Colors.light.red
    };

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, themeColors, useSystemTheme, toggleSystemTheme }}>
            {children}
        </DarkModeContext.Provider>
    );
};

export default DarkModeContext;