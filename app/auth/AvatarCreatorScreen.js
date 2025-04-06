import React, { useState, useContext, useEffect } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/contexts/AuthContext';
import { updateUserAvatar } from '@/services/userService';
import { useDarkMode } from '@/contexts/DarkModeContext';
import AvatarCustomiser from '@/components/AvatarCustomiser';
import { defaultAvatarOptions, avatarOptionChoices, generateAvatar } from '@/config/avatarConfig';

export default function AvatarCreatorScreen() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const { themeColors } = useDarkMode();
    const [loading, setLoading] = useState(true);
    const [svg, setSvg] = useState(null);
    const [options, setOptions] = useState(defaultAvatarOptions);
    const [cacheBuster, setCacheBuster] = useState(Date.now());
    

    const generateRandomSeed = () => {
        const randomSeed = Math.random().toString(36).substring(2, 10);
        setOptions(prev => ({ ...prev, seed: randomSeed }));
        setCacheBuster(Date.now());
    };

    const handleSaveAvatar = async () => {
        if (!user?.uid) return;
        try {
            const avatarUrl = generateAvatar(options);
            await updateUserAvatar(user.uid, avatarUrl);
            router.push('/(tabs/settings');
        } catch (error) {
            Alert.alert('Error', 'Failed to update avatar');
        }
    };

    return (
        <ScrollView  style={{flex: 1}} contentContainerStyle={[styles.container, { backgroundColor: themeColors.background }]}>
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

            {Object.keys(avatarOptionChoices).map(([category, choices]) => (
                <View key={category} style={styles.optionGroup}>
                    <Text style={[styles.categoryLabel, { color: themeColors.text }]}>{category}</Text>
                    <View style={styles.choicesContainer}>
                        {choices.map(choice => (
                            <TouchableOpacity
                                key={choice}
                                onPress={() => setOptions(prev => ({ ...prev, [category]: choice }))}
                                style={[styles.choiceButton, options[category] === choice && { backgroundColor: themeColors.accent, borderColor: themeColors.red }]}
                            >
                                <Text style={[styles.choiceButtonText, { color: themeColors.text }]}>{choice}</Text>
                            </TouchableOpacity>
                        ))}       
                    </View>
                </View>
            ))}

            <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.accent }]} onPress={generateRandomSeed}>
                <Text style={[styles.buttonText, {colors: themeColors.text}]}>Generate New Avatar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.accent }]} onPress={handleSaveAvatar}>
                <Text style={[styles.buttonText, { colors: themeColors.text }]}>Save Avatar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

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
    avatarContainer: {
        width: 200,
        height: 200,
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
    },
    optionGroup: {
        marginVertical: 10,
        width: '100%'
    },
    categoryLabel: {
        fontSize: 16,
        marginBottom: 5
    },
    choicesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    choiceButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        margin: 5,
        borderWidth: 1,
    },
    choiceButtonText: {
        fontSize: 14,
        textTransform: 'capitalize'
    }
});