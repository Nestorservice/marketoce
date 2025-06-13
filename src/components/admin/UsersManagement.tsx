import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card'; // Adjusted path to components/ui
import { Button } from '../../components/ui/button';
import { Trash2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

// Import Firebase functions from your service file
// Ensure these are correctly exported from '../../services/firebase'
import { db, doc, onSnapshot, setDoc, deleteDoc, auth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from '../../services/firebase';

// Import the AuthContext to get the current user's UID
import { useAuth } from '../../contexts/AuthContext';

interface UserProfile {
  id: string; // This will be the UID from Firebase Auth
  name: string;
  email: string;
  status: 'Actif' | 'Inactif';
  joined: string; // ISO string 'YYYY-MM-DD'
  dietPreference: string;
  householdSize: number;
}

const UsersManagement: React.FC = () => {
  const { user } = useAuth(); // Get the authenticated user from AuthContext
  const currentUserId = user?.uid; // Get the UID of the current user, will be null if not logged in

  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // To track if auth state is known
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // To track profile loading

  // --- Firebase Auth State Listener ---
  // This useEffect ensures we only attempt Firestore operations once the user's auth state is known.
  // It also handles anonymous and custom token sign-in.
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token && !authUser) {
        // Only attempt custom token sign-in if a token is present and no user is currently authenticated
        try {
          await signInWithCustomToken(auth, window.__initial_auth_token);
          // console.log("Signed in with custom token from Canvas.");
        } catch (error) {
          console.error("Error signing in with custom token:", error);
          // Fallback to anonymous sign-in if custom token fails
          try {
            await signInAnonymously(auth);
            // console.log("Signed in anonymously after custom token failure.");
          } catch (anonError) {
            console.error("Error signing in anonymously:", anonError);
          }
        }
      } else if (!authUser && !window.__initial_auth_token) {
        // If no custom token and no user, sign in anonymously for local dev or general use
        try {
          await signInAnonymously(auth);
          // console.log("Signed in anonymously (no custom token).");
        } catch (error) {
          console.error("Error signing in anonymously:", error);
        }
      }
      setIsAuthReady(true); // Auth state is now known (user is either logged in or not)
    });
    return () => unsubscribeAuth();
  }, []); // Empty dependency array means this runs once on mount


  // --- Fetch User Profile Data from Firestore (Real-time listener) ---
  useEffect(() => {
    // Only proceed if user is authenticated and auth state is ready
    if (!currentUserId || !isAuthReady) {
      setCurrentUserProfile(null); // Clear profile if no user or auth not ready
      setIsLoadingProfile(false);
      return;
    }

    setIsLoadingProfile(true);
    // Reference to the specific user's document using their UID as the document ID
    const userDocRef = doc(db, 'users', currentUserId);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        // Document exists, map Firestore data to UserProfile interface
        const data = docSnap.data();
        const profile: UserProfile = {
          id: docSnap.id, // The document ID is the user's UID
          name: data.name || user?.displayName || user?.email?.split('@')[0] || 'Nom Inconnu',
          email: data.email || user?.email || 'Email Inconnu',
          status: data.status || 'Actif',
          joined: data.joined || new Date().toISOString().split('T')[0],
          dietPreference: data.dietPreference || 'Non spécifié',
          householdSize: data.householdSize || 1,
        };
        setCurrentUserProfile(profile);
      } else {
        // Document does not exist, create a default profile for the new user
        console.log("No user profile found, creating default...");
        const defaultProfile: UserProfile = {
          id: currentUserId,
          name: user?.displayName || user?.email?.split('@')[0] || 'Nouvel Utilisateur',
          email: user?.email || 'email@example.com',
          status: 'Actif',
          joined: new Date().toISOString().split('T')[0], // Current date
          dietPreference: 'Omnivore',
          householdSize: 1,
        };
        // Use setDoc to create the document with the user's UID as ID
        // setDoc will overwrite if it exists, or create if it doesn't
        setDoc(userDocRef, defaultProfile)
          .then(() => {
            console.log("Default user profile created successfully.");
            setCurrentUserProfile(defaultProfile); // Update state with the newly created profile
            toast.success("Profil utilisateur créé.");
          })
          .catch(error => {
            console.error("Error creating default user profile:", error);
            toast.error("Erreur lors de la création du profil utilisateur.");
          });
      }
      setIsLoadingProfile(false);
    }, (error) => {
      console.error("Erreur lors du chargement du profil utilisateur :", error);
      toast.error('Impossible de charger le profil utilisateur.');
      setIsLoadingProfile(false);
    });

    // Clean up the subscription on unmount or when currentUserId changes
    return () => unsubscribe();
  }, [currentUserId, isAuthReady, user]); // Re-run if user's UID or auth state changes

  // --- Actions ---

  // Placeholder for generating a shopping list (usually done in ListeDeCourses)
  const onGenerateShoppingList = useCallback(() => {
    toast.info('Génération de la liste de courses pour votre profil...');
    // In a real app, this might navigate to a pre-filled shopping list creation page
    // or trigger a Cloud Function to generate one based on user preferences.
  }, []);

  // Delete the current user's profile document from Firestore
  const onDeleteUser = useCallback(async () => {
    if (!currentUserId) {
      toast.error("Vous devez être connecté pour supprimer votre profil.");
      return;
    }
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre profil ? Cette action est irréversible.")) {
      try {
        await deleteDoc(doc(db, 'users', currentUserId));
        toast.success('Votre profil a été supprimé.');
        // Optionally, sign out the user here if deleting their profile should also log them out
        // auth.signOut();
      } catch (error) {
        console.error("Erreur lors de la suppression du profil :", error);
        toast.error('Erreur lors de la suppression de votre profil.');
      }
    }
  }, [currentUserId]);

  // --- Conditional Rendering ---
  if (!isAuthReady || isLoadingProfile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Chargement du profil utilisateur...</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentUserProfile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Aucun profil utilisateur trouvé ou vous n'êtes pas connecté.</p>
          {/* You could add a login/signup prompt here */}
        </CardContent>
      </Card>
    );
  }

  // If currentUserProfile exists, display it in a table-like structure for a single user
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Régime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Foyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUserProfile && ( // Ensure currentUserProfile is not null
                <tr key={currentUserProfile.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {currentUserProfile.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{currentUserProfile.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {currentUserProfile.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {currentUserProfile.dietPreference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {currentUserProfile.householdSize} personne{currentUserProfile.householdSize > 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      currentUserProfile.status === 'Actif'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {currentUserProfile.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onGenerateShoppingList} // No need to pass ID as it's the current user
                      className="mr-2"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Générer liste
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onDeleteUser} // No need to pass ID as it's the current user
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersManagement;