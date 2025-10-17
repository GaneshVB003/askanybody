import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBAhV-zDVG6anJ-Ox8LA_UHeHTPN2R6fXs",
  authDomain: "studio-4201862341-a37db.firebaseapp.com",
  projectId: "studio-4201862341-a37db",
  storageBucket: "studio-4201862341-a37db.firebasestorage.app",
  messagingSenderId: "1032963134049",
  appId: "1:1032963134049:web:a79f7dbc9c553752ce1020"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

export { auth, db, storage };