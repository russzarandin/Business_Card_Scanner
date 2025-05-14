import React, { useState, useContext, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, AppState, Platform, Dimensions, ActivityIndicator } from 'react-native';
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

const { width } = Dimensions.get('window');
const CAPTURE_BUTTON_SIZE = width * 0.2;

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
            setIsActive(nextAppState === 'active' && !isProcessing);
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
    if (!hasPermission || !device) {
        return (
            <View style={[styles.container, { background: themeColors.backgroundPrimary }]}>
                {hasPermission ? (
                    <Text style={{ color: themeColors.textPrimary, textAlign: 'center' }}>Configuring camera...</Text>
                ) : (
                    <Text style={{ color: themeColors.textPrimary, textAlign: 'center' }}>Camera Permission required. Please enable it in settings</Text>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.backgroundPrimary }]}>
            <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                format={format}
                isActive={isActive}
                photo={true}
            />

            <TouchableOpacity onPress={capturePhoto} style={[styles.captureButton, { background: themeColors.backgroundPrimary }]} disabled={isProcessing}>
                {isProcessing ? (
                    <ActivityIndicator size='small' color={themeColors.primaryButtonText} />
                ) : (
                    <View style={styles.captureButtonInner} />
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    captureButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        width: CAPTURE_BUTTON_SIZE,
        height: CAPTURE_BUTTON_SIZE,
        borderRadius: CAPTURE_BUTTON_SIZE / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    captureButtonInner: {
        width: CAPTURE_BUTTON_SIZE * 0.7,
        height: CAPTURE_BUTTON_SIZE * 0.7,
        borderRadius: (CAPTURE_BUTTON_SIZE * 0.7) / 2,
        backgroundColor: 'white'
    }
});