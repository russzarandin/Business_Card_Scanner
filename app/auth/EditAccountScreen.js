/**
 * @fileoverview File responsible for the EditAccountScreen which allows the user to personalise their account
 */

import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/contexts/AuthContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { firestore } from '@/config/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import DraggableLinkList from '@/components/DraggableLinkList';


const MAX_LINKS = 10;

const socialBaseUrls = {
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
    linkedin: 'https://www.linkedin.com/in/',
    twitter: 'https://www.twitter.com/',
    github: 'https://www.github.com/'
};

export default function EditAccountScreen() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const { themeColors } = useDarkMode();
    
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user?.uid) return;
        
        const fetchUserLinks = async () => {
            try {
                const userDocRef = doc(firestore, 'users', user.uid);
                const userSnap = await getDoc(userDocRef);
                
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const userLinks = userData.links || [];
                    const formattedLinks = userLinks.map((link, index) => {
                        if (typeof link === 'string') {
                            return { id: `link-${index}`, url: link };
                        } else if (typeof link === 'object' && link !== null) {
                            return { id: link. id || `link-${index}`, url: link.url || ''};
                        }
                        return { id: `link-${index}`, url: ''};
                    });
                    
                    setLinks(formattedLinks);
                } else {
                    console.log('User document does not exist');
                    setLinks([]);
                }

            } catch (error) {
                console.error('Error fetching user links:', error);
                Alert.alert('Error', 'Failed to load your links');
            } finally {
                setLoading(false);
            }
        };
        fetchUserLinks();
    }, [user?.uid]);
    
    
    const handleLinksChange = (newLinks) => {
        setLinks(newLinks);
    };
    
    const formatUrl = (url) => {
        let cleanedUrl = url.trim();
        
        if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
            cleanedUrl = 'https://' + cleanedUrl;
        };
        
        const knownDomains = ['facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'github.com'];
        const domainOnly = cleanedUrl.replace(/https?:\/\//, ''); // Remove protocol for checking
        
        for (let domain of knownDomains) {
            if (domainOnly.startsWith(domain) && !domainOnly.startsWith('www.')) {
                cleanedUrl = cleanedUrl.replace(domain, 'www.' + domain);
            }
        }
        return cleanedUrl;
    };
    
    const handleSave = async () => {
        if (!user?.uid) return;
        
        try {
            setSaving(true);
            
            const formattedLinks = links
            .filter(link => link.url.trim() !== '')
            .map(link => formatUrl(link.url.trim()));
            
            for (const url of formattedLinks) {
                if (url.length > 150) {
                    Alert.alert('Invalid URL', `Link too long (over 150 characters): \n ${url}`);
                    setSaving(false);
                    return;
                }

                try {
                    const parsed = new URL(url);
                    const protocol = parsed.protocol.toLowerCase();

                    if (!protocol.startsWith('https:') || ['javascript:', 'data:', 'file:'].includes(protocol)) {
                        Alert.alert('Invalid URL', `Blocked protocol in link\n${url}`);
                        setSaving(false);
                        return;
                    }

                    if (!isValidUrl(url)) {
                        Alert.alert('Invalid URL', `Malformed or unsafe link: \n${url}`);
                        setSaving(false);
                        return;
                    }
                } catch (error) {
                    Alert.alert('Invalid URL', `Error parsing link:\n${url}`);
                    setSaving(false);
                    return;
                }
            }
            
            await setDoc(doc(firestore, 'users', user.uid), {
                links: formattedLinks,
                updatedAt: new Date()
            }, {merge: true});
            
            Alert.alert('Success', 'Your links have been saved');
            router.push('/auth/AccountSharingScreen');
        } catch (error) {
            console.error('Error saving links', error);
            Alert.alert('Error', 'Failed to save your links');
        } finally {
            setSaving(false);
        }
    };
    
    const handleAddLink = () => {
        if (links.length >= MAX_LINKS) return;
        setLinks([...links, { id : `link-${Date.now()}`, url: ''}]);
    };

    const isValidUrl = (url) => {
        try {
            const parsed = new URL(url);
            const allowedProtocols = ['https:'];
            const maxLength = 2083;

            return (
                allowedProtocols.includes(parsed.protocol) &&
                url.length <= maxLength &&
                /^[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+$/.test(url)
            )
        } catch (error) {
            return false;
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: themeColors.backgroundPrimary }]}>
                <ActivityIndicator size='large' color={themeColors.primary} />
            </View>
        );
    };
                                            
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundPrimary }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>Edit your links</Text>
            </View>

            <Text style={[styles.instruction, { color: themeColors.textPrimary }]}>
                Press and hold an item to drag and reorder
            </Text>

            <DraggableLinkList
                links={links}
                onChange={handleLinksChange}
                themeColors={themeColors}
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: themeColors.primary }]} onPress={handleAddLink}>
                    <MaterialIcons name='add' size={24} color={themeColors.textPrimary} />
                    <Text style={[styles.buttonText, { color: themeColors.textPrimary }]}>Add Link</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.saveButton, { backgroundColor: themeColors.primary }]} onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size='small' color={themeColors.primary} />
                    ) : (
                        <MaterialIcons name='save' size={24} color={themeColors.textPrimary} />
                    )}
                    <Text style={[styles.buttonText, { color: themeColors.textPrimary }]}>Save</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        marginBottom: 16,
        alignItems: 'center'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    instruction: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 16,
        fontStyle: 'italic',
        textAlign: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 20,
        paddingBottom: 20
    },
    addButton: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginRight: 8
    },
    saveButton: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8
    },
    buttonText: {
        fontWeight: 'bold',
        marginLeft: 8
    }
});