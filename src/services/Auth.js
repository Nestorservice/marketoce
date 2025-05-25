// src/screens/Produits_expirer.js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Make sure to install this library
import moment from 'moment'; // For date management, install 'moment'
import 'moment/locale/fr';

moment.locale('fr');

// Fictitious data to simulate products with expiration dates
const allProducts = [
  { id: '1', name: 'Yaourt nature', category: 'Produits Laitiers', expiryDate: '2025-05-26', quantity: '4 pots' }, // Tomorrow
  { id: '2', name: 'Lait', category: 'Produits Laitiers', expiryDate: '2025-06-01', quantity: '1 litre' }, // In a few days
  { id: '3', name: 'Salade (laitue)', category: 'Légumes', expiryDate: '2025-05-24', quantity: '1 tête' }, // Expired yesterday
  { id: '4', name: 'Jambon', category: 'Viandes', expiryDate: '2025-05-27', quantity: '200g' }, // Day after tomorrow
  { id: '5', name: 'Fromage râpé', category: 'Produits Laitiers', expiryDate: '2025-05-15', quantity: '150g' }, // Expired a long time ago
  { id: '6', name: 'Œufs', category: 'Produits Laitiers', expiryDate: '2025-06-10', quantity: '6' }, // Distant date
  { id: '7', name: 'Tomates cerises', category: 'Légumes', expiryDate: '2025-05-25', quantity: '250g' }, // Expires today
];

const Produits_expirer = () => {
  const [filterType, setFilterType] = useState('all'); // 'all', 'expired', 'soon'

  const getProductStatus = (expiryDate) => {
    const today = moment().startOf('day');
    const expiry = moment(expiryDate).startOf('day');
    const daysDiff = expiry.diff(today, 'days');

    if (daysDiff < 0) {
      return { status: 'expired', days: daysDiff, label: `Expiré il y a ${Math.abs(daysDiff)} jour(s)` };
    } else if (daysDiff === 0) {
      return { status: 'today', days: daysDiff, label: `Expire aujourd'hui` };
    } else if (daysDiff > 0 && daysDiff <= 3) { // Near expiration: within 1 to 3 days
      return { status: 'soon', days: daysDiff, label: `Expire dans ${daysDiff} jour(s)` };
    } else {
      return { status: 'ok', days: daysDiff, label: `Expire dans ${daysDiff} jour(s)` };
    }
  };

  const filteredProducts = allProducts
    .map(product => ({ ...product, status: getProductStatus(product.expiryDate) }))
    .filter(product => {
      if (filterType === 'expired') {
        return product.status.status === 'expired';
      }
      if (filterType === 'soon') {
        return product.status.status === 'soon' || product.status.status === 'today';
      }
      return product.status.status !== 'ok'; // Show all non-"ok" products by default
    })
    .sort((a, b) => a.status.days - b.status.days); // Sort from oldest/nearest to newest

  const renderProductCard = ({ item }) => {
    let cardStyle = styles.cardNormal;
    let iconColor = '#555';
    let textColor = '#333';

    if (item.status.status === 'expired') {
      cardStyle = styles.cardExpired;
      iconColor = '#D32F2F'; // Dark red
      textColor = '#D32F2F';
    } else if (item.status.status === 'today' || item.status.status === 'soon') {
      cardStyle = styles.cardSoon;
      iconColor = '#FFA000'; // Orange
      textColor = '#E65100'; // Darker orange
    }

    return (
      <View style={[styles.productCard, cardStyle]}>
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: textColor }]}>{item.name}</Text>
          <Text style={styles.productDetails}>
            <Text style={{ color: iconColor, fontWeight: 'bold' }}>{item.status.label}</Text> ({item.quantity})
          </Text>
          <Text style={styles.productCategory}>{item.category}</Text>
        </View>
        <View style={styles.productActions}>
          {item.status.status !== 'expired' && ( // Don't offer "Consumed" if already expired
            <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Action', `Marquer '${item.name}' comme consommé`)}>
              <Icon name="check-circle-outline" size={24} color="#4CAF50" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Action', `Jeter '${item.name}'`)}>
            <Icon name="trash-can-outline" size={24} color="#E57373" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getCountForFilter = (type) => {
    const products = allProducts.map(product => ({ ...product, status: getProductStatus(product.expiryDate) }));
    if (type === 'expired') {
      return products.filter(p => p.status.status === 'expired').length;
    }
    if (type === 'soon') {
      return products.filter(p => p.status.status === 'soon' || p.status.status === 'today').length;
    }
    return products.filter(p => p.status.status !== 'ok').length; // Total alerts
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Page Header */}
        <View style={styles.header}>
          <Icon name="alert-circle-outline" size={40} color="#EF5350" style={styles.headerIcon} />
          <Text style={styles.mainTitle}>Produits à Surveiller</Text>
          <Text style={styles.subtitle}>Gérez vos articles avant qu'ils ne périment</Text>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterButtonText, filterType === 'all' && styles.filterButtonTextActive]}>
              Toutes les alertes ({getCountForFilter('all')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'soon' && styles.filterButtonActive]}
            onPress={() => setFilterType('soon')}
          >
            <Text style={[styles.filterButtonText, filterType === 'soon' && styles.filterButtonTextActive]}>
              À consommer ({getCountForFilter('soon')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'expired' && styles.filterButtonActive]}
            onPress={() => setFilterType('expired')}
          >
            <Text style={[styles.filterButtonText, filterType === 'expired' && styles.filterButtonTextActive]}>
              Expirés ({getCountForFilter('expired')})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Product List */}
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="check-all" size={80} color="#A5D6A7" />
            <Text style={styles.emptyStateText}>Tout est sous contrôle !</Text>
            <Text style={styles.emptyStateSubText}>Aucun produit ne nécessite votre attention immédiate.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id}
            renderItem={renderProductCard}
            scrollEnabled={false} // Managed by parent ScrollView
            contentContainerStyle={styles.productList}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCE4EC', // Very pale pink, soft but can accompany an alert
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
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
    fontSize: 26,
    fontWeight: '700',
    color: '#D32F2F', // Red for alert
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: '#757575', // Medium gray
    textAlign: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 5,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#EF5350', // Vibrant red for active
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#616161', // Gray for inactive text
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  productList: {
    paddingVertical: 10,
  },
  productCard: {
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
    borderLeftWidth: 6, // Alert color bar
  },
  cardNormal: {
    borderLeftColor: '#9E9E9E', // Default gray
  },
  cardSoon: {
    borderLeftColor: '#FFC107', // Yellow/Orange for "soon"
  },
  cardExpired: {
    borderLeftColor: '#D32F2F', // Red for "expired"
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 3,
  },
  productDetails: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 3,
  },
  productCategory: {
    fontSize: 13,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5', // Light background for buttons
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#757575',
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

export default Produits_expirer;