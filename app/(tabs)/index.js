import React, { useState, useContext, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, AppState, Platform } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import ImagePicker from 'react-native-image-crop-picker';
import { extractContactInfo } from '@/utils/ocrProcessing';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { saveBusinessCard } from '@/services/businessCardService';
import { saveLocalBusinessCard } from '@/services/localBusinessCardService';
import { AuthContext } from '@/contexts/AuthContext';
import NetInfo from '@react-native-community/netinfo';
import RNFS from 'react-native-fs';

export default function HomeScreen() {
    const { themeColors } = useDarkMode();
    const { user } = useContext(AuthContext);
    const [device, setDevice] = useState(null);
    const [isActive, setIsActive] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const cameraRef = useRef(null); 

    const format = useCameraFormat(device, [
        { photoResolution: 'max' },
        { photoAspectRatio: 4/3 }
    ]);

    useEffect(() => {
        (async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'granted');
            const devices = await Camera.getAvailableCameraDevices();
            setDevice(devices.find(d => d.position === 'back'));
        })();
        
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            setIsActive(nextAppState === 'active');
        });
        
        return () => subscription.remove();
    }, []);

    const handleScan = async (imagePath) => {
        try {
            const result = await TextRecognition.recognize(imagePath);
            const processedData = extractContactInfo(result.text);

            const cardsData = {
                ...processedData,
                scannedAt: new Date().toISOString(),
                imagePath
            };

            const netState = await NetInfo.fetch();
            if (!netState.isConnected || !user) {
                await saveLocalBusinessCard(cardsData);
            } else {
                await saveBusinessCard(cardsData);
            }

            Alert.alert('Success', 'Business card saved successfully');
            console.log('Structured Data:', processedData);
        } catch (error) {
            console.error('OCR Error:', error);
            Alert.alert('Error', 'Failed to process the business card');
        } finally {
            setIsActive(true);
        }
    };

    const capturePhoto = async () => {
        if (!cameraRef.current || isProcessing) return;

        setIsProcessing(true);

        try {
            const photo = await cameraRef.current.takePhoto({
                qualityPrioritization: 'quality',
                flash: 'off',
                skipMetadata: true
            });

            // setIsActive(false);

            let photoPath = photo.path;
            if (Platform.OS === 'android') {
                const destPath = `${RNFS.CachesDirectoryPath}/${Date.now()}.jpg`;
                await RNFS.copyFile(photoPath, destPath);
                photoPath = `file://${destPath}`;
            }

            const croppedPhoto = await ImagePicker.openCropper({
                path: photoPath,
                width: 800,
                height: 600,
                cropperCircleOverlay: false,
                freeStyleCropEnabled: true,
                mediaType: 'photo',
                includeBase64: false,
                avoidEmptySpaceAroundImage: true
            });
            
            if (croppedPhoto.path) {
                await handleScan(croppedPhoto.path);
            }
        } catch (error) {
            console.error('Capture error:', error);
            Alert.alert('Error', 'Failed to capture photo');
        } finally {
            setIsProcessing(false);
            setIsActive(true);
        }
    };
    if (!hasPermission) {
        return (
            <View style={[styles.container, { background: themeColors.background }]}>
                <Text>Camera Permission required</Text>
            </View>
        );
    };

    if (!device) {
        return (
            <View style={[styles.container, { backgroundColor: themeColors.background }]}>
                <Text>No camera device found</Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                format={format}
                isActive={isActive}
                photo={true}
            />

            <TouchableOpacity onPress={capturePhoto} style={[styles.scanButton, { background: themeColors. accent }]} disabled={isProcessing}>
                <Text style={[styles.buttonText, { color: themeColors.text }]}>{isProcessing ? 'Processing...' : 'Scan Business Card'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }, 
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 20
    },
    resultContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgb(0,0,0,0.1)',
        borderRadius: 5,
        padding: 10,
        borderRadius: 5
    },
    resultText: {
        fontSize: 18
    },
    image: {
        height: 200,
        width: '100%',
        resizeMode: 'contain',
        marginTop: 10
    },
    scanButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 5
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 16,
        letterSpacing: 0.5
    },
});