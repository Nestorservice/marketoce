// src/screens/Consulter_stock.js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Assurez-vous d'installer cette librairie

// Données fictives pour simuler un stock
const stockItems = [
  { id: '1', name: 'Tomates', category: 'Légumes', quantity: '5', unit: 'unités', expiry: '2025-06-10' },
  { id: '2', name: 'Lait', category: 'Produits Laitiers', quantity: '1', unit: 'litre', expiry: '2025-06-15' },
  { id: '3', name: 'Pommes', category: 'Fruits', quantity: '8', unit: 'unités', expiry: '2025-06-12' },
  { id: '4', name: 'Oeufs', category: 'Produits Laitiers', quantity: '12', unit: 'pièces', expiry: '2025-06-20' },
  { id: '5', name: 'Pain', category: 'Boulangerie', quantity: '1', unit: 'baguette', expiry: '2025-06-08' },
  { id: '6', name: 'Poulet', category: 'Viandes', quantity: '500', unit: 'g', expiry: '2025-06-11' },
  { id: '7', name: 'Riz', category: 'Céréales', quantity: '1', unit: 'kg', expiry: '2026-12-31' },
  { id: '8', name: 'Fromage', category: 'Produits Laitiers', quantity: '200', unit: 'g', expiry: '2025-06-25' },
];

const categories = [
  { id: 'all', name: 'Tout', icon: 'food-outline' },
  { id: 'fruits', name: 'Fruits', icon: 'food-apple-outline' },
  { id: 'legumes', name: 'Légumes', icon: 'carrot' },
  { id: 'produits_laitiers', name: 'Laitiers', icon: 'milk-outline' },
  { id: 'viandes', name: 'Viandes', icon: 'cow' },
  { id: 'cereales', name: 'Céréales', icon: 'grain' },
  { id: 'boulangerie', name: 'Boulangerie', icon: 'bread-slice' },
];

const Consulter_stock = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const renderCategoryPill = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryPill,
        selectedCategory === item.id && styles.selectedCategoryPill,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Icon
        name={item.icon}
        size={20}
        color={selectedCategory === item.id ? '#FFFFFF' : '#607D8B'}
      />
      <Text
        style={[
          styles.categoryPillText,
          selectedCategory === item.id && styles.selectedCategoryPillText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderStockItem = ({ item }) => (
    <View style={styles.stockCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetails}>
          <Text style={styles.itemQuantity}>{item.quantity} {item.unit}</Text> - Expire le {item.expiry}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="pencil-outline" size={22} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="delete-outline" size={22} color="#E57373" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Votre Stock Alimentaire</Text>
          <Text style={styles.subtitle}>Gérez vos ingrédients et réduisez le gaspillage</Text>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={24} color="#78909C" style={styles.searchIcon} />
          <TextInput
            placeholder="Rechercher un ingrédient..."
            placeholderTextColor="#A0A0A0"
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Filtres par catégories */}
        <View style={styles.categoryFilterContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryPill}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Liste des articles en stock */}
        <Text style={styles.sectionTitle}>Articles en Stock</Text>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="food-off-outline" size={60} color="#CFD8DC" />
            <Text style={styles.emptyStateText}>Aucun article trouvé.</Text>
            <Text style={styles.emptyStateSubText}>Essayez une autre recherche ou ajoutez un nouvel article.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={item => item.id}
            renderItem={renderStockItem}
            scrollEnabled={false} // Géré par le ScrollView parent
          />
        )}
      </ScrollView>

      {/* Bouton d'ajout flottant */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="plus" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FA', // Un fond très léger
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 80, // Espace pour le FAB
  },
  header: {
    marginBottom: 25,
    alignItems: 'flex-start', // Alignement à gauche
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  categoryFilterContainer: {
    marginBottom: 25,
  },
  categoryList: {
    paddingVertical: 5,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E6EB', // Gris clair pour les non-sélectionnés
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  selectedCategoryPill: {
    backgroundColor: '#3498DB', // Bleu vif pour la catégorie sélectionnée
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#607D8B',
    marginLeft: 5,
  },
  selectedCategoryPillText: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#34495E',
    marginBottom: 15,
  },
  stockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemDetails: {
    fontSize: 14,
    color: '#777',
    marginTop: 3,
  },
  itemQuantity: {
    fontWeight: '700',
    color: '#4CAF50', // Vert pour la quantité
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: '#F8F8F8', // Un fond léger pour les boutons d'action
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#7F8C8D',
    marginTop: 15,
    fontWeight: '600',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    backgroundColor: '#FF6F00', // Un orange vif pour le FAB
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FF6F00',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});

export default Consulter_stock;