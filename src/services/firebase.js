import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  deleteField,
} from 'firebase/firestore';

// GESTION DE LA CONFIGURATION POUR L'ENVIRONNEMENT LOCAL
let firebaseConfig = {
  apiKey: "AIzaSyCaq6eFR5H8eaDIkyZYVJlDZC6ZtL-znOw",
  authDomain: "smartmarketlist.firebaseapp.com",
  projectId: "smartmarketlist",
  storageBucket: "smartmarketlist.firebasestorage.app",
  messagingSenderId: "697261497427",
  appId: "1:697261497427:web:4e882df8e1ac2719967aa6",
  measurementId: "G-TQEP53DLRJ",
};

// ID de l'application pour Firestore Rules
const appId = 'default-local-app-id';

// Token d'authentification initial (null en local)
const initialAuthToken = null;

// INITIALISATION DES SERVICES FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  app,
  auth,
  db,
  appId,
  initialAuthToken,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  deleteField,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
};