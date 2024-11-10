import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // Import Firestore
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxdnSSDbMy0cvvCnMl_SP0c9EKXG2_pEk",
  authDomain: "audit-tracking-system.firebaseapp.com",
  projectId: "audit-tracking-system",
  storageBucket: "audit-tracking-system.firebasestorage.app",
  messagingSenderId: "166997509943",
  appId: "1:166997509943:web:311bb283cfcbb27a323cb2",
  measurementId: "G-EK06KKD577"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Export the necessary Firebase services
export { db, auth };