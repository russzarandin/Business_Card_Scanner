import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
// import { HelloWave } from '@/components/HelloWave';
import CameraComponent from '@/components/CameraComponent';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [photoPath, setPhotoPath] = useState(null);
  
  return (
    <View style={styles.container}>
      {/* <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Business Card Scanner</ThemedText>
        <HelloWave />
      </ThemedView> */}

      <CameraComponent onCapture={setPhotoPath} />

      {photoPath && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}type='subtitle'>Last Captured Image:</Text>
            <Image source={{ uri: `file://${photoPath}` }} style={styles.image} />
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
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
    color: 'white',
    fontSize: 18
  },
  image: {
    height: 200,
    width: '100%',
    resizeMode: 'contain',
    marginTop: 10
  },
});
