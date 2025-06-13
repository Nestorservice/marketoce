import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MapPin, Navigation, Clock, Ruler } from 'lucide-react';
import { toast } from 'sonner';

interface Market {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  duration?: string;
}

interface GoogleMapsAdminProps {
  markets: Market[];
  onAddMarket: (market: Omit<Market, 'id'>) => void;
}

// Clé API Google Maps intégrée directement (à remplacer par votre vraie clé)
const GOOGLE_MAPS_API_KEY = 'AIzaSyBGne0xZ4X8ApNTFEXxs7C6H0v0k2Q9rY4'; // Remplacez par votre clé

const GoogleMapsAdmin: React.FC<GoogleMapsAdminProps> = ({ markets, onAddMarket }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [newMarket, setNewMarket] = useState({ name: '', address: '' });
  const [markersWithDistance, setMarkersWithDistance] = useState<Market[]>(markets);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (isMapLoaded && window.google) {
      initializeMap();
    }
  }, [isMapLoaded, markets]);

  const loadGoogleMapsScript = () => {
    if (window.google) {
      setIsMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsMapLoaded(true);
    };
    script.onerror = () => {
      toast.error('Erreur lors du chargement de Google Maps');
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
      zoom: 12,
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
            <svg fill="#22c55e" width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${market.name}</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${market.address}</p>
            ${market.distance ? `
              <div style="margin-top: 8px; font-size: 12px; color: #059669;">
                📍 ${market.distance.toFixed(1)} km - ${market.duration}
              </div>
            ` : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker);
      });
    });

    // Clic pour ajouter un nouveau marché
    mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { location: event.latLng },
          (results, status) => {
            if (status === 'OK' && results?.[0]) {
              setNewMarket({
                name: '',
                address: results[0].formatted_address,
              });
              toast.info('Adresse sélectionnée! Ajoutez un nom au marché.');
            }
          }
        );
      }
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
            map.setZoom(14);
            
            // Ajouter un marqueur pour la position de l'utilisateur
            new google.maps.Marker({
              position: location,
              map,
              title: 'Votre position',
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg fill="#ef4444" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(30, 30),
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
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false,
    }, (response, status) => {
      if (status === 'OK' && response) {
        const updatedMarkets = markets.map((market, index) => {
          const element = response.rows[0].elements[index];
          return {
            ...market,
            distance: element.distance ? element.distance.value / 1000 : undefined, // en km
            duration: element.duration ? element.duration.text : undefined,
          };
        });
        setMarkersWithDistance(updatedMarkets.sort((a, b) => (a.distance || 0) - (b.distance || 0)));
      }
    });
  };

  const handleAddMarket = () => {
    if (!newMarket.name || !newMarket.address) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Géocoder l'adresse pour obtenir les coordonnées
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: newMarket.address }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const location = results[0].geometry.location;
        onAddMarket({
          name: newMarket.name,
          address: newMarket.address,
          latitude: location.lat(),
          longitude: location.lng(),
        });
        setNewMarket({ name: '', address: '' });
        toast.success('Marché ajouté avec succès');
      } else {
        toast.error('Adresse non trouvée');
      }
    });
  };

  if (!isMapLoaded) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de Google Maps...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Gestion des Marchés
            </CardTitle>
            <Button onClick={getCurrentLocation} variant="outline">
              <Navigation className="w-4 h-4 mr-2" />
              Ma position
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={mapRef} className="w-full h-96 rounded-lg border mb-4 shadow-lg" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Nom du marché"
              value={newMarket.name}
              onChange={(e) => setNewMarket({ ...newMarket, name: e.target.value })}
            />
            <Input
              placeholder="Adresse du marché"
              value={newMarket.address}
              onChange={(e) => setNewMarket({ ...newMarket, address: e.target.value })}
            />
          </div>
          <Button onClick={handleAddMarket} className="w-full bg-green-600 hover:bg-green-700">
            <MapPin className="w-4 h-4 mr-2" />
            Ajouter le marché
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Marchés les plus proches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {markersWithDistance.map((market) => (
              <div key={market.id} className="flex justify-between items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div>
                  <h4 className="font-semibold text-lg">{market.name}</h4>
                  <p className="text-sm text-gray-600">{market.address}</p>
                </div>
                <div className="text-right">
                  {market.distance && (
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Ruler className="w-4 h-4 mr-1" />
                      {market.distance.toFixed(1)} km
                    </div>
                  )}
                  {market.duration && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {market.duration}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleMapsAdmin;
