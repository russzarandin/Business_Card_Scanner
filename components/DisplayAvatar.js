/**
 *  @fileoverview This component is responsible for displaying the avatar/profile picture in the settings.js
 */
import React, { useState, useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import axios from 'axios';

const DisplayAvatar = ({ uri, style, themeColors }) => {
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [svgContent, setSvgContent] = useState(null);
    const placeholderImage = require('@/assets/images/placeholder.png');

    useEffect(() => {
        if (!uri) {
            setLoading(false);
            setImageError(true);
            return;
        }

        const fetchSvg = async () => {
            try {
                setLoading(true);
                setImageError(false);

                if (uri.startsWith('<svg')) {
                    setSvgContent(uri);
                    return;
                }

                const response = await axios.get(uri, {
                    headers: {
                        'Content-Type': 'image/svg+xml'
                    }
                });

                if (response.data) {
                    setSvgContent(response.data);
                } else {
                    setImageError(true);
                }
            } catch (error) {
                console.error('Error fetching avatar:', error);
                setImageError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchSvg();
    }, [uri]);

    if (!uri || imageError) {
        return <Image source={placeholderImage} style={[styles.avatar, style]} />;
    }

    if (loading) {
        return (
            <View style={[styles.avatar, style, styles.loadingContainer]}>
                <ActivityIndicator size='small' color={themeColors.textPrimary} />
            </View>
        );
    }

    if (svgContent) {
        return (
            <View style={[styles.avatar, style]}>
                <SvgXml
                    xml={svgContent}
                    width='100%'
                    height='100%'
                />
            </View>
        )
    }

    return (
        <Image
            source={{ uri }}
            style={[styles.avatar, style]}
            onError={() => setImageError(true)}
        />
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        alignSelf: 'center',
        justifyContent: 'center'
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FFF',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: 'transparent'
    },
});

export default DisplayAvatar;