import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Switch, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getUserAvatar, updateUserAvatar } from '@/services/userService';
import { defaultAvatarOptions, generateAvatar } from '@/config/avatarConfig';
import DisplayAvatar from '@/components/DisplayAvatar';

export default function SettingsScreen() {
	const { isDarkMode, toggleDarkMode, useSystemTheme, toggleSystemTheme, themeColors } = useDarkMode();
	const { user, signOut } = useContext(AuthContext);
	const router = useRouter();
	const [avatarUri, setAvatarUri] = useState(null);

	const fetchAvatar = useCallback(async () => {
		if (!user?.uid) return;

		try {
			// Fetch the avatar URL from Firestore
			const customAvatar = await getUserAvatar(user.uid);

			if (customAvatar) {
				setAvatarUri(customAvatar);
			} else {
				const avatarUrl = generateAvatar({
					...defaultAvatarOptions(),
					seed: user.uid || 'default'
				});

				setAvatarUri(avatarUrl);

				await updateUserAvatar(user.uid, avatarUrl);
			}

		} catch (error) {
			console.error('Error fetching avatar:', error);
			setAvatarUri(generateAvatar(defaultAvatarOptions()));
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

	const handleEditAvatar = () => {
		router.push('/auth/AvatarCreatorScreen');
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundPrimary }]}>
			<ThemedText style={{ color: themeColors.textPrimary, marginBottom: 10 }} type='title'>Settings</ThemedText>
			<ThemedText style={{ color: themeColors.textPrimary }} type='subtitle'>Theme Settings</ThemedText>

			<View style={styles.settingItem}>
				<ThemedText style={{ color: themeColors.textPrimary }}>Use System Theme</ThemedText>
				<Switch value={useSystemTheme} onValueChange={toggleSystemTheme} />
			</View>

			{!useSystemTheme && (
				<View style={styles.settingItem}>
					<ThemedText style={{ color: themeColors.textPrimary }}>Dark Mode</ThemedText>
					<Switch value={isDarkMode} onValueChange={toggleDarkMode} />
				</View>
			)}

			{user ? (
				<>
					<View style={styles.userInfo}>
						<ThemedText style={{ color: themeColors.textPrimary }} type='subtitle'>
							Welcome, {user.displayName ? user.displayName : user.email}
						</ThemedText>

						<TouchableOpacity onPress={handleEditAvatar}>
							<DisplayAvatar
								uri={avatarUri}
								style={[styles.avatar, { borderColor: themeColors.textPrimary }]}
								themeColors={themeColors}
							/>
						</TouchableOpacity>
					</View>
					
					<TouchableOpacity style={[styles.button, { backgroundColor: themeColors.red }]} onPress={handleSignOut}>
						<ThemedText style={{ color: themeColors.textPrimary }} type='button'>Sign Out</ThemedText>
					</TouchableOpacity>

					<TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary }]} onPress={() => router.push('/auth/AccountSharingScreen')}>
						<ThemedText style={{ color: themeColors.textPrimary }} type='button'>Display account information</ThemedText>
					</TouchableOpacity>
				</>
			) : (
				<>
					<TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary }]} onPress={() => router.push('/auth/LoginScreen')}>
						<ThemedText style={{ color: themeColors.text }} type='button'>
							Login
						</ThemedText>
					</TouchableOpacity>

					<TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary }]} onPress={() => router.push('/auth/RegisterScreen')}>
						<ThemedText style={{ color: themeColors.text }} type='button'>
							Register
						</ThemedText>
					</TouchableOpacity>
				</>
			)}
		</SafeAreaView>
	);
};

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
		width: 150,
		height: 150,
		borderWidth: 2,
		borderRadius: 75,
		overflow: 'hidden',
		padding: 10
	},
	button: {
		paddingVertical: 12,
		paddingHorizontal: 25,
		borderRadius: 'center',
		marginTop: 20,
		borderRadius: 15,
		alignItems: 'center'
	}
});