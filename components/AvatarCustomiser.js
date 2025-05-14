import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ColorPicker } from 'react-native-color-picker';
import DisplayAvatar from './DisplayAvatar';
import ColorPickerModal from './ARCustomisation/ColorPickerModal';
import OptionGroup from './ARCustomisation/OptionGroup';
import ColorOptionGroup from './ARCustomisation/ColorOptionGroup';

const avatarOptionChoices = {
    top: [
        { value: 'bigHair', label: 'Big hair'},
        { value: 'bob', label: 'Bob'},
        { value: 'bun', label: 'Bun'},
        { value: 'curly', label: 'Curly'},
        { value: 'curvy', label: 'Curvy'},
        { value: 'dreads', label: 'Dreads'},
        { value: 'dreads01', label: 'Short dreads'},
        { value: 'dreads02', label: 'Medium dreads'},
        { value: 'frida', label: 'Frida'},
        { value: 'frizzle', label: 'Frizzle'},
        { value: 'fro', label: 'Fro'},
        { value: 'froBand', label: 'Fro with band'},
        { value: 'hat', label: 'Hat' },
        { value: 'hijab', label: 'Hijab' },
        { value: 'longButNotTooLong', label: 'Long but not too long'},
        { value: 'miaWallace', label: 'Mia Wallace'},
        { value: 'shaggy', label: 'Shaggy'},
        { value: 'shaggyMullet', label: 'Shaggy mullet'},
        { value: 'shavedSides', label: 'Shaved sides'},
        { value: 'shortCurly', label: 'Short curly'},
        { value: 'shortFlat', label: 'Short flat'},
        { value: 'shortRound', label: 'Short round'},
        { value: 'shortWaved', label: 'Short waved'},
        { value: 'sides', label: 'Sides'},
        { value: 'straight01', label: 'Straight'},
        { value: 'straight02', label: 'Straight 2'},
        { value: 'straightAndStrand', label: 'Straight and Strand'},
        { value: 'theCaesar', label: 'The Caesar'},
        { value: 'theCaesarAndSidePart', label: 'The Caesar and side part'},
        { value: 'turban', label: 'Turban'},
        { value: 'winterHat1', label: 'Winter hat 1'},
        { value: 'winterHat02', label: 'Winter hat 2'},
        { value: 'winterHat03', label: 'Winter hat 3'},
        { value: 'winterHat04', label: 'Winter hat 4'},
    ],
    facialHair: [
        { value: 'beardLight', label: 'Light Beard' },
        { value: 'beardMajestic', label: 'Majestic Beard' },
        { value: 'beardMedium', label: 'Medium Beard' },
        { value: 'moustacheFancy', label: 'Fancy Moustache' },
        { value: 'moustacheMagnum', label: 'Magnum Moustache' },
        { value: 'none', label: 'None' }
    ],
    eyes: [
        { value: 'closed', label: 'Closed' },
        { value: 'cry', label: 'Cry' },
        { value: 'default', label: 'Default' },
        { value: 'eyeRoll', label: 'Eye roll' },
        { value: 'happy', label: 'Happy' },
        { value: 'hearts', label: 'Hearts' },
        { value: 'side', label: 'Side' },
        { value: 'squint', label: 'Squint' },
        { value: 'surprised', label: 'Surprised' },
        { value: 'wink', label: 'Wink' },
        { value: 'winkWacky', label: 'Wacky wink' },
        { value: 'xDizzy', label: 'Dizzy' }
    ],
    clothing: [
        { value: 'blazerAndShirt', label: 'Blazer and shirt'},
        { value: 'blazerAndSweater', label: 'Blazer and sweater'},
        { value: 'collarAndSweater', label: 'Collar and sweater'},
        { value: 'graphicShirt', label: 'Graphic shirt'},
        { value: 'hoodie', label: 'Hoodie'},
        { value: 'overall', label: 'Overall'},
        { value: 'shirtAndCrewNeck', label: 'Shirt and crew neck'},
        { value: 'shirtScoopNeck', label: 'Shirt scoop neck'},
        { value: 'shirtVNeck', label: 'Shirt V neck'},
    ]
};

const colorFields = [
    { key: 'hairColor', label: 'Hair Color' },
    { key: 'facialHairColor', label: 'Facial Hair Color' },
    { key: 'accessoriesColor', label: 'Accessories Color' },
    { key: 'hatColor', label: 'Hat Color' },
    { key: 'clothesColor', label: 'Clothes Color' },
    { key: 'skinColor', label: 'Skin Color' },
    { key: 'backgroundColor', label: 'Background Color' },
]

const AvatarCustomiser = ({ avatarOptions, setAvatarOptions, onSave, currentAvatarUrl, generateRandomSeed, themeColors, options, setOptions }) => {
    const [colorPickerState, setColorPickerState] = useState({
        visible: false,
        field: '',
        initialColor: '#ffffff'
    });

    const handleOptionChange = (category, value) => {
        setAvatarOptions(prev =>  {
            const newOptions = { ...prev };

            if (category === 'facialHair') {
                if (value === 'none') {
                    newOptions.facialHairProbability = 0;
                    newOptions.facialHair = ['none'];
                } else {
                    delete newOptions.facialHairProbability;
                    newOptions.facialHair = [value];
                }
            } else if (category === 'accessories') {
                if (value === 'none') {
                    newOptions.accessoriesProbability = 0;
                    newOptions.accessories = ['none'];
                } else {
                    delete newOptions.accessoriesProbability;
                    newOptions.accessories = [value];
                }
            } else {
                newOptions[category] = [value];
            }
            return newOptions;
        });
    };

    const openColorPicker = (field) => {
        setColorPickerState({
            visible: true,
            field,
            initialColor: `#${avatarOptions[field] || 'ffffff'}`
        });
    };

    const handleColorSelect = (color) => {
        setAvatarOptions(prev => ({
            ...prev,
            [colorPickerState.field]: [color.replace('#', '')]
        }));
    };

    const getButtonStyle = (category, value) => {
        if (category === 'facialHair') {
            return (value === 'none' && avatarOptions.facialHairProbability === 0) ||
                (value !== 'none' && Array.isArray(avatarOptions.facialHair) && avatarOptions.facialHair.includes(value) && avatarOptions.facialHairProbability === 100);
        } else if (category === 'accessories') {
            return ( value === 'none' && avatarOptions.accessoriesProbability === 0) ||
                (value !== 'none' && Array.isArray(avatarOptions.accessories) && avatarOptions.accessories.includes(value) && avatarOptions.accessoriesProbability === 100);
        }
        return Array.isArray(avatarOptions[category]) &&
        avatarOptions[category].includes(value);
    };

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {/* Regular options */}
            {Object.entries(avatarOptionChoices).map(([category, choices]) => (
                <OptionGroup
                    key={category}
                    category={category}
                    choices={choices}
                    selectedValue={avatarOptions[category]}
                    onSelect={handleOptionChange}
                    themeColors={themeColors}
                    isActive={(value) => getButtonStyle(category, value)}
                />
            ))}

            {/* Color options */}
            <ColorOptionGroup
                colorFields={colorFields}
                currentColors={avatarOptions}
                onColorPress={openColorPicker}
                themeColors={themeColors}
            />

            <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                onPress={onSave}
            >
                <Text style={[styles.saveButtonText, { color: themeColors.textPrimary }]}>
                    Save Avatar
                </Text>
            </TouchableOpacity>

            {/* Color picker modal */}
            <ColorPickerModal
                visible={colorPickerState.visible}
                onClose={() => setColorPickerState(prev => ({ ...prev, visible: false }))}
                onColorSelect={handleColorSelect}
                initialColor={colorPickerState.initialColor}
                fieldName={colorPickerState.field.split(/(?=[A-Z])/).join(' ')}
                themeColors={themeColors}
            />
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