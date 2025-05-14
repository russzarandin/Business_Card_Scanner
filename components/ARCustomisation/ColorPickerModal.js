import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import ColorPicker, { Panel1, HueSlider, Preview, Swatches } from 'reanimated-color-picker';

const ColorPickerModal = ({
    visible,
    onClose,
    onColorSelect,
    initialColor,
    fieldName,
    themeColors
}) => {
    const [selectedColor, setSelectedColor] = useState(initialColor);

    const handleColorSelect = ({ hex }) => {
        setSelectedColor(hex);
    }

    const handleConfirm = () => {
        onColorSelect(selectedColor);
        onClose();
    };

    return (
        <Modal visible={visible} transparent={true} animationType='slide'>
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: themeColors.backgroundPrimary }]}>
                    <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
                        Select {fieldName}
                    </Text>

                    <ColorPicker
                        style={styles.colorPicker}
                        value={selectedColor}
                        onComplete={handleColorSelect}
                    >
                        <Preview hideInitialColor hideText />
                        <Panel1 style={styles.panel} />
                        <HueSlider style={styles.slider} />
                        <Swatches style={styles.swatches} />
                    </ColorPicker>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary }]} onPress={handleConfirm}>
                            <Text style={[styles.buttonText, { color: themeColors.textPrimary }]}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.red }]} onPress={onClose}>
                            <Text style={[styles.buttonText, { color: themeColors.textPrimary }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        width: '90%',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    colorPicker: {
        width: '100%',
        marginBottom: 20
    },
    panel: {
        borderRadius: 8,
        marginBottom: 15
    },
    slider: {
        borderRadius: 8,
        marginBottom: 15,
        height: 30
    },
    swatches: {
        borderRadius: 8,
        marginBottom: 20
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100'
    },
    button: {
        padding: 12,
        borderRadius: 5,
        minWidth: 100,
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500'
    }
});

export default ColorPickerModal;