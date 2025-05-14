import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ColorOptionGroup = ({
    colorFields,
    currentColors,
    onColorPress,
    themeColors
}) => (
    <View style={styles.optionGroup}>
        <Text style={[styles.categoryLabel, { color: themeColors.textPrimary }]}>
            Colors
        </Text>

        <View style={styles.choicesContainer}>
            {colorFields.map(({ key, label }) => {
                const colorArray = currentColors[key];
                const colorValue = Array.isArray(colorArray) ? colorArray[0] : colorArray;
                const hexColor = colorValue ? `#${colorValue}` : '#ffffff';

                return (
                    <TouchableOpacity
                        key={key}
                        onPress={() => onColorPress(key)}
                        style={[styles.colorButton, { backgroundColor: hexColor, borderColor: themeColors.textPrimary }]}
                    >
                        <Text style={[styles.colorButtonText, { color: themeColors.text }]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    </View>
);

const styles = StyleSheet.create({
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
    colorButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center'
    },
    colorButtonText: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500'
    }
});

export default ColorOptionGroup;