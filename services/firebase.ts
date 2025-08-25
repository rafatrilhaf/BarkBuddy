// services/firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArX5MuCavqggXgYkRGmfBpUjh8P6pVxMQ",
  authDomain: "barkbuddy-bd.firebaseapp.com",
  projectId: "barkbuddy-bd",
  storageBucket: "barkbuddy-bd.firebasestorage.app",
  messagingSenderId: "41034629472",
  appId: "1:41034629472:web:5b975afff21197bedb5e05",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
