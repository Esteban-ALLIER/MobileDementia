
// firebase/firebaseConfig.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyBuPM8OHIGjO4TuVmQ2dY3Se2btmowB1es",
    authDomain: "dementia-d0536.firebaseapp.com",
    projectId: "dementia-d0536",
    storageBucket: "dementia-d0536.firebasestorage.app",
    messagingSenderId: "229430803530",
    appId: "1:229430803530:web:f5b2ec50d107ce1361fab3",
    measurementId: "G-7377H343YE"
};

// Initialize Firebase only once
let app: FirebaseApp;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

// Initialize Auth with proper error handling
let auth: Auth;
try {
    auth = getAuth(app);
} catch (error) {
    // If getAuth fails, try initializeAuth
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
}

export { auth };
export const db = getFirestore(app);
export default app;