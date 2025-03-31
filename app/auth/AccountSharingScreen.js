import React, { useContext, useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Alert} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
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

export default function AccountSharingScreen() {
    const { user } = useContext(AuthContext);
    const { themeColors } = useDarkMode();
    const router = useRouter();
    
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);

    const profileUrl = user?.profileUrl || `https://ar-ai-app-v1.firebaseapp.com/profile/${user?.uid}`;

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user?.uid) {
                try {
                    const userDocRef = doc(firestore, 'users', user.uid);
                    const userSnap = await getDoc(userDocRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        setLinks(userData.links || []);
                    } else {
                        console.log('User document does not exist');
                        setLinks([]);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
            setLoading(false);
        };
        fetchUserProfile();
    }, [user?.uid]);

    const handleNfcWrite = async () => {
        try {
            await writeNFCTag(profileUrl);
            Alert.alert('Success', 'NFC tag written successfully');
        } catch (error) {
            console.error('NFC write error:', error);
            Alert.alert('Error', 'Failed to write NFC tag');
        }
    };


    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>

            <View style={styles.qrContainer}>
                <QRCode 
                    value={profileUrl}
                    size={200}
                    color={themeColors.text}
                    backgroundColor={themeColors.background}
                />
            </View>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>My Links</Text>
            
            {loading ? (
                <ActivityIndicator size='large' color={ themeColors.accent } />
            ): links.length > 0 ? (
                links.map((link, index) => {
                    const iconName = getPlatformIcon(link);
                    return (
                        <TouchableOpacity key={index} onPress={() => Linking.openURL(link)} style={styles.linkRow}>
                            {iconName && (
                                <MaterialCommunityIcons
                                    name={iconName}
                                    size={24}
                                    color={themeColors.text}
                                    style={styles.icon}
                                />
                            )}
                            <Text style={[styles.link, { color: themeColors.accent }]}>{link}</Text>
                        </TouchableOpacity>
                    )
                })
            ) : (
                <Text style={{ color: themeColors.text }}>No links available</Text>
            )}

            <TouchableOpacity style={[styles.button, {backgroundColor: themeColors.accent}]} onPress={handleNfcWrite}>
                <Text style={[styles.buttonText, { color: themeColors.text}]}> Share via NFC</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.accent }]} onPress={() => router.push('/auth/EditAccountScreen')}>
                <Text style={[styles.buttonText, { color: themeColors.text }]}>Edit Links</Text>
            </TouchableOpacity>
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