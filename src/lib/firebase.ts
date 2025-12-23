
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCDGA-g9BnIPE4BdmS9X5PjzqRsWD11afE",
    authDomain: "futoraone-92489.firebaseapp.com",
    projectId: "futoraone-92489",
    storageBucket: "futoraone-92489.firebasestorage.app",
    messagingSenderId: "670532875984",
    appId: "1:670532875984:web:1843189ff642c51fbd50d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
