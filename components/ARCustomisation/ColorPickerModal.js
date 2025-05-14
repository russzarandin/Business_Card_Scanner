import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { ColorPicker } from 'react-native-color-picker';

const ColorPickerModal = ({
    visible,
    onClose,
    onColorSelect,
    initialColor,
    fieldName,
    themeColors
}) => {
    const pickerRef = useRef(null);

    const handleConfirm = async () => {
        try {
            const color = await pickerRef.current.getCurrentColor();
            onColorSelect(color);
            onClose();
        } catch (error) {
            console.error('Error getting color:', error);
            onClose();
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType='slide'>
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: themeColors.background}]}>
                    <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                        Select {fieldName}
                    </Text>

                    <ColorPicker
                        ref={pickerRef}
                        style={styles.colorPicker}
                        defaultColor={initialColor}
                        onColorSelected={color => {}}
                        hideSliders={false}
                    />

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: themeColors.accent }]} onPress={handleConfirm}>
                            <Text style={[styles.modalButtonText, { color: themeColors.text }]}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: themeColors.red }]} onPress={onClose}>
                            <Text style={[styles.modalButtonText, { color: themeColors.text }]}>Cancel</Text>
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
        borderRadius: 10
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    colorPicker: {
        width: '100%',
        height: 300,
        marginBottom: 20
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
        minWidth: 100,
        alignItems: 'center'
    },
    modalButtonText: {
        fontSize: 16
    }
});

export default ColorPickerModal;