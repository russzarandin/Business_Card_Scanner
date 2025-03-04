import { firestore, auth } from '@/config/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

export async function saveBusinessCard(cardData) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not logged in');
    }
    const userCardsRef = collection(firestore, 'users', user.uid, 'businessCards');
    cardData.timestamp = cardData.timestamp || new Date().toISOString();
    return await addDoc(userCardsRef, cardData);
}

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