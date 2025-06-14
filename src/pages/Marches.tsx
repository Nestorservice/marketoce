import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import Layout from '../components/Layout';

interface Market {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  duration?: string;
  category: string;
  rating: number;
  isOpen: boolean;
  openHours: string;
  phone?: string;
  website?: string;
  isFavorite: boolean;
  description: string;
}

const Markets: React.FC = () => {
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [markets, setMarkets] = useState<Market[]>([
    {
      id: '1',
      name: 'Marché Saint-Germain',
      address: '4-6 Rue Lobineau, 75006 Paris',
      latitude: 48.8532,
      longitude: 2.3357,
      category: 'Marché couvert',
      rating: 4.3,
      isOpen: true,
      openHours: 'Mardi-Samedi 8h30-19h30, Dimanche 8h30-14h',
      phone: '01 43 26 45 87',
      website: 'marche-saint-germain.fr',
      isFavorite: true,
      description: 'Marché traditionnel au cœur de Saint-Germain-des-Prés',
    },
    {
      id: '2',
      name: 'Marché des Enfants Rouges',
      address: '39 Rue de Bretagne, 75003 Paris',
      latitude: 48.8633,
      longitude: 2.3627,
      category: 'Marché couvert',
      rating: 4.5,
      isOpen: true,
      openHours: 'Mardi-Samedi 8h30-19h30, Dimanche 8h30-14h',
      phone: '01 42 71 28 56',
      isFavorite: false,
      description: 'Le plus ancien marché couvert de Paris',
    },
    {
      id: '3',
      name: 'Marché Raspail Bio',
      address: 'Boulevard Raspail, 75006 Paris',
      latitude: 48.8503,
      longitude: 2.3249,
      category: 'Marché bio',
      rating: 4.2,
      isOpen: false,
      openHours: 'Dimanche 9h-14h',
      isFavorite: false,
      description: 'Marché entièrement dédié aux produits biologiques',
    },
    {
      id: '4',
      name: 'Marché République',
      address: 'Place de la République, 75011 Paris',
      latitude: 48.8686,
      longitude: 2.3655,
      category: 'Marché de plein air',
      rating: 4.0,
      isOpen: true,
      openHours: 'Jeudi et Dimanche 7h-14h30',
      isFavorite: false,
      description: 'Grand marché de plein air avec de nombreux producteurs',
    },
  ]);

  const categories = ['all', 'Marché couvert', 'Marché bio', 'Marché de plein air', 'Supermarché bio'];

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permission de localisation',
            message: 'Cette application a besoin d\'accéder à votre localisation pour afficher les marchés à proximité.',
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

  const initializeMap = () => {
    if (!mapRef.current) return;

    mapRef.current.animateToRegion({
      latitude: 48.8566,
      longitude: 2.3522,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Toast.show({ type: 'error', text1: 'Permission de localisation refusée' });
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);

        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.lat,
            longitude: location.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }

        calculateDistances(location);
        Toast.show({ type: 'success', text1: 'Position actuelle obtenue' });
      },
      (error) => {
        Toast.show({ type: 'error', text1: 'Impossible d\'obtenir votre position' });
        console.error('Erreur de géolocalisation:', error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const calculateDistances = (userLoc: { lat: number; lng: number }) => {
    const updatedMarkets = markets.map((market) => {
      const distance = getDistance(userLoc.lat, userLoc.lng, market.latitude, market.longitude);
      return {
        ...market,
        distance,
        duration: estimateDuration(distance),
      };
    });
    setMarkets(updatedMarkets.sort((a, b) => (a.distance || 999) - (b.distance || 999)));
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const estimateDuration = (distance: number) => {
    const minutes = Math.round((distance / 5) * 60);
    return `${minutes} min`;
  };

  const toggleFavorite = (marketId: string) => {
    setMarkets(
      markets.map((market) =>
        market.id === marketId ? { ...market, isFavorite: !market.isFavorite } : market
      )
    );
    Toast.show({ type: 'success', text1: 'Favoris mis à jour' });
  };

  const getDirections = async (market: Market) => {
    let url;
    if (userLocation) {
      url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${market.latitude},${market.longitude}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(market.address)}`;
    }

    if (await Linking.canOpenURL(url)) {
      Linking.openURL(url);
    } else {
      Toast.show({ type: 'error', text1: 'Impossible d\'ouvrir l\'itinéraire' });
    }
  };

  const filteredMarkets = markets.filter((market) => {
    const matchesSearch =
      market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || market.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    initializeMap();
  }, []);

  if (!isApiKeySet) {
    return (
      <Layout>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configuration Google Maps</Text>
          <View style={styles.cardContent}>
            <Text style={styles.label}>Clé API Google Maps *</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Entrez votre clé API Google Maps"
            />
            <Text style={styles.hint}>
              Obtenez votre clé API sur{' '}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('https://console.cloud.google.com/apis/credentials')}
              >
                Google Cloud Console
              </Text>
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => setIsApiKeySet(true)}>
              <Text style={styles.buttonText}>Charger Google Maps</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Marchés près de chez vous</Text>
            <Text style={styles.subtitle}>Trouvez les meilleurs marchés pour vos courses</Text>
          </View>
          <TouchableOpacity style={styles.locateButton} onPress={getCurrentLocation}>
            <Icon name="navigation" size={16} color="#fff" />
            <Text style={styles.buttonText}>Localiser</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Carte des marchés</Text>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: 48.8566,
              longitude: 2.3522,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {markets.map((market) => (
              <Marker
                key={market.id}
                coordinate={{ latitude: market.latitude, longitude: market.longitude }}
                title={market.name}
                description={market.address}
                pinColor={market.isOpen ? 'green' : 'red'}
                onPress={() => setSelectedMarket(market)}
              />
            ))}
            {userLocation && (
              <Marker
                coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
                title="Votre position"
                pinColor="blue"
              />
            )}
          </MapView>
        </View>

        <View style={styles.card}>
          {selectedMarket ? (
            <View>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{selectedMarket.name}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(selectedMarket.id)}>
                  <Icon
                    name={selectedMarket.isFavorite ? 'favorite' : 'favorite-border'}
                    size={20}
                    color={selectedMarket.isFavorite ? '#ef4444' : '#9ca3af'}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.badges}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: selectedMarket.isOpen ? '#dcfce7' : '#fee2e2' },
                    ]}
                  >
                    <Text
                      style={{ color: selectedMarket.isOpen ? '#15803d' : '#b91c1c' }}
                    >
                      {selectedMarket.isOpen ? 'OUVERT' : 'FERMÉ'}
                    </Text>
                  </View>
                  <View style={[styles.badge, styles.outlineBadge]}>
                    <Text>{selectedMarket.category}</Text>
                  </View>
                </View>
                <View style={styles.rating}>
                  <Icon name="star" size={16} color="#fbbf24" />
                  <Text style={styles.ratingText}>{selectedMarket.rating}/5</Text>
                </View>
                <View style={styles.info}>
                  <View style={styles.infoItem}>
                    <Icon name="location-pin" size={16} color="#9ca3af" />
                    <Text>{selectedMarket.address}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Icon name="access-time" size={16} color="#9ca3af" />
                    <Text>{selectedMarket.openHours}</Text>
                  </View>
                  {selectedMarket.distance && (
                    <View style={styles.infoItem}>
                      <Icon name="straighten" size={16} color="#9ca3af" />
                      <Text>
                        {selectedMarket.distance.toFixed(1)} km
                        {selectedMarket.duration && ` (${selectedMarket.duration})`}
                      </Text>
                    </View>
                  )}
                  {selectedMarket.phone && (
                    <View style={styles.infoItem}>
                      <Icon name="phone" size={16} color="#9ca3af" />
                      <Text
                        style={styles.link}
                        onPress={() => Linking.openURL(`tel:${selectedMarket.phone}`)}
                      >
                        {selectedMarket.phone}
                      </Text>
                    </View>
                  )}
                  {selectedMarket.website && (
                    <View style={styles.infoItem}>
                      <Icon name="language" size={16} color="#9ca3af" />
                      <Text
                        style={styles.link}
                        onPress={() => Linking.openURL(`https://${selectedMarket.website}`)}
                      >
                        {selectedMarket.website}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.description}>{selectedMarket.description}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => getDirections(selectedMarket)}
                >
                  <Icon name="navigation" size={16} color="#fff" />
                  <Text style={styles.buttonText}>Itinéraire</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Icon name="location-pin" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>Sélectionnez un marché</Text>
              <Text style={styles.emptyText}>
                Cliquez sur un marqueur sur la carte pour voir les détails
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.filterContainer}>
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un marché..."
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>
            <View style={styles.picker}>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value)}
                style={styles.pickerStyle}
              >
                {categories.map((category) => (
                  <Picker.Item
                    key={category}
                    label={category === 'all' ? 'Toutes les catégories' : category}
                    value={category}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.marketList}>
          {filteredMarkets.map((market) => (
            <TouchableOpacity
              key={market.id}
              style={[
                styles.card,
                selectedMarket?.id === market.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedMarket(market)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {market.name}
                </Text>
                <TouchableOpacity
                  onPress={() => toggleFavorite(market.id)}
                  style={styles.favoriteButton}
                >
                  <Icon
                    name={market.isFavorite ? 'favorite' : 'favorite-border'}
                    size={20}
                    color={market.isFavorite ? '#ef4444' : '#9ca3af'}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.badges}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: market.isOpen ? '#dcfce7' : '#fee2e2' },
                    ]}
                  >
                    <Text style={{ color: market.isOpen ? '#15803d' : '#b91c1c' }}>
                      {market.isOpen ? 'OUVERT' : 'FERMÉ'}
                    </Text>
                  </View>
                  <View style={[styles.badge, styles.outlineBadge]}>
                    <Text>{market.category}</Text>
                  </View>
                </View>
                <View style={styles.rating}>
                  <Icon name="star" size={16} color="#fbbf24" />
                  <Text style={styles.ratingText}>{market.rating}/5</Text>
                </View>
                <Text style={styles.address} numberOfLines={2}>
                  {market.address}
                </Text>
                {market.distance && (
                  <View style={styles.distance}>
                    <Icon name="straighten" size={16} color="#9ca3af" />
                    <Text>
                      {market.distance.toFixed(1)} km
                      {market.duration && ` • ${market.duration}`}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.outlineButton}
                  onPress={() => getDirections(market)}
                >
                  <Icon name="navigation" size={16} color="#2563eb" />
                  <Text style={styles.outlineButtonText}>Itinéraire</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
  },
  locateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardContent: {
    marginTop: 8,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  outlineBadge: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'transparent',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  info: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    marginVertical: 8,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  picker: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    overflow: 'hidden',
  },
  pickerStyle: {
    height: 40,
    fontSize: 16,
  },
  marketList: {
    gap: 16,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  favoriteButton: {
    padding: 4,
  },
  address: {
    fontSize: 14,
    color: '#4b5563',
    marginVertical: 4,
  },
  distance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 14,
    color: '#6b7280',
    marginVertical: 4,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  outlineButtonText: {
    color: '#2563eb',
    fontSize: 14,
    marginLeft: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
  },
  link: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
});

export default Markets;