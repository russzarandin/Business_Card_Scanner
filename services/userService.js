import { firestore, auth } from '@/config/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

export const updateUserAvatar = async (userId, avatarUrl) => {
    try {
        const userDocRef = doc(firestore, 'users', userId);
        await setDoc(userDocRef, { avatarUrl }, { merge: true });
        // Updates firebase auth's user profile to reflect new avatar
        await updateProfile(auth.currentUser, { photoURL: avatarUrl });
        console.log('User avatar updated');
    } catch (error) {
        console.error('Error updating user avatar', error);
        throw error;
    }
};

export const getUserAvatar = async (userId) => {
    try {
        const userDocRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userDocRef);   
        if (userDoc.exists()) {
            return userDoc.data().avatarUrl || null;
        } else {
            console.warn('User profile icon not found');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user avatar', error);
        return null;
    }
};

export const updateUserProfile = async (userId, profileData) => {
    try {
        const userDocRef = doc(firestore, 'users', userId);
        await setDoc(userDocRef, profileData, { merge: true});
        console.log('user profile updated successfully');
    } catch (error) {
        console.error('Error updating user profile', error);
        throw error;
    }
};