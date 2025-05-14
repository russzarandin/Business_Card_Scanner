import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'LOCAL_BUSINESS_CARDS';

// Save business card locally and stored to array under STORAGE_KEY
export async function saveLocalBusinessCard(card) {
    try {
        const existingCards = await AsyncStorage.getItem(STORAGE_KEY);
        const cards = existingCards ? JSON.parse(existingCards) : [];
        // Add new card at the beginning of the array
        cards.unshift(card);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
        console.log('Local business card saved');
    } catch (error) {
        console.error('Error saving local business card:', error)
    }
};


// Retrieve all local scanned business cards
export async function getLocalBusinessCards() {
    try {
        const cardsString = await AsyncStorage.getItem(STORAGE_KEY);
        return cardsString ? JSON.parse(cardsString) : [];
    } catch (error) {
        console.error('Error retrieving local business cards:', error);
        return [];
    }
};

export async function clearLocalBusinessCards() {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
        console.log('Local business cards cleared.');
    } catch (error) {
        console.error('Error clearing local business cards:', error);
    }
};

export async function deleteLocalBusinessCard(cardIdentifier) {
    try {
        const existingCards = await AsyncStorage.getItem(STORAGE_KEY);
        if (!existingCards) return;

        const cards = JSON.parse(existingCards);
        const updatedCards = cards.filter(card =>
            (card.id !== cardIdentifier && card.scannedAt !== cardIdentifier)
        );

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
        console.log('Local business card deleted');
    } catch (error) {
        console.error('Error deleting local business cards:', error);
    }
};

export async function deleteMultipleLocalBusinessCards(cardIdentifiers) {
    try {
        const existingCards = await AsyncStorage.getItem(STORAGE_KEY);
        if (!existingCards) return;

        const cards = JSON.parse(existingCards);
        const updatedCards = cards.filter(card =>
            (!cardIdentifiers.includes(card.id) && !cardIdentifiers.includes(card.scannedAt))
        );

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
        console.log(`${cardIdentifiers.length} local business cards deleted`);
    } catch (error) {
        console.error(`Error deleting multiple local business cards:`, error);
    }
};