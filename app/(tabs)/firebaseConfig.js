

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCxdnSSDbMy0cvvCnMl_SP0c9EKXG2_pEk",
  authDomain: "audit-tracking-system.firebaseapp.com",
  projectId: "audit-tracking-system",
  storageBucket: "audit-tracking-system.appspot.com",
  messagingSenderId: "166997509943",
  appId: "1:166997509943:web:311bb283cfcbb27a323cb2",
  measurementId: "G-EK06KKD577",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { db, auth };
