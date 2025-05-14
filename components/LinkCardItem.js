import React, { memo } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons/';

const LinkCardItem = memo(({
    link,
    onDrag,
    isActive,
    themeColors,
    onChangeText,
    onRemove
}) => {
    const scale = isActive ? 1.03: 1;
    const elevation = isActive ? 5 : 1;

    const backgroundColor = isActive ? themeColors.primary + '20' : themeColors.background

    return (
        <Animated.View style={[styles.container, { transform: [{ scale}], elevation, backgroundColor, borderColor: themeColors.textPrimary + '30' }]}>
            <View style={styles.handle}>
                <TouchableOpacity onPressIn={onDrag} style={styles.dragHandle}>
                    <MaterialIcons name='drag-handle' size={24} color={themeColors.textPrimary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <TextInput
                    style={[styles.input, { color: themeColors.textPrimary, borderColor: themeColors.primary }]}
                    value={link.url}
                    onChangeText={onChangeText}
                    placeholder='https://example.com'
                    placeholderTextColor={themeColors.text + '60'}
                    autoCapitalize='none'
                    autoCorrect={false}
                />

                <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                    <MaterialIcons name='remove-circle' size={24} color={themeColors.red || '#F44336'} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: 8,
        marginVertical: 6,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2
    },
    handle: {
        justifyContent: 'center',
        paddingLeft: 8
    },
    dragHandle: {
        padding: 8
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8
    },
    input: {
        flex: 1,
        height: 48,
        paddingHorizontal: 12,
        fontSize: 16,
        borderWidth: 0
    },
    removeButton: {
        padding: 8
    }
});

export default LinkCardItem;