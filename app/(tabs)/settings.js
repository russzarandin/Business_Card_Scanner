import React, { useContext } from 'react';
import { View, Switch, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useDarkMode } from '@/contexts/DarkModeContext';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { AuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import AvatarDisplay from '@/components/AvatarSource';

export default function SettingsScreen() {
  const { isDarkMode, toggleDarkMode, useSystemTheme, toggleSystemTheme, themeColors } = useDarkMode();
  const { user, signOut } = useContext(AuthContext);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/LoginScreen');
    } catch (error) {
      Alert.alert('Error signing out', error.message);
    }
  }

  const handleEditAvatar = () => {
    router.push('/auth/AvatarCreator');
  }

  return (
    <ParallaxScrollView headerBackgroundColor={ themeColors.background }>
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

        {user ? (
          <>
            <View style={styles.userInfo}>
              <ThemedText style={{ color: themeColors.text }} type='subtitle'>
                Welcome, {user.displayName ? user.displayName : user.email}
              </ThemedText>

              <TouchableOpacity onPress={handleEditAvatar}>
                {user.photoURL ? (
                  <AvatarDisplay uri={ user.photoURL } style={styles.avatar} />
                ) : (
                  <AvatarDisplay source={require('@/assets/images/placeholder.png')} style={styles.avatar} />
                )}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={[styles.signOutButton, { backgroundColor: themeColors.red }]} onPress={handleSignOut}>
              <ThemedText style={{ color: themeColors.text }} type='button'>Sign Out</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.authButton, { backgroundColor: themeColors.accent }]} onPress={() => router.push('/auth/AccountSharingScreen')}>
              <ThemedText style={{ color: themeColors.text }} type='button'>
                Display account information
              </ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={[styles.authButton, { backgroundColor: themeColors.accent }]} onPress={() => router.push('/auth/LoginScreen')}>
              <ThemedText style={{ color: themeColors.text }} type='button'>
                Login
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.authButton, { backgroundColor: themeColors.accent }]} onPress={() => router.push('/auth/RegisterScreen')}>
              <ThemedText style={{ color: themeColors.text }} type='button'>
                Register
              </ThemedText>
            </TouchableOpacity>
          </>
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
  },
  userInfo: {
    marginVertical: 20,
    alignItems: 'center'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 10
  },
  signOutButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 'center',
    marginTop: 20
  },
  authButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    alignSelf: 'center'
  }
});