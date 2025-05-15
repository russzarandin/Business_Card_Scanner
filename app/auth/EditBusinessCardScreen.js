import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { updateBusinessCard } from '@/services/businessCardService';
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function EditBusinessCardScreen() {
    const { cardId, rawText } = useLocalSearchParams();
    const router = useRouter();
    const [text, setText] = useState(rawText || '');
    const { themeColors } = useDarkMode();

    function removeEmojis(text) {
        return text.replace(/\p{Emoji}/gu, '');
    };

    const handleSave = async () => {
        const cleanText = removeEmojis(text);

        if (cleanText.trim().length === 0) {
            Alert.alert('Business card text cannot be empty of just emojis');
            return;
        }
        try {
            await updateBusinessCard(cardId, { rawText: cleanText });
            router.back();
        } catch (error) {
            console.error('Failed to update card:', error);
            Alert.alert('Error', 'Could not save changes')
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <TextInput
                style={[styles.input, { color: themeColors.text }]}
                multiline
                value={text}
                onChangeText={setText}
            />
            <Button title="Save" onPress={handleSave} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        backgroundColor: '#fff'
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        minHeight: 100,
        marginBottom: 20
    }
});
