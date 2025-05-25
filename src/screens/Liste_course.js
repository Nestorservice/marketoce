// src/screens/Liste_course.js
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
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Assurez-vous d'installer cette librairie

const Liste_course = () => {
  const [newItem, setNewItem] = useState('');
  const [shoppingList, setShoppingList] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false); // Pour filtrer les articles

  const handleAddItem = () => {
    if (newItem.trim().length > 0) {
      setShoppingList(prevList => [
        ...prevList,
        { id: String(Date.now()), name: newItem.trim(), completed: false },
      ]);
      setNewItem('');
    } else {
      Alert.alert('Attention', 'Veuillez saisir un article à ajouter.');
    }
  };

  const toggleItemCompleted = (id) => {
    setShoppingList(prevList =>
      prevList.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteItem = (id) => {
    Alert.alert(
      'Supprimer l\'article',
      'Êtes-vous sûr de vouloir supprimer cet article de la liste ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', onPress: () => {
          setShoppingList(prevList => prevList.filter(item => item.id !== id));
        }},
      ]
    );
  };

  const clearCompletedItems = () => {
    Alert.alert(
      'Vider la liste',
      'Voulez-vous supprimer tous les articles complétés ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Oui', onPress: () => {
          setShoppingList(prevList => prevList.filter(item => !item.completed));
        }},
      ]
    );
  };

  const getFilteredList = () => {
    return shoppingList.filter(item => showCompleted ? item.completed : !item.completed);
  };

  const renderShoppingItem = ({ item }) => (
    <View style={styles.listItem}>
      <TouchableOpacity onPress={() => toggleItemCompleted(item.id)} style={styles.checkboxContainer}>
        <Icon
          name={item.completed ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
          size={26}
          color={item.completed ? '#4CAF50' : '#777'}
        />
      </TouchableOpacity>
      <Text style={[styles.itemName, item.completed && styles.itemCompleted]}>
        {item.name}
      </Text>
      <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.deleteButton}>
        <Icon name="delete-outline" size={24} color="#E57373" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Icon name="format-list-checks" size={35} color="#4A90E2" style={styles.headerIcon} />
          <Text style={styles.mainTitle}>Ma Liste de Courses</Text>
          <TouchableOpacity onPress={clearCompletedItems} style={styles.optionsButton}>
            <Icon name="trash-can-outline" size={24} color="#607D8B" />
          </TouchableOpacity>
        </View>

        {/* Barre d'ajout d'article */}
        <View style={styles.addBar}>
          <TextInput
            style={styles.addInput}
            placeholder="Ajouter un article..."
            placeholderTextColor="#A0A0A0"
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={handleAddItem} // Permet d'ajouter en appuyant sur Entrée
          />
          <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
            <Icon name="plus" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Filtres d'affichage */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, !showCompleted && styles.filterButtonActive]}
            onPress={() => setShowCompleted(false)}
          >
            <Text style={[styles.filterButtonText, !showCompleted && styles.filterButtonTextActive]}>À acheter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, showCompleted && styles.filterButtonActive]}
            onPress={() => setShowCompleted(true)}
          >
            <Text style={[styles.filterButtonText, showCompleted && styles.filterButtonTextActive]}>Complétés</Text>
          </TouchableOpacity>
        </View>

        {/* Liste des articles */}
        <ScrollView contentContainerStyle={styles.listContainer}>
          {getFilteredList().length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="shopping-search" size={80} color="#CFD8DC" />
              <Text style={styles.emptyStateText}>Votre liste est vide !</Text>
              <Text style={styles.emptyStateSubText}>Commencez par ajouter des articles ci-dessus.</Text>
            </View>
          ) : (
            <FlatList
              data={getFilteredList()}
              keyExtractor={item => item.id}
              renderItem={renderShoppingItem}
              scrollEnabled={false} // Géré par le ScrollView parent
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FA', // Fond très clair
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 10,
  },
  headerIcon: {
    marginRight: 10,
  },
  mainTitle: {
    flex: 1, // Permet au titre de prendre l'espace disponible
    fontSize: 24,
    fontWeight: '700',
    color: '#34495E', // Bleu foncé
    textAlign: 'center',
  },
  optionsButton: {
    marginLeft: 10,
    padding: 5,
  },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  addInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#3498DB', // Bleu pour l'ajout
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
    backgroundColor: '#E0E6EB',
    borderRadius: 12,
    padding: 5,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  filterButtonActive: {
    backgroundColor: '#28B463', // Vert pour le filtre actif
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#607D8B', // Gris pour le texte inactif
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20, // Assurez un espace pour le scroll
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  checkboxContainer: {
    padding: 5,
    marginRight: 10,
  },
  itemName: {
    flex: 1,
    fontSize: 17,
    color: '#333',
    fontWeight: '500',
  },
  itemCompleted: {
    textDecorationLine: 'line-through',
    color: '#9E9E9E',
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#7F8C8D',
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

export default Liste_course;