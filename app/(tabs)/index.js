import React, { useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import captureCropAndRecognizeText from 'react-native-ocr-scanner';
import { extractContactInfo } from '@/utils/ocrProcessing';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { saveBusinessCard } from '@/services/businessCardService';
import { saveLocalBusinessCard } from '@/services/localBusinessCardService';
import { AuthContext } from '@/contexts/AuthContext';
import NetInfo from '@react-native-community/netinfo';

export default function HomeScreen() {
  const { themeColors } = useDarkMode();
  const { user } = useContext(AuthContext);

  const handleScan = async () => {
    try {
        const result = await captureCropAndRecognizeText();
        const processedData = extractContactInfo(result.text);

        const cardData = {
          ...processedData,
          scannedAt: new Date().toISOString()
        }
        
        const netState = await NetInfo.fetch();
        if (!netState.isConnected || !user) {
          await saveLocalBusinessCard(cardData);
          console.log('Saved locally', cardData);
        } else {
          await saveBusinessCard(cardData);
          console.log('Saved to Firestore', cardData)
        }
        Alert.alert('Success', 'Business card saved successfully');
        console.log('--- Structured Contact Info ---');
        console.log('Name:', processedData.name);
        console.log('Title:', processedData.title);
        console.log('Company:', processedData.company);
        console.log('Emails:', processedData.emails);
        console.log('Phones:', processedData.phones);
        console.log('Websites:', processedData.websites);
        console.log('Socials:', processedData.social);

        console.log('\n--- Contextual Line Analysis ---');
        result.blocks.forEach((block, index) => {
            console.log(`Line ${index +1}:`, {
                text: block.text,
                type: determineLineType(block.text, processedData)
            });
        });
    } catch (error) {
        console.error('Scan Error:', error);
        Alert.alert('Error', 'Failed to scan or save the business card');
    }
  };

  const determineLineType = (text, data) => {
    if (data.name === text) return 'NAME';
    if (data.title === text) return 'TITLE';
    if (data.company === text) return 'COMPANY';
    if (data.emails.includes(text)) return 'EMAIL';
    if (data.phones.some(p => text.includes(p))) return 'PHONE';
    if (data.websites.includes(text)) return 'WEBSITE';
    if (Object.values(data.social).flat().includes(text)) return 'SOCIAL';
    return 'OTHER';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleScan} style={[styles.scanButton, { backgroundColor: themeColors.accent }]}>
        <Text style={[styles.buttonText, { color: themeColors.text }]}>Scan Business Card</Text>    
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
