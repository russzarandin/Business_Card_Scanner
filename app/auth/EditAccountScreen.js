import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/services/userService';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { firestore } from '@/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { clean } from 'react-native-image-crop-picker';

const isValidUrl = (url) => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:';
    } catch (error) {
        return false;
    }
};

export default function EditAccountScreen() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const { themeColors } = useDarkMode();

    const [links, setLinks] = useState([]);

    useEffect(() => {
        const fetchUserLinks = async () => {
            if (user?.uid) {
                try {
                    const userDocRef = doc(firestore, 'users', user.uid);
                    const userSnap = await getDoc(userDocRef);
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        setLinks(data.links || []);
                    } else {
                        console.log('User document does not exist');
                    }
                } catch (error) {
                    console.error('Error fetching user links:', error);
                }
            }
        };
        fetchUserLinks();
    }, [user?.uid]);

    const formatUrl = (url) => {
        let cleanedUrl = url.trim();

        if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
            cleanedUrl = 'https://' + cleanedUrl;
        };

        const knownDomains = ['facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com'];
        const domainOnly = cleanedUrl.replace(/https?:\/\//, ""); // Remove protocol for checking
        
        for (let domain of knownDomains) {
            if (domainOnly.startsWith(domain) && !domainOnly.startsWith('www.')) {
                cleanedUrl = cleanedUrl.replace(domain, 'www.' + domain);
            }
        }

        return cleanedUrl;
    }

    const handleChangeLink = (text, index) => {
        const newLinks = [...links];
        newLinks[index] = formatUrl(text);
        setLinks(newLinks);
    };

    const handleAddLink = () => {
        setLinks([...links, '']);
    };

    const handleRemoveLink = (index) => {
        const newLinks = links.filter((_, i) => i !== index);
        setLinks(newLinks);
    };

    const handleMove = (index, direction) => {
        const newLinks = [...links];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newLinks.length) return;
        
        [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];

        setLinks(newLinks);
    };

    const handleSave = async () => {
        const linkValues = links.map(link => link.trim());

        for (const link of linkValues) {
            if (link && !isValidUrl(link)) {
                Alert.alert('Invalid link', `Ensure all links start with "https://". Problematic link: ${link}`);
                return;
            }
        }
        try {
            await updateUserProfile(user.uid, { 
                links: linkValues.filter(l => l !== '')
            });
            Alert.alert('Success', 'Links updated successfully');
            router.push('/auth/AccountSharingScreen');
        } catch (error) {
            console.error('Error updating links:', error);
            Alert.alert('Error', 'Failed to update links');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Edit your links</Text>

            <FlatList
                data={links}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.linkRow}>
                        <View style={styles.controlsContainer}>
                            <TouchableOpacity onPress={() => handleMove(index, 'up')} disabled={index === 0}>
                                <MaterialIcons name='arrow-upward' size={24} color={index === 0 ? themeColors.background : themeColors.text} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => handleMove(index, 'down')} disabled={index === links.length - 1}>
                                <MaterialIcons name='arrow-downward' size={24} color={index === index.length - 1 ? themeColors.red : themeColors.text} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[styles.input, { color: themeColors.text, borderColor: themeColors.accent, textAlign: 'center' }]}
                            placeholder='https://www.example.com'
                            placeholderTextColor={themeColors.text}
                            value={item}
                            onChangeText={(text) => handleChangeLink(text, index)}
                        />
                        <TouchableOpacity style={[styles.removeButton, { backgroundColor: themeColors.red }]} onPress={() => handleRemoveLink(index)}>
                            <Text style={[styles.removeButtonText, { color: themeColors.text }]}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.accent }]} onPress={handleAddLink}>
                    <Text style={[styles.buttonText, { color: themeColors.text }]}>Add another Link</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.accent }]} onPress={handleSave}>
                    <Text style={[styles.buttonText, { color: themeColors.text }]}>Save Links</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8
    },
    controlsContainer: {
        gap: 4,
    },
    input: {
        flex: 1,
        height: '100%',
        borderWidth: 2,
        borderRadius: 8,
        fontSize: 16
    },
    button: {
        marginVertical: 10,

        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        width: '60%',
        alignItems: 'center'
    },
    removeButton: {
        padding: 8,
        borderRadius: 5
    },
    removeButtonText: {
        fontSize: 14,
        fontWeight: '600'
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600'
    },
    footer: {
        padding: 20,
        bottom: 20,
        alignItems: 'center'
    }
});