/**
 * @fileoverview File responsible for the Editing business cards screen
 */

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

    const handleSave = async () => {
        try {
            await updateBusinessCard(cardId, { rawText: text });
            router.back();
        } catch (error) {
            console.error('Failed to update card:', error);
            Alert.alert('Error', 'Could not save changes')
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.backgroundPrimary }]}>
            <TextInput
                style={[styles.input, { color: themeColors.textPrimary }]}
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
