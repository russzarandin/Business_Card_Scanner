import React, { useState, useContext, useEffect } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/contexts/AuthContext';
import { updateUserAvatar } from '@/services/userService';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { defaultAvatarOptions, generateAvatar } from '@/config/avatarConfig';
import AvatarCustomiser from '@/components/AvatarCustomiser';
import DisplayAvatar from '@/components/DisplayAvatar';

export default function AvatarCreatorScreen() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const { themeColors } = useDarkMode();
    
    const [options, setOptions] = useState(defaultAvatarOptions());
    
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
            router.back()  // Fixed closing parenthesis
        } catch (error) {
            Alert.alert('Error', 'Failed to update avatar');
            console.error('Avatar update error:', error);
        }
    };

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.container, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Create your avatar</Text>
            
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