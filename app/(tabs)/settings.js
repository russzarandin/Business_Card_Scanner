import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import DisplayAvatar from '@/components/DisplayAvatar';
import { getUserAvatar } from '@/services/userService';
import dataUri, { generateAvatar, defaultAvatarOptions } from '@/config/avatarConfig';

export default function SettingsScreen() {
  const { isDarkMode, toggleDarkMode, useSystemTheme, toggleSystemTheme, themeColors } = useDarkMode();
  const { user, signOut } = useContext(AuthContext);
  const router = useRouter();
  const [avatarUri, setAvatarUri] = useState(null);

  const fetchAvatar = useCallback(async () => {
    if (!user?.uid) return;
    try {
      let avatarUrl = await getUserAvatar(user.uid);
      if (!avatarUrl) {
        const options = { seed: user.uid || 'default' };
        avatarUrl = defaultAvatarOptions()
      }
      setAvatarUri(avatarUrl);
    } catch (error) {
      console.error('Error fetching avatar:', error);
    }
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      fetchAvatar();
    }, [fetchAvatar])
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/LoginScreen');
    } catch (error) {
      Alert.alert('Error signing out', error.message);
    }
  };

  const handleEditAvatar = () =>  {
    router.push('/auth/AvatarCreatorScreen');
  };

  return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
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
                {avatarUri ? (
                  <DisplayAvatar uri={avatarUri} style={[styles.avatar, { borderColor: themeColors.text, color: themeColors.text }]} />
                ) : ( 
                  <DisplayAvatar source={require('@/assets/images/placeholder.png')} style={[styles.avatar, { borderColor: themeColors.text, tintColor: themeColors.text }]} />
                )}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={[styles.signOutButton, { backgroundColor: themeColors.red }]} onPress={handleSignOut}>
              <ThemedText style={{ color: themeColors.text }} type='button'>Sign Out</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.authButton, { backgroundColor: themeColors.accent }]} onPress={() => router.push('/auth/AccountSharingScreen')}>
              <ThemedText style={{ color: themeColors.text }} type='button'>Display account information</ThemedText>
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
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginVertical: 20,
    marginHorizontal: 10
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
    width: 150,
    height: 150,
    borderRadius: 150,
    borderWidth: 2,
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