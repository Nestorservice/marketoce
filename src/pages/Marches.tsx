import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Ruler, 
  Heart,
  Star,
  Phone,
  Globe,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

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
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
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
      description: 'Marché traditionnel au cœur de Saint-Germain-des-Prés'
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
      description: 'Le plus ancien marché couvert de Paris'
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
      description: 'Marché entièrement dédié aux produits biologiques'
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
      description: 'Grand marché de plein air avec de nombreux producteurs'
    }
  ]);

  const categories = ['Marché couvert', 'Marché bio', 'Marché de plein air', 'Supermarché bio'];

  const initializeMap = () => {
    if (!mapRef.current || !window.google || !isApiKeySet) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
      zoom: 13,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(mapInstance);

    // Ajouter les marqueurs des marchés
    markets.forEach((market) => {
      const marker = new google.maps.Marker({
        position: { lat: market.latitude, lng: market.longitude },
        map: mapInstance,
        title: market.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg fill="${market.isOpen ? '#22c55e' : '#ef4444'}" width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${market.name}</h3>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${market.address}</p>
            <div style="display: flex; align-items: center; margin: 4px 0;">
              <span style="color: ${market.isOpen ? '#22c55e' : '#ef4444'}; font-weight: bold; font-size: 12px;">
                ${market.isOpen ? '● OUVERT' : '● FERMÉ'}
              </span>
            </div>
            <p style="margin: 4px 0; color: #666; font-size: 12px;">${market.openHours}</p>
            <div style="display: flex; align-items: center; margin: 4px 0;">
              <span style="color: #fbbf24;">★</span>
              <span style="margin-left: 4px; font-size: 14px;">${market.rating}/5</span>
            </div>
          </div>
        `,
      });

      marker.addListener('click', () => {
        setSelectedMarket(market);
        infoWindow.open(mapInstance, marker);
      });
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          
          if (map) {
            map.setCenter(location);
            map.setZoom(15);
            
            // Ajouter un marqueur pour la position de l'utilisateur
            new google.maps.Marker({
              position: location,
              map,
              title: 'Votre position',
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg fill="#3b82f6" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#3b82f6"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(24, 24),
              },
            });
          }
          
          calculateDistances(location);
          toast.success('Position actuelle obtenue');
        },
        (error) => {
          toast.error('Impossible d\'obtenir votre position');
          console.error('Erreur de géolocalisation:', error);
        }
      );
    } else {
      toast.error('La géolocalisation n\'est pas supportée par ce navigateur');
    }
  };

  const calculateDistances = (userLoc: { lat: number; lng: number }) => {
    if (!window.google) return;

    const service = new google.maps.DistanceMatrixService();
    const destinations = markets.map(market => 
      new google.maps.LatLng(market.latitude, market.longitude)
    );

    service.getDistanceMatrix({
      origins: [new google.maps.LatLng(userLoc.lat, userLoc.lng)],
      destinations,
      travelMode: google.maps.TravelMode.WALKING,
      unitSystem: google.maps.UnitSystem.METRIC,
    }, (response, status) => {
      if (status === 'OK' && response) {
        const updatedMarkets = markets.map((market, index) => {
          const element = response.rows[0].elements[index];
          return {
            ...market,
            distance: element.distance ? element.distance.value / 1000 : undefined,
            duration: element.duration ? element.duration.text : undefined,
          };
        });
        setMarkets(updatedMarkets.sort((a, b) => (a.distance || 999) - (b.distance || 999)));
      }
    });
  };

  const toggleFavorite = (marketId: string) => {
    setMarkets(markets.map(market => 
      market.id === marketId ? { ...market, isFavorite: !market.isFavorite } : market
    ));
    toast.success('Favoris mis à jour');
  };

  const getDirections = (market: Market) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${market.latitude},${market.longitude}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(market.address)}`;
      window.open(url, '_blank');
    }
  };

  const loadGoogleMaps = () => {
    if (!apiKey) {
      toast.error('Veuillez entrer votre clé API Google Maps');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsApiKeySet(true);
      initializeMap();
    };
    script.onerror = () => {
      toast.error('Erreur lors du chargement de Google Maps');
    };
    document.head.appendChild(script);
  };

  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          market.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || market.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (isApiKeySet && window.google) {
      initializeMap();
    }
  }, [isApiKeySet, markets]);

  if (!isApiKeySet) {
    return (
      <Layout>
        <Card>
          <CardHeader>
            <CardTitle>Configuration Google Maps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Clé API Google Maps *
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Entrez votre clé API Google Maps"
              />
              <p className="text-xs text-gray-500 mt-1">
                Obtenez votre clé API sur{' '}
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google Cloud Console
                </a>
              </p>
            </div>
            <Button onClick={loadGoogleMaps} className="w-full">
              Charger Google Maps
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marchés près de chez vous</h1>
            <p className="text-gray-600">Trouvez les meilleurs marchés pour vos courses</p>
          </div>
          
          <Button onClick={getCurrentLocation} className="bg-blue-600 hover:bg-blue-700">
            <Navigation className="w-4 h-4 mr-2" />
            Localiser
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Carte des marchés</CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={mapRef} className="w-full h-96 rounded-lg border" />
              </CardContent>
            </Card>
          </div>

          {/* Informations du marché sélectionné */}
          <div>
            {selectedMarket ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{selectedMarket.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(selectedMarket.id)}
                    >
                      <Heart className={`w-5 h-5 ${selectedMarket.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge className={selectedMarket.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {selectedMarket.isOpen ? 'OUVERT' : 'FERMÉ'}
                    </Badge>
                    <Badge variant="outline" className="ml-2">{selectedMarket.category}</Badge>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{selectedMarket.rating}/5</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                      <span>{selectedMarket.address}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                      <span>{selectedMarket.openHours}</span>
                    </div>
                    
                    {selectedMarket.distance && (
                      <div className="flex items-center">
                        <Ruler className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{selectedMarket.distance.toFixed(1)} km</span>
                        {selectedMarket.duration && (
                          <span className="ml-2 text-gray-500">({selectedMarket.duration})</span>
                        )}
                      </div>
                    )}
                    
                    {selectedMarket.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <a href={`tel:${selectedMarket.phone}`} className="text-blue-600 hover:underline">
                          {selectedMarket.phone}
                        </a>
                      </div>
                    )}
                    
                    {selectedMarket.website && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 mr-2" />
                        <a 
                          href={`https://${selectedMarket.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedMarket.website}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600">{selectedMarket.description}</p>
                  
                  <Button 
                    onClick={() => getDirections(selectedMarket)}
                    className="w-full"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Itinéraire
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sélectionnez un marché
                  </h3>
                  <p className="text-gray-600">
                    Cliquez sur un marqueur sur la carte pour voir les détails
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher un marché..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des marchés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map((market) => (
            <Card 
              key={market.id} 
              className={`cursor-pointer hover:shadow-lg transition-shadow ${
                selectedMarket?.id === market.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedMarket(market)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{market.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(market.id);
                    }}
                    className="p-1"
                  >
                    <Heart className={`w-5 h-5 ${market.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={market.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {market.isOpen ? 'OUVERT' : 'FERMÉ'}
                    </Badge>
                    <Badge variant="outline">{market.category}</Badge>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{market.rating}/5</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">{market.address}</p>
                  
                  {market.distance && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Ruler className="w-4 h-4 mr-1" />
                      <span>{market.distance.toFixed(1)} km</span>
                      {market.duration && (
                        <span className="ml-2">• {market.duration}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        getDirections(market);
                      }}
                      className="flex-1"
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Itinéraire
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Markets;