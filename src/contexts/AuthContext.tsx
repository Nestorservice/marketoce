import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction d'inscription
  const register = async (email, password, firstName, lastName) => {
    try {
      console.log('Début de l\'inscription...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Utilisateur créé :', user.uid, user.email);

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });
      console.log('Profil mis à jour :', user.displayName);

      if (!auth.currentUser) {
        throw new Error('Aucun utilisateur authentifié trouvé.');
      }

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
      });
      console.log('Document utilisateur créé dans Firestore');

      return user;
    } catch (error) {
      console.error('Erreur dans register :', error);
      if (error.code === 'auth/network-request-failed') {
        toast.error('Erreur de connexion réseau. Veuillez vérifier votre connexion Internet.');
      } else if (error.code === 'permission-denied') {
        toast.error('Permissions insuffisantes pour écrire dans la base de données.');
      } else {
        toast.error(`Erreur lors de l'inscription : ${error.message}`);
      }
      throw error;
    }
  };

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      console.log('Début de la connexion...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Utilisateur connecté :', user.uid, user.email);
      return user;
    } catch (error) {
      console.error('Erreur dans login :', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Mot de passe incorrect.');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('Aucun utilisateur trouvé avec cet email.');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('Identifiants invalides.');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Erreur de connexion réseau. Veuillez vérifier votre connexion Internet.');
      } else {
        toast.error(`Erreur lors de la connexion : ${error.message}`);
      }
      throw error;
    }
  };

  // ✅ Fonction de mise à jour du profil utilisateur
  const updateUserProfile = async (updates) => {
    try {
      if (!auth.currentUser) {
        throw new Error("Aucun utilisateur connecté.");
      }

      const { displayName, firstName, lastName, email, ...rest } = updates;
      const uid = auth.currentUser.uid;

      // 🔹 Mise à jour du profil Firebase Auth
      if (displayName) {
        await updateProfile(auth.currentUser, { displayName });
        console.log('Profil Firebase Auth mis à jour.');
      }

      // 🔹 Mise à jour du document Firestore
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const updatedData = {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
          ...rest,
          updatedAt: new Date().toISOString(),
        };

        await updateDoc(userRef, updatedData);
        console.log('Document Firestore mis à jour :', updatedData);
      } else {
        throw new Error("Document utilisateur introuvable dans Firestore.");
      }

      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      console.error('Erreur dans updateUserProfile :', error);
      toast.error(`Erreur lors de la mise à jour du profil : ${error.message}`);
      throw error;
    }
  };

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
      console.log('État d\'authentification changé :', user ? user.uid : 'Aucun utilisateur');
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    register,
    login,
    updateUserProfile, // ✅ exposé dans le contexte
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
