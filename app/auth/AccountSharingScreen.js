import React, { useContext, useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { writeNFCTag } from '@/services/nfcService';
import { firestore } from '@/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';


const socialIcons = {
    'facebook.com': 'facebook',
    'instagram.com': 'instagram',
    'linkedin.com': 'linkedin',
    'twitter.com': 'twitter',
    'github.com': 'github',
    'youtube.com': 'youtube'
};

const getPlatformIcon = (url) => {
    try {
        const hostname = new URL(url).hostname.replace(/^www\./, '');
        return socialIcons[hostname] || null;
    } catch (error) {
        return null
    }
};

export default function AccountSharingScreen({ userId: propUserId }) {
    const { user } = useContext(AuthContext);
    const { themeColors } = useDarkMode();
    const router = useRouter();
    const params = useLocalSearchParams();

    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileUser, setProfileUser] = useState(null);
    const [isCurrentUser, setIsCurrentUser] = useState(false);

    const userId = propUserId || params.userId || user?.uid;
    const profileUrl = `ai-ar-business-card://profile/${userId}`;

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(firestore, 'users', userId);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setProfileUser(userData);
                    setLinks(userData.links || []);
                    setIsCurrentUser(user?.uid === userId);
                } else {
                    console.log('User document does not exist');
                    setLinks([]);
                    Alert.alert('Error', 'User profile not found');
                    router.back();
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                Alert.alert('Error', 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId, user?.uid])

    const handleNfcWrite = async () => {
        try {
            await writeNFCTag(userId);
            Alert.alert('Success', 'NFC tag written successfully');
        } catch (error) {
            console.error('NFC write error:', error);
            Alert.alert('Error', 'Failed to write NFC tag');
        }
    };


    return (
        <View style={[styles.container, { backgroundColor: themeColors.backgroundPrimary }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>{isCurrentUser ? 'My Profile' : `${profileUser?.displayName || 'User'}'s Profile`}</Text>

            <View style={styles.qrContainer}>
                <QRCode 
                    value={profileUrl}
                    size={200}
                    color={themeColors.textPrimary}
                    backgroundColor={themeColors.backgroundPrimary}
                />
            </View>

            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>{isCurrentUser ? 'My Links' : 'Links'}</Text>
            
            {loading ? (
                <ActivityIndicator size='large' color={ themeColors.primary } />
            ): links.length > 0 ? (
                links.map((link, index) => {
                    const iconName = getPlatformIcon(link);
                    return (
                        <TouchableOpacity key={index} onPress={() => Linking.openURL(link)} style={styles.linkRow}>
                            {iconName && (
                                <MaterialCommunityIcons
                                    name={iconName}
                                    size={24}
                                    color={themeColors.textPrimary}
                                    style={styles.icon}
                                />
                            )}
                            <Text style={[styles.link, { color: themeColors.primary }]}>{link}</Text>
                        </TouchableOpacity>
                    )
                })
            ) : (
                <Text style={{ color: themeColors.textPrimary }}>{isCurrentUser ? 'No links available' : 'User has no links'}</Text>
            )}

            {isCurrentUser && (
                <>
                    <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary }]} onPress={handleNfcWrite}>
                        <Text style={[styles.buttonText, { color: themeColors.textPrimary }]}> Share via NFC</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary }]} onPress={() => router.push('/auth/EditAccountScreen')}>
                        <Text style={[styles.buttonText, { color: themeColors.textPrimary }]}>Edit Links</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        height: '100%',
        padding: 20
    },
    qrContainer: {
        marginVertical: 20
    },
    sectionTitle: {
        fontSize: 20,
        marginBottom: 10
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        width: '100%'
    },
    icon: {
        marginRight: 10
    },
    text: {
        fontSize: 16,
        fontWeight: '600'
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        elevation: 5,
        borderRadius: 25,
        marginTop: 20
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 16,
        letterSpacing: 0.5
    },
    link: {
        fontSize: 16,
        textAlign: 'center',
        textDecorationLine: 'underline',
    }
});