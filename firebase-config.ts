import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyAvUWUA-UR3gcyovlmi1hcLheEQWREeH_U",
    authDomain: "bloombase-82218.firebaseapp.com",
    projectId: "bloombase-82218",
    storageBucket: "bloombase-82218.firebasestorage.app",
    messagingSenderId: "631332926094",
    appId: "1:631332926094:web:890852ae166aff86048fdf",
    measurementId: "G-5MVHC85JZJ"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const FIREBASE_DB = getFirestore(FIREBASE_APP);