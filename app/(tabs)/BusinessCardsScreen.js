import React, { useState, useContext, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subscribeToBusinessCards } from '@/services/businessCardService';
import { getLocalBusinessCards } from '@/services/localBusinessCardService';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { AuthContext } from '@/contexts/AuthContext';

export default function BusinessCardsScreen() {
    const { user } = useContext(AuthContext);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const { themeColors } = useDarkMode();

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            if (user) {
                const unsubscribe = subscribeToBusinessCards((cardsData) => {
                    setCards(cardsData);
                    setLoading(false);
                });
                return () => unsubscribe();
            } else {
                getLocalBusinessCards()
                .then((localCards) => {
                    setCards(localCards);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error loading local cards', error);
                    setLoading(false);
                });
            }
        }, [user])
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={ themeColors.accent }/>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            {cards.length === 0 ? (
                <Text style={[styles.message, { color: themeColors.text }]}>No business cards found.</Text>
            ) : (
                <FlatList
                    data={cards}
                    keyExtractor={(item) => item.id || item.scannedAt}
                    renderItem={({ item }) => (
                        <View style={[styles.card, { backgroundColor: themeColors.accent }]}>
                            <Text style={[styles.cardText, { color: themeColors.text }]}>{item.rawText}</Text>
                            <Text style={[styles.cardTimestamp, { color: themeColors.text }]}>{new Date(item.scannedAt).toLocaleString()}</Text>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listContent: {
        paddingBottom: 20
    },
    card: {
        padding: 15,
        marginBottom: 10,
        borderRadius: 8
    },
    cardText: {
        fontSize: 16
    },
    cardTimestamp: {
        fontSize: 12,
        marginTop: 5
    },
    message: {
        textAlign: 'center',
        top: '50%'
    }
});