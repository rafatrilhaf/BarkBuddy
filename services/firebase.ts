// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArX5MuCavqggXgYkRGmfBpUjh8P6pVxMQ",
  authDomain: "barkbuddy-bd.firebaseapp.com",
  projectId: "barkbuddy-bd",
  storageBucket: "barkbuddy-bd.firebasestorage.app",
  messagingSenderId: "41034629472",
  appId: "1:41034629472:web:5b975afff21197bedb5e05",
  measurementId: "G-PXFPK5M1N4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);