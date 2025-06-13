import React, { useState } from 'react';
import { 
  Users, 
  ChefHat, 
  Settings,
  Database,
  Package,
  Calendar,
  ShoppingCart,
  MapPin,
  BarChart3,
  Search
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import AdminStats from '../components/admin/AdminStats';
import UsersManagement from '../components/admin/UsersManagement';
import DishesManagement from '../components/admin/DishesManagement';
import IngredientsManagement from '../components/admin/IngredientsManagement';
import PlanningManagement from '../components/admin/PlanningManagement';
import ShoppingListsManagement from '../components/admin/ShoppingListsManagement';
import StockManagement from '../components/admin/StockManagement';
import GoogleMapsAdmin from '../components/admin/GoogleMapsAdmin';

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data for stats
  const stats = {
    activeUsers: 156,
    approvedDishes: 89,
    weeklyPlans: 234,
    shoppingLists: 178
  };

  // Sample users data
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'Marie Dupont',
      email: 'marie.dupont@email.com',
      status: 'Actif' as const,
      joined: '2024-01-15',
      dietPreference: 'Végétarien',
      householdSize: 2
    },
    {
      id: '2',
      name: 'Jean Martin',
      email: 'jean.martin@email.com',
      status: 'Actif' as const,
      joined: '2024-02-20',
      dietPreference: 'Omnivore',
      householdSize: 4
    },
    {
      id: '3',
      name: 'Sophie Laurent',
      email: 'sophie.laurent@email.com',
      status: 'Inactif' as const,
      joined: '2024-01-05',
      dietPreference: 'Vegan',
      householdSize: 1
    }
  ]);

  // Sample markets data
  const [markets, setMarkets] = useState([
    {
      id: '1',
      name: 'Marché Saint-Germain',
      address: '4-6 Rue Lobineau, 75006 Paris',
      latitude: 48.8532,
      longitude: 2.3357
    },
    {
      id: '2',
      name: 'Marché des Enfants Rouges',
      address: '39 Rue de Bretagne, 75003 Paris',
      latitude: 48.8633,
      longitude: 2.3627
    }
  ]);

  const handleAddMarket = (marketData: any) => {
    const newMarket = {
      ...marketData,
      id: Date.now().toString()
    };
    setMarkets([...markets, newMarket]);
  };

  const handleGenerateShoppingList = (userId: string) => {
    console.log('Génération de liste de courses pour l\'utilisateur:', userId);
    // TODO: Implémenter la logique de génération de liste de courses
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Suppression de l\'utilisateur:', userId);
    setUsers(users.filter(user => user.id !== userId));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <UsersManagement 
            users={users}
            onGenerateShoppingList={handleGenerateShoppingList}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'dishes':
        return <DishesManagement />;
      case 'ingredients':
        return <IngredientsManagement />;
      case 'planning':
        return <PlanningManagement />;
      case 'shopping':
        return <ShoppingListsManagement />;
      case 'stock':
        return <StockManagement />;
      case 'markets':
        return <GoogleMapsAdmin markets={markets} onAddMarket={handleAddMarket} />;
      case 'stats':
        return (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Statistiques Avancées</h3>
              <p className="text-gray-600">Interface de statistiques avancées en développement...</p>
            </CardContent>
          </Card>
        );
      default:
        return (
          <UsersManagement 
            users={users}
            onGenerateShoppingList={handleGenerateShoppingList}
            onDeleteUser={handleDeleteUser}
          />
        );
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Tableau de bord administrateur 🚀
              </h1>
              <p className="text-emerald-100 text-lg">
                Gestion complète de la plateforme SmartMeal
              </p>
            </div>
            
            <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/30">
                <Settings className="w-5 h-5 mr-2" />
                Paramètres
              </Button>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/30">
                <Database className="w-5 h-5 mr-2" />
                Exporter données
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <AdminStats {...stats} />

        {/* Navigation des onglets */}
        <Card className="overflow-hidden">
          <CardContent className="p-1">
            <div className="flex flex-wrap">
              {[
                { id: 'users', label: 'Utilisateurs', icon: Users, color: 'hover:bg-blue-50 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700' },
                { id: 'dishes', label: 'Plats', icon: ChefHat, color: 'hover:bg-green-50 data-[active=true]:bg-green-100 data-[active=true]:text-green-700' },
                { id: 'ingredients', label: 'Ingrédients', icon: Package, color: 'hover:bg-orange-50 data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700' },
                { id: 'planning', label: 'Planning', icon: Calendar, color: 'hover:bg-purple-50 data-[active=true]:bg-purple-100 data-[active=true]:text-purple-700' },
                { id: 'shopping', label: 'Listes de courses', icon: ShoppingCart, color: 'hover:bg-emerald-50 data-[active=true]:bg-emerald-100 data-[active=true]:text-emerald-700' },
                { id: 'stock', label: 'Stock', icon: Database, color: 'hover:bg-red-50 data-[active=true]:bg-red-100 data-[active=true]:text-red-700' },
                { id: 'markets', label: 'Marchés', icon: MapPin, color: 'hover:bg-indigo-50 data-[active=true]:bg-indigo-100 data-[active=true]:text-indigo-700' },
                { id: 'stats', label: 'Statistiques', icon: BarChart3, color: 'hover:bg-teal-50 data-[active=true]:bg-teal-100 data-[active=true]:text-teal-700' },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-lg transition-all ${tab.color}`}
                    data-active={activeTab === tab.id}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Barre de recherche */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
