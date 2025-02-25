import React from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useDarkMode } from '../contexts/DarkModeContext';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function AccountScreen() {
  const { isDarkMode, toggleDarkMode, useSystemTheme, toggleSystemTheme, themeColors } = useDarkMode();

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>
      <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ThemedText style={{ color: themeColors.text }} type='title'>Settings</ThemedText>
        <ThemedText style={{ color: themeColors.text }} type='subtitle'>Theme Settings</ThemedText>

        <View style={styles.settingItem}>
          <ThemedText style={{ color: themeColors.text }}>Use System Theme</ThemedText>
          <Switch value={useSystemTheme} onValueChange={toggleSystemTheme} />
        </View>

        {!useSystemTheme && (
          <View style={styles.settingItem}>
            <ThemedText style={{ color: themeColors.text }}>Dark Mode</ThemedText>
            <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
          </View>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: '15'
  }
});