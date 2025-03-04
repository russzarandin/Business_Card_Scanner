import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyCBV6XyfLeQZEWxzxPaF6YbGB1CJWnRqAg',
    authDomain: 'ar-ai-app-v1.firebaseapp.com',
    databaseURL: 'https://ar-ai-app-v1.firebaseio.com',
    projectId: 'ar-ai-app-v1',
    storageBucket: 'ar-ai-app-v1.firebasestorage.app',
    messagingSenderId: '385891708943',
    appId: '1:385891708943:web:1a3a87d941ac669536337a',
    measurementId: 'G-8NHTP1S09P'
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };