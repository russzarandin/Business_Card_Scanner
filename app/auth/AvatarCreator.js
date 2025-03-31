import React, { useState, useContext, useEffect } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/contexts/AuthContext';
import { updateUserAvatar } from '@/services/userService';
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function AvatarCreator() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [seed, setSeed] = useState('default');
    const [svg, setSvg] = useState(null);
    const router = useRouter();
    const { themeColors } = useDarkMode();

    const generateRandomSeed = () => {
        const randomSeed = Math.random().toString(36).substring(2, 10);
        setSeed(randomSeed);
    };

    const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&options[mood][]=happy`;

    useEffect(() => {
        setLoading(true);
        fetch(avatarUrl)
            .then((response) => response.text())
            .then((xml) => {
                setSvg(xml);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching SVG:', error);
                setLoading(false);
            });
    }, [avatarUrl]);

    const handleSaveAvatar = async () => {
        try {
            await updateUserAvatar(user.uid, avatarUrl);
            router.push('/(tabs)/settings');
        } catch (error) {
            console.error('Error updating avatar:', error);
            Alert.alert('Error', 'Failed to update avatar');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Create your avatar</Text>
            <View style={styles.avatarContainer}>
                {loading ? (
                    <ActivityIndicator size='large' color='#007AAF' style={styles.loading} />
                ) : svg ? (
                    <SvgXml xml={svg} width='200' height='200'/>
                ) : (
                <Text style={{ color: themeColors.text }}>No Avatar Loaded</Text>
                )}
            </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.accent }]} onPress={generateRandomSeed}>
            <Text style={[styles.buttonText, {colors: themeColors.text}]}>Generate New Avatar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.accent }]} onPress={handleSaveAvatar}>
            <Text style={[styles.buttonText, { colors: themeColors.text }]}>Save Avatar</Text>
        </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20
    },
    avatarContainer: {
        width: 200,
        height: 'auto',
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatar: {
        width: 200,
        height: 200,
        borderRadius: 100
    },
    loading: {
        position: 'absolute'
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginVertical: 10,
        width: '80%',
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600'
    }
});