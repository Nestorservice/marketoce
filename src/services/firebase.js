// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth'; // Importez onAuthStateChanged ici
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
  deleteField
} from 'firebase/firestore';

// ======================================================================
// GESTION DE LA CONFIGURATION POUR L'ENVIRONNEMENT CANVAS ET LOCAL
// ======================================================================

// La configuration Firebase sera soit fournie par Canvas, soit une configuration par défaut
let firebaseConfig;
if (typeof __firebase_config !== 'undefined') {
  try {
    firebaseConfig = JSON.parse(__firebase_config);
  } catch (e) {
    console.error("Erreur de parsing de __firebase_config:", e);
    // Fallback si __firebase_config est mal formé
    firebaseConfig = {
      apiKey: "YOUR_LOCAL_API_KEY", // Remplacez par votre clé API locale si vous en avez une
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID"
    };
  }
} else {
  // Configuration pour le développement local si __firebase_config n'est pas défini
  console.warn("Utilisation de la configuration Firebase locale. Assurez-vous d'avoir remplacé les placeholders.");
  firebaseConfig = {
    apiKey: "AIzaSyCaq6eFR5H8eaDIkyZYVJlDZC6ZtL-znOw", // Clé API pour le développement local
    authDomain: "smartmarketlist.firebaseapp.com",
    projectId: "smartmarketlist",
    storageBucket: "smartmarketlist.firebasestorage.app",
    messagingSenderId: "697261497427",
    appId: "1:697261497427:web:4e882df8e1ac2719967aa6",
    measurementId: "G-TQEP53DLRJ"
  };
}

// ID de l'application (utilisé pour Firestore Rules et les chemins de données)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-local-app-id';

// Token d'authentification initial fourni par Canvas (peut être null en local)
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// ======================================================================
// INITIALISATION DES SERVICES FIREBASE
// ======================================================================

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);

// Obtention des instances des services Firebase
const auth = getAuth(app);
const db = getFirestore(app);

// Vous pouvez initialiser analytics ici si nécessaire
// const analytics = getAnalytics(app);


// ======================================================================
// EXPORTS DES SERVICES ET FONCTIONS FIREBASE
// ======================================================================

export {
  app,
  auth,
  db,
  appId,
  initialAuthToken,

  // Fonctions Firestore couramment utilisées
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

  // Fonctions d'authentification spécifiques pour la configuration initiale
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged // <--- AJOUTEZ CETTE LIGNE
};