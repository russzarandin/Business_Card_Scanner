/**
 *  @fileoverview Component responsible for displaying the camera component in the index.js screen/home screen
 *  currently unused
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { CameraView, useCameraPermissions, requestCameraPermissionsAsync } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { CameraType } from 'expo-image-picker';
import { useDarkMode } from '@/contexts/DarkModeContext';

const CameraComponent = ({ onCapture }) => {
    const { themeColors } = useDarkMode(); 
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const [facing, setFacing] = useState('back');

    const takePhoto = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            onCapture(photo.uri);
        }
    };

    if (!permission) {
        return <Text>Requesting camera permission...</Text>;
    }
    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title='Grant Permission' />
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back' ));
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                        <Ionicons name='camera-reverse' size={42} color={'white'}/>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                        <Ionicons name='ellipse' size={108} color={'white'} />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10
    },
    camera: {
        flex: 1
    },
    captureButton: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 50
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    flipButton: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        borderRadius: 30,
        padding: 10
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold' 
    }
});

export default CameraComponent;