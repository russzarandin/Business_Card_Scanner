import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import { useOCR, DETECTOR_CRAFT_800, RECOGNIZER_EN_CRNN_128, RECOGNIZER_EN_CRNN_256, RECOGNIZER_EN_CRNN_512 } from 'react-native-executorch';
import * as FileSystem from 'expo-file-system';
import { launchCamera } from 'react-native-image-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import { extractContactInfo } from '@/utils/ocrProcessing';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { saveBusinessCard } from '@/services/businessCardService';
import { saveLocalBusinessCard } from '@/services/localBusinessCardService';
import NetInfo from '@react-native-community/netinfo';
import { AuthContext } from '@/contexts/AuthContext';

export default function HomeScreen() {
    const { themeColors } = useDarkMode();
    const { user } = useContext(AuthContext);
    const [ocrResults, setOCRResults] = useState(null);
    const [progress, setProgress] = useState('');

    const model = useOCR({
        detectorSource: DETECTOR_CRAFT_800,
        recognizerSources: {
            recognizerLarge: RECOGNIZER_EN_CRNN_512,
            recognizerMedium: RECOGNIZER_EN_CRNN_256,
            recognizerSmall: RECOGNIZER_EN_CRNN_128
        },
        language: 'en'
    });

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Camera Permission',
                    message: 'This app needs access to your camera to scan business cards.',
                    buttonPositive: 'OK',
                    buttonNegative: 'Cancel',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    const captureImage = async () => {
        try {
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
                Alert.alert('Permission Denied', 'Camera permission is required to scan business cards.');
                throw new Error('Camera permission not granted');
            }

            setProgress('Opening camera...');

            const image = await new Promise((resolve, reject) => {
                launchCamera({
                    mediaType: 'photo',
                    quality: 1,
                    cameraType: 'back',
                    includeBase64: false,
                    saveToPhotos: false
                }, (response) => {
                    if (response.didCancel) {
                        reject(new Error('Image capture cancelled'));
                    } else if (response.errorCode) {
                        reject(new Error(response.errorMessage || 'Camera error'));
                    } else if (response.assets?.[0]?.uri) {
                        resolve(response.assets[0]);
                    } else {
                        reject(new Error('No image captured'));
                    }
                });
            });

            setProgress('Cropping image...');

            const croppedImage = await ImageCropPicker.openCropper({
                path: image.uri,
                width: 800,
                height: 600,
                cropping: true,
                freeStyleCropEnabled: true,
                mediaType: 'photo'
            });

            return { uri: croppedImage.path };
        } catch (error) {
            console.error('Image capture error:', error);
            throw error;
        }
    };

    const handleScan = async () => {
        try {
            if (!model.isReady) {
                Alert.alert('Model loading', 'Please wait for the model to finish loading');
                return;
            }

            setProgress('Starting scan...');

            const scanResult = await captureImage();

            if (!scanResult?.uri) {
                throw new Error('No image captured');
            }

            setProgress('Processing image...');

            const ocrResults = await model.forward(scanResult.uri);
            const combinedText = ocrResults.map(d => d.text).join('\n');

            setProgress('Extracting contact info...');
            const processedData = extractContactInfo(combinedText);

            const cardData = {
                ...processedData,
                scannedAt: new Date().toISOString(),
                rawText: combinedText
            };

            const netState = await NetInfo.fetch();
            if (!netState.isConnected || !user) {
                await saveLocalBusinessCard(cardData);
            } else {
                await saveBusinessCard(cardData);
            }

            setOCRResults({
                rawText: combinedText,
                processedData: processedData,
                blocks: ocrResults
            });

            Alert.alert('Success', 'Business card scanned and saved successfully');
            setProgress('');

        } catch (error) {
            console.error('Scan error:', error);
            Alert.alert('Error', 'Failed to scan or save the business card');
            setProgress('');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <TouchableOpacity
                style={[styles.scanButton, { backgroundColor: themeColors.accent }]}
                onPress={handleScan}
                disabled={!model.isReady}
            >
                <Text style={[styles.buttonText, { color: themeColors.text }]}>{model.isReady ? 'Scan business card' : 'Loading model...'}</Text>
            </TouchableOpacity>

            {!model.isReady && (
                <Text style={{ marginTop: 20, color: themeColors.text }}>Loading model... {Math.round(model.downloadProgress * 100)}%</Text>
            )}

            {progress && (
                <Text style={[styles.progressText, { color: themeColors.text }]}>{progress}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scanButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 5,
        alignSelf: 'center',
        marginVertical: 20
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 16,
        letterSpacing: 0.5
    },
    progressText: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 14
    },
    resultsContainer: {
        marginTop: 20,
        padding: 15,
        borderRadius: 10,
        borderWidth: 1
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5
    },
    resultText: {
        marginBottom: 5
    }
});