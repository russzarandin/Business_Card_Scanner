import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ReorderableList, { reorderItems } from 'react-native-reorderable-list';
import { useRouter } from 'expo-router';
import LinkCard from '@/components/LinkCard';
import { AuthContext } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/services/userService';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { firestore } from '@/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import FloatingActionButton from '@/components/FloatingActionButton';

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

const isValidUrl = (url) => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:';
    } catch (error) {
        return false;
    }
};

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
    const [pickerVisible, setPickerVisible] = useState(false);

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
    }

    const openPicker =  () => setPickerVisible(true);
    const closePicker =  () => setPickerVisible(false);

    const handlePickerSelect = (option) => {
        closePicker();
        if (option === 'other') {
            setLinks([...links, '']);
        } else {
            const prefill = socialBaseUrls[option] || '';
            setLinks([...links, prefill]);
        }
    };
    
    const handleRemoveLink = (index) => {
        const newLinks = links.filter((_, i) => i !== index);
        setLinks(newLinks);
    };

    const handleSave = async () => {
        const formattedLinks = links.map((link) => link.trim() ? formatUrl(link.trim()) : '');
        for (const link of formattedLinks) {
            if (link && !isValidUrl(link)) {
                Alert.alert('Invalid link', `Ensure all links start with "https://". Problematic link: ${link}`);
                return;
            }
        }
        try {
            await updateUserProfile(user.uid, { 
                links: formattedLinks.filter(l => l !== '')
            });
            Alert.alert('Success', 'Links updated successfully');
            router.push('/auth/AccountSharingScreen');
        } catch (error) {
            console.error('Error updating links:', error);
            Alert.alert('Error', 'Failed to update links');
        }
    };

    const renderItem = ({ item, index, drag, isActive }) => (
        <LinkCard
            item={item}
            index={index}
            drag={drag}
            isActive={isActive}
            themeColors={themeColors}
            onChangeText={handleChangeLink}
            onRemove={handleRemoveLink}
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Edit your links</Text>
            <TouchableOpacity onPress={handleSave}>
                <MaterialIcons name='save' size={36} color={ themeColors.text }/>
            </TouchableOpacity>

            <ReorderableList
                data={links}
                renderItem={renderItem}
                onReorder={(fromIndex, toIndex) => {setLinks(prevLinks => reorderItems(prevLinks, fromIndex, toIndex));}}
                keyboardShouldPersistTap='handled'
                style={styles.reorderableList}
            />

            <Modal
                visible={pickerVisible}
                transparent
                animationType='slide'
                onRequestClose={closePicker}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
                        <Text style={[styles.modalTitle, { color: themeColors.text }]}>Select a Platform</Text>
                        {Object.keys(socialBaseUrls).map((platform) => (
                            <TouchableOpacity key={platform} style={styles.modalOption} onPress={() => handlePickerSelect(platform)}>
                                <Text style={[styles.modalOptionText, { color: themeColors.text }]}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.modalOption} onPress={() => handlePickerSelect('other')}>
                            <Text style={[styles.modalOptionText, { color: themeColors.text }]}>Other</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={closePicker}>
                            <Text style={[styles.modalCloseButtonText, { color: themeColors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <FloatingActionButton
                onAddManualLink={handleAddLink}
                openPicker={openPicker}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    reorderableList: {
        flex: 1
    },
    button: {
        marginVertical: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 25,
        width: '60%',
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContainer: {
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 10,
        textAlign: 'center'
    },
    modalOption: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#CCC'
    },
    modalOptionText: {
        fontSize: 18,
        textAlign: 'center'
    },
    modalCloseButton: {
        marginTop: 10,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        backgroundColor: '#CCC'
    },
    modalCloseButtonText: {
        fontSize: 16,
        fontWeight: '600'
    }
});