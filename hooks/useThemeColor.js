/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useDarkMode } from '@/app/contexts/DarkModeContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useThemeColor(props, colorName) {
  const { isDarkMode } = useDarkMode();

  const systemTheme = useRNColorScheme();
  const theme = typeof isDarkMode === 'boolean' ? (isDarkMode ? 'dark' : 'light') : (systemTheme || 'light'); 
  
  return props[theme] || Colors[theme][colorName];
}
