/**
 * @fileoverview This file represents the main navigation bar
 */

import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const { themeColors } = useDarkMode();
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].primary,
				headerShown: false,
				tabBarStyle: Platform.select({
					ios: {
						// Use a transparent background on iOS to show the blur effect
						position: "absolute",
					},
					default: {},
				}),
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="house.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="BusinessCardsScreen"
				options={{
					title: "Scanned cards",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="folder.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="person.fill" color={color} />
					),
				}}
			/>
		</Tabs>
  );
}
