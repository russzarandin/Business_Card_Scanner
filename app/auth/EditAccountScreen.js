import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/services/userService';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { firestore } from '@/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

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
                        setLinks([]);
                    }
                } catch (error) {
                    console.error('Error fetching user links:', error);
                    setLinks([]);
                }
            }
        };
        fetchUserLinks();
    }, [user?.uid]);

    const handleChangeLink = (text, index) => {
        const newLinks = [...links];
        newLinks[index] = text;
        setLinks(newLinks);
    };

    const handleAddLink = () => {
        setLinks([...links, '']);
    };

    const handleRemoveLink = (index) => {
        const newLinks = links.filter((_, i) => i !== index);
        setLinks(newLinks);
    }

    const handleSave = async () => {
        for (const link of links) {
            if (link.trim() && !isValidUrl(link.trim())) {
                Alert.alert('Invalid link', `Ensure all links start with "https://". Problematic link: ${link}`);
                return;
            }
        }
        try {
            await updateUserProfile(user.uid, { links: links.filter((l) => l.trim() !== '') });
            Alert.alert('Success', 'Links updated successfully');
            router.push('/auth/AccountSharingScreen');
        } catch (error) {
            console.error('Error updating links:', error);
            Alert.alert('Error', 'Failed to update links');
        }
    };

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Edit your links</Text>
            
            {links.map((link, index) => (
                <View key={index} style={styles.linkRow}>
                    <TextInput
                        style={[styles.input, { color: themeColors.text, borderColor: themeColors.accent }]}
                        placeholder='https://www.example.com'
                        placeholderTextColor={themeColors.text}
                        value={link}
                        onChangeText={(text) => handleChangeLink(text, index)}
                    />
                    <TouchableOpacity style={[styles.removeButton, { backgroundColor: themeColors.red}]} onPress={() => handleRemoveLink(index)}>
                        <Text style={[styles.removeButtonText, { color: themeColors.text }]}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ))}

            <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.accent }]} onPress={handleAddLink}>
                <Text style={[styles.buttonText, { color: themeColors.text }]}>Add another Link</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.accent }]} onPress={handleSave}>
                <Text style={[styles.buttonText, { color: themeColors.text }]}>Save Links</Text>
            </TouchableOpacity>
        </ScrollView>
    )
};


const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center'
    },
    title: {
        fontSize: 28,
        marginBottom: 20
    },
    linkRow: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15
    },
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 2,
        borderRadius: 8,
        marginBottom: 15
    },
    button: {
        marginTop: 10,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        width: '80%',
        alignItems: 'center'
    },
    removeButton: {
        marginLeft: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#FDD'
    },
    removeButtonText: {
        fontSize: 14,
        fontWeight: '600'
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600'
    }
});