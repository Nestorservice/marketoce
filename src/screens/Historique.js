// src/screens/Historique.js
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Assurez-vous d'installer cette librairie
import moment from 'moment'; // Pour la gestion des dates, installez 'moment' (npm install moment)
import 'moment/locale/fr'; // Pour la langue française

moment.locale('fr');

// Données d'historique fictives
const historiqueData = [
  { id: '1', type: 'ajout', date: '2025-05-24T10:00:00Z', details: { nomPlat: 'Spaghetti Bolognaise' } },
  { id: '2', type: 'consommation', date: '2025-05-24T12:30:00Z', details: { nomPlat: 'Salade César', repas: 'Déjeuner' } },
  { id: '3', type: 'ajout', date: '2025-05-23T18:00:00Z', details: { nomPlat: 'Soupe de légumes' } },
  { id: '4', type: 'consommation', date: '2025-05-23T19:45:00Z', details: { nomPlat: 'Tarte aux pommes', repas: 'Dîner' } },
  { id: '5', type: 'stock_ajout', date: '2025-05-22T09:00:00Z', details: { nomArticle: 'Lait', quantite: '1 litre' } },
  { id: '6', type: 'consommation', date: '2025-05-22T08:00:00Z', details: { nomPlat: 'Omelette', repas: 'Petit-déjeuner' } },
  { id: '7', type: 'ajout', date: '2025-05-21T14:30:00Z', details: { nomPlat: 'Poulet Curry' } },
];

const Historique = () => {

  const renderHistoryItem = ({ item }) => {
    let iconName, iconColor, title, description;

    switch (item.type) {
      case 'ajout':
        iconName = 'silverware-fork-knife';
        iconColor = '#4CAF50'; // Vert pour l'ajout de plat
        title = `Nouveau plat : ${item.details.nomPlat}`;
        description = `Ajouté le ${moment(item.date).format('DD MMMM YYYY à HH:mm')}`;
        break;
      case 'consommation':
        iconName = 'utensils-fork-knife';
        iconColor = '#2196F3'; // Bleu pour la consommation
        title = `Plat consommé : ${item.details.nomPlat}`;
        description = `Repas du ${item.details.repas || 'jour'} le ${moment(item.date).format('DD MMMM YYYY à HH:mm')}`;
        break;
      case 'stock_ajout':
        iconName = 'cart-plus';
        iconColor = '#FF9800'; // Orange pour l'ajout au stock
        title = `Stock mis à jour : ${item.details.nomArticle}`;
        description = `Ajout de ${item.details.quantite} le ${moment(item.date).format('DD MMMM YYYY à HH:mm')}`;
        break;
      default:
        iconName = 'information-outline';
        iconColor = '#9E9E9E';
        title = 'Activité inconnue';
        description = moment(item.date).format('DD MMMM YYYY à HH:mm');
    }

    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineDot} />
        <View style={styles.timelineContent}>
          <View style={styles.eventCard}>
            <View style={styles.eventIconContainer}>
              <Icon name={iconName} size={28} color={iconColor} />
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{title}</Text>
              <Text style={styles.eventDescription}>{description}</Text>
            </View>
            <TouchableOpacity style={styles.viewDetailsButton}>
              <Icon name="chevron-right" size={24} color="#B0BEC5" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* En-tête de la page */}
        <View style={styles.header}>
          <Icon name="history" size={40} color="#607D8B" style={styles.headerIcon} />
          <Text style={styles.mainTitle}>Votre Historique d'Activité</Text>
          <Text style={styles.subtitle}>Retracez vos actions dans l'application</Text>
        </View>

        {historiqueData.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="timeline-alert-outline" size={80} color="#CFD8DC" />
            <Text style={styles.emptyStateText}>Votre historique est vide pour l'instant.</Text>
            <Text style={styles.emptyStateSubText}>Commencez à ajouter des plats ou des consommations pour le remplir !</Text>
          </View>
        ) : (
          <FlatList
            data={historiqueData.sort((a, b) => new Date(b.date) - new Date(a.date))} // Trie par date décroissante
            keyExtractor={item => item.id}
            renderItem={renderHistoryItem}
            scrollEnabled={false} // Le ScrollView parent gère le défilement
            contentContainerStyle={styles.timelineList}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ECEFF1', // Gris très clair, fond apaisant
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#FFFFFF', // Fond blanc pour l'en-tête
    borderRadius: 15,
    paddingVertical: 20,
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
    fontSize: 26,
    fontWeight: '700',
    color: '#37474F', // Gris bleu foncé
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: '#78909C', // Gris moyen
    textAlign: 'center',
  },
  timelineList: {
    paddingVertical: 10,
    paddingLeft: 20, // Espace pour la ligne de temps
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#607D8B', // Couleur du point de la ligne de temps
    position: 'absolute',
    left: -6, // Centre le point sur la ligne
    top: 15, // Alignement vertical avec la carte
    zIndex: 1, // Pour être au-dessus de la ligne
  },
  timelineContent: {
    flex: 1,
    marginLeft: 20, // Espace entre la ligne et la carte
    borderLeftWidth: 2, // La ligne de temps verticale
    borderLeftColor: '#B0BEC5', // Couleur de la ligne de temps
    paddingLeft: 20, // Espacement du contenu de la carte par rapport à la ligne
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 3,
  },
  eventIconContainer: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#E3F2FD', // Bleu très clair pour le fond de l'icône
    marginRight: 15,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 3,
  },
  eventDescription: {
    fontSize: 13,
    color: '#78909C',
  },
  viewDetailsButton: {
    padding: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#78909C',
    marginTop: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});

export default Historique;