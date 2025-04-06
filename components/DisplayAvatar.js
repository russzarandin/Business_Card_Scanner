import React, { useState, useEffect } from 'react';
import { Image, ActivityIndicator, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { generateAvatar, defaultAvatarOptions } from '@/config/avatarConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';


const DisplayAvatar = ({ uri, style }) => {
    const [svg, setSvg] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(false);
    const placeholderImage = require('@/assets/images/placeholder.png');
    // const isSvg = uri.trim().startsWith('<svg');
    // const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" /></svg>`;
    console.log('Received URI in DisplayAvatar:', uri);

    if (!uri || imageError) {
        return <Image source={placeholderImage} style={[styles.avatar, style]} />;
    }
        
    // If the URL indicates an SVG, render using SvgXml
    if (uri.startsWith('<svg')) {
        if (loading) {
            return <ActivityIndicator style={styles.loading} size='small' color='#007AAF' />;
        }
        return <SvgXml xml={uri} width={style?.width || 150} height={style?.height || 150} />;
    } else {
        // Assume it is a png/jpg/jpeg/bmp/gif/webp and render using <Image />
        return (
            <Image 
                source={{ uri }}
                style={[style.avatar, style]}
                onError={() => setImageError(true)}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
            />
        )
    }
};

const styles = StyleSheet.create({
    loading: {
        alignSelf: 'center'
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 2,
        borderColor: '#FFF',
        marginTop: 20
    },
});

export default DisplayAvatar;