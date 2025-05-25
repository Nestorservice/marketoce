/*
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';



const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');


  const handleSignUp = async () => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      // Enregistre les infos supplémentaires dans Firestore
      await firestore().collection('users').doc(userCredential.user.uid).set({
        fullName,
        phone,
        email,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      setMessage('Compte créé avec succès !');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      setMessage('Connexion réussie !');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentification</Text>
      {isSignUp && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nom complet"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Téléphone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </>
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {isSignUp ? (
        <>
          <TouchableOpacity onPress={handleSignUp} style={styles.boutton1}>
            <Text>Créer un compte</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSignUp(false)}>
            <Text style={styles.linkBlue}>Déjà inscrit ? Se connecter</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity onPress={handleSignIn} style={styles.boutton2}>
            <Text>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSignUp(true)}>
            <Text style={styles.linkGray}>Créer un compte</Text>
          </TouchableOpacity>
        </>
      )}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: 'green', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  message: { marginTop: 10, textAlign: 'center', color: 'red' },
  boutton1: { 
    backgroundColor: 'green',
    width: 200,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 70,
    borderRadius: 30,
    marginVertical: 15,
  },
  boutton2: {
    backgroundColor: 'green',
    width: 200,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 70,
    borderRadius: 30,
    marginVertical: 15,
  },
  linkBlue: { 
    color: 'black',
    textAlign: 'center', 
    fontSize: 16, 
    marginVertical: 8,
  },
  linkGray: { 
    color: 'black', 
    textAlign: 'center', 
    fontSize: 16, 
    marginVertical: 8,
  },
  //boutton: {color: 'green'},
});

export default AuthScreen;
*/