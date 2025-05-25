// src/screens/Ajouter_plat.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  SafeAreaView, // Pour une meilleure gestion des encoches
  KeyboardAvoidingView, // Pour gérer le clavier
  ScrollView, // Pour rendre l'écran scrollable
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDispatch } from 'react-redux';
import { addFavorite } from '../features/FavoriteSlice';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Assurez-vous d'installer cette librairie (npm install react-native-vector-icons)

export default function Ajouter_plat() {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState(''); // Ajout d'un champ description
  const [image, setImage] = useState(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES, // Nouvelle permission pour Android 13+
          {
            title: 'Accès à la Galerie',
            message: 'Nous avons besoin de votre permission pour accéder à vos photos afin de sélectionner une image pour le plat.',
            buttonNeutral: 'Demander plus tard',
            buttonNegative: 'Annuler',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission requise', "L'accès à la galerie est nécessaire pour choisir une image.");
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 1000, // Augmenter la taille pour une meilleure qualité
        maxHeight: 1000,
        quality: 0.8, // Légère compression pour la performance
      },
      (response) => {
        if (response.didCancel) {
          console.log('Sélection d\'image annulée.');
        } else if (response.errorCode) {
          console.log('Erreur lors de la sélection de l\'image: ', response.errorMessage);
          Alert.alert('Erreur', 'Impossible de sélectionner l\'image. Veuillez réessayer.');
        } else if (response.assets && response.assets.length > 0) {
          setImage(response.assets[0].uri);
        }
      }
    );
  };

  const handleAjouterPlat = () => {
    if (nom.trim() && image) {
      dispatch(addFavorite({ id: Date.now(), nom: nom.trim(), image: { uri: image }, description: description.trim() }));
      Alert.alert('Succès', 'Votre plat a été ajouté avec succès !', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Champs requis', 'Veuillez renseigner au moins le nom du plat et sélectionner une image.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Ajouter un Nouveau Plat</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom du plat :</Text>
              <TextInput
                placeholder="Ex: Salade composée fraîche"
                placeholderTextColor="#A0A0A0"
                style={styles.input}
                value={nom}
                onChangeText={setNom}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (optionnel) :</Text>
              <TextInput
                placeholder="Quelques mots sur votre plat..."
                placeholderTextColor="#A0A0A0"
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <Icon name="camera-plus-outline" size={40} color="#7F8C8D" />
                  <Text style={styles.imagePickerText}>Ajouter une photo du plat</Text>
                </View>
              )}
            </TouchableOpacity>

            {image && (
              <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImageButton}>
                <Text style={styles.removeImageButtonText}>Supprimer l'image</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleAjouterPlat} style={styles.addButton}>
              <Text style={styles.addButtonText}>Confirmer l'ajout</Text>
              <Icon name="silverware-fork-knife" size={20} color="#FFFFFF" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Fond légèrement gris
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30, // Espace en bas pour le clavier
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 15,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700', // Plus gras
    color: '#333',
    flex: 1, // Pour que le titre prenne l'espace restant
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15, // Coins arrondis
    padding: 20,
    shadowColor: '#000', // Ombre subtile
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0', // Couleur de bordure plus douce
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FDFDFD',
  },
  textArea: {
    height: 120, // Plus de hauteur pour la description
    textAlignVertical: 'top', // Texte aligné en haut
  },
  imagePickerButton: {
    backgroundColor: '#E8F5E9', // Vert très clair
    height: 180,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D4E8D4', // Bordure légèrement plus foncée
    overflow: 'hidden', // Pour que l'image ne dépasse pas
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#7F8C8D',
    marginTop: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Pour que l'image remplisse bien le cadre
    borderRadius: 10,
  },
  removeImageButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#FFEBEE', // Rouge très clair
    borderRadius: 8,
  },
  removeImageButtonText: {
    color: '#E57373', // Rouge plus doux
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4CAF50', // Vert harmonieux
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row', // Pour aligner texte et icône
    justifyContent: 'center',
    marginTop: 10, // Espacement
    shadowColor: '#4CAF50', // Ombre colorée
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase', // Texte en majuscules
  },
});