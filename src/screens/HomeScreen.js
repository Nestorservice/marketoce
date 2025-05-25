// src/screens/HomeScreen.js
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Alert,
  SafeAreaView, // Pour gérer les encoches et barres de statut
  StatusBar, // Pour le style de la barre de statut
  Dimensions, // Pour des tailles responsives
  Platform, // Pour des ajustements spécifiques à la plateforme
  LinearGradient // Pour un bel effet de dégradé (installez 'react-native-linear-gradient')
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Préférer MaterialCommunityIcons
import auth from '@react-native-firebase/auth'; // Pour la déconnexion

// Assurez-vous que cette image existe et est de bonne qualité
const headerImage = require('../../assets/images/home_background.jpeg'); // Image de fond pour l'en-tête

const { width } = Dimensions.get('window'); // Pour des tailles responsives

const HomeScreen = ({ navigation }) => {
  // Obtenir le nom de l'utilisateur connecté si Firebase auth est utilisé
  const user = auth().currentUser;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Utilisateur';

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter de MarketFree ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui',
          onPress: async () => {
            try {
              await auth().signOut();
              // Optionnel: navigation.replace('Auth'); // Assurez-vous que 'Auth' est le nom de votre route de connexion
            } catch (error) {
              console.error('Erreur de déconnexion:', error.message);
              Alert.alert('Erreur', 'Impossible de se déconnecter. Veuillez réessayer.');
            }
          },
        },
      ]
    );
  };

  // Les cartes des fonctionnalités
  const featureCards = [
    { title: 'Configurer ma Famille', icon: 'account-group', screen: 'Famille', color: '#6A5ACD' }, // Slate Blue
    { title: 'Consulter mon Stock', icon: 'food-outline', screen: 'Consulter_stock', color: '#20B2AA' }, // Light Sea Green
    { title: 'Ma Liste de Courses', icon: 'cart-outline', screen: 'ListeCourses', color: '#FFA07A' }, // Light Salmon
    { title: 'Mon Suivi Alimentaire', icon: 'chart-bar', screen: 'Consommation', color: '#4682B4' }, // Steel Blue
    { title: 'Alertes Expirations', icon: 'calendar-alert', screen: 'ProduitsExpires', color: '#CD5C5C' }, // Indian Red
    { title: 'Historique des Activités', icon: 'history', screen: 'Historique', color: '#808080' }, // Gray
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <ImageBackground
          source={headerImage}
          style={styles.imageBackground}
          imageStyle={styles.imageBackgroundStyle}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'transparent']}
            style={styles.gradientOverlay}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                <Icon name="logout-variant" size={24} color="#FFF" />
                <Text style={styles.signOutText}>Déconnexion</Text>
              </TouchableOpacity>

              <Text style={styles.appName}>MarketFree</Text>
              <Text style={styles.welcomeMessage}>Bienvenue, {displayName} !</Text>
              <Text style={styles.currentDate}>{currentDate}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.bottomContainer}>
          <Text style={styles.sectionQuestion}>Que souhaitez-vous gérer aujourd'hui ?</Text>
          <ScrollView contentContainerStyle={styles.cardGrid}>
            {featureCards.map((card, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.card, { borderColor: card.color + '80' }]} // Bordure semi-transparente
                onPress={() => card.screen && navigation.navigate(card.screen)}
              >
                <Icon name={card.icon} size={35} color={card.color} style={styles.cardIcon} />
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Icon name="arrow-right" size={20} color="#777" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Fond général très clair
  },
  container: {
    flex: 1,
  },
  imageBackground: {
    height: Platform.OS === 'ios' ? 280 : 250, // Ajustement pour iOS
    width: '100%',
  },
  imageBackgroundStyle: {
    resizeMode: 'cover',
    borderBottomLeftRadius: 30, // Coins inférieurs arrondis pour un look plus doux
    borderBottomRightRadius: 30,
    overflow: 'hidden', // Important pour que le borderRadius s'applique à l'image
  },
  gradientOverlay: {
    flex: 1,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0, // Gérer la barre de statut Android
    paddingHorizontal: 20,
    justifyContent: 'flex-end', // Aligner le contenu vers le bas
    paddingBottom: 25,
  },
  headerContent: {
    alignItems: 'center', // Centrer le contenu de l'en-tête
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute', // Positionnement absolu
    top: Platform.OS === 'ios' ? 50 : 20, // Ajustement pour iOS/Android
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fond semi-transparent
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  signOutText: {
    color: '#FFF',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  appName: {
    fontSize: 38, // Plus grand et plus impactant
    fontWeight: '900', // Très gras
    color: '#FFFFFF', // Blanc pur
    textShadowColor: 'rgba(0, 0, 0, 0.4)', // Ombre pour un meilleur contraste
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 5,
  },
  welcomeMessage: {
    fontSize: 20,
    color: '#E0E0E0', // Blanc légèrement estompé
    marginBottom: 5,
    fontWeight: '500',
  },
  currentDate: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.8,
    fontWeight: '400',
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Continuité du fond clair
    marginTop: -20, // Pour chevaucher légèrement l'ImageBackground
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  sectionQuestion: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  cardGrid: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 8, // Espacement vertical
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 6,
    borderLeftWidth: 6, // Nouvelle barre de couleur sur le côté
  },
  cardIcon: {
    marginRight: 15,
  },
  cardTitle: {
    flex: 1, // Permet au texte de prendre l'espace restant
    fontSize: 18,
    fontWeight: '600',
    color: '#424242', // Gris foncé pour le texte
  },
});

export default HomeScreen;