import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useOCR, DETECTOR_CRAFT_800, RECOGNIZER_EN_CRNN_128, RECOGNIZER_EN_CRNN_256, RECOGNIZER_EN_CRNN_512 } from 'react-native-executorch';
import * as FileSystem from 'expo-file-system';

import { extractContactInfo } from '@/utils/ocrProcessing';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { saveBusinessCard } from '@/services/businessCardService';
import { saveLocalBusinessCard } from '@/services/localBusinessCardService';
import NetInfo from '@react-native-community/netinfo';
import { AuthContext } from '@/contexts/AuthContext';
import captureCropAndRecognizeText from 'react-native-ocr-scanner';

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

    const handleScan = async () => {
        try {
            if (!model.isReady) {
                Alert.alert('Model loading', 'Please wait for the model to finish loading');
                return;
            }

            setProgress('Starting scan...');

            const scanResult = await captureCropAndRecognizeText();

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

            // Save results
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

            console.log('--- Structured Contact Info ---');
            console.log('Name:', processedData.name);
            console.log('Title:', processedData.title);
            console.log('Company:', processedData.company);
            console.log('Emails:', processedData.emails);
            console.log('Phones:', processedData.phones``);
            console.log('Websites:', processedData.websites);
            console.log('Socials:', processedData.social);
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

            {ocrResults && (
                <View style={[styles.resultsContainer, { borderColor: themeColors.accent }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Raw OCR Text:</Text>
                    <Text style={[styles.resultText, { color: themeColors.text }]}>{ocrResults.rawText}</Text>
                    
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Extracted information:</Text>
                    <Text style={[styles.resultText, { color: themeColors.text }]}>Name: {ocrResults.processedData.name || 'Not found'}</Text>
                    <Text style={[styles.resultText, { color: themeColors.text }]}>Company: {ocrResults.processedData.company || 'Not found'}</Text>
                    <Text style={[styles.resultText, { color: themeColors.text }]}>Emails: {ocrResults.processedData.emails.join(', ') || 'Not found'}</Text>
                </View>
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