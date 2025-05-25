// src/screens/Choix.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addFavorite, removeFavorite } from '../features/FavoriteSlice';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView, // Pour une meilleure gestion des encoches
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Préférer MaterialCommunityIcons pour plus de choix
import { useNavigation } from '@react-navigation/native';

// Assurez-vous que ces images existent dans le dossier assets/images
const plats = [
  { id: 1, nom: 'Riz au poisson', description: 'Un classique savoureux et nourrissant.', image: require('../../assets/images/riz_poisson.jpeg') },
  { id: 2, nom: 'Spaghetti Bolognaise', description: 'La recette italienne que tout le monde aime.', image: require('../../assets/images/spaghetti.jpeg') },
  { id: 3, nom: 'Poulet Curry', description: 'Un plat épicé et parfumé, idéal pour les amateurs de saveurs exotiques.', image: require('../../assets/images/poulet_curry.jpeg') },
  { id: 4, nom: 'Tarte aux pommes', description: 'Un dessert gourmand et réconfortant.', image: require('../../assets/images/tarte_pommes.jpeg') },
  { id: 5, nom: 'Pizza Margherita', description: 'La simplicité et le goût de l\'Italie.', image: require('../../assets/images/pizza_margherita.jpeg') },
  { id: 6, nom: 'Lasagnes', description: 'Un plat gratiné riche en saveurs.', image: require('../../assets/images/lasagnes.jpeg') },
  { id: 7, nom: 'Soupe de légumes', description: 'Légère et pleine de vitamines.', image: require('../../assets/images/soupe_legumes.jpeg') },
  { id: 8, nom: 'Couscous Royal', description: 'Le plat emblématique du Maghreb, généreux et parfumé.', image: require('../../assets/images/couscous.jpeg') },
  { id: 9, nom: 'Tajine d\'agneau', description: 'Un plat marocain mijoté avec des fruits secs.', image: require('../../assets/images/tajine.jpeg') },
  { id: 10, nom: 'Quiche Lorraine', description: 'Un grand classique de la cuisine française.', image: require('../../assets/images/quiche.jpeg') },
  { id: 11, nom: 'Chili con carne', description: 'Un plat mexicain épicé et réconfortant.', image: require('../../assets/images/chili.jpeg') },
];

export default function Choix() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Accès aux favoris avec une vérification de sécurité
  const favoris = useSelector(state => state.favorites?.value) ?? [];

  const toggleFavori = (plat) => {
    const isFavori = favoris.some(p => p.id === plat.id);
    if (isFavori) {
      dispatch(removeFavorite(plat));
    } else {
      // Inclure la description si elle existe dans le plat original ou si elle a été ajoutée
      dispatch(addFavorite({ ...plat, description: plat.description || '' }));
    }
  };

  const favorisPlats = plats.filter(p => favoris.some(f => f.id === p.id));
  const nonFavorisPlats = plats.filter(p => !favoris.some(f => f.id === p.id));

  const renderPlatCard = ({ item }) => {
    const isFavori = favoris.some(p => p.id === item.id);
    return (
      <View style={styles.platCard}>
        <Image source={item.image} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.nom}</Text>
          {item.description && <Text style={styles.cardDescription}>{item.description}</Text>}
          <TouchableOpacity
            onPress={() => toggleFavori(item)}
            style={styles.favoriteButton}
          >
            <Icon
              name={isFavori ? 'heart' : 'heart-outline'}
              size={26}
              color={isFavori ? '#FF6B6B' : '#B0B0B0'} // Rouge corail pour les favoris, gris clair pour les autres
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.mainTitle}>Explorez nos Plats</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vos Favoris</Text>
          <Icon name="star-outline" size={24} color="#FFA726" />
        </View>
        {favorisPlats.length === 0 ? (
          <Text style={styles.emptySectionText}>
            Ajoutez vos plats préférés ici en cliquant sur le cœur !
          </Text>
        ) : (
          <FlatList
            data={favorisPlats}
            keyExtractor={item => item.id.toString()}
            renderItem={renderPlatCard}
            scrollEnabled={false} // Le ScrollView parent gère le défilement
            numColumns={2} // Affichage en grille de 2 colonnes
            columnWrapperStyle={styles.row}
          />
        )}

        <View style={[styles.sectionHeader, { marginTop: 30 }]}>
          <Text style={styles.sectionTitle}>Toutes les Recettes</Text>
          <Icon name="silverware-fork-knife" size={24} color="#78909C" />
        </View>
        <FlatList
          data={nonFavorisPlats}
          keyExtractor={item => item.id.toString()}
          renderItem={renderPlatCard}
          scrollEnabled={false}
          numColumns={2} // Affichage en grille de 2 colonnes
          columnWrapperStyle={styles.row}
        />
      </ScrollView>

      <TouchableOpacity
        onPress={() => navigation.navigate('Ajouter_plat')}
        style={styles.fab}
      >
        <Icon name="plus" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Fond très clair
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80, // Espace pour le FAB
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2C3E50', // Gris foncé élégant
    marginBottom: 25,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1', // Ligne subtile
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#34495E', // Gris bleu
    marginRight: 10,
  },
  emptySectionText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#7F8C8D', // Gris moyen
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  row: {
    justifyContent: 'space-between', // Pour espacer les cartes dans la même ligne
    marginBottom: 15, // Espacement entre les lignes de cartes
  },
  platCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: '48%', // Presque la moitié de l'écran pour 2 colonnes, avec un peu de marge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden', // Pour que l'image respecte le borderRadius
  },
  cardImage: {
    width: '100%',
    height: 140, // Hauteur fixe pour les images de cartes
    resizeMode: 'cover',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 13,
    color: '#777',
    marginBottom: 10,
  },
  favoriteButton: {
    position: 'absolute', // Positionnement absolu pour le bouton cœur
    top: 10, // Du haut de la carte
    right: 10, // De la droite de la carte
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Fond semi-transparent
    borderRadius: 20,
    padding: 6,
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    backgroundColor: '#28B463', // Vert plus vif
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Ombre plus prononcée
    shadowColor: '#28B463',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});