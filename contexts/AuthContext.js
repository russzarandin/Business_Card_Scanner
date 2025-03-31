import React, { createContext, useState, useEffect } from 'react';
import { auth } from '@/config/firebaseConfig';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { getLocalBusinessCards, clearLocalBusinessCards } from '@/services/localBusinessCardService';
import { saveBusinessCard } from '@/services/businessCardService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Sync local business cards to Firestore for the user
    const syncLocalCardsToFirestore = async () => {
        try {
            const localCards = await getLocalBusinessCards();
            if (localCards && localCards.length > 0) {
                for (const card of localCards) {
                    await saveBusinessCard(card);
                }
                await clearLocalBusinessCards();
                console.log('Local business cards synced successfully');
            }
        } catch (error) {
            console.error('Error syncing local cards:', error);
        }
    };

    const signUp = async (name, email, password) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(userCredential.user, { displayName: name });
        setUser(userCredential.user);
        //After signing up, sync local scanned cards
        await syncLocalCardsToFirestore();
        return userCredential.user;
    };

    const signIn = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);

        await syncLocalCardsToFirestore();
        return userCredential.user;
    };

    const signOutUser = async () => {
        await firebaseSignOut(auth);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut: signOutUser }}>
            {children}
        </AuthContext.Provider>
    );
};