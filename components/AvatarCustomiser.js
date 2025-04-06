import React, { useState, useEffect } from 'react';
import { View, Image, Button, TextInput, ScrollView } from 'react-native';
import { updateUserAvatar } from '@/services/userService';
import { generateAvatar } from '@/config/avatarConfig';

const AvatarCustomiser = ({ userId, onAvatarChange }) => {
    const [avatarOptions, setAvatarOptions] = useState({
        seed: 'default',
        flip: false,
        backgroundColor: ['b6e3f4'],
        backgroundType: ['solid'],
        accessories: ['none'],
        accessoriesColor: ['000000'],
        clothing: ['shirtCrewNeck'],
        clothesColor: ['0000FF'],
        eyebrows: ['default'],
        eyes: ['default'],
        facialHair: ['none'],
        facialHairColor: ['000000'],
        hairColor: ['000000'],
        hatColor: ['808080'],
        mouth: ['default'],
        nose: ['default'],
        top: ['shortHair'],
        skinColor: ['FAD782']
        // Change the color from words to hexcodes
    });

    const [avatarUri, setAvatarUri] = useState('');

    useEffect(() => {
        setAvatarUri(generateAvatar(avatarOptions));
    }, [avatarOptions]);

    const saveAvatarToFirestore = async () => {
        if (!userId || !avatarUri) return;
        try {
            await updateUserAvatar(userId, avatarUri);
            console.log('Avatar saved successfully');
        } catch (error) {
            console.error('Error saving avatar', error);
        }
    };

    return (
        <View>
            {avatarUri && (
            <Image
                source={{ uri: avatarUri }}
                style={{ width : 100, height: 100 }}
            />
            )}

            <TextInput
                placeholder='Enter seed'
                value={avatarOptions.seed}
                onChangeText={(text) => setAvatarOptions({ ...avatarOptions, seed: text })}
                style={{
                    borderWidth: 1,
                    padding: 10,
                    marginVertical: 10
                }}
            />

            <Button title='Save Avatar' onPress={saveAvatarToFirestore} />
        </View>
    );
};

export default AvatarCustomiser;