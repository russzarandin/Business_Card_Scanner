import React, { useState, useContext, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { subscribeToBusinessCards, deleteBusinessCard, deleteMultipleBusinessCards } from '@/services/businessCardService';
import { getLocalBusinessCards, deleteLocalBusinessCard, deleteMultipleLocalBusinessCards } from '@/services/localBusinessCardService';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BusinessCardsScreen() {
    const { user } = useContext(AuthContext);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedCards, setSelectedCards] = useState([]);
    const { themeColors } = useDarkMode();
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            setIsSelectionMode(false);
            setSelectedCards([]);

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

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedCards([]);
    };

    const toggleCardSelection = (cardId) => {
        setSelectedCards(prevSelectedCards => {
            if (prevSelectedCards.includes(cardId)) {
                return prevSelectedCards.filter(id => id !== cardId);
            } else {
                return [...prevSelectedCards, cardId];
            }
        });
    };

    const handleCardPress = (item) => {
        if (isSelectionMode) {
            toggleCardSelection(item.id || item.scannedAt);
        } else {
            router.push({
                pathname: '/auth/EditBusinessCardScreen',
                params: { cardId: item.id, rawText: item.rawText }
            });
        }
    };

    const confirmDelete = async (multiple = false, cardId = null) => {
        const message = multiple
            ? `Are you sure you want to delete ${selectedCards.length} selected business cards?`
            : 'Are you sure you want to delete this business card?';

        Alert.alert(
            'Confirm delete',
            message,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        if (multiple) {
                            handleDeleteMultiple();
                        } else {
                            handleDelete(cardId);
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = async (cardId) => {
        try {
            if (user) {
                await deleteBusinessCard(cardId);
            } else {
                await deleteLocalBusinessCard(cardId);
                setCards(cards.filter(card => (card.id || card.scannedAt) !== cardId));
            }
        } catch (error) {
            console.error('Error deleting business card:', error);
            Alert.alert('Error', 'Failed to delete business card. Please try again.');
        }
    };

    const handleDeleteMultiple = async () => {
        if (selectedCards.length === 0) return;

        try {
            if (user) {
                await deleteMultipleBusinessCards(selectedCards);
            } else {
                await deleteMultipleLocalBusinessCards(selectedCards);
                setCards(cards.filter(card => 
                    !selectedCards.includes(card.id || card.scannedAt)
                ));
            }
            setIsSelectionMode(false);
            setSelectedCards([]);
        } catch (error) {
            console.error('Error deleting multiple business cards:', error);
            Alert.alert('Error', 'Failed to delete multiple business cards. Please try again');
        }
    };

    const renderItem = ({ item }) => {
        const cardId = item.id || item.scannedAt;
        const isSelected = selectedCards.includes(cardId);

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    { backgroundColor: themeColors.primary },
                    isSelected && { borderColor: themeColors.primary, borderWidth: 2 }
                ]}
                onPress={() => handleCardPress(item)}
                onLongPress={() => {
                    if (!isSelectionMode) {
                        setIsSelectionMode(true);
                        toggleCardSelection(cardId);
                    }
                }}
            >
                <View style={styles.cardContent}>
                    <View style={styles.cardTextContainer}>
                        <Text style={[styles.cardText, { color: themeColors.textPrimary }]}>
                            {item.rawText}
                        </Text>
                        <Text style={[styles.cardTimestamp, { color: themeColors.textSecondary }]}>
                            {new Date(item.scannedAt).toLocaleString()}
                        </Text>
                    </View>

                    {isSelectionMode ? (
                        <Ionicons
                            name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color={isSelected ? themeColors.primary : themeColors.textSecondary}
                        />
                    ) : (
                        <TouchableOpacity
                            onPress={() => confirmDelete(false, cardId)}
                            style={styles.deleteButton}
                        >
                            <Ionicons
                                name="trash-outline" size={20} color={themeColors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: themeColors.backgroundPrimary }]}>
                <ActivityIndicator size='large' color={ themeColors.primary }/>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundPrimary }]}>
            <View style={styles.header}>
                <ThemedText style={{ color: themeColors.textPrimary }} type='title'>Scan history</ThemedText>
                {cards.length > 0 && (
                    <View style={styles.headerActions}>
                        {isSelectionMode && selectedCards.length > 0 && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: themeColors.red }]}
                                onPress={() => confirmDelete(true)}
                            >
                                <Text style={styles.actionButtonText}>Delete ({selectedCards.length})</Text>
                            </TouchableOpacity>
                        )}

                        {cards.length > 1 && (
                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={toggleSelectionMode}
                            >
                                <Text style={{ color: themeColors.primary }}>
                                    {isSelectionMode ? 'Cancel' : 'Select'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {cards.length === 0 ? (
                <Text style={[styles.message, { color: themeColors.textSecondary }]}>No business cards found.</Text>
            ) : (
                <FlatList
                    data={cards}
                    keyExtractor={(item) => item.id || item.scannedAt}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    selectButton: {
        padding: 8
    },
    actionButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginRight: 10
    },
    actionButtonText: {
        fontWeight: '600'
    },
    listContent: {
        paddingBottom: 20
    },
    card: {
        padding: 15,
        marginBottom: 10,
        borderRadius: 8
    },
    selectedCard: {
        borderWidth: 2,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cardTextContainer: {
        flex: 1,
        marginRight: 10
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