// src/screens/Famille.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView, // Pour une meilleure gestion des encoches
  KeyboardAvoidingView, // Pour gérer le clavier
  Platform, // Pour adapter le comportement du KeyboardAvoidingView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Assurez-vous d'installer cette librairie

const Famille = ({ navigation }) => {
  const [familyName, setFamilyName] = useState('');
  const [numChildren, setNumChildren] = useState('');
  const [childrenNames, setChildrenNames] = useState([]);

  // Met à jour le nombre d'enfants et ajuste le tableau des prénoms
  const handleNumChildrenChange = (value) => {
    const num = parseInt(value, 10); // Spécifier la base 10
    if (!isNaN(num) && num >= 0) { // S'assurer que c'est un nombre valide et positif
      setNumChildren(String(num)); // Garder la valeur comme chaîne pour le TextInput
      // Garder les prénoms existants et ajouter des chaînes vides si nécessaire
      setChildrenNames(prevNames => {
        const newNames = Array(num).fill('');
        for (let i = 0; i < Math.min(prevNames.length, num); i++) {
          newNames[i] = prevNames[i];
        }
        return newNames;
      });
    } else if (value === '') {
      setNumChildren('');
      setChildrenNames([]);
    }
  };

  // Met à jour le prénom d'un enfant
  const handleChildNameChange = (index, name) => {
    const updatedNames = [...childrenNames];
    updatedNames[index] = name;
    setChildrenNames(updatedNames);
  };

  const handleSave = () => {
    // Ici tu peux sauvegarder les infos dans Redux ou AsyncStorage
    // Exemple : dispatch({type: 'SET_FAMILY', payload: { familyName, childrenNames }})

    // Validation simple
    if (!familyName.trim()) {
      alert('Veuillez entrer le nom de la famille.');
      return;
    }
    if (numChildren !== '' && parseInt(numChildren, 10) > 0) {
      const emptyChildName = childrenNames.some(name => !name.trim());
      if (emptyChildName) {
        alert('Veuillez entrer les prénoms de tous les enfants.');
        return;
      }
    }

    console.log('Nom de famille:', familyName);
    console.log('Prénoms des enfants:', childrenNames);
    alert('Configuration de la famille enregistrée !'); // Feedback visuel

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Icon name="home-group" size={45} color="#FF7043" style={styles.headerIcon} />
            <Text style={styles.mainTitle}>Votre Espace Famille</Text>
            <Text style={styles.subtitle}>Personnalisez votre profil familial.</Text>
          </View>

          {/* Section Nom de la famille */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="tag-outline" size={24} color="#8D6E63" />
              <Text style={styles.cardTitle}>Nom de la famille</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ex: Famille Dupont"
              placeholderTextColor="#A0A0A0"
              value={familyName}
              onChangeText={setFamilyName}
            />
          </View>

          {/* Section Nombre d'enfants */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="numeric" size={24} color="#66BB6A" />
              <Text style={styles.cardTitle}>Combien d'enfants ?</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
              value={numChildren}
              onChangeText={handleNumChildrenChange}
            />
          </View>

          {/* Section Prénoms des enfants (dynamique) */}
          {childrenNames.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name="account-group-outline" size={24} color="#42A5F5" />
                <Text style={styles.cardTitle}>Prénoms des enfants</Text>
              </View>
              {childrenNames.map((name, idx) => (
                <View key={idx} style={styles.childInputContainer}>
                  <Text style={styles.childLabel}>Enfant {idx + 1} :</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={`Prénom de l'enfant ${idx + 1}`}
                    placeholderTextColor="#A0A0A0"
                    value={name}
                    onChangeText={(text) => handleChildNameChange(idx, text)}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Bouton Enregistrer */}
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Icon name="content-save-outline" size={22} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Enregistrer la famille</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCE4EC', // Rose très pâle, chaleureux
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40, // Espace pour le clavier
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 15,
    backgroundColor: '#FFF3E0', // Crème pâle
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  headerIcon: {
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D84315', // Orange brûlé
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8D6E63', // Marron doux
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5', // Ligne très claire
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242', // Gris foncé
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0', // Bordure plus douce
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA', // Fond légèrement teinté
  },
  childInputContainer: {
    marginBottom: 15,
  },
  childLabel: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#FF7043', // Orange vif et chaleureux
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 20,
    shadowColor: '#FF7043',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    textTransform: 'uppercase',
  },
});

export default Famille;