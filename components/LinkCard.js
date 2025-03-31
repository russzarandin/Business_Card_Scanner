import React, { memo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons/MaterialIcons';
import { useReorderableDrag } from 'react-native-reorderable-list';

const LinkCard = memo(({
    item,
    index,
    themeColors,
    onChangeText,
    onRemove
}) => {
    const drag = useReorderableDrag();
    
    return (
        <TouchableOpacity
        onLongPress={drag}
        activeOpacity={1}
        style={[styles.container, { backgroundColor: themeColors.background, borderColor: themeColors.text
            
         }]}
        >
            <View style={styles.topRow}>
                <TextInput
                    style={[styles.input, { color: themeColors.text, borderColor: themeColors.accent }]}
                    placeholder='https://www.example.com'
                    placeholderTextColor={themeColors.text}
                    value={item}
                    onChangeText={(text) => onChangeText(text, index)}
                    textAlign='center'
                />
            </View>
            <View style={styles.bottomRow}>
                <TouchableOpacity style={[styles.removeButton, { backgroundColor: themeColors.red }]} onPress={() => onRemove(index)}>
                    <Text style={[styles.removeButtonText, { color: themeColors.text }]}>Remove</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        padding: 10,
        marginVertical: 5,
        borderRadius: 8,
        borderWidth: 2,
    },
    activeContainer: {
        elevation: 5
    },
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 2,
        borderRadius: 8,
        fontSize: 16
    },
    bottomRow: {
        marginTop: 5,
        alignItems: 'center'
    },
    removeButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5
    },
    removeButtonText: {
        fontSize: 14,
        fontWeight: '600'
    }
});

export default LinkCard;