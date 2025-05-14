import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkModeProvider } from '../contexts/DarkModeContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
	SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	useEffect(() => {
		const handleDeepLink = ({ url }) => {
			const { path, queryParams } = Linking.parse(url);
			console.log('Deep link received:', path, queryParams);

			if (path === 'profile' && queryParams.userId) {
				console.log('Navigating to profile:', queryParams.userId);
			}
		};

		const subscription = Linking.addEventListener('url', handleDeepLink)

		Linking.getInitialURL().then(url => {
			if (url) {
				handleDeepLink({ url });
			}
		});

		return () => {
			subscription.remove();
		};
	}, []);

	if (!loaded) {
		return null;
	}

	return (
		<DarkModeProvider>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<AuthProvider>
					<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme }>
						<Stack>
							<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
							<Stack.Screen name="+not-found" />
							<Stack.Screen
								name='profile/[userId]'
								options={{
									title: 'Profile',
									presentation: 'modal'
								}}
							/>
						</Stack>
						<StatusBar style="auto" />
					</ThemeProvider>
				</AuthProvider>
			</GestureHandlerRootView>
		</DarkModeProvider>
	);
};
