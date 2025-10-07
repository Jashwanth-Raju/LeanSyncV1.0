// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔹 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBpEI15hzQFEQQP4fo-piU82nRjrfhwsbI",
  authDomain: "leansync-demo.firebaseapp.com",
  projectId: "leansync-demo",
  storageBucket: "leansync-demo.appspot.com", // ✅ double check this matches console
  messagingSenderId: "408357107055",
  appId: "1:408357107055:web:cb991a03e581512a9aa49a",
  measurementId: "G-G23DLJRFJ3",
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

// Firestore
export const db = getFirestore(app);