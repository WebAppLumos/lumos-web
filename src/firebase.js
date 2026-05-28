// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAykGNS2GvJRJshwRz55klv2L8CQX4VTcU",
  authDomain: "lumos-auth.firebaseapp.com",
  projectId: "lumos-auth",
  storageBucket: "lumos-auth.firebasestorage.app",
  messagingSenderId: "1033076551089",
  appId: "1:1033076551089:web:a808d5928328b7ce65a190",
  measurementId: "G-5MSWV70XS7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);