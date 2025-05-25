// src/screens/Consommation.js
import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // N'oubliez pas d'installer cette librairie

const Consommation = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* En-tête de la page */}
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Mon Bilan Alimentaire</Text>
          <Text style={styles.subtitle}>Aperçu de votre consommation</Text>
        </View>

        {/* Section de bienvenue / résumé */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="food-apple-outline" size={28} color="#4CAF50" />
            <Text style={styles.cardTitle}>Bonjour !</Text>
          </View>
          <Text style={styles.cardText}>
            Votre tableau de bord pour suivre vos habitudes alimentaires.
            Bientôt, retrouvez ici vos données clés !
          </Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Voir les détails</Text>
            <Icon name="arrow-right" size={18} color="#336699" />
          </TouchableOpacity>
        </View>

        {/* Section "Mes Objectifs" */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="target" size={24} color="#FFC107" />
            <Text style={styles.sectionTitle}>Mes Objectifs</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="check-circle-outline" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>Calories quotidiennes : Non définies</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="silverware-fork-knife" size={20} color="#9E9E9E" />
            <Text style={styles.infoText}>Plats ajoutés : 0 (aujourd'hui)</Text>
          </View>
        </View>

        {/* Section "Plats Récents" */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="history" size={24} color="#607D8B" />
            <Text style={styles.sectionTitle}>Activité Récente</Text>
          </View>
          <Text style={styles.emptyStateText}>
            Aucun plat enregistré pour le moment. Ajoutez-en un !
          </Text>
          {/* Ici, on pourrait utiliser une FlatList pour afficher les plats récents */}
        </View>

        {/* Section "Conseils du Jour" */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="lightbulb-on-outline" size={24} color="#2196F3" />
            <Text style={styles.sectionTitle}>Conseil du Jour</Text>
          </View>
          <Text style={styles.infoText}>
            "Mangez des fruits et légumes variés pour un apport optimal en vitamines."
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Un fond gris-bleu très clair
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800', // Très gras
    color: '#2C3E50', // Gris foncé
  },
  subtitle: {
    fontSize: 18,
    color: '#7F8C8D', // Gris moyen
    marginTop: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    borderLeftWidth: 5, // Ajout d'une barre de couleur sur le côté
    borderLeftColor: '#4CAF50', // Vert pour la fraîcheur
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#34495E',
    marginLeft: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Aligné à droite
    paddingVertical: 5,
  },
  actionButtonText: {
    color: '#336699', // Bleu pour l'action
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1', // Ligne subtile
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34495E',
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
    lineHeight: 22,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
});

export default Consommation;