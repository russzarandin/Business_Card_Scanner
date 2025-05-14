import { firestore, auth } from '@/config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch, getDoc } from 'firebase/firestore';

export async function saveBusinessCard(cardData) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not logged in');
    }
    const userCardsRef = collection(firestore, 'users', user.uid, 'businessCards');
    cardData.timestamp = cardData.timestamp || new Date().toISOString();
    return await addDoc(userCardsRef, cardData);
};

export function subscribeToBusinessCards(callback) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not logged in');
    }
    const userCardsRef = collection(firestore, 'users', user.uid, 'businessCards');
    const q = query(userCardsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()}));
        callback(cards);
    });

    return unsubscribe;
};

export async function getBusinessCardById(id) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not logged in');
    }
    const docRef = doc(firestore, 'users', user.uid, 'businessCards', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export async function updateBusinessCard(id, data) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not logged in');

    }

    const docRef = doc(firestore, 'users', user.uid, 'businessCards', id);
    await updateDoc(docRef, data);
};

export async function deleteBusinessCard(cardId) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not logged in');
    }

    const docRef = doc(firestore, 'users', user.uid, 'businessCards', cardId);
    await deleteDoc(docRef);
    console.log(`Business card ${cardId} deleted successfully`);
};

export async function deleteMultipleBusinessCards(cardIds) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not logged in');
    }

    const batch = writeBatch(firestore);

    cardIds.forEach(cardId => {
        const docRef = doc(firestore, 'users', user.uid, 'businessCards', cardId);
        batch.delete(docRef);
    });

    await batch.commit();
    console.log(`${cardIds.length} business cards deleted successfully`);
};