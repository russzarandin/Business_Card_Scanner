/**
 * @fileoverview file responsible for displaying the Avatar creator screen 
 */

import React, { useState, useContext, useEffect } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/contexts/AuthContext';
import { getUserAvatar, updateUserAvatar } from '@/services/userService';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { defaultAvatarOptions, generateAvatar, parseAvatarUrl } from '@/config/avatarConfig';
import AvatarCustomiser from '@/components/AvatarCustomiser';
import DisplayAvatar from '@/components/DisplayAvatar';

export default function AvatarCreatorScreen() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const { themeColors } = useDarkMode();
    
    const [options, setOptions] = useState(defaultAvatarOptions());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserAvatar = async () => {
            if (!user?.uid) return;

            try {
                const avatarUrl = await getUserAvatar(user.uid);

                if (avatarUrl) {
                    const currentOptions = parseAvatarUrl(avatarUrl);
                    setOptions(currentOptions);
                } else {
                    setOptions(defaultAvatarOptions());
                }
            } catch (error) {
                console.error('Error fetching avatar:', error);
                setOptions(defaultAvatarOptions());
            } finally {
                setLoading(false);
            }
        };

        fetchUserAvatar();
    }, [user?.uid]);

    const generateRandomSeed = () => {
        setOptions(prev => ({
            ...prev,
            seed: Math.random().toString(36).substring(2, 10)
        }));
    };

    const handleSaveAvatar = async () => {
        if (!user?.uid) return;
        try {
            const avatarUrl = generateAvatar(options);
            await updateUserAvatar(user.uid, avatarUrl);
            router.back()
        } catch (error) {
            Alert.alert('Error', 'Failed to update avatar');
            console.error('Avatar update error:', error);
        }
    };

    if (loading || !options) {
        return (
            <View style={[styles.container, { backgroundColor: themeColors.backgroundPrimary }]}>
                <ActivityIndicator size='large' color={themeColors.primary} />
            </View>
        );
    };

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.container, { backgroundColor: themeColors.backgroundPrimary }]}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>Create your avatar</Text>
            
            <DisplayAvatar
                uri={generateAvatar(options)}
                style={styles.avatarPreview}
                themeColors={themeColors}
            />

            <AvatarCustomiser 
                avatarOptions={options}
                setAvatarOptions={setOptions}
                onSave={handleSaveAvatar}
                generateRandomSeed={generateRandomSeed}
                themeColors={themeColors}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20
    },
    avatarPreview: {
        width: 200,
        height: 200,
        marginBottom: 20
    }
});