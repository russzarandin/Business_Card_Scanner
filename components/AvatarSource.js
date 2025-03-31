import React, { useState, useEffect } from 'react';
import { Image, ActivityIndicator, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';

const AvatarDisplay = ({ uri, style }) => {
    const [svg, setSvg] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (uri && uri.includes('svg')) {
            setLoading(true);
            fetch(uri)
                .then((res) => res.text())
                .then((text) => {
                    setSvg(text);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching SVG:', error);
                    setLoading(false);
                });
        }
    }, [uri]);

    if (!uri) return null;

    // If the URL indicates an SVG, render using SvgXml
    if (uri.includes('svg')) {
        if (loading || !svg) {
            return <ActivityIndicator style={[styles.loading, style]} size='small' color='#007AAF' />;
        }
        return <SvgXml xml={svg} width={style?.width || 100} height={style?.height || 100} />;
    } else {
        // Otherwise, assume it's a PNG/JPG and render using <Image />
        return <Image source={{ uri }} style={style} />;
    }
};

const styles = StyleSheet.create({
    loading: {
        alignSelf: 'center'
    }
});

export default AvatarDisplay;