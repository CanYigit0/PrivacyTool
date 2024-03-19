// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDCo5dnxPT83s44-1B8O0dWWFnst_MiU8",
  authDomain: "social-media-privacy-tool.firebaseapp.com",
  projectId: "social-media-privacy-tool",
  storageBucket: "social-media-privacy-tool.appspot.com",
  messagingSenderId: "720049313347",
  appId: "1:720049313347:web:00b90ce0233dc30d64e6f6",
  measurementId: "G-6EHRNV1EYZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);


export { app,auth }