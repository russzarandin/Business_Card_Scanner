import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const OptionGroup = ({
    category,
    choices,
    selectedValue,
    onSelect,
    themeColors,
    isActive
}) => (
    <View style={styles.optionGroup}>
        <Text style={[styles.categoryLabel, { color: themeColors.text }]}>
            {category.split(/(?=[A-Z])/).join(' ')}
        </Text>

        <View style={styles.choicesContainer}>
            {choices.map(({ value, label }) => (
                <TouchableOpacity
                    key={value}
                    onPress={() => onSelect(category, value)}
                    style={[styles.choiceButton, isActive(value) && { backgroundColor: themeColors.accent, borderColor: themeColors.accent }]}
                >
                    <Text style={[styles.choiceText, { color: themeColors.text }, isActive(value) && { color: themeColors.background }]}>
                        {label}
                    </Text>
                </TouchableOpacity>
            ))}
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
    choiceButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1
    },
    choiceText: {
        fontSize: 14
    }
});

export default OptionGroup;