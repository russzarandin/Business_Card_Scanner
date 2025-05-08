import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import DisplayAvatar from './DisplayAvatar';

const avatarOptionChoices = {
    top: [
        { value: 'hat', label: 'Hat' },
        { value: 'hijab', label: 'Hijab' },
        { value: 'turban', label: 'Turban' }
    ],
    hairColor: [
        { value: 'a55728', label: 'Auburn' },
        { value: 'b58143', label: 'Brown' },
        { value: '000000', label: 'Black' }
    ],
    facialHair: [
        { value: 'beardMajestic', label: 'Majestic Beard' },
        { value: 'beardMedium', label: 'Medium Beard' },
        { value: 'none', label: 'None' }
    ],
    eyes: [
        { value: 'default', label: 'Default' },
        { value: 'happy', label: 'Happy' },
        { value: 'wink', label: 'Wink' }
    ]
};

const AvatarCustomiser = ({ avatarOptions, setAvatarOptions, onSave, currentAvatarUrl, generateRandomSeed, themeColors, options, setOptions }) => {
    const [activeCategory, setActiveCategory] = useState('top');

    const handleOptionChange = (category, value) => {
        setAvatarOptions(prev => ({
            ...prev,
            [category]: value
        }));
    };

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {Object.entries(avatarOptionChoices).map(([category, choices]) => (
                <View key={category} style={styles.optionGroup}>
                    <Text style={[styles.categoryLabel, { color: themeColors.text }]}>
                        {category.split(/(?=[A-Z])/).join(' ')}
                    </Text>
                    <View style={styles.choicesContainer}>
                        {choices.map(({ value, label }) => (
                            <TouchableOpacity
                                key={value}
                                onPress={() => handleOptionChange(category, value)}
                                style={[
                                    styles.choiceButton,
                                    avatarOptions[category] === value && { 
                                        backgroundColor: themeColors.accent 
                                    }
                                ]}
                            >
                                <Text style={[styles.choiceText, { color: themeColors.text }]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}

            <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                onPress={onSave}
            >
                <Text style={[styles.saveButtonText, { color: themeColors.text }]}>
                    Save Avatar
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    contentContainer: {
        paddingBottom: 30
    },
    optionGroup: {
        marginBottom: 20
    },
    categoryLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textTransform: 'capitalize'
    },
    choicesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    choiceButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1
    },
    choiceText: {
        fontSize: 14
    },
    saveButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default AvatarCustomiser;